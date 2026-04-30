import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ENV } from "./env";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: express.Request, name: string): string {
  const val = req.query[name];
  return typeof val === "string" ? val : "";
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);

  // OAuth Routes registered directly in index.ts for maximum robustness
  const loginHandler = (req: express.Request, res: express.Response) => {
    console.log(`[OAuth] Login request received: ${req.url}`);
    try {
      const oauthPortalUrl = ENV.oAuthServerUrl;
      const appId = ENV.appId;
      const origin = ENV.baseUrl || `${req.protocol}://${req.get("host")}`;
      const redirectUri = `${origin}/api/oauth/callback`;
      const returnTo = (req.query.returnTo as string) || "/admin";

      console.log("[OAuth] Configuration check:", {
        oauthPortalUrl,
        appId: appId ? "PRESENT" : "MISSING",
        origin,
        redirectUri,
        returnTo
      });

      if (!appId || !oauthPortalUrl) {
        console.error("[OAuth] Missing required configuration:", { appId: !!appId, oauthPortalUrl: !!oauthPortalUrl });
        return res.status(500).json({ 
          error: "Login configuration error",
          details: "Missing APP_ID or OAUTH_SERVER_URL"
        });
      }

      const authUrl = new URL(`${oauthPortalUrl.replace(/\/+$/, "")}/app-auth`);
      authUrl.searchParams.set("appId", appId);
      authUrl.searchParams.set("redirectUri", redirectUri);
      authUrl.searchParams.set("state", JSON.stringify({ returnTo }));

      console.log("[OAuth] Redirecting to:", authUrl.toString());
      return res.redirect(302, authUrl.toString());
    } catch (error) {
      console.error("[OAuth] Failed to build login URL:", error);
      return res.status(500).json({ error: "Login configuration error" });
    }
  };

  app.get("/api/auth/login", loginHandler);
  app.get("/api/auth/login/", loginHandler);

  app.get("/api/oauth/callback", async (req: express.Request, res: express.Response) => {
    console.log(`[OAuth] Callback request received: ${req.url}`);
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    try {
      const { user, token } = await sdk.exchangeCodeForToken(code);
      const dbUser = await db.upsertUser({
        openId: user.openId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      let returnTo = "/admin";
      if (state) {
        try {
          const parsed = JSON.parse(state);
          if (parsed.returnTo) returnTo = parsed.returnTo;
        } catch (e) {
          console.warn("[OAuth] Failed to parse state:", e);
        }
      }

      res.redirect(returnTo);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => res.json({ ok: true, timestamp: Date.now() }));
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3000");

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);

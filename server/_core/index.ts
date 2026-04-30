import "dotenv/config";
import express from "express";
import compression from "compression";
import { createServer } from "http";
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

  // Performance: Enable Gzip compression
  app.use(compression());

  // Security: Basic hardening headers
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Routes MUST be registered BEFORE serveStatic to avoid 404/SPA interception in production
  console.log("[Server] Registering API routes...");
  
  // Health check
  app.get("/api/health", (req, res) => {
    console.log("[API] Health check requested");
    res.json({ ok: true, timestamp: Date.now(), env: process.env.NODE_ENV });
  });

  registerStorageProxy(app);

  // OAuth Routes
  const loginHandler = (req: express.Request, res: express.Response) => {
    console.log(`[OAuth] Login request received: ${req.url}`);
    try {
      let oauthPortalUrl = ENV.oAuthServerUrl;
      const appId = ENV.appId;
      
      // On Render/Proxies, req.protocol might be http even if external is https
      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const origin = ENV.baseUrl || `${protocol}://${req.get("host")}`;
      const redirectUri = `${origin}/api/oauth/callback`;
      const returnTo = (req.query.returnTo as string) || "/admin";

      // Ensure oauthPortalUrl is absolute
      if (oauthPortalUrl && !oauthPortalUrl.startsWith("http")) {
        oauthPortalUrl = `https://${oauthPortalUrl}`;
      }

      console.log("[OAuth] Config check:", {
        oauthPortalUrl,
        appId: appId ? "PRESENT" : "MISSING",
        origin,
        redirectUri,
        protocol
      });

      if (!appId || !oauthPortalUrl || oauthPortalUrl.includes(req.get("host") || "")) {
        if (oauthPortalUrl?.includes(req.get("host") || "")) {
          console.warn("[OAuth] OAUTH_SERVER_URL points to self. Falling back to default provider.");
          oauthPortalUrl = "https://manuspre.computer";
        }
        
        if (!appId || !oauthPortalUrl) {
          console.error("[OAuth] Missing configuration.");
          return res.status(500).json({ 
            error: "Login configuration error",
            details: "APP_ID or OAUTH_SERVER_URL is missing"
          });
        }
      }

      const authUrl = new URL(`${oauthPortalUrl.replace(/\/+$/, "")}/app-auth`);
      authUrl.searchParams.set("appId", appId);
      authUrl.searchParams.set("redirectUri", redirectUri);
      authUrl.searchParams.set("state", JSON.stringify({ returnTo }));

      console.log("[OAuth] Redirecting browser to:", authUrl.toString());
      return res.redirect(302, authUrl.toString());
    } catch (error) {
      console.error("[OAuth] Redirect failed:", error);
      return res.status(500).json({ error: "Login failed to initialize" });
    }
  };

  app.get("/api/auth-login", loginHandler);
  app.get("/api/auth-login/", loginHandler);

  app.get("/api/oauth/callback", async (req: express.Request, res: express.Response) => {
    console.log(`[OAuth] Callback received: ${req.url}`);
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    try {
      const { user, token } = await sdk.exchangeCodeForToken(code);
      await db.upsertUser({
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
        } catch (e) {}
      }
      res.redirect(returnTo);
    } catch (error) {
      console.error("[OAuth] Callback processing failed", error);
      res.status(500).send("Authentication failed");
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // STATIC FILES / SPA FALLBACK - MUST be last
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    console.log("[Server] Setting up static file serving");
    serveStatic(app);
  }


  const port = parseInt(process.env.PORT || "3000");

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);

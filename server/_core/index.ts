import "dotenv/config";
import express from "express";
import compression from "compression";
import axios from "axios";
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

  // OAuth Routes (Native Google OAuth 2.0)
  const loginHandler = (req: express.Request, res: express.Response) => {
    console.log(`[OAuth] Login request received: ${req.url}`);
    try {
      const clientId = ENV.googleClientId;
      
      if (!clientId) {
        console.error("[OAuth] Missing GOOGLE_CLIENT_ID in ENV.");
        return res.status(500).json({ 
          error: "Login configuration error",
          details: "O administrador precisa configurar o GOOGLE_CLIENT_ID no servidor."
        });
      }

      // Detect correct protocol (important for Render proxies)
      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const origin = ENV.baseUrl || `${protocol}://${req.get("host")}`;
      const redirectUri = `${origin}/api/oauth/callback`;
      const returnTo = (req.query.returnTo as string) || "/admin";

      console.log("[OAuth] Generating Google Auth URL with redirectUri:", redirectUri);

      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "email profile");
      authUrl.searchParams.set("state", JSON.stringify({ returnTo }));

      return res.redirect(302, authUrl.toString());
    } catch (error) {
      console.error("[OAuth] Redirect failed:", error);
      return res.status(500).json({ error: "Login failed to initialize" });
    }
  };

  app.get("/api/auth/login", loginHandler);
  app.get("/api/auth-login", loginHandler);
  app.get("/api/oauth/callback", async (req: express.Request, res: express.Response) => {
    console.log(`[OAuth] Callback received: ${req.url}`);
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    try {
      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const origin = ENV.baseUrl || `${protocol}://${req.get("host")}`;
      const redirectUri = `${origin}/api/oauth/callback`;

      // 1. Exchange code for Google Access Token
      const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
        client_id: ENV.googleClientId,
        client_secret: ENV.googleClientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri
      });

      // 2. Fetch User Profile from Google
      const userResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
      });

      const googleUser = userResponse.data;
      
      // 3. Save or update user in database
      await db.upsertUser({
        openId: googleUser.id,
        name: googleUser.name,
        email: googleUser.email,
        avatar: googleUser.picture,
        loginMethod: "google",
        lastSignedIn: new Date()
      });

      // 4. Create App Session Cookie
      const token = await sdk.createSessionToken(googleUser.id, { name: googleUser.name });
      const cookieOptions = getSessionCookieOptions(req);
      
      res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      // 5. Redirect back to destination
      let returnTo = "/admin";
      if (state) {
        try {
          const parsed = JSON.parse(state);
          if (parsed.returnTo) returnTo = parsed.returnTo;
        } catch (e) {}
      }
      res.redirect(returnTo);
    } catch (error: any) {
      console.error("[OAuth] Callback processing failed", error?.response?.data || error);
      res.status(500).send("Authentication failed. Please check your Google OAuth credentials.");
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

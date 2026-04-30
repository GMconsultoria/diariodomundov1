import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Server-side login redirect — uses OAUTH_SERVER_URL from server env,
  // avoiding the fragile client-side VITE_OAUTH_PORTAL_URL build-time bake-in.
  app.get("/api/auth/login", (req: Request, res: Response) => {
    try {
      const oauthPortalUrl = ENV.oAuthServerUrl;
      const appId = ENV.appId;
      const origin = `${req.protocol}://${req.get("host")}`;
      const redirectUri = `${origin}/api/oauth/callback`;
      // Fix #3: embed returnTo in state so callback can redirect user back to the right page
      const returnTo = (req.query.returnTo as string) || "/admin";
      const stateData = `${redirectUri}|${returnTo}`;
      const state = Buffer.from(stateData).toString("base64");

      const url = new URL(`${oauthPortalUrl}/app-auth`);
      url.searchParams.set("appId", appId);
      url.searchParams.set("redirectUri", redirectUri);
      url.searchParams.set("state", state);
      url.searchParams.set("type", "signIn");

      res.redirect(302, url.toString());
    } catch (error) {
      console.error("[OAuth] Failed to build login URL:", error);
      res.status(500).json({ error: "Login configuration error" });
    }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Fix #2: extract returnTo from state (format: "redirectUri|returnTo") and redirect there
      let returnTo = "/admin";
      try {
        const decoded = Buffer.from(state, "base64").toString("utf-8");
        const parts = decoded.split("|");
        if (parts[1] && parts[1].startsWith("/")) {
          returnTo = parts[1];
        }
      } catch { /* ignore — use default */ }
      res.redirect(302, returnTo);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

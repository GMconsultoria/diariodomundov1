export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  try {
    let oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
    
    // Se a variável estiver vazia, indefinida ou apontando para a própria aplicação (causando o 404 interno),
    // usamos o portal padrão de autenticação do Manus
    if (!oauthPortalUrl || oauthPortalUrl === "undefined" || oauthPortalUrl === window.location.origin) {
      oauthPortalUrl = "https://manuspre.computer";
    }

    const appId = import.meta.env.VITE_APP_ID || "diariodomundo";
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);

    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    console.error("Falha ao gerar URL de login:", error);
    return "";
  }
};

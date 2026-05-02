export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "default_secret",
  databaseUrl: process.env.DATABASE_URL ?? "",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  baseUrl: process.env.BASE_URL?.replace(/\/+$/, "") ?? "",
};

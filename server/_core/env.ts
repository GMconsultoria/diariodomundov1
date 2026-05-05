export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "default_secret",
  databaseUrl: process.env.DATABASE_URL ?? "",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  baseUrl: process.env.BASE_URL?.replace(/\/+$/, "") ?? "",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "dnf2ervbd",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "323245979113573",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? "wd7J7Ygh2xW2-0LMyAmVPalRSBU",
};

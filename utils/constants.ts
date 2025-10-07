export const baseURL: string | undefined =
  process.env.VERCEL === "1"
    ? process.env.VERCEL_ENV === "production"
      ? process.env.BETTER_AUTH_URL
      : process.env.VERCEL_ENV === "preview"
        ? `https://${process.env.VERCEL_URL}`
        : undefined
    : undefined;

export const cookieDomain: string | undefined =
  process.env.VERCEL === "1"
    ? process.env.VERCEL_ENV === "production"
      ? ".better-auth.com"
      : process.env.VERCEL_ENV === "preview"
        ? `.${process.env.VERCEL_URL}`
        : undefined
    : undefined;
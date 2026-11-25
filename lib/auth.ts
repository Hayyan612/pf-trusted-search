import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } }
    : undefined;

export const googleEnabled = Boolean(google);

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true, minPasswordLength: 8, autoSignIn: true },
  socialProviders: google,
  plugins: [nextCookies()],
});

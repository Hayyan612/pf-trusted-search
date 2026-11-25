import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import { sendMail } from "@/lib/mail";

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } }
    : undefined;

export const googleEnabled = Boolean(google);

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail(user.email, "Reset your TrueUnit password", "Reset your password", "Use this link to choose a new password. It works once and expires in an hour.", { label: "Choose a new password", url });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail(user.email, "Confirm your email for TrueUnit", "Confirm your email", "Confirm this address so Scout can send you agents' answers about your shortlist.", { label: "Confirm email", url });
    },
  },
  socialProviders: google,
  plugins: [nextCookies()],
});

import { betterAuth } from "better-auth";
import {
  bearer,
  admin,
  multiSession,
  organization,
  twoFactor,
  openAPI,
  customSession,
  deviceAuthorization,
  lastLoginMethod,
  oAuthProxy
} from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { passkey } from "better-auth/plugins/passkey"
import { nextCookies } from "better-auth/next-js";

import { reactInvitationEmail } from "./email/invitation";
import { reactResetPasswordEmail } from "./email/reset-password";
import { resend } from "@/lib/email/resend";
import { baseURL, cookieDomain } from "@/utils/constants";

const from = process.env.BETTER_AUTH_EMAIL || "delivered@resend.dev";
const to = process.env.TEST_EMAIL || "";

const client = new MongoClient("mongodb+srv://10crollno23gm_db_user:qbIdKcff1hoTI7F2@hashmap.isjlcxl.mongodb.net/");
const db = client.db();

export const auth = betterAuth({
  appName: "Better Auth Demo",
  baseURL: baseURL,
  database: mongodbAdapter(db, {
    // client,
  }),
  session: {
    cookieCache: {
      enabled: false, // Too big session data so no caching
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      await resend.emails.send({
        from,
        to: user.email,
        subject: "Reset your password",
        react: reactResetPasswordEmail({
          username: user.email,
          resetLink: url,
        }),
      });
    },
  },
  emailVerification: {
    async sendVerificationEmail({ user, url }) {
      const res = await resend.emails.send({
        from,
        to: to || user.email,
        subject: "Verify your email address",
        html: `<a href="${url}">Verify your email address</a>`,
      });
      console.log(res, user.email);
    },
  },
  // account: {
  // 	accountLinking: {
  // 		trustedProviders: ["google"],
  // 	},
  // },
  socialProviders: {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  plugins: [
    organization({
      async sendInvitationEmail(data) {
        await resend.emails.send({
          from,
          to: data.email,
          subject: "You've been invited to join an organization",
          react: reactInvitationEmail({
            username: data.email,
            invitedByUsername: data.inviter.user.name,
            invitedByEmail: data.inviter.user.email,
            teamName: data.organization.name,
            inviteLink:
              process.env.NODE_ENV === "development"
                ? `http://localhost:3000/accept-invitation/${data.id}`
                : `${process.env.BETTER_AUTH_URL ||
                "https://demo.better-auth.com"
                }/accept-invitation/${data.id}`,
          }),
        });
      },
    }),
    // 
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          await resend.emails.send({
            from,
            to: user.email,
            subject: "Your OTP",
            html: `Your OTP is ${otp}`,
          });
        },
      },
    }),
    passkey(),
    openAPI(),
    bearer(),
    admin({
      adminUserIds: ["EXD5zjob2SD6CBWcEQ6OpLRHcyoUbnaB"],
    }),
    multiSession(),
    oAuthProxy(),
    nextCookies(),

    customSession(async (session) => {
      return {
        ...session,
        user: {
          ...session.user,
          dd: "test",
        },
      };
    }),
    deviceAuthorization({
      expiresIn: "3min",
      interval: "5s",
    }),
    lastLoginMethod(),
  ],
  trustedOrigins: ["exp://"],
  advanced: {
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === "production",
      domain: cookieDomain,
    },
  },
});
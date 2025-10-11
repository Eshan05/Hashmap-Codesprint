import {
  adminClient,
  deviceAuthorizationClient,
  genericOAuthClient,
  lastLoginMethodClient,
  multiSessionClient,
  oidcClient,
  passkeyClient,
  twoFactorClient
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";
export const authClient = createAuthClient({
  // baseURL: "http://192.168.1.7:3000",
  // baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_BASE || "http://localhost:3000",
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_BASE || "http://pht.esn.qzz.io",
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/two-factor";
      },
    }),
    passkeyClient(),
    adminClient(),
    multiSessionClient(),
    oidcClient(),
    genericOAuthClient(),
    deviceAuthorizationClient(),
    lastLoginMethodClient(),
  ],
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) toast.error("Too many requests. Please try again later.");
    },
  },
})

export const {
  signUp,
  signIn,
  signOut,
  useSession,
} = authClient;
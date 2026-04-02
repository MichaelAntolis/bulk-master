import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  providers: [], // Leave empty for edge compatibility in middleware
} satisfies NextAuthConfig;

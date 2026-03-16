import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import type { Session } from "next-auth";
import type { NextRequest } from "next/server";

const nextAuth = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24시간 만료 (NFR11)
  },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.githubUsername = profile.login;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.githubUsername) {
        (session.user as unknown as Record<string, unknown>).githubUsername = token.githubUsername;
      }
      return session;
    },
  },
});

export const handlers: { GET: (req: NextRequest) => Promise<Response>; POST: (req: NextRequest) => Promise<Response> } = nextAuth.handlers;
export const signIn: typeof nextAuth.signIn = nextAuth.signIn;
export const signOut: typeof nextAuth.signOut = nextAuth.signOut;
export const auth: () => Promise<Session | null> = nextAuth.auth as () => Promise<Session | null>;

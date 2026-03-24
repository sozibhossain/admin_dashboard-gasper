import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginAdmin, refreshAuthToken } from "@/lib/api";
import { getTokenExpiry } from "@/lib/utils";

type AuthToken = {
  _id?: string;
  role?: "admin" | "manager" | "user";
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  email?: string | null;
  error?: string;
};

async function refreshAccessToken(token: AuthToken): Promise<AuthToken> {
  try {
    if (!token.refreshToken) {
      return { ...token, error: "MissingRefreshToken" };
    }

    const response = await refreshAuthToken({
      refreshToken: token.refreshToken,
    });

    const refreshed = response.data;

    return {
      ...token,
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      accessTokenExpires: getTokenExpiry(refreshed.accessToken),
      error: undefined,
    };
  } catch {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const response = await loginAdmin({
          email: credentials.email,
          password: credentials.password,
        });

        const payload = response.data;

        if (!payload?.accessToken || payload.role !== "admin") {
          throw new Error("Only admin users can access this dashboard");
        }

        return {
          id: payload._id,
          email: credentials.email,
          _id: payload._id,
          role: payload.role,
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          accessTokenExpires: getTokenExpiry(payload.accessToken),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          _id: user._id,
          email: user.email,
          role: user.role,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
        };
      }

      const currentToken = token as AuthToken;

      if (
        currentToken.accessToken &&
        currentToken.accessTokenExpires &&
        Date.now() < currentToken.accessTokenExpires - 30_000
      ) {
        return currentToken;
      }

      return refreshAccessToken(currentToken);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user._id = token._id as string;
        session.user.role = token.role as "admin" | "manager" | "user";
        session.user.email = token.email;
      }

      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.error = token.error as string | undefined;

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

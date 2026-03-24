import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user: DefaultSession["user"] & {
      _id?: string;
      role?: "admin" | "manager" | "user";
    };
  }

  interface User {
    _id?: string;
    role?: "admin" | "manager" | "user";
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    role?: "admin" | "manager" | "user";
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}

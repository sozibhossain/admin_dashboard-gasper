import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const authPaths = ["/login", "/forgot-password", "/verify-email", "/reset-password"];
const protectedPrefixes = [
  "/dashboard",
  "/orders",
  "/products",
  "/category",
  "/customers",
  "/vendors",
  "/staff",
  "/subscribe",
  "/coupons",
  "/commission",
  "/settings",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const isAuthRoute = authPaths.some((path) => pathname.startsWith(path));
  const isProtected = protectedPrefixes.some((path) => pathname.startsWith(path));

  if (!token && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (token && isProtected && token.role !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/forgot-password",
    "/verify-email",
    "/reset-password",
    "/dashboard/:path*",
    "/orders/:path*",
    "/products/:path*",
    "/category/:path*",
    "/customers/:path*",
    "/vendors/:path*",
    "/staff/:path*",
    "/subscribe/:path*",
    "/coupons/:path*",
    "/commission/:path*",
    "/settings/:path*",
  ],
};

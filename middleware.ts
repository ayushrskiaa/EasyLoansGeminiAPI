import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow auth pages and API routes
        if (req.nextUrl.pathname.startsWith("/auth") || req.nextUrl.pathname.startsWith("/api/auth")) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|auth|_next/static|_next/image|favicon.ico).*)",
  ],
};


import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session via auth
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;

  if (pathname.startsWith("/organizer")) {
    if (!user || user.role !== "organizer") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!user || user.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/organizer/:path*", "/admin/:path*"],
};

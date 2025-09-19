import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function middleware(request) {
  const token = await cookies().get("chat-token");

  const path = request.nextUrl.pathname;

  if (!token && path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token && path == "/") {
    return NextResponse.redirect(new URL("/dashboard/home", request.url));
  }
  return NextResponse.next();
}

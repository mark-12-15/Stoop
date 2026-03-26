import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Temporary dev-only route: clears ALL cookies and redirects to /login
export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(`${origin}/login`);

  // Clear every cookie the browser sends
  request.cookies.getAll().forEach(({ name }) => {
    response.cookies.set(name, "", { maxAge: 0, path: "/" });
  });

  return response;
}

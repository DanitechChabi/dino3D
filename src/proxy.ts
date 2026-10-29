import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Vérification rapide (optimiste) de la session ; les pages et actions revérifient le rôle en base.
export async function proxy(request: NextRequest) {
  const token = request.cookies.get("ebb_session")?.value;
  let ok = false;
  if (token && process.env.AUTH_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
      ok = true;
    } catch {}
  }
  if (!ok) {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("suite", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/espace-membre/:path*"] };

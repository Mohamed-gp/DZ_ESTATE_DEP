import { NextResponse, NextRequest } from "next/server";
import { i18nRouter } from "next-i18n-router";
import i18nConfig from "../i18nConfig";

export function middleware(req: NextRequest) {
  // Récupérer le token (depuis les cookies ou le header)
  return i18nRouter(req, i18nConfig);
  const pathName = req.nextUrl.pathname;
  const token = req.cookies.get("accessToken");
  const isProtectedRoute = pathName.startsWith("/account");

  const isAuthRoute =
    pathName.startsWith("/auth/login") || pathName.startsWith("/auth/register");

  // Vérifiez si l'utilisateur est connecté
  if ((token && isAuthRoute) || (!token && isProtectedRoute)) {
    const url = req.nextUrl.clone();
    url.pathname = "/"; // Redirigez vers le tableau de bord ou une autre page
    NextResponse.redirect(url);
    return i18nRouter(req, i18nConfig);
  }

  NextResponse.next(); // Continuez si aucune condition n'est remplie
  return i18nRouter(req, i18nConfig);
}

export const config = {
  matcher: [
    "/account/:path*",
    "/settings",
    "/auth/register",
    "/auth/login",
    "/((?!api|static|.*\\..*|_next).*)",
  ],
};

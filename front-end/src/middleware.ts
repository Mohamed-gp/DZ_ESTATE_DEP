import { NextResponse, NextRequest } from "next/server";
import { i18nRouter } from "next-i18n-router";
import i18nConfig from "../i18nConfig";

export function middleware(req: NextRequest) {
  // Use i18nRouter to handle localization
  const i18nResponse = i18nRouter(req, i18nConfig);
  if (i18nResponse) {
    return i18nResponse;
  }

  // Récupérer le token (depuis les cookies ou le header)
  const pathName = req.nextUrl.pathname;
  const token = req.cookies.get("accessToken");
  const isProtectedRoute = pathName.startsWith("/account");

  const isAuthRoute =
    pathName.match(/^\/[a-z]{2}\/auth\/login$/) ||
    pathName.match(/^\/[a-z]{2}\/auth\/register$/);

  // Vérifiez si l'utilisateur est connecté
  if ((token && isAuthRoute) || (!token && isProtectedRoute)) {
    const url = req.nextUrl.clone();
    url.pathname = "/"; // Redirigez vers le tableau de bord ou une autre page
    return NextResponse.redirect(url);
  }

  return NextResponse.next(); // Continuez si aucune condition n'est remplie
}

export const config = {
  matcher: [
    "/account/:path*",
    "/settings",
    "/auth/register",
    "/auth/login",
    "/((?!api|static|.*\\..*|_next).*)",
    "/:lng/auth/login",
    "/:lng/auth/register",
  ],
};

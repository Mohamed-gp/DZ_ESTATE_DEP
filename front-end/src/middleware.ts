import { NextResponse,NextRequest } from 'next/server';

export function middleware(req : NextRequest) {
    // Récupérer le token (depuis les cookies ou le header)
    const pathName = req.nextUrl.pathname;

    const token = req.cookies.get('accessToken'); 
    const isProtectedRoute = pathName.startsWith("/account");

    const isAuthRoute =
      pathName.startsWith("/auth/login") || pathName.startsWith("/auth/register");
    // Vérifiez si l'utilisateur est connecté
    if (token && isAuthRoute || !token && isProtectedRoute) {
        const url = req.nextUrl.clone();
        url.pathname = '/'; // Redirigez vers le tableau de bord ou une autre page
        return NextResponse.redirect(url);
        
    }
 
    return NextResponse.next(); // Continuez si aucune condition n'est remplie
}



  


export const config = {
  matcher: ["/account/:path*", "/settings", "/auth/register", "/auth/login"],
};

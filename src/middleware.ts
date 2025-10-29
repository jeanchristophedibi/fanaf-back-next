import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes protégées - nécessitent une authentification
  const protectedRoutes = [
    '/dashboard',
  ];

  // Vérifier si la route est protégée
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Note: On ne redirige pas depuis le middleware pour les routes protégées
  // car le token peut être dans localStorage (côté client uniquement)
  // Le AuthGuard côté client gérera la redirection

  // Si c'est la page de login et que l'utilisateur est déjà connecté (cookie présent), rediriger vers le dashboard
  if (pathname === '/login' || pathname === '/signin') {
    const token = request.cookies.get('fanaf_token')?.value;
    if (token) {
      return NextResponse.redirect(new URL('/dashboard/admin-fanaf', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};


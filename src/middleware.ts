import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Gestion de l'authentification et des rôles côté middleware (cookies seulement)
  const token = request.cookies.get('fanaf_token')?.value;
  const role = request.cookies.get('fanaf_role')?.value;

  const isDashboard = pathname.startsWith('/dashboard');

  if (isDashboard) {
    // Bloquer l'accès au dashboard sans token
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Contrôles d'accès par segment
    const deny = (cond: boolean) => (cond ? NextResponse.redirect(new URL('/no-access', request.url)) : null);

    // Agence
    const d1 = deny(pathname.startsWith('/dashboard/agence') && role !== 'admin_agency');
    if (d1) return d1;

    // Admin FANAF
    const d2 = deny(pathname.startsWith('/dashboard/admin-fanaf') && role !== 'admin_fanaf');
    if (d2) return d2;

    // Admin ASACI
    const d3 = deny(pathname.startsWith('/dashboard/admin-asaci') && role !== 'admin_platform');
    if (d3) return d3;

    // Agent inscription (FANAF)
    const d4 = deny(pathname.startsWith('/dashboard/agent-inscription') && role !== 'agent_fanaf');
    if (d4) return d4;

    // Opérateur caisse
    const d5 = deny(pathname.startsWith('/dashboard/operateur-caisse') && role !== 'cashier');
    if (d5) return d5;

    // Opérateur badge
    const d6 = deny(pathname.startsWith('/dashboard/operateur-badge') && role !== 'operateur_badge');
    if (d6) return d6;
  }

  // Si c'est la page de login et que l'utilisateur est déjà connecté (cookie présent), rediriger vers le dashboard
  if (pathname === '/login' || pathname === '/signin') {
    if (token) {
      // Si déjà connecté, envoyer vers une page neutre pour choix/contrôle
      return NextResponse.redirect(new URL('/no-access', request.url));
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


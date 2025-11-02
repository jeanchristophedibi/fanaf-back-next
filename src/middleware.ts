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
    const d3 = deny(pathname.startsWith('/dashboard/admin-asaci') && role !== 'admin_asaci');
    if (d3) return d3;

    // Admin global (super admin) - Vérifier APRÈS admin-asaci et admin-fanaf pour éviter les conflits
    const d7 = deny(pathname.startsWith('/dashboard/admin') && 
                   !pathname.startsWith('/dashboard/admin-asaci') && 
                   !pathname.startsWith('/dashboard/admin-fanaf') &&
                   role !== 'admin' && role !== 'admin_platform');
    if (d7) return d7;

    // Agent inscription (FANAF)
    const d4 = deny(pathname.startsWith('/dashboard/agent-inscription') && role !== 'agent_fanaf');
    if (d4) return d4;

    // Opérateur caisse
    const d5 = deny(pathname.startsWith('/dashboard/operateur-caisse') && role !== 'cashier');
    if (d5) return d5;

    // Opérateur badge
    const d6 = deny(pathname.startsWith('/dashboard/operateur-badge') && role !== 'badge_operator');
    if (d6) return d6;
  }

  // Si c'est la page de login et que l'utilisateur est déjà connecté (cookie présent), rediriger vers le dashboard
  if (pathname === '/login' || pathname === '/signin') {
    if (token) {
      // Déterminer le dashboard selon le rôle
      const roleToPath = (r: string | null | undefined): string => {
        switch (r) {
          case 'admin_agency': return '/dashboard/agence';
          case 'admin_fanaf': return '/dashboard/admin-fanaf';
          case 'admin_asaci': return '/dashboard/admin-asaci';
          case 'admin_platform': return '/dashboard/admin';
          case 'admin': return '/dashboard/admin';
          case 'agent_fanaf': return '/dashboard/agent-inscription';
          case 'cashier': return '/dashboard/operateur-caisse';
          case 'badge_operator': return '/dashboard/operateur-badge';
          default: return '/no-access';
        }
      };
      const dashboardPath = roleToPath(role);
      return NextResponse.redirect(new URL(dashboardPath, request.url));
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


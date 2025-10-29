'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fanafApi } from '../../services/fanafApi';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Composant pour protéger les routes nécessitant une authentification
 * Ne bloque pas le rendu initial - vérifie en arrière-plan
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  // Initialiser immédiatement côté client
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const auth = fanafApi.isAuthenticated();
      console.log('[AuthGuard] État initial isAuthenticated:', auth);
      return auth;
    }
    return false; // Côté serveur
  });
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Vérifier uniquement côté client
    if (typeof window === 'undefined') {
      return;
    }

    const checkAuth = () => {
      const authenticated = fanafApi.isAuthenticated();
      console.log('[AuthGuard] Vérification auth:', authenticated, 'pathname:', pathname);
      setIsAuthenticated(authenticated);
      setHasChecked(true);

      if (!authenticated) {
        // Déterminer le dashboard par défaut selon le pathname
        let defaultDashboard = '/dashboard/admin-fanaf';
        if (pathname?.includes('/dashboard/admin-asaci')) {
          defaultDashboard = '/dashboard/admin-asaci';
        } else if (pathname?.includes('/dashboard/agence')) {
          defaultDashboard = '/dashboard/agence';
        } else if (pathname?.includes('/dashboard/admin-fanaf')) {
          defaultDashboard = '/dashboard/admin-fanaf';
        }
        
        // Rediriger vers la page de login avec le chemin actuel ou le dashboard par défaut
        const redirectUrl = pathname || defaultDashboard;
        const loginUrl = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
        console.log('[AuthGuard] Redirection vers:', loginUrl);
        router.push(loginUrl);
      } else {
        console.log('[AuthGuard] Authentification OK, rendu des enfants (sidebar visible)');
      }
    };

    // Vérifier immédiatement
    checkAuth();
  }, [router, pathname]);

  // Si non authentifié après vérification, rediriger
  if (hasChecked && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  // Rendre le contenu si authentifié (même pendant la vérification initiale)
  // Cela évite de bloquer le rendu de la sidebar
  return <>{children}</>;
}

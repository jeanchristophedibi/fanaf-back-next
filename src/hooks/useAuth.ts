'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fanafApi } from '../services/fanafApi';

/**
 * Hook pour gérer l'authentification
 */
export function useAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const checkAuth = () => {
      const authenticated = fanafApi.isAuthenticated();
      setIsAuthenticated(authenticated);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    try {
      fanafApi.logout();
      setIsAuthenticated(false);
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    loading,
    logout,
  };
}


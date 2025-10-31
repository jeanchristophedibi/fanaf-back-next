'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { fanafApi } from '../services/fanafApi';

/**
 * Hook pour gérer l'authentification
 */
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Query pour vérifier l'état d'authentification
  const authQuery = useQuery({
    queryKey: ['auth', 'isAuthenticated'],
    queryFn: () => fanafApi.isAuthenticated(),
    staleTime: 0,
    gcTime: 0,
  });

  // Mutation pour la déconnexion
  const logoutMutation = useMutation({
    mutationFn: () => {
      fanafApi.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'isAuthenticated'], false);
      router.push('/login');
    },
    onError: (error) => {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    isAuthenticated: authQuery.data ?? null,
    loading: authQuery.isLoading,
    logout,
  };
}


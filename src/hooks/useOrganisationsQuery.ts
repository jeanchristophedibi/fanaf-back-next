'use client';

import { useQuery } from '@tanstack/react-query';
import { companiesDataService } from '../components/data/companiesData';
import type { Organisation } from '../components/data/types';

/**
 * Hook React Query pour récupérer les organisations avec cache
 */
export function useOrganisationsQuery(options?: {
  enabled?: boolean;
  forceReload?: boolean;
}) {
  const { enabled = true, forceReload = false } = options || {};

  const query = useQuery({
    queryKey: ['organisations', forceReload ? 'force-reload' : 'cached'],
    queryFn: async () => {
      try {
        return await companiesDataService.loadOrganisations(forceReload);
      } catch (error: any) {
        // Logger l'erreur mais retourner un tableau vide pour ne pas bloquer la page
        console.warn('[useOrganisationsQuery] Erreur lors du chargement des organisations:', error);
        // Retourner un tableau vide pour permettre à la page de se charger
        return [] as Organisation[];
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - les organisations changent moins souvent
    gcTime: 10 * 60 * 1000, // 10 minutes en cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1, // Réessayer une seule fois en cas d'erreur
    retryOnMount: false, // Ne pas réessayer au montage si déjà en erreur
  });

  return {
    ...query,
    organisations: query.data || [],
  };
}


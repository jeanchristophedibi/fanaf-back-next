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
      return await companiesDataService.loadOrganisations(forceReload);
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - les organisations changent moins souvent
    gcTime: 10 * 60 * 1000, // 10 minutes en cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    ...query,
    organisations: query.data || [],
  };
}


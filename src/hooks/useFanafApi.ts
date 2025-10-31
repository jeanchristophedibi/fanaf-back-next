'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fanafApi } from '../services/fanafApi';

interface UseFanafApiOptions {
  enabled?: boolean;
  autoFetch?: boolean;
}

/**
 * Hook pour utiliser l'API FANAF 2026 avec React Query
 */
export function useFanafApi(options: UseFanafApiOptions = {}) {
  const { enabled = true, autoFetch = false } = options;
  const queryClient = useQueryClient();

  // Query pour participants
  const participantsQuery = useQuery({
    queryKey: ['fanafApi', 'participants'],
    queryFn: async () => {
      const response = await fanafApi.getParticipants();
      return response.data || [];
    },
    enabled: enabled && autoFetch,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Query pour associations
  const associationsQuery = useQuery({
    queryKey: ['fanafApi', 'associations'],
    queryFn: async () => {
      const response = await fanafApi.getAssociations();
      return response.data || [];
    },
    enabled: enabled && autoFetch,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Query pour networking requests
  const networkingRequestsQuery = useQuery({
    queryKey: ['fanafApi', 'networkingRequests'],
    queryFn: async () => {
      const response = await fanafApi.getNetworkingRequests();
      return response.data || [];
    },
    enabled: enabled && autoFetch,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Query pour registrations
  const registrationsQuery = useQuery({
    queryKey: ['fanafApi', 'registrations'],
    queryFn: async () => {
      const response = await fanafApi.getRegistrations();
      return response.data || [];
    },
    enabled: false, // Non auto-fetché par défaut
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Query pour flight plans
  const flightPlansQuery = useQuery({
    queryKey: ['fanafApi', 'flightPlans'],
    queryFn: async () => {
      const response = await fanafApi.getFlightPlans();
      return response.data || [];
    },
    enabled: false, // Non auto-fetché par défaut
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Query pour flight plans stats
  const flightPlansStatsQuery = useQuery({
    queryKey: ['fanafApi', 'flightPlansStats'],
    queryFn: async () => {
      return await fanafApi.getFlightPlansStats();
    },
    enabled: enabled && autoFetch,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Query pour badge scans counters
  const badgeScansCountersQuery = useQuery({
    queryKey: ['fanafApi', 'badgeScansCounters'],
    queryFn: async () => {
      try {
        return await fanafApi.getBadgeScansCounters();
      } catch (err: any) {
        // Erreurs réseau pour badge scans sont ignorées silencieusement (non-critique)
        const isNetworkError = err?.message?.includes('connexion') || 
                              err?.message?.includes('Failed to fetch') ||
                              err?.message?.includes('NetworkError');
        if (!isNetworkError) {
          console.warn('[useFanafApi] Erreur badge scans counters (non-critique):', err?.message || err);
        }
        return null;
      }
    },
    enabled: enabled && autoFetch,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: false,
  });

  // Fetch functions utilisant React Query
  const fetchParticipants = async (params?: { page?: number; per_page?: number; category?: 'member' | 'not_member' | 'vip' }) => {
    if (!enabled) return;
    return queryClient.fetchQuery({
      queryKey: ['fanafApi', 'participants', params],
      queryFn: async () => {
        const response = await fanafApi.getParticipants(params);
        return response;
      },
    });
  };

  const fetchAssociations = async (params?: { page?: number; per_page?: number }) => {
    if (!enabled) return;
    return queryClient.fetchQuery({
      queryKey: ['fanafApi', 'associations', params],
      queryFn: async () => {
        const response = await fanafApi.getAssociations(params);
        return response;
      },
    });
  };

  const fetchNetworkingRequests = async (params?: { page?: number; per_page?: number; type?: 'participant' | 'sponsor'; status?: string }) => {
    if (!enabled) return;
    return queryClient.fetchQuery({
      queryKey: ['fanafApi', 'networkingRequests', params],
      queryFn: async () => {
        const response = await fanafApi.getNetworkingRequests(params);
        return response;
      },
    });
  };

  const fetchRegistrations = async (params?: { category?: 'member' | 'not_member' | 'vip'; per_page?: number; page?: number }) => {
    if (!enabled) return;
    return queryClient.fetchQuery({
      queryKey: ['fanafApi', 'registrations', params],
      queryFn: async () => {
        const response = await fanafApi.getRegistrations(params);
        return response;
      },
    });
  };

  const fetchFlightPlans = async (params?: { page?: number; per_page?: number }) => {
    if (!enabled) return;
    return queryClient.fetchQuery({
      queryKey: ['fanafApi', 'flightPlans', params],
      queryFn: async () => {
        const response = await fanafApi.getFlightPlans(params);
        return response;
      },
    });
  };

  const fetchFlightPlansStats = async () => {
    if (!enabled) return;
    return queryClient.fetchQuery({
      queryKey: ['fanafApi', 'flightPlansStats'],
      queryFn: async () => {
        return await fanafApi.getFlightPlansStats();
      },
    });
  };

  const fetchBadgeScansCounters = async () => {
    if (!enabled) return null;
    try {
      return queryClient.fetchQuery({
        queryKey: ['fanafApi', 'badgeScansCounters'],
        queryFn: async () => {
          return await fanafApi.getBadgeScansCounters();
        },
      });
    } catch (err: any) {
      const isNetworkError = err?.message?.includes('connexion') || 
                            err?.message?.includes('Failed to fetch') ||
                            err?.message?.includes('NetworkError');
      if (!isNetworkError) {
        console.warn('[useFanafApi] Erreur badge scans counters (non-critique):', err?.message || err);
      }
      return null;
    }
  };

  // Calculer loading et error agrégés
  const loading = participantsQuery.isLoading || associationsQuery.isLoading || 
                  networkingRequestsQuery.isLoading || flightPlansStatsQuery.isLoading || 
                  badgeScansCountersQuery.isLoading;
  
  const error = participantsQuery.error || associationsQuery.error || 
                networkingRequestsQuery.error || flightPlansStatsQuery.error;

  return {
    // Data
    participants: participantsQuery.data || [],
    associations: associationsQuery.data || [],
    networkingRequests: networkingRequestsQuery.data || [],
    registrations: registrationsQuery.data || [],
    flightPlans: flightPlansQuery.data || [],
    badgeScansCounters: badgeScansCountersQuery.data || null,
    flightPlansStats: flightPlansStatsQuery.data || null,

    // State
    loading,
    error: error ? (error as Error).message : null,

    // Fetch functions
    fetchParticipants,
    fetchAssociations,
    fetchNetworkingRequests,
    fetchRegistrations,
    fetchFlightPlans,
    fetchFlightPlansStats,
    fetchBadgeScansCounters,

    // Direct API access
    api: fanafApi,
  };
}


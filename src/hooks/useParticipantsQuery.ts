'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { inscriptionsDataService } from '../components/data/inscriptionsData';
import type { Participant } from '../components/data/types';
import { useState } from 'react';

/**
 * Hook React Query pour récupérer les participants depuis l'API uniquement
 */
export function useParticipantsQuery(options?: {
  enabled?: boolean;
  includeOrganisations?: boolean;
  categories?: Array<'member' | 'not_member' | 'vip'>;
}) {
  const { enabled = true, includeOrganisations = false, categories } = options || {};
  const queryClient = useQueryClient();
  
  const [finalisedParticipantsIds, setFinalisedParticipantsIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const stored = localStorage.getItem('finalisedParticipantsIds');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Fonction helper pour appliquer le statut finalisé aux participants
  function applyFinalisedStatus(participants: Participant[], finalisedIds: Set<string>): Participant[] {
    return participants.map(p => {
      if (finalisedIds.has(p.id) && p.statutInscription === 'non-finalisée') {
        return { ...p, statutInscription: 'finalisée' as const };
      }
      return p;
    });
  }

  const query = useQuery({
    queryKey: ['participants', Array.from(finalisedParticipantsIds).sort().join(','), categories?.join(',') || 'all'],
    queryFn: async () => {
      // Récupérer uniquement depuis l'API via le service
      const apiParticipants = await inscriptionsDataService.loadParticipants(categories);
      return applyFinalisedStatus(apiParticipants || [], finalisedParticipantsIds);
    },
    enabled,
    staleTime: 30 * 1000, // 30 secondes - rafraîchir plus souvent pour les mises à jour locales
    gcTime: 5 * 60 * 1000, // 5 minutes en cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Écouter les changements via React Query uniquement
  // Les événements paymentFinalized doivent invalider directement les queries React Query
  // Note: Le localStorage est lu une seule fois lors de l'initialisation du state
  // Pour les mises à jour en temps réel, utilisez queryClient.invalidateQueries({ queryKey: ['participants'] })
  // depuis l'endroit où vous dispatch l'événement paymentFinalized

  return {
    ...query,
    participants: query.data || [],
  };
}


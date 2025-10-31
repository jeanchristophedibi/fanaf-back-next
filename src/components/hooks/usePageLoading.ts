'use client';

import { useParticipantsQuery } from '../../hooks/useParticipantsQuery';
import { useOrganisationsQuery } from '../../hooks/useOrganisationsQuery';

interface UsePageLoadingOptions {
  includeOrganisations?: boolean;
  includeRendezVous?: boolean;
}

/**
 * Hook pour gérer l'état de chargement global d'une page
 * Combine les états de chargement de tous les hooks de données avec React Query
 */
export function usePageLoading(options: UsePageLoadingOptions = {}) {
  const {
    includeOrganisations = false,
    includeRendezVous = false,
  } = options;

  // Utiliser React Query pour charger les participants
  const { isLoading: isLoadingParticipants } = useParticipantsQuery({
    enabled: true,
  });

  const { isLoading: isLoadingOrganisations } = useOrganisationsQuery({
    enabled: includeOrganisations,
  });

  // État de chargement global
  const isLoading = isLoadingParticipants || (includeOrganisations && isLoadingOrganisations);

  return {
    isLoading,
  };
}


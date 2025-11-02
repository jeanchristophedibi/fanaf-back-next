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
  const { isLoading: isLoadingParticipants, error: participantsError } = useParticipantsQuery({
    enabled: true,
  });

  const { isLoading: isLoadingOrganisations, error: organisationsError } = useOrganisationsQuery({
    enabled: includeOrganisations,
  });

  // Si une erreur se produit, ne pas bloquer indéfiniment
  // Attendre seulement si on charge activement (pas d'erreur = chargement en cours normalement)
  // Mais si une erreur survient, ne pas bloquer indéfiniment - permettre à la page de s'afficher
  const isLoading = isLoadingParticipants || 
    (includeOrganisations && isLoadingOrganisations && !organisationsError && !participantsError);

  // Logger les erreurs mais ne pas bloquer le chargement indéfiniment
  if (participantsError) {
    console.warn('[usePageLoading] Erreur lors du chargement des participants:', participantsError);
  }
  if (organisationsError) {
    console.warn('[usePageLoading] Erreur lors du chargement des organisations:', organisationsError);
  }

  return {
    isLoading,
    error: participantsError || (includeOrganisations ? organisationsError : null),
  };
}


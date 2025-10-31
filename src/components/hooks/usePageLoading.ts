'use client';

import { useState, useEffect } from 'react';
import { useDynamicInscriptions } from './useDynamicInscriptions';
import { useOrganisationsQuery } from '../../hooks/useOrganisationsQuery';

interface UsePageLoadingOptions {
  includeOrganisations?: boolean;
  includeRendezVous?: boolean;
}

/**
 * Hook pour gérer l'état de chargement global d'une page
 * Combine les états de chargement de tous les hooks de données
 */
export function usePageLoading(options: UsePageLoadingOptions = {}) {
  const {
    includeOrganisations = false,
    includeRendezVous = false,
  } = options;

  // Utiliser le hook useDynamicInscriptions qui retourne déjà isLoading
  // Mais on doit charger les données explicitement pour détecter le chargement
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);
  
  // Charger les participants explicitement pour détecter le chargement initial
  useEffect(() => {
    import('../data/inscriptionsData').then(({ inscriptionsDataService }) => {
      let mounted = true;
      
      const loadParticipants = async () => {
        setIsLoadingParticipants(true);
        try {
          await inscriptionsDataService.loadParticipants();
        } catch (error) {
          console.error('Erreur lors du chargement des participants:', error);
        } finally {
          if (mounted) {
            // Petit délai pour éviter le flash
            setTimeout(() => {
              if (mounted) {
                setIsLoadingParticipants(false);
              }
            }, 300);
          }
        }
      };
      
      loadParticipants();
      return () => { mounted = false; };
    });
  }, []);

  const { isLoading: isLoadingOrganisations } = useOrganisationsQuery({
    enabled: includeOrganisations,
  });

  // État de chargement global
  const isLoading = isLoadingParticipants || (includeOrganisations && isLoadingOrganisations);

  return {
    isLoading,
  };
}


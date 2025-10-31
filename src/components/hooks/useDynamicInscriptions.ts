import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { inscriptionsDataService } from '../data/inscriptionsData';
import type { Participant, Organisation } from '../data/types';

interface UseDynamicDataOptions {
  enabled?: boolean;
  interval?: number; // en millisecondes
  includeOrganisations?: boolean;
  includeRendezVous?: boolean;
  includeReservations?: boolean;
}

// Types temporaires pour la compatibilité avec les fichiers existants
interface RendezVous {
  id: string;
  [key: string]: any;
}

interface ReservationStand {
  id: string;
  [key: string]: any;
}

export function useDynamicInscriptions({ 
  enabled = false, // DÉSACTIVÉ : Plus de nouvelles inscriptions automatiques
  interval = 120000, // Par défaut, nouvelle donnée toutes les 2 minutes (120 secondes)
  includeOrganisations = false,
  includeRendezVous = false,
  includeReservations = false,
}: UseDynamicDataOptions = {}) {
  const queryClient = useQueryClient();
  
  const [lastAddedParticipant, setLastAddedParticipant] = useState<Participant | null>(null);
  const [lastAddedOrganisation, setLastAddedOrganisation] = useState<Organisation | null>(null);
  const [lastAddedRendezVous, setLastAddedRendezVous] = useState<RendezVous | null>(null);
  const [lastAddedReservation, setLastAddedReservation] = useState<ReservationStand | null>(null);
  
  const [totalAdded, setTotalAdded] = useState(0);

  // Charger les participants avec React Query
  const { data: participants = [], isLoading: participantsLoading } = useQuery({
    queryKey: ['dynamicParticipants'],
    queryFn: async () => {
      try {
        return await inscriptionsDataService.loadParticipants();
      } catch (error) {
        console.error('Erreur lors du chargement des participants:', error);
        return [];
      }
    },
    enabled: enabled,
    refetchInterval: enabled ? interval : false,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Charger les organisations avec React Query si demandé
  const { data: organisations = [], isLoading: organisationsLoading } = useQuery({
    queryKey: ['dynamicOrganisations'],
    queryFn: async () => {
      try {
        return await inscriptionsDataService.loadOrganisations();
      } catch (error) {
        console.error('Erreur lors du chargement des organisations:', error);
        return [];
      }
    },
    enabled: enabled && includeOrganisations,
    refetchInterval: enabled ? interval : false,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // TODO: Charger rendezVous et reservations depuis l'API quand disponibles
  const rendezVous: RendezVous[] = [];
  const reservations: ReservationStand[] = [];

  const isLoading = participantsLoading || organisationsLoading;

  return {
    participants,
    organisations,
    rendezVous,
    reservations,
    lastAddedParticipant,
    lastAddedOrganisation,
    lastAddedRendezVous,
    lastAddedReservation,
    totalAdded,
  };
}

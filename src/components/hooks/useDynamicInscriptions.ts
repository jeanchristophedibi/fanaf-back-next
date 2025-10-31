import { useEffect, useState } from 'react';
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
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [reservations, setReservations] = useState<ReservationStand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [lastAddedParticipant, setLastAddedParticipant] = useState<Participant | null>(null);
  const [lastAddedOrganisation, setLastAddedOrganisation] = useState<Organisation | null>(null);
  const [lastAddedRendezVous, setLastAddedRendezVous] = useState<RendezVous | null>(null);
  const [lastAddedReservation, setLastAddedReservation] = useState<ReservationStand | null>(null);
  
  const [totalAdded, setTotalAdded] = useState(0);

  // Charger les données depuis l'API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Charger les participants
        const loadedParticipants = await inscriptionsDataService.loadParticipants();
        setParticipants(loadedParticipants);
        
        // Charger les organisations si demandé
        if (includeOrganisations) {
          const loadedOrganisations = await inscriptionsDataService.loadOrganisations();
          setOrganisations(loadedOrganisations);
        }
        
        // TODO: Charger rendezVous et reservations depuis l'API quand disponibles
        // Pour l'instant, on laisse les tableaux vides
        setRendezVous([]);
        setReservations([]);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    
    // Recharger périodiquement si enabled
    if (enabled) {
      const intervalId = setInterval(() => {
        loadData();
      }, interval);

      return () => clearInterval(intervalId);
    }
  }, [enabled, interval, includeOrganisations, includeRendezVous, includeReservations]);

  // Écouter les changements de localStorage pour les paiements finalisés
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handlePaymentFinalized = async () => {
      // Recharger les participants après finalisation d'un paiement
      try {
        const loadedParticipants = await inscriptionsDataService.loadParticipants();
        setParticipants(loadedParticipants);
      } catch (error) {
        console.error('Erreur lors du rechargement des participants:', error);
      }
    };

    // Écouter l'événement personnalisé dispatché lors de la finalisation d'un paiement
    window.addEventListener('paymentFinalized', handlePaymentFinalized);

    return () => {
      window.removeEventListener('paymentFinalized', handlePaymentFinalized);
    };
  }, []);

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

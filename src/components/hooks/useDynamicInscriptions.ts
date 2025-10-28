import { useEffect, useState } from 'react';
import { 
  addRandomParticipant, 
  addRandomOrganisation,
  addRandomRendezVous,
  addRandomReservation,
  subscribeToDataUpdates, 
  getCurrentParticipants,
  getCurrentOrganisations,
  getCurrentRendezVous,
  getCurrentReservations
} from '../data/mockData';
import type { Participant, Organisation, RendezVous, ReservationStand } from '../data/mockData';

interface UseDynamicDataOptions {
  enabled?: boolean;
  interval?: number; // en millisecondes
  includeOrganisations?: boolean;
  includeRendezVous?: boolean;
  includeReservations?: boolean;
}

export function useDynamicInscriptions({ 
  enabled = false, // DÉSACTIVÉ : Plus de nouvelles inscriptions automatiques
  interval = 120000, // Par défaut, nouvelle donnée toutes les 2 minutes (120 secondes)
  includeOrganisations = false,
  includeRendezVous = false,
  includeReservations = false,
}: UseDynamicDataOptions = {}) {
  // State pour tracker les participants finalisés via localStorage
  const [finalisedParticipantsIds, setFinalisedParticipantsIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('finalisedParticipantsIds');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }
    return new Set();
  });

  const [participants, setParticipants] = useState<Participant[]>(() => {
    const currentParticipants = getCurrentParticipants();
    return applyFinalisedStatus(currentParticipants, finalisedParticipantsIds);
  });
  const [organisations, setOrganisations] = useState<Organisation[]>(getCurrentOrganisations());
  const [rendezVous, setRendezVous] = useState<RendezVous[]>(getCurrentRendezVous());
  const [reservations, setReservations] = useState<ReservationStand[]>(getCurrentReservations());
  
  const [lastAddedParticipant, setLastAddedParticipant] = useState<Participant | null>(null);
  const [lastAddedOrganisation, setLastAddedOrganisation] = useState<Organisation | null>(null);
  const [lastAddedRendezVous, setLastAddedRendezVous] = useState<RendezVous | null>(null);
  const [lastAddedReservation, setLastAddedReservation] = useState<ReservationStand | null>(null);
  
  const [totalAdded, setTotalAdded] = useState(0);

  // Fonction helper pour appliquer le statut finalisé aux participants
  function applyFinalisedStatus(participants: Participant[], finalisedIds: Set<string>): Participant[] {
    return participants.map(p => {
      if (finalisedIds.has(p.id) && p.statutInscription === 'non-finalisée') {
        return { ...p, statutInscription: 'finalisée' as const };
      }
      return p;
    });
  }

  useEffect(() => {
    // S'abonner aux mises à jour
    const unsubscribe = subscribeToDataUpdates(() => {
      const currentParticipants = getCurrentParticipants();
      setParticipants(applyFinalisedStatus(currentParticipants, finalisedParticipantsIds));
      setOrganisations(getCurrentOrganisations());
      setRendezVous(getCurrentRendezVous());
      setReservations(getCurrentReservations());
    });

    return unsubscribe;
  }, [finalisedParticipantsIds]);

  // Écouter les changements de localStorage pour les paiements finalisés
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handlePaymentFinalized = () => {
      // Recharger les IDs des participants finalisés depuis localStorage
      const stored = localStorage.getItem('finalisedParticipantsIds');
      const newFinalisedIds = stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
      setFinalisedParticipantsIds(newFinalisedIds);
      
      // Mettre à jour la liste des participants avec les nouveaux statuts
      const currentParticipants = getCurrentParticipants();
      setParticipants(applyFinalisedStatus(currentParticipants, newFinalisedIds));
    };

    // Écouter l'événement personnalisé dispatché lors de la finalisation d'un paiement
    window.addEventListener('paymentFinalized', handlePaymentFinalized);

    return () => {
      window.removeEventListener('paymentFinalized', handlePaymentFinalized);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Ajouter des données aléatoires à intervalles réguliers
    const intervalId = setInterval(() => {
      // Décider quel type de donnée ajouter
      const types: string[] = ['participant'];
      
      if (includeOrganisations) types.push('organisation');
      if (includeRendezVous) types.push('rendezVous');
      if (includeReservations) types.push('reservation');
      
      const selectedType = types[Math.floor(Math.random() * types.length)];
      
      switch (selectedType) {
        case 'participant':
          const newParticipant = addRandomParticipant();
          setLastAddedParticipant(newParticipant);
          setTimeout(() => setLastAddedParticipant(null), 3000);
          break;
          
        case 'organisation':
          const newOrganisation = addRandomOrganisation();
          setLastAddedOrganisation(newOrganisation);
          setTimeout(() => setLastAddedOrganisation(null), 3000);
          break;
          
        case 'rendezVous':
          const newRdv = addRandomRendezVous();
          setLastAddedRendezVous(newRdv);
          setTimeout(() => setLastAddedRendezVous(null), 3000);
          break;
          
        case 'reservation':
          const newReservation = addRandomReservation();
          setLastAddedReservation(newReservation);
          setTimeout(() => setLastAddedReservation(null), 3000);
          break;
      }
      
      setTotalAdded(prev => prev + 1);
    }, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, includeOrganisations, includeRendezVous, includeReservations]);

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

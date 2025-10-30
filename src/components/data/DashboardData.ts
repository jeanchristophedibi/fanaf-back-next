/**
 * Agrégateur de données pour le Dashboard
 * Centralise le chargement et le calcul des compteurs (inscriptions, organisations, networking)
 */

import { inscriptionsDataService } from './inscriptionsData';
import { networkingDataService } from './networkingData';

export interface DashboardCounts {
  totals: {
    participants: number;
    organisations: number;
    rendezVous: number;
  };
  inscriptions: {
    membres: number;
    nonMembres: number;
    vip: number;
    speakers: number;
    enAttenteMembres: number;
    enAttenteNonMembres: number;
  };
  organisations: {
    membres: number;
    nonMembres: number;
    sponsors: number;
  };
  networking: {
    rdvSponsors: number;
    rdvParticipants: number;
  };
}

export async function loadDashboardCounts(): Promise<{
  counts: DashboardCounts;
  data: { participants: any[]; organisations: any[]; rendezVous: any[] };
}> {
  // Charger les jeux de données nécessaires
  const organisations = await inscriptionsDataService.loadOrganisations();
  const participants = await inscriptionsDataService.loadParticipants(['member', 'not_member', 'vip']);
  const rendezVous = await networkingDataService.loadNetworkingRequests();

  // Calculer les compteurs Inscriptions
  const inscriptions = {
    membres: participants.filter(p => p.statut === 'membre' && p.statutInscription === 'finalisée').length,
    nonMembres: participants.filter(p => p.statut === 'non-membre' && p.statutInscription === 'finalisée').length,
    vip: participants.filter(p => p.statut === 'vip').length,
    speakers: participants.filter(p => p.statut === 'speaker').length,
    enAttenteMembres: participants.filter(p => p.statut === 'membre' && p.statutInscription === 'non-finalisée').length,
    enAttenteNonMembres: participants.filter(p => p.statut === 'non-membre' && p.statutInscription === 'non-finalisée').length,
  };

  // Calculer les compteurs Organisations
  const organisationsCounts = {
    membres: organisations.filter(o => o.statut === 'membre').length,
    nonMembres: organisations.filter(o => o.statut === 'non-membre').length,
    sponsors: organisations.filter(o => o.statut === 'sponsor').length,
  };

  // Calculer les compteurs Networking
  const networking = {
    rdvSponsors: rendezVous.filter(r => r.type === 'sponsor').length,
    rdvParticipants: rendezVous.filter(r => r.type === 'participant').length,
  };

  const counts: DashboardCounts = {
    totals: {
      participants: participants.length,
      organisations: organisations.length,
      rendezVous: rendezVous.length,
    },
    inscriptions,
    organisations: organisationsCounts,
    networking,
  };

  return { counts, data: { participants, organisations, rendezVous } };
}



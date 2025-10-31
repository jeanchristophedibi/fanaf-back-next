/**
 * Types de base pour les données du système FANAF
 */

export type StatutParticipant = 'membre' | 'non-membre' | 'vip' | 'speaker';
export type StatutInscription = 'finalisée' | 'non-finalisée';
export type ModePaiement = 'espèce' | 'carte bancaire' | 'orange money' | 'wave' | 'virement' | 'chèque';
export type CanalEncaissement = 'externe' | 'asapay';

export interface Participant {
  id: string;
  nom: string;
  prenom: string;
  reference: string;
  email: string;
  telephone: string;
  pays: string;
  fonction?: string;
  organisationId: string;
  statut: StatutParticipant;
  statutInscription: StatutInscription;
  dateInscription: string;
  datePaiement?: string;
  modePaiement?: ModePaiement;
  canalEncaissement?: CanalEncaissement;
  caissier?: string;
  badgeGenere?: boolean;
  checkIn?: boolean;
  checkInDate?: string;
  groupeId?: string;
  nomGroupe?: string;
}

export interface Organisation {
  id: string;
  nom: string;
  contact?: string;
  email?: string;
  pays: string;
  dateCreation?: string;
  statut: 'membre' | 'non-membre' | 'sponsor';
  secteurActivite?: string;
  referent?: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    fonction: string;
  };
}

export type StatutRendezVous = 'acceptée' | 'en-attente' | 'occupée' | 'annulée';

export interface RendezVous {
  id: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  demandeurId: string;
  recepteurId: string;
  type: 'participant' | 'sponsor';
  statut: StatutRendezVous;
  sujet?: string;
  notes?: string;
  commentaire?: string;
}

export interface PlanVol {
  id: string;
  participantId: string;
  type: 'arrivee' | 'depart';
  date: string;
  heure: string;
  numeroVol: string;
  aeroport: string;
  compagnie: string;
  villeOrigine?: string;
  villeDestination?: string;
  aeroportOrigine?: string;
  aeroportDestination?: string;
}

export interface ReservationStand {
  id: string;
  organisationId: string;
  numeroStand: string;
  dateReservation: string;
  statut: 'confirmee' | 'en-attente' | 'annulee';
}

export type ProfilMembre = 'caissier' | 'agent-scan';

export interface MembreComite {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  profil: ProfilMembre;
  dateCreation: string;
}



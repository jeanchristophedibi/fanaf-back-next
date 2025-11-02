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

export interface Referent {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  fonction: string;
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
  referent?: Referent;
  is_active?: boolean; // Statut d'activation/désactivation de la compagnie
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

export type ProfilMembre = 'cashier' | 'scan_agent' | 'agent_registration' | 'badge_operator';

export interface MembreComite {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  profil: ProfilMembre;
  dateCreation: string;
  badge_url?: string;
}

export type TypeNotification = 'inscription' | 'rendez-vous' | 'vol' | 'alerte';
export type PrioriteNotification = 'haute' | 'moyenne' | 'basse';

export interface Notification {
  id: string;
  type: TypeNotification;
  priorite: PrioriteNotification;
  titre: string;
  message: string;
  dateCreation: string;
  lu: boolean;
  lien?: string;
}

// Système de notifications (stub - à implémenter avec l'API quand disponible)
const notificationsStore: Notification[] = [];
const subscribers: Array<(notification: Notification) => void> = [];

export function getCurrentNotifications(): Notification[] {
  return [...notificationsStore];
}

export function subscribeToNotifications(callback: (notification: Notification) => void): () => void {
  subscribers.push(callback);
  return () => {
    const index = subscribers.indexOf(callback);
    if (index > -1) {
      subscribers.splice(index, 1);
    }
  };
}

export function markNotificationAsRead(id: string): void {
  const notification = notificationsStore.find(n => n.id === id);
  if (notification) {
    notification.lu = true;
  }
}

export function markAllNotificationsAsRead(): void {
  notificationsStore.forEach(n => {
    n.lu = true;
  });
}



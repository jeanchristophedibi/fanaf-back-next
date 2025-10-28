// Types de données
export type StatutParticipant = 'membre' | 'non-membre' | 'vip' | 'speaker' | 'referent';
export type StatutInscription = 'finalisée' | 'non-finalisée';
export type StatutOrganisation = 'membre' | 'non-membre' | 'sponsor';
export type StatutRendezVous = 'acceptée' | 'occupée' | 'en-attente' | 'annulée';
export type StatutPaiement = 'payé' | 'non-payé' | 'partiellement-payé';
export type ModePaiement = 'espèce' | 'carte bancaire' | 'orange money' | 'wave' | 'virement' | 'chèque';
export type CanalEncaissement = 'externe' | 'asapay'; // Canal d'encaissement des paiements
export type ProfilMembre = 'caissier' | 'agent-scan';
export type TypeNotification = 'inscription' | 'rendez-vous' | 'vol' | 'alerte';
export type PrioriteNotification = 'haute' | 'moyenne' | 'basse';

// Notifications
export interface Notification {
  id: string;
  type: TypeNotification;
  priorite: PrioriteNotification;
  titre: string;
  message: string;
  dateCreation: string;
  lu: boolean;
  lien?: string; // Pour navigation vers la page concernée
}

// Badge & Check-in
export interface Badge {
  participantId: string;
  qrCode: string;
  genere: boolean;
  dateGeneration?: string;
}

export interface CheckIn {
  id: string;
  participantId: string;
  dateCheckIn: string;
  heureCheckIn: string;
  scanPar?: string; // ID du membre qui a scanné
  autorise: boolean; // Si l'accès a été autorisé ou refusé
  raisonRefus?: string; // Raison du refus si autorise = false
  nombreScans: number; // Nombre de fois que le badge a été scanné
  statutRemontee?: 'signale' | 'normal'; // Statut de remontée pour les cas problématiques
}

// Participants
export interface Participant {
  id: string;
  nom: string;
  prenom: string;
  reference: string;
  email: string;
  telephone: string;
  pays: string;
  fonction?: string; // Fonction/Poste du participant
  organisationId: string;
  statut: StatutParticipant;
  statutInscription: StatutInscription;
  dateInscription: string;
  datePaiement?: string; // Date à laquelle le paiement a été effectué
  modePaiement?: ModePaiement;
  canalEncaissement?: CanalEncaissement; // Canal d'encaissement (EXTERNE ou ASAPAY)
  caissier?: string; // Nom du caissier qui a finalisé le paiement
  badgeGenere?: boolean;
  checkIn?: boolean; // Indique si le participant a fait son check-in
  checkInDate?: string;
  groupeId?: string; // ID du groupe pour les inscriptions groupées
  nomGroupe?: string; // Nom du groupe pour affichage
}

// Plan de vol
export interface PlanVol {
  id: string;
  participantId: string;
  numeroVol: string;
  date: string;
  heure: string;
  aeroport: string;
  aeroportOrigine?: string; // Pour les arrivées - ville de provenance
  aeroportDestination?: string; // Pour les départs - ville de destination
  type: 'depart' | 'arrivee';
}

// Référent d'organisation (pour les sponsors)
export interface Referent {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  fonction: string; // Ex: Directeur Commercial, Responsable Partenariats, etc.
}

// Organisations
export interface Organisation {
  id: string;
  nom: string;
  contact: string;
  email: string;
  pays: string;
  dateCreation: string;
  statut: StatutOrganisation;
  secteurActivite?: string; // Secteur d'activité de l'organisation
  referent?: Referent; // Référent pour les sponsors qui reçoit les demandes de RDV
}

// Réservations de stand
export interface ReservationStand {
  id: string;
  participantId: string;
  numeroStand: string;
  dimension: '9m²' | '12m²';
  cout: number;
  statutPaiement: StatutPaiement;
  dateReservation: string;
}

// Rendez-vous
export interface RendezVous {
  id: string;
  demandeurId: string;
  recepteurId: string;
  type: 'participant' | 'sponsor';
  date: string;
  heure: string;
  statut: StatutRendezVous;
  commentaire?: string;
}

// Membres du comité d'organisation
export interface MembreComite {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  profil: ProfilMembre;
  dateCreation: string;
}

// Mock data
export const mockOrganisations: Organisation[] = [
  {
    id: 'org1',
    nom: 'Assurance CI',
    contact: '+225 27 20 30 40 50',
    email: 'contact@assurance-ci.com',
    pays: 'Côte d\'Ivoire',
    dateCreation: '2024-01-10',
    statut: 'membre',
  },
  {
    id: 'org2',
    nom: 'Sen Assur',
    contact: '+221 33 123 45 67',
    email: 'info@senassur.sn',
    pays: 'Sénégal',
    dateCreation: '2024-02-15',
    statut: 'membre',
  },
  {
    id: 'org3',
    nom: 'AXA Afrique',
    contact: '+225 27 20 50 60 70',
    email: 'contact@axa-afrique.com',
    pays: 'Côte d\'Ivoire',
    dateCreation: '2024-01-05',
    statut: 'sponsor',
    referent: {
      nom: 'Kouassi',
      prenom: 'Jean-Baptiste',
      email: 'jb.kouassi@axa-afrique.com',
      telephone: '+225 05 45 67 89 01',
      fonction: 'Directeur Commercial',
    },
  },
  {
    id: 'org4',
    nom: 'Mali Assur',
    contact: '+223 20 12 34 56',
    email: 'contact@maliassur.ml',
    pays: 'Mali',
    dateCreation: '2024-03-20',
    statut: 'membre',
  },
  {
    id: 'org5',
    nom: 'Tech Insurance Solutions',
    contact: '+225 07 88 99 00 11',
    email: 'info@techinsurance.com',
    pays: 'Côte d\'Ivoire',
    dateCreation: '2024-04-12',
    statut: 'non-membre',
  },
  {
    id: 'org6',
    nom: 'Allianz Africa',
    contact: '+237 6 70 12 34 56',
    email: 'contact@allianz-africa.com',
    pays: 'Cameroun',
    dateCreation: '2024-01-08',
    statut: 'sponsor',
    referent: {
      nom: 'Mballa',
      prenom: 'Christine',
      email: 'christine.mballa@allianz-africa.com',
      telephone: '+237 6 70 12 34 56',
      fonction: 'Responsable Partenariats',
    },
  },
  {
    id: 'org7',
    nom: 'Burkina Assur',
    contact: '+226 25 30 40 50',
    email: 'info@burkinaassur.bf',
    pays: 'Burkina Faso',
    dateCreation: '2024-05-18',
    statut: 'membre',
  },
  {
    id: 'org8',
    nom: 'Gabon Insurance',
    contact: '+241 01 23 45 67',
    email: 'contact@gabon-insurance.ga',
    pays: 'Gabon',
    dateCreation: '2024-02-28',
    statut: 'non-membre',
  },
  {
    id: 'org9',
    nom: 'Sanlam Assurance',
    contact: '+225 07 12 34 56 78',
    email: 'contact@sanlam-assurance.com',
    pays: 'Côte d\'Ivoire',
    dateCreation: '2024-01-15',
    statut: 'sponsor',
    referent: {
      nom: 'Diabaté',
      prenom: 'Mariam',
      email: 'mariam.diabate@sanlam-assurance.com',
      telephone: '+225 07 12 34 56 78',
      fonction: 'Directrice Marketing',
    },
  },
  {
    id: 'org10',
    nom: 'Saham Finances',
    contact: '+212 5 22 43 43 43',
    email: 'info@saham-finances.ma',
    pays: 'Maroc',
    dateCreation: '2024-02-01',
    statut: 'sponsor',
    referent: {
      nom: 'Benali',
      prenom: 'Karim',
      email: 'karim.benali@saham-finances.ma',
      telephone: '+212 6 61 23 45 67',
      fonction: 'Responsable Communication',
    },
  },
];

// Liste officielle fixe des 150 participants FANAF 2026
// Cette liste est identique pour tous les profils (Admin Agence, Admin FANAF, Admin ASACI, Opérateur Badge, etc.)
const getOfficialParticipants = (): Participant[] => {
  const participants: Participant[] = [
    // 55 MEMBRES FINALISÉS (payés)
    // Espèce (9 paiements)
    { id: '1', nom: 'Diallo', prenom: 'Amadou', reference: 'FANAF-2026-001', email: 'amadou.diallo@example.com', telephone: '+225 0701234501', pays: 'Côte d\'Ivoire', fonction: 'Directeur Général', organisationId: 'org1', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-15', modePaiement: 'espèce', canalEncaissement: 'externe', datePaiement: '2025-01-18' },
    { id: '2', nom: 'Ndiaye', prenom: 'Fatou', reference: 'FANAF-2026-002', email: 'fatou.ndiaye@example.com', telephone: '+221 771234502', pays: 'Sénégal', fonction: 'Directrice Marketing', organisationId: 'org2', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-16', modePaiement: 'espèce', canalEncaissement: 'externe', datePaiement: '2025-01-19' },
    { id: '3', nom: 'Kouassi', prenom: 'Jean-Baptiste', reference: 'FANAF-2026-003', email: 'jean-baptiste.kouassi@example.com', telephone: '+225 0701234503', pays: 'Côte d\'Ivoire', fonction: 'Responsable Communication', organisationId: 'org1', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-17', modePaiement: 'espèce', canalEncaissement: 'externe', datePaiement: '2025-01-20' },
    { id: '4', nom: 'Touré', prenom: 'Aissata', reference: 'FANAF-2026-004', email: 'aissata.toure@example.com', telephone: '+223 701234504', pays: 'Mali', fonction: 'Directrice Technique', organisationId: 'org4', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-18', modePaiement: 'espèce', canalEncaissement: 'externe', datePaiement: '2025-01-21' },
    { id: '5', nom: 'Kamara', prenom: 'Mohamed', reference: 'FANAF-2026-005', email: 'mohamed.kamara@example.com', telephone: '+225 0701234505', pays: 'Côte d\'Ivoire', fonction: 'Chef de Projet', organisationId: 'org1', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-19', modePaiement: 'espèce', canalEncaissement: 'externe', datePaiement: '2025-01-22' },
    { id: '6', nom: 'Sissoko', prenom: 'Mariam', reference: 'FANAF-2026-006', email: 'mariam.sissoko@example.com', telephone: '+223 701234506', pays: 'Mali', fonction: 'Analyste Risques', organisationId: 'org4', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-20', modePaiement: 'espèce', canalEncaissement: 'externe', datePaiement: '2025-01-23' },
    { id: '7', nom: 'Traoré', prenom: 'Ibrahim', reference: 'FANAF-2026-007', email: 'ibrahim.traore@example.com', telephone: '+226 701234507', pays: 'Burkina Faso', fonction: 'Directeur Commercial', organisationId: 'org7', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-21', modePaiement: 'espèce', canalEncaissement: 'externe', datePaiement: '2025-01-24' },
    { id: '8', nom: 'Ba', prenom: 'Aminata', reference: 'FANAF-2026-008', email: 'aminata.ba@example.com', telephone: '+221 771234508', pays: 'Sénégal', fonction: 'Responsable Souscription', organisationId: 'org2', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-22', modePaiement: 'espèce', canalEncaissement: 'externe', datePaiement: '2025-01-25' },
    { id: '9', nom: 'Keita', prenom: 'Seydou', reference: 'FANAF-2026-009', email: 'seydou.keita@example.com', telephone: '+223 701234509', pays: 'Mali', fonction: 'Directeur Financier', organisationId: 'org4', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-23', modePaiement: 'espèce', canalEncaissement: 'externe', datePaiement: '2025-01-26' },
    
    // Carte bancaire (9 paiements)
    { id: '10', nom: 'Sanogo', prenom: 'Fatoumata', reference: 'FANAF-2026-010', email: 'fatoumata.sanogo@example.com', telephone: '+225 0701234510', pays: 'Côte d\'Ivoire', fonction: 'Responsable Sinistres', organisationId: 'org1', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-24', modePaiement: 'carte bancaire', canalEncaissement: 'asapay', datePaiement: '2025-01-27' },
    { id: '11', nom: 'Cissé', prenom: 'Oumar', reference: 'FANAF-2026-011', email: 'oumar.cisse@example.com', telephone: '+221 771234511', pays: 'Sénégal', fonction: 'Chargé de Clientèle', organisationId: 'org2', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-25', modePaiement: 'carte bancaire', canalEncaissement: 'asapay', datePaiement: '2025-01-28' },
    { id: '12', nom: 'Konaté', prenom: 'Salimata', reference: 'FANAF-2026-012', email: 'salimata.konate@example.com', telephone: '+223 701234512', pays: 'Mali', fonction: 'Directrice des Opérations', organisationId: 'org4', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-26', modePaiement: 'carte bancaire', canalEncaissement: 'asapay', datePaiement: '2025-01-29' },
    { id: '13', nom: 'Ouattara', prenom: 'Mamadou', reference: 'FANAF-2026-013', email: 'mamadou.ouattara@example.com', telephone: '+225 0701234513', pays: 'Côte d\'Ivoire', fonction: 'Responsable Actuariat', organisationId: 'org1', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-27', modePaiement: 'carte bancaire', canalEncaissement: 'asapay', datePaiement: '2025-01-30' },
    { id: '14', nom: 'Sow', prenom: 'Aïcha', reference: 'FANAF-2026-014', email: 'aicha.sow@example.com', telephone: '+221 771234514', pays: 'Sénégal', fonction: 'Chef de Service', organisationId: 'org2', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-28', modePaiement: 'carte bancaire', canalEncaissement: 'asapay', datePaiement: '2025-01-31' },
    { id: '15', nom: 'Fofana', prenom: 'Abdoulaye', reference: 'FANAF-2026-015', email: 'abdoulaye.fofana@example.com', telephone: '+223 701234515', pays: 'Mali', fonction: 'Gestionnaire de Portefeuille', organisationId: 'org4', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-29', modePaiement: 'carte bancaire', canalEncaissement: 'asapay', datePaiement: '2025-02-01' },
    { id: '16', nom: 'Dembélé', prenom: 'Khady', reference: 'FANAF-2026-016', email: 'khady.dembele@example.com', telephone: '+226 701234516', pays: 'Burkina Faso', fonction: 'Directrice Marketing', organisationId: 'org7', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-15', modePaiement: 'carte bancaire', canalEncaissement: 'asapay', datePaiement: '2025-01-18' },
    { id: '17', nom: 'Kouyaté', prenom: 'Moussa', reference: 'FANAF-2026-017', email: 'moussa.kouyate@example.com', telephone: '+225 0701234517', pays: 'Côte d\'Ivoire', fonction: 'Directeur Technique', organisationId: 'org1', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-16', modePaiement: 'carte bancaire', canalEncaissement: 'asapay', datePaiement: '2025-01-19' },
    { id: '18', nom: 'Sylla', prenom: 'Maimouna', reference: 'FANAF-2026-018', email: 'maimouna.sylla@example.com', telephone: '+221 771234518', pays: 'Sénégal', fonction: 'Responsable Communication', organisationId: 'org2', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-17', modePaiement: 'carte bancaire', canalEncaissement: 'asapay', datePaiement: '2025-01-20' },
    
    // Orange Money (9 paiements)
    { id: '19', nom: 'Doumbia', prenom: 'Ousmane', reference: 'FANAF-2026-019', email: 'ousmane.doumbia@example.com', telephone: '+223 701234519', pays: 'Mali', fonction: 'Chef de Projet', organisationId: 'org4', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-18', modePaiement: 'orange money', canalEncaissement: 'asapay', datePaiement: '2025-01-21' },
    { id: '20', nom: 'Bamba', prenom: 'Bintou', reference: 'FANAF-2026-020', email: 'bintou.bamba@example.com', telephone: '+225 0701234520', pays: 'Côte d\'Ivoire', fonction: 'Analyste Risques', organisationId: 'org1', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-19', modePaiement: 'orange money', canalEncaissement: 'asapay', datePaiement: '2025-01-22' },
    { id: '21', nom: 'Coulibaly', prenom: 'Boubacar', reference: 'FANAF-2026-021', email: 'boubacar.coulibaly@example.com', telephone: '+223 701234521', pays: 'Mali', fonction: 'Directeur Commercial', organisationId: 'org4', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-20', modePaiement: 'orange money', canalEncaissement: 'asapay', datePaiement: '2025-01-23' },
    { id: '22', nom: 'Sawadogo', prenom: 'Awa', reference: 'FANAF-2026-022', email: 'awa.sawadogo@example.com', telephone: '+226 701234522', pays: 'Burkina Faso', fonction: 'Responsable Souscription', organisationId: 'org7', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-21', modePaiement: 'orange money', canalEncaissement: 'asapay', datePaiement: '2025-01-24' },
    { id: '23', nom: 'Ouédraogo', prenom: 'Ibrahima', reference: 'FANAF-2026-023', email: 'ibrahima.ouedraogo@example.com', telephone: '+226 701234523', pays: 'Burkina Faso', fonction: 'Directeur Financier', organisationId: 'org7', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-22', modePaiement: 'orange money', canalEncaissement: 'asapay', datePaiement: '2025-01-25' },
    { id: '24', nom: 'Mbaye', prenom: 'Coumba', reference: 'FANAF-2026-024', email: 'coumba.mbaye@example.com', telephone: '+221 771234524', pays: 'Sénégal', fonction: 'Responsable Sinistres', organisationId: 'org2', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-23', modePaiement: 'orange money', canalEncaissement: 'asapay', datePaiement: '2025-01-26' },
    { id: '25', nom: 'Fall', prenom: 'Souleymane', reference: 'FANAF-2026-025', email: 'souleymane.fall@example.com', telephone: '+221 771234525', pays: 'Sénégal', fonction: 'Chargé de Clientèle', organisationId: 'org2', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-24', modePaiement: 'orange money', canalEncaissement: 'asapay', datePaiement: '2025-01-27' },
    { id: '26', nom: 'Gueye', prenom: 'Mariama', reference: 'FANAF-2026-026', email: 'mariama.gueye@example.com', telephone: '+221 771234526', pays: 'Sénégal', fonction: 'Directrice des Opérations', organisationId: 'org2', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-25', modePaiement: 'orange money', canalEncaissement: 'asapay', datePaiement: '2025-01-28' },
    { id: '27', nom: 'Ndao', prenom: 'Adama', reference: 'FANAF-2026-027', email: 'adama.ndao@example.com', telephone: '+221 771234527', pays: 'Sénégal', fonction: 'Responsable Actuariat', organisationId: 'org2', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-26', modePaiement: 'orange money', canalEncaissement: 'asapay', datePaiement: '2025-01-29' },
    
    // Wave (9 paiements)
    { id: '28', nom: 'Thiam', prenom: 'Kadiatou', reference: 'FANAF-2026-028', email: 'kadiatou.thiam@example.com', telephone: '+221 771234528', pays: 'Sénégal', fonction: 'Chef de Service', organisationId: 'org2', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-27', modePaiement: 'wave', canalEncaissement: 'asapay', datePaiement: '2025-01-30' },
    { id: '29', nom: 'Sarr', prenom: 'Moustapha', reference: 'FANAF-2026-029', email: 'moustapha.sarr@example.com', telephone: '+221 771234529', pays: 'Sénégal', fonction: 'Gestionnaire de Portefeuille', organisationId: 'org2', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-28', modePaiement: 'wave', canalEncaissement: 'asapay', datePaiement: '2025-01-31' },
    { id: '30', nom: 'Sall', prenom: 'Ramata', reference: 'FANAF-2026-030', email: 'ramata.sall@example.com', telephone: '+221 771234530', pays: 'Sénégal', fonction: 'Directrice Marketing', organisationId: 'org2', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-29', modePaiement: 'wave', canalEncaissement: 'asapay', datePaiement: '2025-02-01' },
    { id: '31', nom: 'Diabaté', prenom: 'Lamine', reference: 'FANAF-2026-031', email: 'lamine.diabate@example.com', telephone: '+223 701234531', pays: 'Mali', fonction: 'Directeur Technique', organisationId: 'org4', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-15', modePaiement: 'wave', canalEncaissement: 'asapay', datePaiement: '2025-01-18' },
    { id: '32', nom: 'Koné', prenom: 'Salif', reference: 'FANAF-2026-032', email: 'salif.kone@example.com', telephone: '+225 0701234532', pays: 'Côte d\'Ivoire', fonction: 'Responsable Communication', organisationId: 'org1', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-16', modePaiement: 'wave', canalEncaissement: 'asapay', datePaiement: '2025-01-19' },
    { id: '33', nom: 'Yao', prenom: 'Clarisse', reference: 'FANAF-2026-033', email: 'clarisse.yao@example.com', telephone: '+225 0701234533', pays: 'Côte d\'Ivoire', fonction: 'Chef de Projet', organisationId: 'org1', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-17', modePaiement: 'wave', canalEncaissement: 'asapay', datePaiement: '2025-01-20' },
    { id: '34', nom: 'Koffi', prenom: 'Emmanuel', reference: 'FANAF-2026-034', email: 'emmanuel.koffi@example.com', telephone: '+225 0701234534', pays: 'Côte d\'Ivoire', fonction: 'Analyste Risques', organisationId: 'org1', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-18', modePaiement: 'wave', canalEncaissement: 'asapay', datePaiement: '2025-01-21' },
    { id: '35', nom: 'Mensah', prenom: 'Patricia', reference: 'FANAF-2026-035', email: 'patricia.mensah@example.com', telephone: '+228 701234535', pays: 'Togo', fonction: 'Directrice Commerciale', organisationId: 'org1', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-19', modePaiement: 'wave', canalEncaissement: 'asapay', datePaiement: '2025-01-22' },
    { id: '36', nom: 'Agboton', prenom: 'Jules', reference: 'FANAF-2026-036', email: 'jules.agboton@example.com', telephone: '+229 701234536', pays: 'Bénin', fonction: 'Responsable Souscription', organisationId: 'org1', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-20', modePaiement: 'wave', canalEncaissement: 'asapay', datePaiement: '2025-01-23' },
    
    // Virement (9 paiements)
    { id: '37', nom: 'Adjovi', prenom: 'Marie', reference: 'FANAF-2026-037', email: 'marie.adjovi@example.com', telephone: '+229 701234537', pays: 'Bénin', fonction: 'Directrice Financière', organisationId: 'org1', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-21', modePaiement: 'virement', canalEncaissement: 'externe', datePaiement: '2025-01-24' },
    { id: '38', nom: 'Zongo', prenom: 'Pascal', reference: 'FANAF-2026-038', email: 'pascal.zongo@example.com', telephone: '+226 701234538', pays: 'Burkina Faso', fonction: 'Responsable Sinistres', organisationId: 'org7', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-22', modePaiement: 'virement', canalEncaissement: 'externe', datePaiement: '2025-01-25' },
    { id: '39', nom: 'Kaboré', prenom: 'Françoise', reference: 'FANAF-2026-039', email: 'francoise.kabore@example.com', telephone: '+226 701234539', pays: 'Burkina Faso', fonction: 'Chargée de Clientèle', organisationId: 'org7', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-23', modePaiement: 'virement', canalEncaissement: 'externe', datePaiement: '2025-01-26' },
    { id: '40', nom: 'Tapsoba', prenom: 'Rodrigue', reference: 'FANAF-2026-040', email: 'rodrigue.tapsoba@example.com', telephone: '+226 701234540', pays: 'Burkina Faso', fonction: 'Directeur des Opérations', organisationId: 'org7', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-24', modePaiement: 'virement', canalEncaissement: 'externe', datePaiement: '2025-01-27' },
    { id: '41', nom: 'Compaoré', prenom: 'Sylvie', reference: 'FANAF-2026-041', email: 'sylvie.compaore@example.com', telephone: '+226 701234541', pays: 'Burkina Faso', fonction: 'Responsable Actuariat', organisationId: 'org7', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-25', modePaiement: 'virement', canalEncaissement: 'externe', datePaiement: '2025-01-28' },
    { id: '42', nom: 'Ilboudo', prenom: 'Georges', reference: 'FANAF-2026-042', email: 'georges.ilboudo@example.com', telephone: '+226 701234542', pays: 'Burkina Faso', fonction: 'Chef de Service', organisationId: 'org7', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-26', modePaiement: 'virement', canalEncaissement: 'externe', datePaiement: '2025-01-29' },
    { id: '43', nom: 'Nikièma', prenom: 'Hortense', reference: 'FANAF-2026-043', email: 'hortense.nikiema@example.com', telephone: '+226 701234543', pays: 'Burkina Faso', fonction: 'Gestionnaire de Portefeuille', organisationId: 'org7', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-27', modePaiement: 'virement', canalEncaissement: 'externe', datePaiement: '2025-01-30' },
    { id: '44', nom: 'Traoré', prenom: 'Yacouba', reference: 'FANAF-2026-044', email: 'yacouba.traore@example.com', telephone: '+225 0701234544', pays: 'Côte d\'Ivoire', fonction: 'Directeur Marketing', organisationId: 'org1', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-28', modePaiement: 'virement', canalEncaissement: 'externe', datePaiement: '2025-01-31' },
    { id: '45', nom: 'Diabaté', prenom: 'Mariam', reference: 'FANAF-2026-045', email: 'mariam.diabate@sanlam-assurance.com', telephone: '+225 07 12 34 56 78', pays: 'Côte d\'Ivoire', fonction: 'Directrice Marketing', organisationId: 'org9', statut: 'referent', statutInscription: 'finalisée', dateInscription: '2025-01-29', modePaiement: 'virement', canalEncaissement: 'externe', datePaiement: '2025-02-01' },
    
    // Chèque (10 paiements - membres)
    { id: '46', nom: 'Benali', prenom: 'Karim', reference: 'FANAF-2026-046', email: 'karim.benali@saham-finances.ma', telephone: '+212 6 61 23 45 67', pays: 'Maroc', fonction: 'Responsable Communication', organisationId: 'org10', statut: 'referent', statutInscription: 'finalisée', dateInscription: '2025-01-15', modePaiement: 'chèque', canalEncaissement: 'externe', datePaiement: '2025-01-18' },
    { id: '47', nom: 'El Khadir', prenom: 'Fatima', reference: 'FANAF-2026-047', email: 'fatima.elkhadir@example.com', telephone: '+212 661234547', pays: 'Maroc', fonction: 'Directrice Technique', organisationId: 'org10', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-16', modePaiement: 'chèque', canalEncaissement: 'externe', datePaiement: '2025-01-19' },
    { id: '48', nom: 'Benmoussa', prenom: 'Hassan', reference: 'FANAF-2026-048', email: 'hassan.benmoussa@example.com', telephone: '+212 661234548', pays: 'Maroc', fonction: 'Chef de Projet', organisationId: 'org10', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-17', modePaiement: 'chèque', canalEncaissement: 'externe', datePaiement: '2025-01-20' },
    { id: '49', nom: 'Alami', prenom: 'Leila', reference: 'FANAF-2026-049', email: 'leila.alami@example.com', telephone: '+212 661234549', pays: 'Maroc', fonction: 'Analyste Risques', organisationId: 'org10', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-18', modePaiement: 'chèque', canalEncaissement: 'externe', datePaiement: '2025-01-21' },
    { id: '50', nom: 'Tazi', prenom: 'Omar', reference: 'FANAF-2026-050', email: 'omar.tazi@example.com', telephone: '+212 661234550', pays: 'Maroc', fonction: 'Directeur Commercial', organisationId: 'org10', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-19', modePaiement: 'chèque', canalEncaissement: 'externe', datePaiement: '2025-01-22' },
    { id: '51', nom: 'Benjelloun', prenom: 'Samira', reference: 'FANAF-2026-051', email: 'samira.benjelloun@example.com', telephone: '+212 661234551', pays: 'Maroc', fonction: 'Responsable Souscription', organisationId: 'org10', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-20', modePaiement: 'chèque', canalEncaissement: 'externe', datePaiement: '2025-01-23' },
    { id: '52', nom: 'Belkhadir', prenom: 'Ahmed', reference: 'FANAF-2026-052', email: 'ahmed.belkhadir@example.com', telephone: '+212 661234552', pays: 'Maroc', fonction: 'Directeur Financier', organisationId: 'org10', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-21', modePaiement: 'chèque', canalEncaissement: 'externe', datePaiement: '2025-01-24' },
    { id: '53', nom: 'Chaoui', prenom: 'Nawal', reference: 'FANAF-2026-053', email: 'nawal.chaoui@example.com', telephone: '+212 661234553', pays: 'Maroc', fonction: 'Responsable Sinistres', organisationId: 'org10', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-22', modePaiement: 'chèque', canalEncaissement: 'externe', datePaiement: '2025-01-25' },
    { id: '54', nom: 'Fassi', prenom: 'Youssef', reference: 'FANAF-2026-054', email: 'youssef.fassi@example.com', telephone: '+212 661234554', pays: 'Maroc', fonction: 'Chargé de Clientèle', organisationId: 'org10', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-23', modePaiement: 'chèque', canalEncaissement: 'externe', datePaiement: '2025-01-26' },
    { id: '55', nom: 'Lahlou', prenom: 'Zineb', reference: 'FANAF-2026-055', email: 'zineb.lahlou@example.com', telephone: '+212 661234555', pays: 'Maroc', fonction: 'Directrice des Opérations', organisationId: 'org10', statut: 'membre', statutInscription: 'finalisée', dateInscription: '2025-01-24', modePaiement: 'chèque', canalEncaissement: 'externe', datePaiement: '2025-01-27' },
    
    // 40 NON-MEMBRES FINALISÉS (payés) - répartis sur 5 modes de paiement
    // Espèce (8 paiements)
    { id: '56', nom: 'Dupont', prenom: 'Michel', reference: 'FANAF-2026-056', email: 'michel.dupont@example.com', telephone: '+225 0701234556', pays: 'Côte d\'Ivoire', fonction: 'Directeur Général', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-25', modePaiement: 'espèce', canalEncaissement: 'externe', datePaiement: '2025-01-28' },
    { id: '57', nom: 'Martin', prenom: 'Sophie', reference: 'FANAF-2026-057', email: 'sophie.martin@example.com', telephone: '+225 0701234557', pays: 'Côte d\'Ivoire', fonction: 'Directrice Marketing', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-26', modePaiement: 'espèce', canalEncaissement: 'externe', datePaiement: '2025-01-29' },
    { id: '58', nom: 'Bernard', prenom: 'François', reference: 'FANAF-2026-058', email: 'francois.bernard@example.com', telephone: '+241 701234558', pays: 'Gabon', fonction: 'Responsable Communication', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-27', modePaiement: 'espèce', canalEncaissement: 'externe', datePaiement: '2025-01-30' },
    { id: '59', nom: 'Petit', prenom: 'Catherine', reference: 'FANAF-2026-059', email: 'catherine.petit@example.com', telephone: '+241 701234559', pays: 'Gabon', fonction: 'Directrice Technique', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-28', modePaiement: 'espèce', canalEncaissement: 'externe', datePaiement: '2025-01-31' },
    { id: '60', nom: 'Robert', prenom: 'Pierre', reference: 'FANAF-2026-060', email: 'pierre.robert@example.com', telephone: '+225 0701234560', pays: 'Côte d\'Ivoire', fonction: 'Chef de Projet', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-29', modePaiement: 'espèce', canalEncaissement: 'externe', datePaiement: '2025-02-01' },
    { id: '61', nom: 'Richard', prenom: 'Julie', reference: 'FANAF-2026-061', email: 'julie.richard@example.com', telephone: '+241 701234561', pays: 'Gabon', fonction: 'Analyste Risques', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-15', modePaiement: 'espèce', canalEncaissement: 'externe', datePaiement: '2025-01-18' },
    { id: '62', nom: 'Simon', prenom: 'Philippe', reference: 'FANAF-2026-062', email: 'philippe.simon@example.com', telephone: '+225 0701234562', pays: 'Côte d\'Ivoire', fonction: 'Directeur Commercial', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-16', modePaiement: 'espèce', canalEncaissement: 'externe', datePaiement: '2025-01-19' },
    { id: '63', nom: 'Laurent', prenom: 'Marie', reference: 'FANAF-2026-063', email: 'marie.laurent@example.com', telephone: '+241 701234563', pays: 'Gabon', fonction: 'Responsable Souscription', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-17', modePaiement: 'espèce', canalEncaissement: 'externe', datePaiement: '2025-01-20' },
    
    // Carte bancaire (8 paiements)
    { id: '64', nom: 'Leroy', prenom: 'David', reference: 'FANAF-2026-064', email: 'david.leroy@example.com', telephone: '+225 0701234564', pays: 'Côte d\'Ivoire', fonction: 'Directeur Financier', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-18', modePaiement: 'carte bancaire', canalEncaissement: 'asapay', datePaiement: '2025-01-21' },
    { id: '65', nom: 'Moreau', prenom: 'Isabelle', reference: 'FANAF-2026-065', email: 'isabelle.moreau@example.com', telephone: '+241 701234565', pays: 'Gabon', fonction: 'Responsable Sinistres', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-19', modePaiement: 'carte bancaire', canalEncaissement: 'asapay', datePaiement: '2025-01-22' },
    { id: '66', nom: 'Lambert', prenom: 'Nicolas', reference: 'FANAF-2026-066', email: 'nicolas.lambert@example.com', telephone: '+225 0701234566', pays: 'Côte d\'Ivoire', fonction: 'Chargé de Clientèle', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-20', modePaiement: 'carte bancaire', canalEncaissement: 'asapay', datePaiement: '2025-01-23' },
    { id: '67', nom: 'Fontaine', prenom: 'Nathalie', reference: 'FANAF-2026-067', email: 'nathalie.fontaine@example.com', telephone: '+241 701234567', pays: 'Gabon', fonction: 'Directrice des Opérations', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-21', modePaiement: 'carte bancaire', canalEncaissement: 'asapay', datePaiement: '2025-01-24' },
    { id: '68', nom: 'Rousseau', prenom: 'Olivier', reference: 'FANAF-2026-068', email: 'olivier.rousseau@example.com', telephone: '+225 0701234568', pays: 'Côte d\'Ivoire', fonction: 'Responsable Actuariat', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-22', modePaiement: 'carte bancaire', canalEncaissement: 'asapay', datePaiement: '2025-01-25' },
    { id: '69', nom: 'Vincent', prenom: 'Véronique', reference: 'FANAF-2026-069', email: 'veronique.vincent@example.com', telephone: '+241 701234569', pays: 'Gabon', fonction: 'Chef de Service', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-23', modePaiement: 'carte bancaire', canalEncaissement: 'asapay', datePaiement: '2025-01-26' },
    { id: '70', nom: 'Muller', prenom: 'Patrick', reference: 'FANAF-2026-070', email: 'patrick.muller@example.com', telephone: '+225 0701234570', pays: 'Côte d\'Ivoire', fonction: 'Gestionnaire de Portefeuille', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-24', modePaiement: 'carte bancaire', canalEncaissement: 'asapay', datePaiement: '2025-01-27' },
    { id: '71', nom: 'Lefebvre', prenom: 'Sandrine', reference: 'FANAF-2026-071', email: 'sandrine.lefebvre@example.com', telephone: '+241 701234571', pays: 'Gabon', fonction: 'Directrice Marketing', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-25', modePaiement: 'carte bancaire', canalEncaissement: 'asapay', datePaiement: '2025-01-28' },
    
    // Orange Money (8 paiements)
    { id: '72', nom: 'Girard', prenom: 'Thierry', reference: 'FANAF-2026-072', email: 'thierry.girard@example.com', telephone: '+225 0701234572', pays: 'Côte d\'Ivoire', fonction: 'Directeur Technique', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-26', modePaiement: 'orange money', canalEncaissement: 'asapay', datePaiement: '2025-01-29' },
    { id: '73', nom: 'Bonnet', prenom: 'Sylvie', reference: 'FANAF-2026-073', email: 'sylvie.bonnet@example.com', telephone: '+241 701234573', pays: 'Gabon', fonction: 'Responsable Communication', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-27', modePaiement: 'orange money', canalEncaissement: 'asapay', datePaiement: '2025-01-30' },
    { id: '74', nom: 'Dupuis', prenom: 'Alain', reference: 'FANAF-2026-074', email: 'alain.dupuis@example.com', telephone: '+225 0701234574', pays: 'Côte d\'Ivoire', fonction: 'Chef de Projet', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-28', modePaiement: 'orange money', canalEncaissement: 'asapay', datePaiement: '2025-01-31' },
    { id: '75', nom: 'Lambert', prenom: 'Claire', reference: 'FANAF-2026-075', email: 'claire.lambert@example.com', telephone: '+241 701234575', pays: 'Gabon', fonction: 'Analyste Risques', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-29', modePaiement: 'orange money', canalEncaissement: 'asapay', datePaiement: '2025-02-01' },
    { id: '76', nom: 'Faure', prenom: 'Christian', reference: 'FANAF-2026-076', email: 'christian.faure@example.com', telephone: '+225 0701234576', pays: 'Côte d\'Ivoire', fonction: 'Directeur Commercial', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-15', modePaiement: 'orange money', canalEncaissement: 'asapay', datePaiement: '2025-01-18' },
    { id: '77', nom: 'Bertrand', prenom: 'Brigitte', reference: 'FANAF-2026-077', email: 'brigitte.bertrand@example.com', telephone: '+241 701234577', pays: 'Gabon', fonction: 'Responsable Souscription', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-16', modePaiement: 'orange money', canalEncaissement: 'asapay', datePaiement: '2025-01-19' },
    { id: '78', nom: 'Roux', prenom: 'Marc', reference: 'FANAF-2026-078', email: 'marc.roux@example.com', telephone: '+225 0701234578', pays: 'Côte d\'Ivoire', fonction: 'Directeur Financier', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-17', modePaiement: 'orange money', canalEncaissement: 'asapay', datePaiement: '2025-01-20' },
    { id: '79', nom: 'Fournier', prenom: 'Monique', reference: 'FANAF-2026-079', email: 'monique.fournier@example.com', telephone: '+241 701234579', pays: 'Gabon', fonction: 'Responsable Sinistres', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-18', modePaiement: 'orange money', canalEncaissement: 'asapay', datePaiement: '2025-01-21' },
    
    // Wave (8 paiements)
    { id: '80', nom: 'Blanc', prenom: 'Jean', reference: 'FANAF-2026-080', email: 'jean.blanc@example.com', telephone: '+225 0701234580', pays: 'Côte d\'Ivoire', fonction: 'Chargé de Clientèle', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-19', modePaiement: 'wave', canalEncaissement: 'asapay', datePaiement: '2025-01-22' },
    { id: '81', nom: 'Guerin', prenom: 'Annie', reference: 'FANAF-2026-081', email: 'annie.guerin@example.com', telephone: '+241 701234581', pays: 'Gabon', fonction: 'Directrice des Opérations', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-20', modePaiement: 'wave', canalEncaissement: 'asapay', datePaiement: '2025-01-23' },
    { id: '82', nom: 'Garnier', prenom: 'Daniel', reference: 'FANAF-2026-082', email: 'daniel.garnier@example.com', telephone: '+225 0701234582', pays: 'Côte d\'Ivoire', fonction: 'Responsable Actuariat', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-21', modePaiement: 'wave', canalEncaissement: 'asapay', datePaiement: '2025-01-24' },
    { id: '83', nom: 'Chevalier', prenom: 'Martine', reference: 'FANAF-2026-083', email: 'martine.chevalier@example.com', telephone: '+241 701234583', pays: 'Gabon', fonction: 'Chef de Service', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-22', modePaiement: 'wave', canalEncaissement: 'asapay', datePaiement: '2025-01-25' },
    { id: '84', nom: 'François', prenom: 'Bruno', reference: 'FANAF-2026-084', email: 'bruno.francois@example.com', telephone: '+225 0701234584', pays: 'Côte d\'Ivoire', fonction: 'Gestionnaire de Portefeuille', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-23', modePaiement: 'wave', canalEncaissement: 'asapay', datePaiement: '2025-01-26' },
    { id: '85', nom: 'Gauthier', prenom: 'Nicole', reference: 'FANAF-2026-085', email: 'nicole.gauthier@example.com', telephone: '+241 701234585', pays: 'Gabon', fonction: 'Directrice Marketing', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-24', modePaiement: 'wave', canalEncaissement: 'asapay', datePaiement: '2025-01-27' },
    { id: '86', nom: 'Mercier', prenom: 'Didier', reference: 'FANAF-2026-086', email: 'didier.mercier@example.com', telephone: '+225 0701234586', pays: 'Côte d\'Ivoire', fonction: 'Directeur Technique', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-25', modePaiement: 'wave', canalEncaissement: 'asapay', datePaiement: '2025-01-28' },
    { id: '87', nom: 'Barbier', prenom: 'Colette', reference: 'FANAF-2026-087', email: 'colette.barbier@example.com', telephone: '+241 701234587', pays: 'Gabon', fonction: 'Responsable Communication', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-26', modePaiement: 'wave', canalEncaissement: 'asapay', datePaiement: '2025-01-29' },
    
    // Virement (8 paiements)
    { id: '88', nom: 'Renard', prenom: 'Bernard', reference: 'FANAF-2026-088', email: 'bernard.renard@example.com', telephone: '+225 0701234588', pays: 'Côte d\'Ivoire', fonction: 'Chef de Projet', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-27', modePaiement: 'virement', canalEncaissement: 'externe', datePaiement: '2025-01-30' },
    { id: '89', nom: 'Arnaud', prenom: 'Chantal', reference: 'FANAF-2026-089', email: 'chantal.arnaud@example.com', telephone: '+241 701234589', pays: 'Gabon', fonction: 'Analyste Risques', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-28', modePaiement: 'virement', canalEncaissement: 'externe', datePaiement: '2025-01-31' },
    { id: '90', nom: 'Giraud', prenom: 'Serge', reference: 'FANAF-2026-090', email: 'serge.giraud@example.com', telephone: '+225 0701234590', pays: 'Côte d\'Ivoire', fonction: 'Directeur Commercial', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-29', modePaiement: 'virement', canalEncaissement: 'externe', datePaiement: '2025-02-01' },
    { id: '91', nom: 'Aubry', prenom: 'Jacqueline', reference: 'FANAF-2026-091', email: 'jacqueline.aubry@example.com', telephone: '+241 701234591', pays: 'Gabon', fonction: 'Responsable Souscription', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-15', modePaiement: 'virement', canalEncaissement: 'externe', datePaiement: '2025-01-18' },
    { id: '92', nom: 'Lemoine', prenom: 'Robert', reference: 'FANAF-2026-092', email: 'robert.lemoine@example.com', telephone: '+225 0701234592', pays: 'Côte d\'Ivoire', fonction: 'Directeur Financier', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-16', modePaiement: 'virement', canalEncaissement: 'externe', datePaiement: '2025-01-19' },
    { id: '93', nom: 'Dumas', prenom: 'Denise', reference: 'FANAF-2026-093', email: 'denise.dumas@example.com', telephone: '+241 701234593', pays: 'Gabon', fonction: 'Responsable Sinistres', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-17', modePaiement: 'virement', canalEncaissement: 'externe', datePaiement: '2025-01-20' },
    { id: '94', nom: 'Rey', prenom: 'Georges', reference: 'FANAF-2026-094', email: 'georges.rey@example.com', telephone: '+225 0701234594', pays: 'Côte d\'Ivoire', fonction: 'Chargé de Clientèle', organisationId: 'org5', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-18', modePaiement: 'virement', canalEncaissement: 'externe', datePaiement: '2025-01-21' },
    { id: '95', nom: 'Perrin', prenom: 'Yvette', reference: 'FANAF-2026-095', email: 'yvette.perrin@example.com', telephone: '+241 701234595', pays: 'Gabon', fonction: 'Directrice des Opérations', organisationId: 'org8', statut: 'non-membre', statutInscription: 'finalisée', dateInscription: '2025-01-19', modePaiement: 'virement', canalEncaissement: 'externe', datePaiement: '2025-01-22' },
    
    // 10 VIP (exonérés)
    { id: '96', nom: 'N\'Guessan', prenom: 'Alassane', reference: 'FANAF-2026-096', email: 'alassane.nguessan@example.com', telephone: '+225 0701234596', pays: 'Côte d\'Ivoire', fonction: 'Commissaire Général FANAF', organisationId: 'org1', statut: 'vip', statutInscription: 'finalisée', dateInscription: '2025-01-20' },
    { id: '97', nom: 'Wade', prenom: 'Cheikh', reference: 'FANAF-2026-097', email: 'cheikh.wade@example.com', telephone: '+221 771234597', pays: 'Sénégal', fonction: 'Président FANAF', organisationId: 'org2', statut: 'vip', statutInscription: 'finalisée', dateInscription: '2025-01-21' },
    { id: '98', nom: 'Diarra', prenom: 'Bakary', reference: 'FANAF-2026-098', email: 'bakary.diarra@example.com', telephone: '+223 701234598', pays: 'Mali', fonction: 'Ministre des Finances', organisationId: 'org4', statut: 'vip', statutInscription: 'finalisée', dateInscription: '2025-01-22' },
    { id: '99', nom: 'Compaoré', prenom: 'Roch', reference: 'FANAF-2026-099', email: 'roch.compaore@example.com', telephone: '+226 701234599', pays: 'Burkina Faso', fonction: 'Gouverneur Banque Centrale', organisationId: 'org7', statut: 'vip', statutInscription: 'finalisée', dateInscription: '2025-01-23' },
    { id: '100', nom: 'Ondo', prenom: 'Paul', reference: 'FANAF-2026-100', email: 'paul.ondo@example.com', telephone: '+241 701234600', pays: 'Gabon', fonction: 'Ministre du Commerce', organisationId: 'org8', statut: 'vip', statutInscription: 'finalisée', dateInscription: '2025-01-24' },
    { id: '101', nom: 'Kouassi', prenom: 'Christine', reference: 'FANAF-2026-101', email: 'christine.kouassi@example.com', telephone: '+225 0701234601', pays: 'Côte d\'Ivoire', fonction: 'Directrice Générale Assurances', organisationId: 'org9', statut: 'vip', statutInscription: 'finalisée', dateInscription: '2025-01-25' },
    { id: '102', nom: 'Mballa', prenom: 'Christine', reference: 'FANAF-2026-102', email: 'christine.mballa@allianz-africa.com', telephone: '+237 6 70 12 34 56', pays: 'Cameroun', fonction: 'Responsable Partenariats', organisationId: 'org6', statut: 'vip', statutInscription: 'finalisée', dateInscription: '2025-01-26' },
    { id: '103', nom: 'Traoré', prenom: 'Lancina', reference: 'FANAF-2026-103', email: 'lancina.traore@example.com', telephone: '+223 701234603', pays: 'Mali', fonction: 'Secrétaire Général CIMA', organisationId: 'org4', statut: 'vip', statutInscription: 'finalisée', dateInscription: '2025-01-27' },
    { id: '104', nom: 'Bâ', prenom: 'Tidjane', reference: 'FANAF-2026-104', email: 'tidjane.ba@example.com', telephone: '+221 771234604', pays: 'Sénégal', fonction: 'PDG Sunu Assurances', organisationId: 'org2', statut: 'vip', statutInscription: 'finalisée', dateInscription: '2025-01-28' },
    { id: '105', nom: 'Diop', prenom: 'Aminata', reference: 'FANAF-2026-105', email: 'aminata.diop@example.com', telephone: '+221 771234605', pays: 'Sénégal', fonction: 'Présidente ASACI', organisationId: 'org2', statut: 'vip', statutInscription: 'finalisée', dateInscription: '2025-01-29' },
    
    // 5 SPEAKERS (exonérés)
    { id: '106', nom: 'Johnson', prenom: 'Michael', reference: 'FANAF-2026-106', email: 'michael.johnson@example.com', telephone: '+1 2025551001', pays: 'États-Unis', fonction: 'Expert en Réassurance', organisationId: 'org3', statut: 'speaker', statutInscription: 'finalisée', dateInscription: '2025-01-15' },
    { id: '107', nom: 'Smith', prenom: 'Sarah', reference: 'FANAF-2026-107', email: 'sarah.smith@example.com', telephone: '+44 2075551002', pays: 'Royaume-Uni', fonction: 'Analyste Risques Climatiques', organisationId: 'org6', statut: 'speaker', statutInscription: 'finalisée', dateInscription: '2025-01-16' },
    { id: '108', nom: 'Chen', prenom: 'Wei', reference: 'FANAF-2026-108', email: 'wei.chen@example.com', telephone: '+86 1085551003', pays: 'Chine', fonction: 'Spécialiste Insurtech', organisationId: 'org3', statut: 'speaker', statutInscription: 'finalisée', dateInscription: '2025-01-17' },
    { id: '109', nom: 'Müller', prenom: 'Hans', reference: 'FANAF-2026-109', email: 'hans.muller@example.com', telephone: '+49 3085551004', pays: 'Allemagne', fonction: 'Expert en Actuariat', organisationId: 'org6', statut: 'speaker', statutInscription: 'finalisée', dateInscription: '2025-01-18' },
    { id: '110', nom: 'Martinez', prenom: 'Carlos', reference: 'FANAF-2026-110', email: 'carlos.martinez@example.com', telephone: '+34 915551005', pays: 'Espagne', fonction: 'Consultant Transformation Digitale', organisationId: 'org3', statut: 'speaker', statutInscription: 'finalisée', dateInscription: '2025-01-19' },
    
    // 20 MEMBRES EN ATTENTE (non-finalisés)
    { id: '111', nom: 'Koné', prenom: 'Yaya', reference: 'FANAF-2026-111', email: 'yaya.kone@example.com', telephone: '+225 0701234611', pays: 'Côte d\'Ivoire', fonction: 'Responsable Actuariat', organisationId: 'org1', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-20' },
    { id: '112', nom: 'Beye', prenom: 'Oumou', reference: 'FANAF-2026-112', email: 'oumou.beye@example.com', telephone: '+221 771234612', pays: 'Sénégal', fonction: 'Chef de Service', organisationId: 'org2', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-21' },
    { id: '113', nom: 'Sissoko', prenom: 'Lassana', reference: 'FANAF-2026-113', email: 'lassana.sissoko@example.com', telephone: '+223 701234613', pays: 'Mali', fonction: 'Gestionnaire de Portefeuille', organisationId: 'org4', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-22' },
    { id: '114', nom: 'Yameogo', prenom: 'Apollinaire', reference: 'FANAF-2026-114', email: 'apollinaire.yameogo@example.com', telephone: '+226 701234614', pays: 'Burkina Faso', fonction: 'Directeur Marketing', organisationId: 'org7', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-23' },
    { id: '115', nom: 'Tall', prenom: 'Aissatou', reference: 'FANAF-2026-115', email: 'aissatou.tall@example.com', telephone: '+221 771234615', pays: 'Sénégal', fonction: 'Directrice Technique', organisationId: 'org2', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-24' },
    { id: '116', nom: 'Camara', prenom: 'Sory', reference: 'FANAF-2026-116', email: 'sory.camara@example.com', telephone: '+224 621234616', pays: 'Guinée', fonction: 'Chef de Projet', organisationId: 'org1', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-25' },
    { id: '117', nom: 'Kébé', prenom: 'Fatoumata', reference: 'FANAF-2026-117', email: 'fatoumata.kebe@example.com', telephone: '+221 771234617', pays: 'Sénégal', fonction: 'Analyste Risques', organisationId: 'org2', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-26' },
    { id: '118', nom: 'Cissokho', prenom: 'Mamadou', reference: 'FANAF-2026-118', email: 'mamadou.cissokho@example.com', telephone: '+221 771234618', pays: 'Sénégal', fonction: 'Directeur Commercial', organisationId: 'org2', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-27' },
    { id: '119', nom: 'Maïga', prenom: 'Hawa', reference: 'FANAF-2026-119', email: 'hawa.maiga@example.com', telephone: '+223 701234619', pays: 'Mali', fonction: 'Responsable Souscription', organisationId: 'org4', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-28' },
    { id: '120', nom: 'Kaboré', prenom: 'Issouf', reference: 'FANAF-2026-120', email: 'issouf.kabore@example.com', telephone: '+226 701234620', pays: 'Burkina Faso', fonction: 'Directeur Financier', organisationId: 'org7', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-29' },
    { id: '121', nom: 'Dia', prenom: 'Moussa', reference: 'FANAF-2026-121', email: 'moussa.dia@example.com', telephone: '+221 771234621', pays: 'Sénégal', fonction: 'Responsable Sinistres', organisationId: 'org2', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-15' },
    { id: '122', nom: 'Traoré', prenom: 'Aminata', reference: 'FANAF-2026-122', email: 'aminata.traore@example.com', telephone: '+225 0701234622', pays: 'Côte d\'Ivoire', fonction: 'Chargée de Clientèle', organisationId: 'org1', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-16' },
    { id: '123', nom: 'Barry', prenom: 'Mamadou', reference: 'FANAF-2026-123', email: 'mamadou.barry@example.com', telephone: '+224 621234623', pays: 'Guinée', fonction: 'Directeur des Opérations', organisationId: 'org1', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-17' },
    { id: '124', nom: 'Ouédraogo', prenom: 'Marie', reference: 'FANAF-2026-124', email: 'marie.ouedraogo@example.com', telephone: '+226 701234624', pays: 'Burkina Faso', fonction: 'Responsable Actuariat', organisationId: 'org7', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-18' },
    { id: '125', nom: 'Ndiaye', prenom: 'Omar', reference: 'FANAF-2026-125', email: 'omar.ndiaye@example.com', telephone: '+221 771234625', pays: 'Sénégal', fonction: 'Chef de Service', organisationId: 'org2', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-19' },
    { id: '126', nom: 'Diallo', prenom: 'Fatoumata', reference: 'FANAF-2026-126', email: 'fatoumata.diallo@example.com', telephone: '+224 621234626', pays: 'Guinée', fonction: 'Gestionnaire de Portefeuille', organisationId: 'org1', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-20' },
    { id: '127', nom: 'Keita', prenom: 'Boubacar', reference: 'FANAF-2026-127', email: 'boubacar.keita@example.com', telephone: '+223 701234627', pays: 'Mali', fonction: 'Directeur Marketing', organisationId: 'org4', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-21' },
    { id: '128', nom: 'Sow', prenom: 'Kadiatou', reference: 'FANAF-2026-128', email: 'kadiatou.sow@example.com', telephone: '+224 621234628', pays: 'Guinée', fonction: 'Directrice Technique', organisationId: 'org1', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-22' },
    { id: '129', nom: 'Sankara', prenom: 'Thomas', reference: 'FANAF-2026-129', email: 'thomas.sankara@example.com', telephone: '+226 701234629', pays: 'Burkina Faso', fonction: 'Responsable Communication', organisationId: 'org7', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-23' },
    { id: '130', nom: 'Cissé', prenom: 'Mariama', reference: 'FANAF-2026-130', email: 'mariama.cisse@example.com', telephone: '+221 771234630', pays: 'Sénégal', fonction: 'Chef de Projet', organisationId: 'org2', statut: 'membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-24' },
    
    // 20 NON-MEMBRES EN ATTENTE (non-finalisés)
    { id: '131', nom: 'Dubois', prenom: 'Laurent', reference: 'FANAF-2026-131', email: 'laurent.dubois@example.com', telephone: '+225 0701234631', pays: 'Côte d\'Ivoire', fonction: 'Analyste Risques', organisationId: 'org5', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-25' },
    { id: '132', nom: 'Thomas', prenom: 'Françoise', reference: 'FANAF-2026-132', email: 'francoise.thomas@example.com', telephone: '+241 701234632', pays: 'Gabon', fonction: 'Directrice Commerciale', organisationId: 'org8', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-26' },
    { id: '133', nom: 'Robert', prenom: 'Alain', reference: 'FANAF-2026-133', email: 'alain.robert@example.com', telephone: '+225 0701234633', pays: 'Côte d\'Ivoire', fonction: 'Responsable Souscription', organisationId: 'org5', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-27' },
    { id: '134', nom: 'Petit', prenom: 'Sylvie', reference: 'FANAF-2026-134', email: 'sylvie.petit@example.com', telephone: '+241 701234634', pays: 'Gabon', fonction: 'Directrice Financière', organisationId: 'org8', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-28' },
    { id: '135', nom: 'Durand', prenom: 'Jacques', reference: 'FANAF-2026-135', email: 'jacques.durand@example.com', telephone: '+225 0701234635', pays: 'Côte d\'Ivoire', fonction: 'Responsable Sinistres', organisationId: 'org5', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-29' },
    { id: '136', nom: 'Leroy', prenom: 'Christine', reference: 'FANAF-2026-136', email: 'christine.leroy@example.com', telephone: '+241 701234636', pays: 'Gabon', fonction: 'Chargée de Clientèle', organisationId: 'org8', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-15' },
    { id: '137', nom: 'Moreau', prenom: 'Paul', reference: 'FANAF-2026-137', email: 'paul.moreau@example.com', telephone: '+225 0701234637', pays: 'Côte d\'Ivoire', fonction: 'Directeur des Opérations', organisationId: 'org5', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-16' },
    { id: '138', nom: 'Simon', prenom: 'Martine', reference: 'FANAF-2026-138', email: 'martine.simon@example.com', telephone: '+241 701234638', pays: 'Gabon', fonction: 'Responsable Actuariat', organisationId: 'org8', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-17' },
    { id: '139', nom: 'Laurent', prenom: 'Thierry', reference: 'FANAF-2026-139', email: 'thierry.laurent@example.com', telephone: '+225 0701234639', pays: 'Côte d\'Ivoire', fonction: 'Chef de Service', organisationId: 'org5', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-18' },
    { id: '140', nom: 'Lefebvre', prenom: 'Nicole', reference: 'FANAF-2026-140', email: 'nicole.lefebvre@example.com', telephone: '+241 701234640', pays: 'Gabon', fonction: 'Gestionnaire de Portefeuille', organisationId: 'org8', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-19' },
    { id: '141', nom: 'Michel', prenom: 'André', reference: 'FANAF-2026-141', email: 'andre.michel@example.com', telephone: '+225 0701234641', pays: 'Côte d\'Ivoire', fonction: 'Directeur Marketing', organisationId: 'org5', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-20' },
    { id: '142', nom: 'Garcia', prenom: 'Isabelle', reference: 'FANAF-2026-142', email: 'isabelle.garcia@example.com', telephone: '+241 701234642', pays: 'Gabon', fonction: 'Directrice Technique', organisationId: 'org8', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-21' },
    { id: '143', nom: 'David', prenom: 'Claude', reference: 'FANAF-2026-143', email: 'claude.david@example.com', telephone: '+225 0701234643', pays: 'Côte d\'Ivoire', fonction: 'Responsable Communication', organisationId: 'org5', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-22' },
    { id: '144', nom: 'Bertrand', prenom: 'Monique', reference: 'FANAF-2026-144', email: 'monique.bertrand@example.com', telephone: '+241 701234644', pays: 'Gabon', fonction: 'Chef de Projet', organisationId: 'org8', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-23' },
    { id: '145', nom: 'Roux', prenom: 'Daniel', reference: 'FANAF-2026-145', email: 'daniel.roux@example.com', telephone: '+225 0701234645', pays: 'Côte d\'Ivoire', fonction: 'Analyste Risques', organisationId: 'org5', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-24' },
    { id: '146', nom: 'Vincent', prenom: 'Annie', reference: 'FANAF-2026-146', email: 'annie.vincent@example.com', telephone: '+241 701234646', pays: 'Gabon', fonction: 'Directrice Commerciale', organisationId: 'org8', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-25' },
    { id: '147', nom: 'Fournier', prenom: 'Bernard', reference: 'FANAF-2026-147', email: 'bernard.fournier@example.com', telephone: '+225 0701234647', pays: 'Côte d\'Ivoire', fonction: 'Responsable Souscription', organisationId: 'org5', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-26' },
    { id: '148', nom: 'Girard', prenom: 'Colette', reference: 'FANAF-2026-148', email: 'colette.girard@example.com', telephone: '+241 701234648', pays: 'Gabon', fonction: 'Directrice Financière', organisationId: 'org8', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-27' },
    { id: '149', nom: 'Bonnet', prenom: 'Serge', reference: 'FANAF-2026-149', email: 'serge.bonnet@example.com', telephone: '+225 0701234649', pays: 'Côte d\'Ivoire', fonction: 'Responsable Sinistres', organisationId: 'org5', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-28' },
    { id: '150', nom: 'Blanc', prenom: 'Chantal', reference: 'FANAF-2026-150', email: 'chantal.blanc@example.com', telephone: '+241 701234650', pays: 'Gabon', fonction: 'Chargée de Clientèle', organisationId: 'org8', statut: 'non-membre', statutInscription: 'non-finalisée', dateInscription: '2025-01-29' },
  ];
  
  return participants;
};

// Liste officielle fixe des 150 participants FANAF 2026
// IMPORTANT: Cette liste est la même pour tous les profils (Admin Agence, Admin FANAF, Admin ASACI, Opérateur Badge, Agent d'inscription, etc.)
let participantIdCounter = 151; // Commence après les 150 officiels
let dynamicParticipants: Participant[] = getOfficialParticipants();

// Export des participants actuels
export const mockParticipants: Participant[] = dynamicParticipants;

// Listeners pour les mises à jour
type DataUpdateListener = () => void;
const dataUpdateListeners: DataUpdateListener[] = [];

export const subscribeToDataUpdates = (listener: DataUpdateListener) => {
  dataUpdateListeners.push(listener);
  return () => {
    const index = dataUpdateListeners.indexOf(listener);
    if (index > -1) {
      dataUpdateListeners.splice(index, 1);
    }
  };
};

const notifyDataUpdate = () => {
  dataUpdateListeners.forEach(listener => listener());
};

// Fonction pour obtenir les participants actuels
export const getCurrentParticipants = () => {
  return [...dynamicParticipants];
};

// Fonction pour gén��rer un nouveau participant aléatoire
export const generateRandomParticipant = (): Participant => {
  const noms = ['Diallo', 'Ndiaye', 'Kouassi', 'Touré', 'Kamara', 'Sissoko', 'Traoré', 'Ba', 'Keita', 'Sanogo', 'Cissé', 'Konaté', 'Ouattara', 'Sow', 'Fofana', 'Dembélé', 'Kouyaté', 'Sylla', 'Doumbia', 'Bamba', 'Coulibaly', 'Sawadogo', 'Ouédraogo', 'Mbaye', 'Fall', 'Gueye', 'Ndao', 'Thiam', 'Sarr', 'Sall'];
  const prenoms = ['Amadou', 'Fatou', 'Jean-Baptiste', 'Aissata', 'Mohamed', 'Mariam', 'Ibrahim', 'Aminata', 'Seydou', 'Fatoumata', 'Oumar', 'Salimata', 'Mamadou', 'Aïcha', 'Abdoulaye', 'Khady', 'Moussa', 'Maimouna', 'Ousmane', 'Bintou', 'Boubacar', 'Awa', 'Ibrahima', 'Coumba', 'Souleymane', 'Mariama', 'Adama', 'Kadiatou', 'Moustapha', 'Ramata'];
  const pays = ['Côte d\'Ivoire', 'Sénégal', 'Mali', 'Burkina Faso', 'Guinée', 'Niger', 'Bénin', 'Togo', 'Cameroun', 'Gabon'];
  const orgs = ['org1', 'org2', 'org3', 'org4', 'org5', 'org6', 'org7', 'org8', 'org9', 'org10'];
  const modesPaiement: ModePaiement[] = ['espèce', 'carte bancaire', 'orange money', 'wave', 'virement'];
  
  // Types d'inscriptions possibles avec probabilités
  const types: { statut: StatutParticipant, statutInscription: StatutInscription, probability: number }[] = [
    { statut: 'membre', statutInscription: 'finalisée', probability: 0.35 },
    { statut: 'non-membre', statutInscription: 'finalisée', probability: 0.30 },
    { statut: 'membre', statutInscription: 'non-finalisée', probability: 0.20 },
    { statut: 'non-membre', statutInscription: 'non-finalisée', probability: 0.10 },
    { statut: 'vip', statutInscription: 'finalisée', probability: 0.03 },
    { statut: 'speaker', statutInscription: 'finalisée', probability: 0.02 },
  ];
  
  const rand = Math.random();
  let cumulative = 0;
  let selectedType = types[0];
  
  for (const type of types) {
    cumulative += type.probability;
    if (rand <= cumulative) {
      selectedType = type;
      break;
    }
  }
  
  const nom = noms[Math.floor(Math.random() * noms.length)];
  const prenom = prenoms[Math.floor(Math.random() * prenoms.length)];
  
  // Récupérer toutes les organisations disponibles
  const allOrganisations = [...mockOrganisations, ...dynamicOrganisations];
  
  // Sélectionner une organisation compatible avec le statut souhaité
  let orgId: string;
  if (selectedType.statut === 'vip' || selectedType.statut === 'speaker' || selectedType.statut === 'referent') {
    // VIP, Speaker et Référent doivent provenir d'organisations membre ou sponsor
    const orgsEligibles = allOrganisations.filter(org => org.statut === 'membre' || org.statut === 'sponsor');
    const selectedOrg = orgsEligibles[Math.floor(Math.random() * orgsEligibles.length)];
    orgId = selectedOrg ? selectedOrg.id : orgs[0];
  } else if (selectedType.statut === 'membre') {
    // Un participant membre doit provenir d'une organisation membre ou sponsor
    const orgsEligibles = allOrganisations.filter(org => org.statut === 'membre' || org.statut === 'sponsor');
    const selectedOrg = orgsEligibles[Math.floor(Math.random() * orgsEligibles.length)];
    orgId = selectedOrg ? selectedOrg.id : orgs[0];
  } else if (selectedType.statut === 'non-membre') {
    // Un participant non-membre doit provenir d'une organisation non-membre
    const orgsEligibles = allOrganisations.filter(org => org.statut === 'non-membre');
    const selectedOrg = orgsEligibles[Math.floor(Math.random() * orgsEligibles.length)];
    // Fallback sur org5 (Tech Insurance Solutions) qui est non-membre
    orgId = selectedOrg ? selectedOrg.id : 'org5';
  } else {
    orgId = orgs[Math.floor(Math.random() * orgs.length)];
  }
  
  const paysPart = pays[Math.floor(Math.random() * pays.length)];
  
  const now = new Date();
  const dateInscription = now.toISOString().split('T')[0];
  
  // Vérifier le statut de l'organisation sélectionnée
  const selectedOrg = allOrganisations.find(org => org.id === orgId);
  
  // RÈGLE DE GESTION : Le statut du participant doit être cohérent avec le statut de l'organisation
  // Organisation "membre" ou "sponsor" → Participant "membre" (sauf VIP/Speaker/Référent qui gardent leur statut)
  // Organisation "non-membre" → Participant "non-membre" (sauf VIP/Speaker/Référent qui gardent leur statut)
  let finalStatut = selectedType.statut;
  
  // Les VIP, Speaker et Référent conservent leur statut spécial
  if (selectedType.statut !== 'vip' && selectedType.statut !== 'speaker' && selectedType.statut !== 'referent') {
    if (selectedOrg?.statut === 'non-membre') {
      // Si l'organisation est non-membre, le participant doit être non-membre
      finalStatut = 'non-membre';
    } else if (selectedOrg?.statut === 'membre' || selectedOrg?.statut === 'sponsor') {
      // Si l'organisation est membre ou sponsor, le participant doit être membre
      finalStatut = 'membre';
    }
  }
  
  const participant: Participant = {
    id: String(participantIdCounter),
    nom,
    prenom,
    reference: `FANAF-2026-${String(participantIdCounter).padStart(3, '0')}`,
    email: `${prenom.toLowerCase().replace(/[éè]/g, 'e').replace(/[àâ]/g, 'a').replace(/[ïî]/g, 'i')}.${nom.toLowerCase()}@example.com`,
    telephone: `+225 ${Math.floor(10000000 + Math.random() * 90000000)}`,
    pays: paysPart,
    organisationId: orgId,
    statut: finalStatut,
    statutInscription: selectedType.statutInscription,
    dateInscription,
  };
  
  // Ajouter mode de paiement et canal d'encaissement pour les inscriptions finalisées payantes
  if (selectedType.statutInscription === 'finalisée' && (finalStatut === 'membre' || finalStatut === 'non-membre')) {
    // Attribuer un canal d'encaissement (60% EXTERNE, 40% ASAPAY)
    participant.canalEncaissement = Math.random() < 0.6 ? 'externe' : 'asapay';
    
    // RÈGLE MÉTIER : 
    // - EXTERNE : Chèque, Espèce + Virement uniquement
    // - ASAPAY : Carte, Orange Money, Wave uniquement
    if (participant.canalEncaissement === 'externe') {
      const modesExterne: ModePaiement[] = ['chèque', 'espèce', 'virement'];
      participant.modePaiement = modesExterne[Math.floor(Math.random() * modesExterne.length)];
    } else {
      const modesAsapay: ModePaiement[] = ['carte bancaire', 'orange money', 'wave'];
      participant.modePaiement = modesAsapay[Math.floor(Math.random() * modesAsapay.length)];
    }
    
    // Générer une date de paiement entre la date d'inscription et maintenant
    const inscriptionDate = new Date(dateInscription);
    const daysDiff = Math.floor(Math.random() * 5) + 1; // 1 à 5 jours après l'inscription
    const paiementDate = new Date(inscriptionDate);
    paiementDate.setDate(paiementDate.getDate() + daysDiff);
    participant.datePaiement = paiementDate.toISOString().split('T')[0];
  }
  
  // Ajouter un groupe aléatoirement (20% de chance d'appartenir à un groupe)
  if (Math.random() < 0.2 && (finalStatut === 'membre' || finalStatut === 'non-membre')) {
    const orgName = selectedOrg?.nom || 'Organisation';
    const groupNumber = Math.floor(Math.random() * 5) + 1; // Groupes 1 à 5
    participant.groupeId = `groupe-${orgId}-${groupNumber}`;
    participant.nomGroupe = `Délégation ${orgName} ${groupNumber}`;
  }
  
  participantIdCounter++;
  return participant;
};

// DÉSACTIVÉ: Fonction pour ajouter un nouveau participant
// La liste est maintenant fixée à 150 participants officiels
// Aucun nouveau participant ne peut être ajouté dynamiquement
export const addRandomParticipant = (): Participant => {
  console.warn('❌ Ajout de participants désactivé: La liste est fixée à 150 participants officiels');
  // Retourner le dernier participant comme placeholder (pas d'ajout réel)
  return dynamicParticipants[dynamicParticipants.length - 1];
};

// DÉSACTIVÉ: Fonction pour créer un groupe de participants
// La liste est maintenant fixée à 150 participants officiels
// Aucun nouveau groupe ne peut être créé dynamiquement
export const createParticipantGroup = (
  organisationId: string,
  groupName: string,
  count: number,
  statut: StatutParticipant = 'membre',
  statutInscription: StatutInscription = 'non-finalisée'
): Participant[] => {
  console.warn('❌ Création de groupes désactivée: La liste est fixée à 150 participants officiels');
  // Retourner un tableau vide (pas de création réelle)
  return [];
};

// ========== ORGANISATIONS DYNAMIQUES ==========
let organisationIdCounter = 11;
let dynamicOrganisations: Organisation[] = [];

export const getCurrentOrganisations = () => {
  return [...dynamicOrganisations];
};

export const generateRandomOrganisation = (): Organisation => {
  const nomsAssurances = [
    'Atlantique Assurances', 'Sahel Insurance', 'Tropical Assurance', 
    'Continental Insurance', 'Africa Re', 'Pan African Assurance',
    'Guaranty Trust Insurance', 'Liberty Mutual Africa', 'Eagle Insurance',
    'Phoenix Assurance', 'Prudential Africa', 'Metropolitan Insurance',
    'Alliance Assurance', 'Heritage Insurance', 'Unity Assurance'
  ];
  
  const pays = ['Côte d\'Ivoire', 'Sénégal', 'Mali', 'Burkina Faso', 'Guinée', 
                'Niger', 'Bénin', 'Togo', 'Cameroun', 'Gabon', 'RDC', 'Congo'];
  
  const statuts: StatutOrganisation[] = ['membre', 'non-membre', 'sponsor'];
  const probabilities = [0.5, 0.4, 0.1]; // 50% membre, 40% non-membre, 10% sponsor
  
  const rand = Math.random();
  let cumulative = 0;
  let selectedStatut: StatutOrganisation = 'membre';
  
  for (let i = 0; i < statuts.length; i++) {
    cumulative += probabilities[i];
    if (rand <= cumulative) {
      selectedStatut = statuts[i];
      break;
    }
  }
  
  const nom = nomsAssurances[Math.floor(Math.random() * nomsAssurances.length)] + ' ' + 
              (Math.random() > 0.5 ? pays[Math.floor(Math.random() * pays.length)] : '');
  const paysSel = pays[Math.floor(Math.random() * pays.length)];
  
  const now = new Date();
  const dateCreation = now.toISOString().split('T')[0];
  
  const organisation: Organisation = {
    id: `org${organisationIdCounter}`,
    nom,
    contact: `+225 ${Math.floor(10000000 + Math.random() * 90000000)}`,
    email: `contact@${nom.toLowerCase().replace(/\s+/g, '-').replace(/[àâ]/g, 'a').replace(/[éè]/g, 'e')}.com`,
    pays: paysSel,
    dateCreation,
    statut: selectedStatut,
  };
  
  // Ajouter référent si sponsor
  if (selectedStatut === 'sponsor') {
    const prenoms = ['Amadou', 'Fatou', 'Jean-Baptiste', 'Aissata', 'Mohamed', 'Mariam'];
    const noms = ['Diallo', 'Ndiaye', 'Kouassi', 'Touré', 'Kamara', 'Sissoko'];
    const prenom = prenoms[Math.floor(Math.random() * prenoms.length)];
    const nomRef = noms[Math.floor(Math.random() * noms.length)];
    
    organisation.referent = {
      nom: nomRef,
      prenom,
      email: `${prenom.toLowerCase()}.${nomRef.toLowerCase()}@${nom.toLowerCase().replace(/\s+/g, '-')}.com`,
      telephone: `+225 ${Math.floor(10000000 + Math.random() * 90000000)}`,
      fonction: 'Responsable Partenariats',
    };
  }
  
  organisationIdCounter++;
  return organisation;
};

export const addRandomOrganisation = (): Organisation => {
  const newOrganisation = generateRandomOrganisation();
  dynamicOrganisations.push(newOrganisation);
  
  // Créer une notification pour cette nouvelle organisation
  const statutLabel = newOrganisation.statut === 'membre' ? 'Membre' :
                      newOrganisation.statut === 'sponsor' ? 'Sponsor' : 'Non-membre';
  
  addNotification({
    type: 'alerte',
    priorite: newOrganisation.statut === 'sponsor' ? 'moyenne' : 'basse',
    titre: `Nouvelle organisation ${statutLabel.toLowerCase()}`,
    message: `${newOrganisation.nom} (${newOrganisation.pays}) vient de s'inscrire${newOrganisation.statut === 'sponsor' ? ' en tant que sponsor' : ''}`,
    lien: '/organisations',
  });
  
  notifyDataUpdate();
  return newOrganisation;
};

// ========== RENDEZ-VOUS DYNAMIQUES ==========
let rdvIdCounter = 8;
// Sera initialisé avec mockRendezVous en bas du fichier
let dynamicRendezVous: RendezVous[] = [];

export const getCurrentRendezVous = () => {
  return [...dynamicRendezVous];
};

export const generateRandomRendezVous = (): RendezVous => {
  const types: ('participant' | 'sponsor')[] = ['participant', 'sponsor'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const statuts: StatutRendezVous[] = ['en-attente', 'acceptée', 'occupée', 'annulée'];
  const probabilities = [0.5, 0.3, 0.1, 0.1]; // 50% en attente, 30% acceptée, 10% refusée, 10% annulée
  
  const rand = Math.random();
  let cumulative = 0;
  let selectedStatut: StatutRendezVous = 'en-attente';
  
  for (let i = 0; i < statuts.length; i++) {
    cumulative += probabilities[i];
    if (rand <= cumulative) {
      selectedStatut = statuts[i];
      break;
    }
  }
  
  // Sélectionner des participants aléatoires
  const demandeurId = String(Math.floor(1 + Math.random() * Math.min(participantIdCounter - 1, 50)));
  
  // Pour les rendez-vous sponsor, utiliser uniquement les participants 3 ou 11 (référents sponsors)
  let recepteurId: string;
  if (type === 'sponsor') {
    // Alterner entre les deux référents sponsors (participants 3 et 11)
    recepteurId = Math.random() < 0.5 ? '3' : '11';
  } else {
    recepteurId = String(Math.floor(1 + Math.random() * Math.min(participantIdCounter - 1, 50)));
  }
  
  // Date de l'événement FANAF 2026 (9-11 février 2026)
  const eventDates = ['2026-02-09', '2026-02-10', '2026-02-11'];
  const date = eventDates[Math.floor(Math.random() * eventDates.length)];
  
  const heures = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  const heure = heures[Math.floor(Math.random() * heures.length)];
  
  const rdv: RendezVous = {
    id: `rdv${rdvIdCounter}`,
    demandeurId,
    recepteurId,
    type,
    date,
    heure,
    statut: selectedStatut,
  };
  
  rdvIdCounter++;
  return rdv;
};

export const addRandomRendezVous = (): RendezVous => {
  const newRdv = generateRandomRendezVous();
  dynamicRendezVous.push(newRdv);
  
  // Créer une notification pour ce nouveau rendez-vous
  const typeLabel = newRdv.type === 'sponsor' ? 'sponsor' : 'participant';
  const statutLabel = newRdv.statut === 'en-attente' ? 'en attente de validation' :
                      newRdv.statut === 'acceptée' ? 'accepté' : 
                      newRdv.statut === 'annulée' ? 'annulé' : 'occupé';
  
  addNotification({
    type: 'rendez-vous',
    priorite: newRdv.statut === 'en-attente' ? 'moyenne' : 'basse',
    titre: `Nouvelle demande de rendez-vous ${typeLabel}`,
    message: `Un rendez-vous ${typeLabel} prévu le ${newRdv.date} à ${newRdv.heure} est ${statutLabel}`,
    lien: newRdv.type === 'sponsor' ? '/networking/rendez-vous-sponsor' : '/networking',
  });
  
  notifyDataUpdate();
  return newRdv;
};

// Fonction pour mettre à jour un rendez-vous existant
export const updateRendezVous = (rdvId: string, updates: Partial<RendezVous>): void => {
  const index = dynamicRendezVous.findIndex(rdv => rdv.id === rdvId);
  if (index !== -1) {
    const oldRdv = dynamicRendezVous[index];
    dynamicRendezVous[index] = { ...oldRdv, ...updates };
    
    // Créer une notification uniquement pour les rendez-vous sponsor acceptés
    if (oldRdv.type === 'sponsor' && updates.statut === 'acceptée' && oldRdv.statut !== 'acceptée') {
      const demandeur = getParticipantById(oldRdv.demandeurId);
      const referentSponsor = getReferentSponsor(oldRdv.recepteurId);
      
      if (demandeur && referentSponsor) {
        addNotification({
          type: 'rendez-vous',
          priorite: 'haute',
          titre: 'Rendez-vous sponsor confirmé',
          message: `Le rendez-vous avec ${referentSponsor.prenom} ${referentSponsor.nom} (${referentSponsor.organisationNom}) le ${oldRdv.date} à ${oldRdv.heure} a été confirmé`,
          lien: '/networking/rendez-vous-sponsor',
        });
      }
    }
    
    notifyDataUpdate();
  }
};

// ========== RÉSERVATIONS DE STAND DYNAMIQUES ==========
let reservationIdCounter = 8;
let standCounter = 50; // Pour générer des numéros de stand
let dynamicReservations: ReservationStand[] = [];

export const getCurrentReservations = () => {
  return [...dynamicReservations];
};

export const generateRandomReservation = (): ReservationStand => {
  const dimensions: ('9m²' | '12m²')[] = ['9m²', '12m²'];
  const dimension = dimensions[Math.floor(Math.random() * dimensions.length)];
  const cout = dimension === '9m²' ? 1800000 : 2500000;
  
  const statuts: StatutPaiement[] = ['payé', 'non-payé', 'partiellement-payé'];
  const probabilities = [0.6, 0.25, 0.15];
  
  const rand = Math.random();
  let cumulative = 0;
  let selectedStatut: StatutPaiement = 'payé';
  
  for (let i = 0; i < statuts.length; i++) {
    cumulative += probabilities[i];
    if (rand <= cumulative) {
      selectedStatut = statuts[i];
      break;
    }
  }
  
  // Sélectionner un participant aléatoire
  const participantId = String(Math.floor(1 + Math.random() * Math.min(participantIdCounter - 1, 50)));
  
  // Générer numéro de stand
  const secteurs = ['A', 'B', 'C', 'D', 'E'];
  const secteur = secteurs[Math.floor(Math.random() * secteurs.length)];
  const numeroStand = `${secteur}-${String(standCounter++).padStart(2, '0')}`;
  
  const now = new Date();
  const dateReservation = now.toISOString().split('T')[0];
  
  const reservation: ReservationStand = {
    id: `res${reservationIdCounter}`,
    participantId,
    numeroStand,
    dimension,
    cout,
    statutPaiement: selectedStatut,
    dateReservation,
  };
  
  reservationIdCounter++;
  return reservation;
};

export const addRandomReservation = (): ReservationStand => {
  const newReservation = generateRandomReservation();
  dynamicReservations.push(newReservation);
  
  // Créer une notification pour cette nouvelle réservation
  const paiementLabel = newReservation.statutPaiement === 'payé' ? 'payée' :
                        newReservation.statutPaiement === 'partiellement-payé' ? 'partiellement payée' : 'en attente de paiement';
  
  addNotification({
    type: 'alerte',
    priorite: newReservation.statutPaiement === 'payé' ? 'basse' : 'moyenne',
    titre: 'Nouvelle réservation de stand',
    message: `Stand ${newReservation.numeroStand} (${newReservation.dimension}) réservé - ${paiementLabel}`,
    lien: '/reservations',
  });
  
  notifyDataUpdate();
  return newReservation;
};

export const mockReservations: ReservationStand[] = [
  {
    id: 'res1',
    participantId: '1',
    numeroStand: 'A-12',
    dimension: '12m²',
    cout: 2500000,
    statutPaiement: 'payé',
    dateReservation: '2025-01-16',
  },
  {
    id: 'res2',
    participantId: '3',
    numeroStand: 'B-08',
    dimension: '12m²',
    cout: 2500000,
    statutPaiement: 'payé',
    dateReservation: '2025-01-21',
  },
  {
    id: 'res3',
    participantId: '2',
    numeroStand: 'C-15',
    dimension: '9m²',
    cout: 1800000,
    statutPaiement: 'payé',
    dateReservation: '2025-01-19',
  },
  {
    id: 'res4',
    participantId: '5',
    numeroStand: 'C-22',
    dimension: '9m²',
    cout: 1800000,
    statutPaiement: 'non-payé',
    dateReservation: '2025-01-26',
  },
  {
    id: 'res5',
    participantId: '9',
    numeroStand: 'A-05',
    dimension: '12m²',
    cout: 2500000,
    statutPaiement: 'payé',
    dateReservation: '2025-02-09',
  },
  {
    id: 'res6',
    participantId: '6',
    numeroStand: 'D-11',
    dimension: '9m²',
    cout: 1800000,
    statutPaiement: 'non-payé',
    dateReservation: '2025-02-02',
  },
  {
    id: 'res7',
    participantId: '11',
    numeroStand: 'B-03',
    dimension: '12m²',
    cout: 2500000,
    statutPaiement: 'payé',
    dateReservation: '2025-02-13',
  },
];

export const mockRendezVous: RendezVous[] = [
  {
    id: 'rdv1',
    demandeurId: '2',
    recepteurId: '1',
    type: 'participant',
    date: '2026-02-09',
    heure: '10:00',
    statut: 'acceptée',
  },
  {
    id: 'rdv2',
    demandeurId: '4',
    recepteurId: '3',
    type: 'sponsor',
    date: '2026-02-09',
    heure: '14:30',
    statut: 'en-attente',
  },
  {
    id: 'rdv3',
    demandeurId: '5',
    recepteurId: '1',
    type: 'participant',
    date: '2026-02-10',
    heure: '09:00',
    statut: 'acceptée',
  },
  {
    id: 'rdv4',
    demandeurId: '6',
    recepteurId: '11',
    type: 'sponsor',
    date: '2026-02-10',
    heure: '11:00',
    statut: 'occupée',
    commentaire: 'Créneau déjà pris',
  },
  {
    id: 'rdv5',
    demandeurId: '8',
    recepteurId: '9',
    type: 'participant',
    date: '2026-02-10',
    heure: '15:00',
    statut: 'en-attente',
  },
  {
    id: 'rdv6',
    demandeurId: '10',
    recepteurId: '3',
    type: 'sponsor',
    date: '2026-02-11',
    heure: '10:30',
    statut: 'acceptée',
  },
  {
    id: 'rdv7',
    demandeurId: '12',
    recepteurId: '11',
    type: 'sponsor',
    date: '2026-02-11',
    heure: '14:00',
    statut: 'en-attente',
  },
  {
    id: 'rdv8',
    demandeurId: '7',
    recepteurId: '3',
    type: 'sponsor',
    date: '2026-02-09',
    heure: '11:00',
    statut: 'annulée',
    commentaire: 'Annulé par le demandeur',
  },
  {
    id: 'rdv9',
    demandeurId: '14',
    recepteurId: '15',
    type: 'participant',
    date: '2026-02-10',
    heure: '16:00',
    statut: 'annulée',
    commentaire: 'Conflit d\'horaire',
  },
  {
    id: 'rdv10',
    demandeurId: '18',
    recepteurId: '11',
    type: 'sponsor',
    date: '2026-02-11',
    heure: '09:00',
    statut: 'annulée',
  },
];

export const mockPlansVol: PlanVol[] = [
  {
    id: 'pv1',
    participantId: '1',
    numeroVol: 'AF456',
    date: '2025-10-25',
    heure: '14:30',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport Charles de Gaulle (CDG) - Paris',
    type: 'arrivee',
  },
  {
    id: 'pv2',
    participantId: '1',
    numeroVol: 'AF457',
    date: '2025-10-29',
    heure: '18:45',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport Charles de Gaulle (CDG) - Paris',
    type: 'depart',
  },
  {
    id: 'pv3',
    participantId: '2',
    numeroVol: 'SN215',
    date: '2025-10-25',
    heure: '10:15',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport Blaise Diagne (DSS) - Dakar',
    type: 'arrivee',
  },
  {
    id: 'pv4',
    participantId: '2',
    numeroVol: 'SN216',
    date: '2025-10-29',
    heure: '16:30',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport Blaise Diagne (DSS) - Dakar',
    type: 'depart',
  },
  {
    id: 'pv5',
    participantId: '3',
    numeroVol: 'ET507',
    date: '2025-10-25',
    heure: '08:00',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport Charles de Gaulle (CDG) - Paris',
    type: 'arrivee',
  },
  {
    id: 'pv6',
    participantId: '3',
    numeroVol: 'ET508',
    date: '2025-10-29',
    heure: '20:15',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport Charles de Gaulle (CDG) - Paris',
    type: 'depart',
  },
  {
    id: 'pv7',
    participantId: '4',
    numeroVol: 'TU604',
    date: '2025-10-25',
    heure: '12:45',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport Modibo Keita (BKO) - Bamako',
    type: 'arrivee',
  },
  {
    id: 'pv8',
    participantId: '4',
    numeroVol: 'TU605',
    date: '2025-10-29',
    heure: '15:20',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport Modibo Keita (BKO) - Bamako',
    type: 'depart',
  },
  {
    id: 'pv9',
    participantId: '5',
    numeroVol: 'KP301',
    date: '2025-10-25',
    heure: '16:00',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport de Conakry (CKY) - Conakry',
    type: 'arrivee',
  },
  {
    id: 'pv10',
    participantId: '6',
    numeroVol: 'BF720',
    date: '2025-10-25',
    heure: '11:30',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport de Ouagadougou (OUA) - Ouagadougou',
    type: 'arrivee',
  },
  {
    id: 'pv11',
    participantId: '6',
    numeroVol: 'BF721',
    date: '2025-10-29',
    heure: '19:00',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport de Ouagadougou (OUA) - Ouagadougou',
    type: 'depart',
  },
  {
    id: 'pv12',
    participantId: '9',
    numeroVol: 'AF458',
    date: '2025-10-25',
    heure: '13:15',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport Charles de Gaulle (CDG) - Paris',
    type: 'arrivee',
  },
  {
    id: 'pv13',
    participantId: '9',
    numeroVol: 'AF459',
    date: '2025-10-29',
    heure: '17:30',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport Charles de Gaulle (CDG) - Paris',
    type: 'depart',
  },
  {
    id: 'pv14',
    participantId: '11',
    numeroVol: 'QC308',
    date: '2025-10-25',
    heure: '09:45',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport de Douala (DLA) - Douala',
    type: 'arrivee',
  },
  {
    id: 'pv15',
    participantId: '11',
    numeroVol: 'QC309',
    date: '2025-10-29',
    heure: '21:00',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport de Douala (DLA) - Douala',
    type: 'depart',
  },
  // Plans de vol supplémentaires avec dates variées pour le test des filtres
  {
    id: 'pv16',
    participantId: '7',
    numeroVol: 'SN220',
    date: '2026-02-07',
    heure: '07:30',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport Blaise Diagne (DSS) - Dakar',
    type: 'arrivee',
  },
  {
    id: 'pv17',
    participantId: '7',
    numeroVol: 'SN221',
    date: '2026-02-12',
    heure: '19:45',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport Blaise Diagne (DSS) - Dakar',
    type: 'depart',
  },
  {
    id: 'pv18',
    participantId: '8',
    numeroVol: 'AF461',
    date: '2026-02-08',
    heure: '10:20',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport Charles de Gaulle (CDG) - Paris',
    type: 'arrivee',
  },
  {
    id: 'pv19',
    participantId: '8',
    numeroVol: 'AF462',
    date: '2026-02-11',
    heure: '22:30',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport Charles de Gaulle (CDG) - Paris',
    type: 'depart',
  },
  {
    id: 'pv20',
    participantId: '10',
    numeroVol: 'ET511',
    date: '2026-02-08',
    heure: '15:10',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport International Gnassingbé Eyadema (LFW) - Lomé',
    type: 'arrivee',
  },
  {
    id: 'pv21',
    participantId: '10',
    numeroVol: 'ET512',
    date: '2026-02-12',
    heure: '16:40',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport International Gnassingbé Eyadema (LFW) - Lomé',
    type: 'depart',
  },
  {
    id: 'pv22',
    participantId: '12',
    numeroVol: 'KP305',
    date: '2026-02-06',
    heure: '11:15',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport de Conakry (CKY) - Conakry',
    type: 'arrivee',
  },
  {
    id: 'pv23',
    participantId: '12',
    numeroVol: 'KP306',
    date: '2026-02-13',
    heure: '08:45',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport de Conakry (CKY) - Conakry',
    type: 'depart',
  },
  {
    id: 'pv24',
    participantId: '13',
    numeroVol: 'TU608',
    date: '2026-02-09',
    heure: '06:00',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport Modibo Keita (BKO) - Bamako',
    type: 'arrivee',
  },
  {
    id: 'pv25',
    participantId: '13',
    numeroVol: 'TU609',
    date: '2026-02-11',
    heure: '20:30',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport Modibo Keita (BKO) - Bamako',
    type: 'depart',
  },
  {
    id: 'pv26',
    participantId: '14',
    numeroVol: 'BF725',
    date: '2026-02-09',
    heure: '12:00',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport de Ouagadougou (OUA) - Ouagadougou',
    type: 'arrivee',
  },
  {
    id: 'pv27',
    participantId: '14',
    numeroVol: 'BF726',
    date: '2026-02-11',
    heure: '18:15',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport de Ouagadougou (OUA) - Ouagadougou',
    type: 'depart',
  },
  {
    id: 'pv28',
    participantId: '15',
    numeroVol: 'QC312',
    date: '2026-02-08',
    heure: '14:25',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport de Douala (DLA) - Douala',
    type: 'arrivee',
  },
  {
    id: 'pv29',
    participantId: '15',
    numeroVol: 'QC313',
    date: '2026-02-12',
    heure: '09:50',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport de Douala (DLA) - Douala',
    type: 'depart',
  },
  {
    id: 'pv30',
    participantId: '16',
    numeroVol: 'AF465',
    date: '2026-02-07',
    heure: '16:45',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport Charles de Gaulle (CDG) - Paris',
    type: 'arrivee',
  },
  {
    id: 'pv31',
    participantId: '16',
    numeroVol: 'AF466',
    date: '2026-02-13',
    heure: '11:20',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport Charles de Gaulle (CDG) - Paris',
    type: 'depart',
  },
  {
    id: 'pv32',
    participantId: '17',
    numeroVol: 'SN224',
    date: '2026-02-10',
    heure: '08:10',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport Blaise Diagne (DSS) - Dakar',
    type: 'arrivee',
  },
  {
    id: 'pv33',
    participantId: '17',
    numeroVol: 'SN225',
    date: '2026-02-12',
    heure: '21:05',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport Blaise Diagne (DSS) - Dakar',
    type: 'depart',
  },
  {
    id: 'pv34',
    participantId: '18',
    numeroVol: 'ET515',
    date: '2026-02-06',
    heure: '13:30',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport International Gnassingbé Eyadema (LFW) - Lomé',
    type: 'arrivee',
  },
  {
    id: 'pv35',
    participantId: '18',
    numeroVol: 'ET516',
    date: '2026-02-13',
    heure: '15:00',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport International Gnassingbé Eyadema (LFW) - Lomé',
    type: 'depart',
  },
  {
    id: 'pv36',
    participantId: '19',
    numeroVol: 'KP309',
    date: '2026-02-09',
    heure: '10:40',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport de Conakry (CKY) - Conakry',
    type: 'arrivee',
  },
  {
    id: 'pv37',
    participantId: '19',
    numeroVol: 'KP310',
    date: '2026-02-11',
    heure: '17:25',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport de Conakry (CKY) - Conakry',
    type: 'depart',
  },
  {
    id: 'pv38',
    participantId: '20',
    numeroVol: 'TU612',
    date: '2026-02-10',
    heure: '07:20',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport Modibo Keita (BKO) - Bamako',
    type: 'arrivee',
  },
  {
    id: 'pv39',
    participantId: '20',
    numeroVol: 'TU613',
    date: '2026-02-12',
    heure: '14:50',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport Modibo Keita (BKO) - Bamako',
    type: 'depart',
  },
  {
    id: 'pv40',
    participantId: '21',
    numeroVol: 'BF730',
    date: '2026-02-07',
    heure: '09:15',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportOrigine: 'Aéroport de Ouagadougou (OUA) - Ouagadougou',
    type: 'arrivee',
  },
  {
    id: 'pv41',
    participantId: '21',
    numeroVol: 'BF731',
    date: '2026-02-13',
    heure: '12:35',
    aeroport: 'Aéroport Félix-Houphouët-Boigny (ABJ)',
    aeroportDestination: 'Aéroport de Ouagadougou (OUA) - Ouagadougou',
    type: 'depart',
  },
];

// Mock membres comité
export const mockMembresComite: MembreComite[] = [
  {
    id: 'mc1',
    nom: 'Kouassi',
    prenom: 'Amina',
    email: 'amina.kouassi@fanaf2026.com',
    telephone: '+225 07 12 34 56 78',
    profil: 'caissier',
    dateCreation: '2025-01-15',
  },
  {
    id: 'mc2',
    nom: 'Diallo',
    prenom: 'Mamadou',
    email: 'mamadou.diallo@fanaf2026.com',
    telephone: '+225 05 98 76 54 32',
    profil: 'agent-scan',
    dateCreation: '2025-01-20',
  },
  {
    id: 'mc3',
    nom: 'N\'Guessan',
    prenom: 'Fatou',
    email: 'fatou.nguessan@fanaf2026.com',
    telephone: '+225 07 45 67 89 12',
    profil: 'caissier',
    dateCreation: '2025-02-05',
  },
  {
    id: 'mc4',
    nom: 'Traoré',
    prenom: 'Ibrahim',
    email: 'ibrahim.traore@fanaf2026.com',
    telephone: '+225 01 23 45 67 89',
    profil: 'agent-scan',
    dateCreation: '2025-02-10',
  },
  {
    id: 'mc5',
    nom: 'Koné',
    prenom: 'Aïcha',
    email: 'aicha.kone@fanaf2026.com',
    telephone: '+225 07 89 12 34 56',
    profil: 'caissier',
    dateCreation: '2025-03-01',
  },
];

// Fonctions helper
export function getParticipantById(id: string): Participant | undefined {
  return mockParticipants.find(p => p.id === id);
}

export function getOrganisationById(id: string): Organisation | undefined {
  return mockOrganisations.find(o => o.id === id);
}

export function getParticipantsByOrganisation(organisationId: string): Participant[] {
  return mockParticipants.filter(p => p.organisationId === organisationId);
}

export function getPlanVolByType(type: 'depart' | 'arrivee'): PlanVol[] {
  return mockPlansVol.filter(pv => pv.type === type);
}

export function getPlanVolByParticipant(participantId: string): PlanVol[] {
  return mockPlansVol.filter(pv => pv.participantId === participantId);
}

// Fonction pour récupérer le référent sponsor d'un rendez-vous sponsor
export function getReferentSponsor(recepteurId: string): (Referent & { organisationNom: string }) | undefined {
  const participant = getParticipantById(recepteurId);
  if (!participant) return undefined;
  
  const organisation = getOrganisationById(participant.organisationId);
  if (!organisation || organisation.statut !== 'sponsor' || !organisation.referent) {
    return undefined;
  }
  
  return {
    ...organisation.referent,
    organisationNom: organisation.nom
  };
}

// ========== NOTIFICATIONS DYNAMIQUES ==========
let notificationIdCounter = 1;
let dynamicNotifications: Notification[] = [
  {
    id: 'notif-init-1',
    type: 'inscription',
    priorite: 'moyenne',
    titre: 'Système de simulation activé',
    message: 'Les données sont mises à jour automatiquement toutes les 3-8 secondes',
    dateCreation: new Date(Date.now() - 2 * 60000).toISOString(),
    lu: false,
  },
];

// Listeners pour les notifications
type NotificationListener = (notification: Notification) => void;
const notificationListeners: NotificationListener[] = [];

export const subscribeToNotifications = (listener: NotificationListener) => {
  notificationListeners.push(listener);
  return () => {
    const index = notificationListeners.indexOf(listener);
    if (index > -1) {
      notificationListeners.splice(index, 1);
    }
  };
};

const notifyNewNotification = (notification: Notification) => {
  notificationListeners.forEach(listener => listener(notification));
};

export const getCurrentNotifications = () => {
  return [...dynamicNotifications];
};

export const addNotification = (notification: Omit<Notification, 'id' | 'dateCreation' | 'lu'>): Notification => {
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${notificationIdCounter++}`,
    dateCreation: new Date().toISOString(),
    lu: false,
  };
  
  dynamicNotifications.unshift(newNotification); // Ajouter au début
  
  // Limiter à 50 notifications max
  if (dynamicNotifications.length > 50) {
    dynamicNotifications = dynamicNotifications.slice(0, 50);
  }
  
  notifyNewNotification(newNotification);
  return newNotification;
};

export const markNotificationAsRead = (id: string) => {
  const notification = dynamicNotifications.find(n => n.id === id);
  if (notification) {
    notification.lu = true;
  }
};

export const markAllNotificationsAsRead = () => {
  dynamicNotifications.forEach(n => n.lu = true);
};

// Mock Notifications pour compatibilité (utilise maintenant les dynamiques)
export const mockNotifications: Notification[] = dynamicNotifications;

// Mock Check-ins
export const mockCheckIns: CheckIn[] = [
  // Jour 1 - 9 février 2026
  {
    id: 'ci1',
    participantId: '1',
    dateCheckIn: '2026-02-09',
    heureCheckIn: '08:30',
    scanPar: 'mc2',
    autorise: true,
    nombreScans: 1,
    statutRemontee: 'normal',
  },
  {
    id: 'ci2',
    participantId: '2',
    dateCheckIn: '2026-02-09',
    heureCheckIn: '08:45',
    scanPar: 'mc4',
    autorise: true,
    nombreScans: 1,
    statutRemontee: 'normal',
  },
  {
    id: 'ci3',
    participantId: '5',
    dateCheckIn: '2026-02-09',
    heureCheckIn: '09:00',
    scanPar: 'mc2',
    autorise: true,
    nombreScans: 1,
    statutRemontee: 'normal',
  },
  {
    id: 'ci4',
    participantId: '7',
    dateCheckIn: '2026-02-09',
    heureCheckIn: '09:15',
    scanPar: 'mc2',
    autorise: false, // Accès refusé
    raisonRefus: 'Inscription non finalisée',
    nombreScans: 1,
    statutRemontee: 'signale',
  },
  {
    id: 'ci5',
    participantId: '3',
    dateCheckIn: '2026-02-09',
    heureCheckIn: '09:30',
    scanPar: 'mc4',
    autorise: true,
    nombreScans: 1,
    statutRemontee: 'normal',
  },
  {
    id: 'ci6',
    participantId: '4',
    dateCheckIn: '2026-02-09',
    heureCheckIn: '10:00',
    scanPar: 'mc2',
    autorise: true,
    nombreScans: 1,
    statutRemontee: 'normal',
  },
  {
    id: 'ci7',
    participantId: '1',
    dateCheckIn: '2026-02-09',
    heureCheckIn: '14:30',
    scanPar: 'mc4',
    autorise: true,
    nombreScans: 2, // 2ème scan du participant 1
    statutRemontee: 'normal',
  },
  
  // Jour 2 - 10 février 2026
  {
    id: 'ci8',
    participantId: '1',
    dateCheckIn: '2026-02-10',
    heureCheckIn: '08:15',
    scanPar: 'mc2',
    autorise: true,
    nombreScans: 3, // 3ème scan du participant 1
    statutRemontee: 'normal',
  },
  {
    id: 'ci9',
    participantId: '6',
    dateCheckIn: '2026-02-10',
    heureCheckIn: '08:40',
    scanPar: 'mc4',
    autorise: true,
    nombreScans: 1,
    statutRemontee: 'normal',
  },
  {
    id: 'ci10',
    participantId: '8',
    dateCheckIn: '2026-02-10',
    heureCheckIn: '09:00',
    scanPar: 'mc2',
    autorise: true,
    nombreScans: 1,
    statutRemontee: 'normal',
  },
  {
    id: 'ci11',
    participantId: '9',
    dateCheckIn: '2026-02-10',
    heureCheckIn: '09:20',
    scanPar: 'mc4',
    autorise: false, // Accès refusé
    raisonRefus: 'Badge invalide',
    nombreScans: 1,
    statutRemontee: 'signale',
  },
  {
    id: 'ci12',
    participantId: '2',
    dateCheckIn: '2026-02-10',
    heureCheckIn: '09:45',
    scanPar: 'mc2',
    autorise: true,
    nombreScans: 2, // 2ème scan du participant 2
    statutRemontee: 'normal',
  },
  {
    id: 'ci13',
    participantId: '5',
    dateCheckIn: '2026-02-10',
    heureCheckIn: '10:10',
    scanPar: 'mc4',
    autorise: true,
    nombreScans: 2, // 2ème scan du participant 5
    statutRemontee: 'normal',
  },
  
  // Jour 3 - 11 février 2026
  {
    id: 'ci14',
    participantId: '1',
    dateCheckIn: '2026-02-11',
    heureCheckIn: '08:00',
    scanPar: 'mc2',
    autorise: true,
    nombreScans: 4, // 4ème scan du participant 1
    statutRemontee: 'normal',
  },
  {
    id: 'ci15',
    participantId: '10',
    dateCheckIn: '2026-02-11',
    heureCheckIn: '08:30',
    scanPar: 'mc4',
    autorise: true,
    nombreScans: 1,
    statutRemontee: 'normal',
  },
  {
    id: 'ci16',
    participantId: '11',
    dateCheckIn: '2026-02-11',
    heureCheckIn: '08:50',
    scanPar: 'mc2',
    autorise: true,
    nombreScans: 1,
    statutRemontee: 'normal',
  },
  {
    id: 'ci17',
    participantId: '3',
    dateCheckIn: '2026-02-11',
    heureCheckIn: '09:10',
    scanPar: 'mc4',
    autorise: true,
    nombreScans: 2, // 2ème scan du participant 3
    statutRemontee: 'normal',
  },
  {
    id: 'ci18',
    participantId: '4',
    dateCheckIn: '2026-02-11',
    heureCheckIn: '09:30',
    scanPar: 'mc2',
    autorise: true,
    nombreScans: 2, // 2ème scan du participant 4
    statutRemontee: 'normal',
  },
];

// Helpers pour notifications
export function getNotificationsNonLues(): Notification[] {
  return dynamicNotifications.filter(n => !n.lu);
}

export function getNotificationsByType(type: TypeNotification): Notification[] {
  return dynamicNotifications.filter(n => n.type === type);
}

// Helpers pour badges et check-ins
export function getCheckInByParticipant(participantId: string): CheckIn | undefined {
  return mockCheckIns.find(ci => ci.participantId === participantId);
}

export function isParticipantCheckedIn(participantId: string): boolean {
  return mockCheckIns.some(ci => ci.participantId === participantId);
}

// ========== INITIALISATION DES DONNÉES DYNAMIQUES ==========
// Initialiser les tableaux dynamiques avec les données mock
dynamicOrganisations = [...mockOrganisations];
dynamicRendezVous = [...mockRendezVous];
dynamicReservations = [...mockReservations];

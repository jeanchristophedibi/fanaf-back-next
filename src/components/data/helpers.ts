/**
 * Helpers pour remplacer les fonctions de mockData
 * Ces fonctions utilisent les services API
 */

import { inscriptionsDataService } from './inscriptionsData';
import { planVolDataService } from './planvolData';
import type { Participant, Organisation, PlanVol } from './types';

/**
 * Obtient un participant par son ID depuis les données chargées
 */
export function getParticipantById(id: string): Participant | undefined {
  const participants = inscriptionsDataService.getParticipants();
  return participants.find(p => p.id === id);
}

/**
 * Obtient une organisation par son ID depuis les données chargées
 */
export function getOrganisationById(id: string): Organisation | undefined {
  return inscriptionsDataService.getOrganisationById(id);
}

/**
 * Obtient le référent d'un sponsor par l'ID de l'organisation
 */
export function getReferentSponsor(organisationId: string): { nom: string; prenom: string; email: string; telephone: string; fonction: string } | undefined {
  const organisation = getOrganisationById(organisationId);
  return organisation?.referent;
}

/**
 * Met à jour un rendez-vous (fonction stub pour compatibilité)
 * TODO: Implémenter avec l'API quand disponible
 */
export function updateRendezVous(rdvId: string, updates: Partial<any>): void {
  console.warn('updateRendezVous: Non implémenté avec l\'API pour l\'instant');
  // TODO: Implémenter la mise à jour via l'API
}

/**
 * Obtient les participants par organisation
 */
export function getParticipantsByOrganisation(organisationId: string): Participant[] {
  const participants = inscriptionsDataService.getParticipants();
  return participants.filter(p => p.organisationId === organisationId);
}

/**
 * Obtient les plans de vol par type (depart ou arrivee)
 */
export function getPlanVolByType(type: 'arrivee' | 'depart'): PlanVol[] {
  return planVolDataService.getFlightPlansByType(type);
}

/**
 * Obtient les plans de vol par participant
 */
export function getPlanVolByParticipant(participantId: string): PlanVol[] {
  return planVolDataService.getFlightPlansByParticipant(participantId);
}


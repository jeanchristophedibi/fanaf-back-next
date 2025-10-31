/**
 * Service de récupération et mapping des données de plans de vol
 * Centralise la logique de récupération depuis l'API et de mapping vers le format interne
 */

import { fanafApi } from '../../services/fanafApi';
import type { PlanVol } from './types';
import { inscriptionsDataService } from './inscriptionsData';

/**
 * Mappe les données de plan de vol de l'API vers le format PlanVol
 */
function mapApiFlightPlanToPlanVol(apiData: any, participantId: string): PlanVol {
  // Déterminer le type de vol
  // "outbound" = arrivée vers ABJ (type: 'arrivee')
  // "return" = départ depuis ABJ (type: 'depart')
  const flightType = apiData.flight_type === 'outbound' ? 'arrivee' : 'depart';
  
  // Extraire la date et l'heure depuis departure_time
  const departureDateTime = apiData.departure_time ? new Date(apiData.departure_time) : new Date();
  const date = departureDateTime.toISOString().split('T')[0]; // Format YYYY-MM-DD
  const heure = departureDateTime.toTimeString().slice(0, 5); // Format HH:MM
  
  // Déterminer l'aéroport selon le type de vol
  let aeroport = '';
  let aeroportOrigine: string | undefined;
  let aeroportDestination: string | undefined;
  
  if (flightType === 'arrivee') {
    // Arrivée : l'aéroport de destination (ABJ normalement)
    aeroport = apiData.arrival_airport || apiData.departure_airport || '';
    aeroportOrigine = apiData.departure_airport;
    aeroportDestination = apiData.arrival_airport;
  } else {
    // Départ : l'aéroport de départ (ABJ normalement)
    aeroport = apiData.departure_airport || apiData.arrival_airport || '';
    aeroportOrigine = apiData.departure_airport;
    aeroportDestination = apiData.arrival_airport;
  }
  
  const planVol: PlanVol = {
    id: apiData.id || `planvol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    participantId,
    numeroVol: apiData.flight_number || '',
    date,
    heure,
    aeroport,
    compagnie: apiData.airline || apiData.airline_name || apiData.company || '',
    aeroportOrigine,
    aeroportDestination,
    type: flightType,
  };
  
  return planVol;
}

/**
 * Crée un participantId temporaire basé sur l'email si le participant n'est pas trouvé
 */
function generateTemporaryParticipantId(email: string, fullName: string): string {
  const emailKey = email.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
  const nameKey = fullName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
  return `temp_${emailKey}_${nameKey}`;
}

/**
 * Récupère les plans de vol depuis l'API avec gestion de la pagination
 */
export async function fetchFlightPlans(forceReloadParticipants = false): Promise<PlanVol[]> {
  const allFlightPlans: PlanVol[] = [];
  
  // Charger les participants d'abord pour pouvoir mapper les participantId
  // Si forceReloadParticipants est true, recharger les participants depuis l'API
  const participants = await inscriptionsDataService.loadParticipants(undefined, forceReloadParticipants);
  console.log(`[fetchFlightPlans] ${participants.length} participants chargés pour le mapping`);
  
  // Créer un index par email开支 accès rapide
  const participantsByEmail = new Map<string, string>();
  participants.forEach(p => {
    if (p.email) {
      participantsByEmail.set(p.email.toLowerCase().trim(), p.id);
    }
  });
  
  try {
    let page = 1;
    let hasMore = true;
    let perPage = 100;
    let totalPages = 1;
    let totalFlights = 0;
    
    console.log(`[fetchFlightPlans] Début du chargement des plans de vol`);
    
    while (hasMore) {
      try {
        const response = await fanafApi.getFlightPlans({
          per_page: perPage,
          page: page,
        }) as any;
        
        console.log(`[fetchFlightPlans] Réponse API page ${page}:`, {
          hasData: !!response?.data,
          dataLength: response?.data?.length || 0,
          hasMeta: !!response?.meta,
          meta: response?.meta,
          responseKeys: Object.keys(response || {})
        });
        
        // Extraire les données de la réponse (structure Laravel avec pagination)
        let data: any[] = [];
        
        if (Array.isArray(response)) {
          data = response;
          hasMore = false;
          console.log(`[fetchFlightPlans] Réponse est un tableau direct, ${data.length} éléments`);
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          // Structure imbriquée: response.data.data (double data) - PRIORITÉ
          data = response.data.data;
          if (response.data.last_page !== undefined) {
            totalPages = response.data.last_page || 1;
            totalFlights = response.data.total || 0;
            const currentPage = response.data.current_page || page;
            const actualPerPage = response.data.per_page;
            if (actualPerPage && actualPerPage !== perPage) {
              console.log(`[fetchFlightPlans] L'API limite à ${actualPerPage} éléments par page (demandé: ${perPage})`);
              perPage = actualPerPage;
            }
            hasMore = currentPage < totalPages;
            console.log(`[fetchFlightPlans] Pagination détectée (structure imbriquée): page ${currentPage}/${totalPages}, total: ${totalFlights}, per_page réel: ${perPage}`);
          } else if (response?.meta) {
            totalPages = response.meta.last_page || 1;
            totalFlights = response.meta.total || 0;
            const currentPage = response.meta.current_page || page;
            const actualPerPage = response.meta.per_page;
            if (actualPerPage && actualPerPage !== perPage) {
              console.log(`[fetchFlightPlans] L'API limite à ${actualPerPage} éléments par page (demandé: ${perPage})`);
              perPage = actualPerPage;
            }
            hasMore = currentPage < totalPages;
            console.log(`[fetchFlightPlans] Pagination détectée (via meta): page ${currentPage}/${totalPages}, total: ${totalFlights}, per_page réel: ${perPage}`);
          }
        } else if (response?.data && Array.isArray(response.data)) {
          data = response.data;
          if (response.meta) {
            totalPages = response.meta.last_page || response.meta.total_pages || 1;
            totalFlights = response.meta.total || 0;
            const currentPage = response.meta.current_page || page;
            const actualPerPage = response.meta.per_page;
            if (actualPerPage && actualPerPage !== perPage) {
              console.log(`[fetchFlightPlans] L'API limite à ${actualPerPage} éléments par page (demandé: ${perPage})`);
              perPage = actualPerPage;
            }
            hasMore = currentPage < totalPages;
            console.log(`[fetchFlightPlans] Pagination détectée (via meta): page ${currentPage}/${totalPages}, total: ${totalFlights}, per_page réel: ${perPage}`);
          } else {
            hasMore = data.length >= perPage;
          }
        } else {
          console.warn(`[fetchFlightPlans] Format de réponse inattendu page ${page}:`, response);
          hasMore = false;
        }
        
        console.log(`[fetchFlightPlans] Page ${page}/${totalPages || '?'}: ${data.length} éléments extraits (total attendu: ${totalFlights || '?'})`);
        
        // Mapper les données
        for (const item of data) {
          // Trouver le participantId depuis l'email de l'utilisateur
          const userEmail = item.user?.email || '';
          let participantId = participantsByEmail.get(userEmail.toLowerCase().trim()) || null;
          
          // Si le participant n'est pas trouvé, générer un ID temporaire
          if (!participantId) {
            const fullName = item.user?.full_name || '';
            participantId = generateTemporaryParticipantId(userEmail || 'unknown', fullName || 'unknown');
            console.warn(`[fetchFlightPlans] Participant non trouvé pour email ${userEmail}, génération d'un ID temporaire: ${participantId}`);
          }
          
          const planVol = mapApiFlightPlanToPlanVol(item, participantId);
          allFlightPlans.push(planVol);
        }
        
        page++;
        
        // Sécurité: éviter les boucles infinies
        if (page > 100) {
          console.warn(`[fetchFlightPlans] Limite de pages atteinte (100)`);
          hasMore = false;
        }
      } catch (pageError: any) {
        console.error(`[fetchFlightPlans] Erreur lors du chargement de la page ${page}:`, pageError);
        hasMore = false;
      }
    }
    
    console.log(`[fetchFlightPlans] TOTAL: ${allFlightPlans.length} plans de vol chargés`);
    return allFlightPlans;
  } catch (err: any) {
    console.error(`[fetchFlightPlans] Erreur lors du chargement des plans de vol:`, err);
    return allFlightPlans; // Retourner ce qui a été chargé jusqu'à présent
  }
}

/**
 * Classe pour gérer les données de plans de vol avec cache
 */
export class PlanVolDataService {
  private plansVolCache: PlanVol[] = [];
  
  /**
   * Charge et cache les plans de vol (utilise le cache si déjà chargées et pas de rechargement forcé)
   */
  async loadFlightPlans(forceReload = false, forceReloadParticipants = false): Promise<PlanVol[]> {
    // Si déjà chargées et pas de rechargement forcé, retourner le cache
    if (!forceReload && this.plansVolCache.length > 0) {
      console.log(`[PlanVolDataService] Utilisation du cache (${this.plansVolCache.length} plans de vol)`);
      return this.plansVolCache;
    }

    try {
      this.plansVolCache = await fetchFlightPlans(forceReloadParticipants);
      console.log(`[PlanVolDataService] ${this.plansVolCache.length} plans de vol chargés et mis en cache`);
      return this.plansVolCache;
    } catch (error) {
      console.error('[PlanVolDataService] Erreur lors du chargement des plans de vol:', error);
      return this.plansVolCache; // Retourner le cache même en cas d'erreur
    }
  }

  /**
   * Obtient tous les plans de vol du cache
   */
  getFlightPlans(): PlanVol[] {
    return this.plansVolCache;
  }

  /**
   * Obtient les plans de vol par type
   */
  getFlightPlansByType(type: 'depart' | 'arrivee'): PlanVol[] {
    return this.plansVolCache.filter(pv => pv.type === type);
  }

  /**
   * Obtient les plans de vol par participant
   */
  getFlightPlansByParticipant(participantId: string): PlanVol[] {
    return this.plansVolCache.filter(pv => pv.participantId === participantId);
  }

  /**
   * Vide le cache
   */
  clearCache() {
    this.plansVolCache = [];
  }
}

// Instance singleton pour être utilisée dans les composants
export const planVolDataService = new PlanVolDataService();

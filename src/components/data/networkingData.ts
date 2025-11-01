/**
 * Service de récupération et mapping des données de networking/rendez-vous
 * Centralise la logique de récupération depuis l'API et de mapping vers le format interne
 */

import { fanafApi } from '../../services/fanafApi';
import type { RendezVous, StatutRendezVous } from './types';

/**
 * Mappe les données de rendez-vous de l'API vers le format RendezVous
 * Structure API attendue: { id, demandeur_id, recepteur_id, type, date, heure/start_time, statut/status, commentaire, created_at, updated_at }
 */
export function mapApiNetworkingRequestToRendezVous(apiData: any): RendezVous {
  // Mapper le statut de l'API vers le format StatutRendezVous
  const mapApiStatut = (apiStatut: any): StatutRendezVous => {
    if (!apiStatut) return 'en-attente';
    
    const statut = String(apiStatut).toLowerCase();
    if (statut === 'acceptée' || statut === 'accepted' || statut === 'accepte') {
      return 'acceptée';
    } else if (statut === 'occupée' || statut === 'occupied' || statut === 'refused' || statut === 'refusée') {
      return 'occupée';
    } else if (statut === 'annulée' || statut === 'cancelled' || statut === 'canceled') {
      return 'annulée';
    }
    // Par défaut: en-attente
    return 'en-attente';
  };

  // Mapper le type
  const type = apiData.type === 'sponsor' ? 'sponsor' : 'participant';

  // Extraire l'heure (peut être 'heure', 'start_time', 'time')
  const heure = apiData.heure || apiData.start_time || apiData.time || '09:00';

  const mapped = {
    id: apiData.id || apiData.request_id || '',
    demandeurId: apiData.demandeur_id || apiData.demandeurId || apiData.requester_id || '',
    recepteurId: apiData.recepteur_id || apiData.recepteurId || apiData.receiver_id || '',
    type,
    date: apiData.date || apiData.appointment_date || new Date().toISOString().split('T')[0],
    heure,
    statut: mapApiStatut(apiData.statut || apiData.status),
    commentaire: apiData.commentaire || apiData.comment || apiData.notes,
  } as any;

  // Attacher les objets associés pour l'UI (non typés, conservés en 'any')
  if (apiData.demandeur) mapped.demandeur = apiData.demandeur;
  if (apiData.recepteur) mapped.recepteur = apiData.recepteur;

  return mapped as RendezVous;
}

/**
 * Récupère tous les rendez-vous depuis l'API avec gestion de la pagination
 */
export async function fetchNetworkingRequests(
  filters?: {
    type?: 'participant' | 'sponsor';
    status?: string;
  }
): Promise<RendezVous[]> {
  try {
    const allRequests: RendezVous[] = [];
    const seenIds = new Set<string>();
    const perPage = 100;

    // Si un type est spécifié, on charge seulement ce type
    // Sinon on charge les deux types séparément
    // Conversion: 'participant' -> 'user', 'sponsor' -> 'sponsor' pour l'API
    const targetsToLoad: Array<'user' | 'sponsor'> = 
      filters?.type 
        ? [filters.type === 'participant' ? 'user' : 'sponsor']
        : ['user', 'sponsor']; // Charger les deux types si aucun filtre

    for (const requestTarget of targetsToLoad) {
      const typeLabel = requestTarget === 'user' ? 'participant' : requestTarget === 'sponsor' ? 'sponsor' : 'tous types';
      
      let page = 1;
      let hasMore = true;
      let totalPages = 0;
      let totalCount = 0;
      let loadedCount = 0;
      
      while (hasMore) {
        try {
          const response = await fanafApi.getNetworkingRequests({
            per_page: perPage,
            page: page,
            ...(requestTarget ? { target: requestTarget } : {}),
            ...(filters?.status ? { status: filters.status } : {}),
          }) as any;

          // Extraire les données de la réponse
          let data: any[] = [];
          
          if (Array.isArray(response)) {
            data = response;
            hasMore = false;
            console.log(`[fetchNetworkingRequests] 📦 ${typeLabel} - Réponse est un tableau direct, ${data.length} éléments`);
          } else if (response?.data?.data && Array.isArray(response.data.data)) {
            // Structure imbriquée: response.data.data (double data) - PRIORITÉ
            data = response.data.data;
            totalPages = response.data.last_page || 1;
            totalCount = response.data.total || 0;
            if (response.data.last_page !== undefined) {
              hasMore = page < (response.data.last_page || 1);
              // Log réduit : pagination détaillée (commenté pour réduire le bruit)
              // console.log(`[fetchNetworkingRequests] 📄 ${typeLabel} - Pagination (structure imbriquée): page ${page}/${response.data.last_page}, total: ${response.data.total}, données: ${data.length}`);
            } else {
              hasMore = data.length >= perPage;
            }
          } else if (response?.data && Array.isArray(response.data)) {
            data = response.data;
            // Vérifier la pagination
            if (response?.meta) {
              totalPages = response.meta.last_page || response.meta.total_pages || 1;
              totalCount = response.meta.total || 0;
              hasMore = page < totalPages;
              // Log réduit : pagination détaillée (commenté pour réduire le bruit)
              // console.log(`[fetchNetworkingRequests] 📄 ${typeLabel} - Pagination (via meta): page ${page}/${totalPages}, total: ${totalCount}, données: ${data.length}`);
            } else if (response.data.last_page !== undefined) {
              totalPages = response.data.last_page || 1;
              totalCount = response.data.total || 0;
              hasMore = page < totalPages;
              // Log réduit : pagination détaillée (commenté pour réduire le bruit)
              // console.log(`[fetchNetworkingRequests] 📄 ${typeLabel} - Pagination (via data): page ${page}/${totalPages}, total: ${totalCount}, données: ${data.length}`);
            } else {
              hasMore = data.length === perPage;
            }
          } else if (response?.results && Array.isArray(response.results)) {
            data = response.results;
            hasMore = data.length === perPage;
          } else if (response?.requests && Array.isArray(response.requests)) {
            data = response.requests;
            hasMore = data.length === perPage;
          } else {
            console.warn(`[fetchNetworkingRequests] ⚠️ ${typeLabel} - Format de réponseизвод inattendu pour page ${page}:`, {
              hasResponse: !!response,
              hasData: !!response?.data,
              hasDataData: !!response?.data?.data,
              responseKeys: response ? Object.keys(response) : [],
              responseType: typeof response,
              sampleResponse: response ? JSON.stringify(response).substring(0, 500) : 'null'
            });
            hasMore = false;
          }
          
          if (data.length > 0) {
            // Log réduit : exemples et détails (commentés pour réduire le bruit)
            // if (page === 1) {
            //   console.log(`[fetchNetworkingRequests] 📋 ${typeLabel} - Premier élément exemple (page 1):`, {
            //     id: data[0]?.id,
            //     type: data[0]?.type,
            //     date: data[0]?.date,
            //     heure: data[0]?.heure || data[0]?.start_time,
            //     statut: data[0]?.statut || data[0]?.status,
            //     keys: Object.keys(data[0] || {}),
            //     sampleData: JSON.stringify(data[0]).substring(0, 300)
            //   });
            // }
            // console.log(`[fetchNetworkingRequests] 📦 ${typeLabel} - Page ${page}: ${data.length} éléments bruts reçus`);
          } else {
            console.warn(`[fetchNetworkingRequests] ⚠️ ${typeLabel} - Page ${page}: Aucune donnée dans la réponse`);
          }

          // Mapper et dédupliquer par ID
          const mapped = data.map(item => mapApiNetworkingRequestToRendezVous(item));
          let addedCount = 0;
          let duplicateCount = 0;
          
          for (const request of mapped) {
            if (request.id && !seenIds.has(request.id)) {
              seenIds.add(request.id);
              allRequests.push(request);
              addedCount++;
              loadedCount++;
            } else {
              duplicateCount++;
              // Log réduit : duplication (commenté pour réduire le bruit)
              // if (duplicateCount <= 3) {
              //   console.log(`[fetchNetworkingRequests] 🔄 ${typeLabel} - Dupliqué ignoré: ID "${request.id}"`);
              // }
            }
          }
          
          // Log réduit : détails par page (commenté pour réduire le bruit)
          // console.log(`[fetchNetworkingRequests] ✅ ${typeLabel} - Page ${page}: ${addedCount} rendez-vous ajoutés, ${duplicateCount} dupliqués ignorés (total: ${loadedCount})`);

          // Si pas assez de données, pas de page suivante
          if (data.length < perPage) {
            hasMore = false;
          }

          page++;
        } catch (pageError: any) {
          console.error(`[fetchNetworkingRequests] ❌ ${typeLabel} - Erreur page ${page}:`, {
            error: pageError?.message || String(pageError),
            stack: pageError?.stack,
            errorType: typeof pageError
          });
          hasMore = false; // Arrêter en cas d'erreur
        }
      }
      
      // Log réduit : récapitulatif par type (commenté pour réduire le bruit)
      // console.log(`[fetchNetworkingRequests] 📊 ${typeLabel} - Récapitulatif: ${loadedCount} rendez-vous chargés (total attendu: ${totalCount || '?'}, pages: ${totalPages || page - 1})`);
    }

    // Log final uniquement avec le total (réduit)
    console.log(`[fetchNetworkingRequests] ✅ ${allRequests.length} rendez-vous chargés`);
    
    // Log détaillé désactivé (peut être réactivé en debug)
    // console.log(`[fetchNetworkingRequests] ===== FIN DU CHARGEMENT =====`);
    // console.log(`[fetchNetworkingRequests] ✅ TOTAL: ${allRequests.length} rendez-vous uniques chargés (${seenIds.size} IDs uniques)`);
    // console.log(`[fetchNetworkingRequests] 📋 Exemples de rendez-vous chargés:`, 
    //   allRequests.slice(0, 5).map(r => ({ 
    //     id: r.id, 
    //     type: r.type, 
    //     date: r.date,
    //     statut: r.statut
    //   }))
    // );
    return allRequests;
  } catch (error: any) {
    console.error('Erreur lors du chargement des rendez-vous:', error);
    throw error;
  }
}

/**
 * Classe pour gérer les données de networking/rendez-vous avec cache
 */
export class NetworkingDataService {
  private requestsCache: RendezVous[] = [];
  private requestsById: Map<string, RendezVous> = new Map();
  private isRequestsLoaded = false;
  private lastFilters: { type?: 'participant' | 'sponsor'; status?: string } | null = null;

  /**
   * Charge et cache les rendez-vous (utilise le cache si déjà chargées avec les mêmes filtres)
   */
  async loadNetworkingRequests(
    filters?: { type?: 'participant' | 'sponsor'; status?: string },
    forceReload = false
  ): Promise<RendezVous[]> {
    // Vérifier si les filtres sont identiques
    const filtersMatch = 
      this.lastFilters?.type === filters?.type &&
      this.lastFilters?.status === filters?.status;
    
    // Si déjà chargées avec les mêmes filtres et pas de rechargement forcé, retourner le cache
    if (!forceReload && this.isRequestsLoaded && this.requestsCache.length > 0 && filtersMatch) {
      // Log réduit pour l'utilisation du cache (moins de bruit)
      // console.log(`[loadNetworkingRequests] ✅ Utilisation du cache (${this.requestsCache.length} rendez-vous)`);
      return this.requestsCache;
    }

    // Log uniquement lors d'un chargement depuis l'API
    if (forceReload || !this.isRequestsLoaded || this.requestsCache.length === 0 || !filtersMatch) {
      console.log(`[loadNetworkingRequests] 📡 Démarrage du chargement depuis l'API...`, filters || 'aucun filtre');
    }
    
    try {
      this.requestsCache = await fetchNetworkingRequests(filters);
      
      console.log(`[loadNetworkingRequests] ✅ ${this.requestsCache.length} rendez-vous chargés depuis l'API`);
      
      // Créer un index par ID pour un accès rapide
      this.requestsById.clear();
      
      let indexedById = 0;
      
      this.requestsCache.forEach(request => {
        if (request.id) {
          this.requestsById.set(request.id, request);
          indexedById++;
        }
      });
      
      this.isRequestsLoaded = true;
      this.lastFilters = filters || null;
      
      // Log détaillé uniquement en mode debug (désactivé par défaut)
      // console.log(`[loadNetworkingRequests] 📊 Index: ${indexedById} par ID`);
      // console.log(`[loadNetworkingRequests] 📋 Exemples de rendez-vous:`, 
      //   this.requestsCache.slice(0, 5).map(r => ({ 
      //     id: r.id, 
      //     type: r.type, 
      //     date: r.date,
      //     statut: r.statut
      //   }))
      // );
      
      return this.requestsCache;
    } catch (error: any) {
      console.error(`[loadNetworkingRequests] ❌ Erreur lors du chargement des rendez-vous:`, {
        error: error?.message || String(error),
        stack: error?.stack,
        cacheLength: this.requestsCache.length
      });
      return this.requestsCache; // Retourner le cache même en cas d'erreur
    }
  }

  /**
   * Obtient un rendez-vous par son ID depuis le cache
   */
  getRequestById(id: string): RendezVous | undefined {
    if (!id || id === '') {
      return undefined;
    }
    
    return this.requestsById.get(id);
  }

  /**
   * Obtient tous les rendez-vous du cache
   */
  getNetworkingRequests(): RendezVous[] {
    return this.requestsCache;
  }

  /**
   * Met à jour un rendez-vous dans le cache (après acceptation/refus depuis l'API)
   */
  updateRequest(id: string, updates: Partial<RendezVous>): void {
    const request = this.requestsById.get(id);
    if (request) {
      const updated = { ...request, ...updates };
      this.requestsById.set(id, updated);
      // Mettre à jour aussi dans le cache
      const index = this.requestsCache.findIndex(r => r.id === id);
      if (index !== -1) {
        this.requestsCache[index] = updated;
      }
    }
  }

  /**
   * Vide le cache
   */
  clearCache() {
    this.requestsCache = [];
    this.requestsById.clear();
    this.isRequestsLoaded = false;
    this.lastFilters = null;
  }
}

// Instance singleton pour être utilisée dans les composants
export const networkingDataService = new NetworkingDataService();


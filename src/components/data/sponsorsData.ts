/**
 * Service de récupération et mapping des données de sponsors
 * Centralise la logique de récupération depuis l'API et de mapping vers le format interne
 */

import { fanafApi } from '../../services/fanafApi';
import type { Organisation } from './mockData';

/**
 * Mappe les données de sponsor de l'API vers le format Organisation
 * Les sponsors ont une structure similaire aux organisations, mais avec statut 'sponsor'
 */
export function mapApiSponsorToOrganisation(apiData: any): Organisation {
  // Extraire le type de sponsor (ARGENT, GOLD, etc.) comme secteur d'activité
  const sponsorType = apiData.type?.name || apiData.type || '';
  
  return {
    id: apiData.id || apiData.sponsor_id || '',
    nom: apiData.name || apiData.nom || '',
    contact: apiData.phone || apiData.telephone || apiData.contact_phone || '', // Pas dans l'API actuelle
    email: apiData.email || '',
    pays: apiData.country || apiData.pays || '', // Pas dans l'API actuelle
    dateCreation: apiData.created_at || apiData.date_creation || new Date().toISOString(),
    statut: 'sponsor', // Les sponsors ont toujours le statut 'sponsor'
    secteurActivite: sponsorType, // Utiliser le type de sponsor (ARGENT, GOLD, etc.) comme secteur
    referent: undefined, // Les sponsors de l'API n'ont pas de référent direct
  };
}

/**
 * Récupère tous les sponsors depuis l'API avec gestion de la pagination
 */
export async function fetchSponsors(): Promise<Organisation[]> {
  try {
    console.log('[fetchSponsors] ===== DÉBUT DU CHARGEMENT DES SPONSORS =====');
    const allSponsors: Organisation[] = [];
    const seenIds = new Set<string>();
    const perPage = 100;

    let page = 1;
    let hasMore = true;
    let totalPages = 0;
    let totalCount = 0;
    let loadedCount = 0;
    
    while (hasMore) {
      try {
        console.log(`[fetchSponsors] 🔄 Appel API - Page ${page} (per_page: ${perPage})`);
        
        const response = await fanafApi.getSponsors({
          per_page: perPage,
          page: page,
        }) as any;
        
        console.log(`[fetchSponsors] ✅ Réponse API reçue pour page ${page}:`, {
          hasResponse: !!response,
          responseKeys: response ? Object.keys(response) : [],
          hasData: !!response?.data,
          hasDataData: !!response?.data?.data,
          hasMeta: !!response?.meta,
          responseType: typeof response,
        });

        // Extraire les données de la réponse
        // Vérifier aussi response.data.data comme pour les companies (structure Laravel)
        let data: any[] = [];
        
        if (Array.isArray(response)) {
          data = response;
          hasMore = false;
          console.log(`[fetchSponsors] 📦 Réponse est un tableau direct, ${data.length} éléments`);
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          // Structure imbriquée: response.data.data (double data) - PRIORITÉ
          data = response.data.data;
          totalPages = response.data.last_page || 1;
          totalCount = response.data.total || 0;
          if (response.data.last_page !== undefined) {
            hasMore = page < (response.data.last_page || 1);
            console.log(`[fetchSponsors] 📄 Pagination (structure imbriquée): page ${page}/${response.data.last_page}, total: ${response.data.total}, données: ${data.length}`);
          } else {
            hasMore = data.length >= perPage;
            console.log(`[fetchSponsors] 📄 Pas de meta last_page, vérification basée sur longueur: ${data.length} >= ${perPage}`);
          }
        } else if (response?.data && Array.isArray(response.data)) {
          data = response.data;
          // Vérifier s'il y a plus de pages
          if (response?.meta) {
            totalPages = response.meta.last_page || response.meta.total_pages || 1;
            totalCount = response.meta.total || 0;
            hasMore = page < totalPages;
            console.log(`[fetchSponsors] 📄 Pagination (via meta): page ${page}/${totalPages}, total: ${totalCount}, données: ${data.length}`);
          } else if (response.data.last_page !== undefined) {
            totalPages = response.data.last_page || 1;
            totalCount = response.data.total || 0;
            hasMore = page < totalPages;
            console.log(`[fetchSponsors] 📄 Pagination (via data): page ${page}/${totalPages}, total: ${totalCount}, données: ${data.length}`);
          } else {
            hasMore = data.length === perPage;
            console.log(`[fetchSponsors] 📄 Pas de meta, vérification basée sur longueur: ${data.length} === ${perPage}`);
          }
        } else if (response?.results && Array.isArray(response.results)) {
          data = response.results;
          hasMore = data.length === perPage;
          console.log(`[fetchSponsors] 📦 Données dans response.results, ${data.length} éléments`);
        } else if (response?.items && Array.isArray(response.items)) {
          data = response.items;
          hasMore = data.length === perPage;
          console.log(`[fetchSponsors] 📦 Données dans response.items, ${data.length} éléments`);
        } else if (response?.sponsors && Array.isArray(response.sponsors)) {
          data = response.sponsors;
          hasMore = data.length === perPage;
          console.log(`[fetchSponsors] 📦 Données dans response.sponsors, ${data.length} éléments`);
        } else {
          console.warn(`[fetchSponsors] ⚠️ Format de réponse inattendu pour page ${page}:`, {
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
          if (page === 1) {
            console.log(`[fetchSponsors] 📋 Premier élément exemple (page 1):`, {
              id: data[0]?.id,
              name: data[0]?.name || data[0]?.nom,
              type: data[0]?.type,
              country: data[0]?.country || data[0]?.pays,
              email: data[0]?.email,
              phone: data[0]?.phone,
              keys: Object.keys(data[0] || {}),
              sampleData: JSON.stringify(data[0]).substring(0, 300)
            });
          }
          console.log(`[fetchSponsors] 📦 Page ${page}: ${data.length} éléments bruts reçus`);
        } else {
          console.warn(`[fetchSponsors] ⚠️ Page ${page}: Aucune donnée dans la réponse`);
        }

        // Mapper et dédupliquer par ID
        const mapped = data.map(item => mapApiSponsorToOrganisation(item));
        let addedCount = 0;
        let duplicateCount = 0;
        
        for (const sponsor of mapped) {
          if (sponsor.id && !seenIds.has(sponsor.id)) {
            seenIds.add(sponsor.id);
            allSponsors.push(sponsor);
            addedCount++;
            loadedCount++;
          } else {
            duplicateCount++;
            if (duplicateCount <= 3) {
              console.log(`[fetchSponsors] 🔄 Dupliqué ignoré: ID "${sponsor.id}", nom "${sponsor.nom}"`);
            }
          }
        }
        
        console.log(`[fetchSponsors] ✅ Page ${page}: ${addedCount} sponsors ajoutés, ${duplicateCount} dupliqués ignorés (total: ${loadedCount})`);

        // Si pas assez de données, pas de page suivante
        if (data.length < perPage) {
          hasMore = false;
        }

        page++;
      } catch (pageError: any) {
        console.error(`[fetchSponsors] ❌ Erreur page ${page}:`, {
          error: pageError?.message || String(pageError),
          stack: pageError?.stack,
          errorType: typeof pageError
        });
        hasMore = false; // Arrêter en cas d'erreur
      }
    }
    
    console.log(`[fetchSponsors] 📊 Récapitulatif: ${loadedCount} sponsors chargés (total attendu: ${totalCount || '?'}, pages: ${totalPages || page - 1})`);
    console.log(`[fetchSponsors] ===== FIN DU CHARGEMENT =====`);
    console.log(`[fetchSponsors] ✅ TOTAL: ${allSponsors.length} sponsors uniques chargés (${seenIds.size} IDs uniques)`);
    console.log(`[fetchSponsors] 📋 Exemples de sponsors chargés:`, 
      allSponsors.slice(0, 5).map(s => ({ 
        id: s.id, 
        nom: s.nom, 
        statut: s.statut, 
        pays: s.pays 
      }))
    );
    return allSponsors;
  } catch (error: any) {
    console.error('Erreur lors du chargement des sponsors:', error);
    throw error;
  }
}

/**
 * Classe pour gérer les données de sponsors avec cache
 */
export class SponsorsDataService {
  private sponsorsCache: Organisation[] = [];
  private sponsorsById: Map<string, Organisation> = new Map();
  // Index pour rechercher par nom - insensible à la casse et aux espaces
  private sponsorsByName: Map<string, Organisation> = new Map();
  private isSponsorsLoaded = false;

  /**
   * Charge et cache les sponsors (utilise le cache si déjà chargés)
   */
  async loadSponsors(forceReload = false): Promise<Organisation[]> {
    console.log(`[loadSponsors] 🔄 Appel de loadSponsors (forceReload: ${forceReload})`);
    
    // Si déjà chargés et pas de rechargement forcé, retourner le cache
    if (!forceReload && this.isSponsorsLoaded && this.sponsorsCache.length > 0) {
      console.log(`[loadSponsors] ✅ Utilisation du cache (${this.sponsorsCache.length} sponsors)`);
      console.log(`[loadSponsors] 📋 Exemples du cache:`, 
        this.sponsorsCache.slice(0, 3).map(s => ({ id: s.id, nom: s.nom, statut: s.statut }))
      );
      return this.sponsorsCache;
    }

    console.log(`[loadSponsors] 📡 Démarrage du chargement depuis l'API...`);
    
    try {
      this.sponsorsCache = await fetchSponsors();
      
      console.log(`[loadSponsors] ✅ fetchSponsors terminé, ${this.sponsorsCache.length} sponsors reçus`);
      
      // Créer un index par ID et par nom pour un accès rapide
      this.sponsorsById.clear();
      this.sponsorsByName.clear();
      
      let indexedById = 0;
      let indexedByName = 0;
      
      this.sponsorsCache.forEach(sponsor => {
        if (sponsor.id) {
          this.sponsorsById.set(sponsor.id, sponsor);
          indexedById++;
        }
        if (sponsor.nom) {
          // Normaliser le nom (minuscules, sans espaces superflus) pour la recherche
          const normalizedName = sponsor.nom.trim().toLowerCase().replace(/\s+/g, ' ');
          this.sponsorsByName.set(normalizedName, sponsor);
          indexedByName++;
        }
      });
      
      this.isSponsorsLoaded = true;
      console.log(`[loadSponsors] ✅ ${this.sponsorsCache.length} sponsors chargés et indexés`);
      console.log(`[loadSponsors] 📊 Index: ${indexedById} par ID, ${indexedByName} par nom`);
      console.log(`[loadSponsors] 📋 Exemples de sponsors:`, 
        this.sponsorsCache.slice(0, 5).map(s => ({ 
          id: s.id, 
          nom: s.nom, 
          statut: s.statut, 
          pays: s.pays 
        }))
      );
      
      return this.sponsorsCache;
    } catch (error: any) {
      console.error(`[loadSponsors] ❌ Erreur lors du chargement des sponsors:`, {
        error: error?.message || String(error),
        stack: error?.stack,
        cacheLength: this.sponsorsCache.length
      });
      return this.sponsorsCache; // Retourner le cache même en cas d'erreur
    }
  }

  /**
   * Obtient un sponsor par son ID depuis le cache
   */
  getSponsorById(id: string): Organisation | undefined {
    if (!id || id === '') {
      return undefined;
    }
    
    // Chercher directement par ID
    let sponsor = this.sponsorsById.get(id);
    
    // Si non trouvé, essayer de chercher dans le cache (peut-être un problème de casse ou format)
    if (!sponsor && this.sponsorsCache.length > 0) {
      sponsor = this.sponsorsCache.find(s => 
        s.id === id || 
        s.id?.toLowerCase() === id.toLowerCase() ||
        String(s.id) === String(id)
      );
      // Si trouvé, l'ajouter au Map pour un accès futur plus rapide
      if (sponsor) {
        this.sponsorsById.set(id, sponsor);
      }
    }
    
    return sponsor;
  }

  /**
   * Obtient un sponsor par son nom depuis le cache
   */
  getSponsorByName(name: string): Organisation | undefined {
    if (!name || name === '') {
      return undefined;
    }
    
    // Normaliser le nom pour la recherche (insensible à la casse, sans espaces superflus)
    const normalizedName = name.trim().toLowerCase().replace(/\s+/g, ' ');
    
    // Chercher dans l'index par nom (recherche exacte)
    let sponsor = this.sponsorsByName.get(normalizedName);
    
    // Si non trouvé, chercher avec correspondance partielle (fuzzy)
    if (!sponsor && this.sponsorsCache.length > 0) {
      // Essayer plusieurs stratégies de recherche
      // 1. Correspondance exacte après normalisation
      sponsor = this.sponsorsCache.find(s => {
        const sponsorName = s.nom?.trim().toLowerCase().replace(/\s+/g, ' ') || '';
        return sponsorName === normalizedName;
      });
      
      // 2. Si pas trouvé, correspondance partielle (le nom cherché est contenu dans le nom du sponsor)
      if (!sponsor) {
        sponsor = this.sponsorsCache.find(s => {
          const sponsorName = s.nom?.trim().toLowerCase().replace(/\s+/g, ' ') || '';
          return sponsorName.includes(normalizedName) || normalizedName.includes(sponsorName);
        });
      }
      
      // 3. Si pas trouvé, essayer de trouver avec des mots clés
      if (!sponsor) {
        const nameWords = normalizedName.split(/\s+/).filter(w => w.length > 2); // Mots de plus de 2 caractères
        sponsor = this.sponsorsCache.find(s => {
          const sponsorName = s.nom?.trim().toLowerCase().replace(/\s+/g, ' ') || '';
          return nameWords.some(word => sponsorName.includes(word));
        });
      }
      
      // Si trouvé, l'ajouter au Map pour un accès futur plus rapide
      if (sponsor && sponsor.nom) {
        const sponsorNormalizedName = sponsor.nom.trim().toLowerCase().replace(/\s+/g, ' ');
        this.sponsorsByName.set(sponsorNormalizedName, sponsor);
        // Ajouter aussi le nom recherché pour un accès direct futur
        this.sponsorsByName.set(normalizedName, sponsor);
      }
    }
    
    return sponsor;
  }

  /**
   * Obtient tous les sponsors du cache
   */
  getSponsors(): Organisation[] {
    return this.sponsorsCache;
  }

  /**
   * Vide le cache
   */
  clearCache() {
    this.sponsorsCache = [];
    this.sponsorsById.clear();
    this.sponsorsByName.clear();
    this.isSponsorsLoaded = false;
  }
}

// Instance singleton pour être utilisée dans les composants
export const sponsorsDataService = new SponsorsDataService();


/**
 * Service de récupération et mapping des données de companies/organisations
 * Centralise la logique de récupération depuis l'API et de mapping vers le format interne
 */

import { fanafApi } from '../../services/fanafApi';
import type { Organisation } from './mockData';

/**
 * Mappe les données d'organisation de l'API vers le format Organisation
 */
export function mapApiAssociationToOrganisation(apiData: any): Organisation {
  return {
    id: apiData.id || apiData.organisation_id || apiData.association_id || '',
    nom: apiData.nom || apiData.name || apiData.organization_name || '',
    contact: apiData.contact || apiData.phone || apiData.telephone || apiData.contact_phone || '',
    email: apiData.email || apiData.contact_email || '',
    pays: apiData.pays || apiData.country || apiData.country_name || '',
    dateCreation: apiData.date_creation || apiData.dateCreation || apiData.created_at || new Date().toISOString(),
    statut: mapApiStatutToOrganisationStatut(apiData.statut || apiData.status || apiData.type),
    secteurActivite: apiData.secteur_activite || apiData.secteurActivite || apiData.sector || apiData.activity_sector,
    referent: apiData.referent_nom || apiData.referent ? {
      nom: apiData.referent_nom || apiData.referent?.nom || apiData.referent_nom || '',
      prenom: apiData.referent_prenom || apiData.referent?.prenom || apiData.referent_prenom || '',
      email: apiData.referent_email || apiData.referent?.email || apiData.referent_email || '',
      telephone: apiData.referent_telephone || apiData.referent?.telephone || apiData.referent_telephone || '',
      fonction: apiData.referent_fonction || apiData.referent?.fonction || apiData.referent_fonction || '',
    } : undefined,
  };
}

/**
 * Mappe le statut de l'API vers le format StatutOrganisation
 */
function mapApiStatutToOrganisationStatut(apiStatut: any): 'membre' | 'non-membre' | 'sponsor' {
  if (!apiStatut) return 'non-membre';
  
  const statut = String(apiStatut).toLowerCase();
  // L'API utilise 'company' -> non-membre, 'association' -> membre
  if (statut === 'association' || statut === 'member' || statut === 'membre') {
    return 'membre';
  } else if (statut === 'sponsor') {
    return 'sponsor';
  }
  // Par défaut, si c'est 'company', c'est non-membre
  return 'non-membre';
}

/**
 * Récupère toutes les organisations depuis l'API avec gestion de la pagination
 */
export async function fetchOrganisations(): Promise<Organisation[]> {
  try {
    console.log('[fetchOrganisations] ===== DÉBUT DU CHARGEMENT DES ORGANISATIONS =====');
    const allOrganisations: Organisation[] = [];
    const seenIds = new Set<string>();
    const perPage = 100;

    // Charger séparément les companies et les associations
    for (const orgType of ['company', 'association'] as const) {
      console.log(`[fetchOrganisations] 📡 Début chargement ${orgType} (type: ${orgType})`);
      let page = 1;
      let hasMore = true;
      let totalPagesForType = 0;
      let totalCountForType = 0;
      let loadedCountForType = 0;
      
      while (hasMore) {
        try {
          console.log(`[fetchOrganisations] 🔄 Appel API ${orgType} - Page ${page} (per_page: ${perPage})`);
          
          const response = await fanafApi.getCompanies({
            per_page: perPage,
            page: page,
            type: orgType,
          }) as any;
          
          console.log(`[fetchOrganisations] ✅ Réponse API reçue pour ${orgType}, page ${page}:`, {
            hasResponse: !!response,
            responseKeys: response ? Object.keys(response) : [],
            hasData: !!response?.data,
            hasDataData: !!response?.data?.data,
            hasMeta: !!response?.meta,
            responseType: typeof response,
          });

          // Extraire les données de la réponse
          // Vérifier aussi response.data.data comme pour les registrations (structure Laravel)
          let data: any[] = [];
          
          if (Array.isArray(response)) {
            data = response;
            hasMore = false;
            console.log(`[fetchOrganisations] 📦 ${orgType} - Réponse est un tableau direct, ${data.length} éléments`);
          } else if (response?.data?.data && Array.isArray(response.data.data)) {
            // Structure imbriquée: response.data.data (double data) - PRIORITÉ
            data = response.data.data;
            totalPagesForType = response.data.last_page || 1;
            totalCountForType = response.data.total || 0;
            if (response.data.last_page !== undefined) {
              hasMore = page < (response.data.last_page || 1);
              console.log(`[fetchOrganisations] 📄 ${orgType} - Pagination (structure imbriquée): page ${page}/${response.data.last_page}, total: ${response.data.total}, données: ${data.length}`);
            } else {
              hasMore = data.length >= perPage;
              console.log(`[fetchOrganisations] 📄 ${orgType} - Pas de meta last_page, vérification basée sur longueur: ${data.length} >= ${perPage}`);
            }
          } else if (response?.data && Array.isArray(response.data)) {
            data = response.data;
            // Vérifier s'il y a plus de pages
            if (response?.meta) {
              totalPagesForType = response.meta.last_page || response.meta.total_pages || 1;
              totalCountForType = response.meta.total || 0;
              hasMore = page < totalPagesForType;
              console.log(`[fetchOrganisations] 📄 ${orgType} - Pagination (via meta): page ${page}/${totalPagesForType}, total: ${totalCountForType}, données: ${data.length}`);
            } else if (response.data.last_page !== undefined) {
              totalPagesForType = response.data.last_page || 1;
              totalCountForType = response.data.total || 0;
              hasMore = page < totalPagesForType;
              console.log(`[fetchOrganisations] 📄 ${orgType} - Pagination (via data): page ${page}/${totalPagesForType}, total: ${totalCountForType}, données: ${data.length}`);
            } else {
              hasMore = data.length === perPage;
              console.log(`[fetchOrganisations] 📄 ${orgType} - Pas de meta, vérification basée sur longueur: ${data.length} === ${perPage}`);
            }
          } else if (response?.results && Array.isArray(response.results)) {
            data = response.results;
            hasMore = data.length === perPage;
            console.log(`[fetchOrganisations] 📦 ${orgType} - Données dans response.results, ${data.length} éléments`);
          } else if (response?.items && Array.isArray(response.items)) {
            data = response.items;
            hasMore = data.length === perPage;
            console.log(`[fetchOrganisations] 📦 ${orgType} - Données dans response.items, ${data.length} éléments`);
          } else if (response?.associations && Array.isArray(response.associations)) {
            data = response.associations;
            hasMore = data.length === perPage;
            console.log(`[fetchOrganisations] 📦 ${orgType} - Données dans response.associations, ${data.length} éléments`);
          } else if (response?.companies && Array.isArray(response.companies)) {
            data = response.companies;
            hasMore = data.length === perPage;
            console.log(`[fetchOrganisations] 📦 ${orgType} - Données dans response.companies, ${data.length} éléments`);
          } else {
            console.warn(`[fetchOrganisations] ⚠️ ${orgType} - Format de réponse inattendu pour page ${page}:`, {
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
              console.log(`[fetchOrganisations] 📋 ${orgType} - Premier élément exemple (page 1):`, {
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
            console.log(`[fetchOrganisations] 📦 ${orgType} - Page ${page}: ${data.length} éléments bruts reçus`);
          } else {
            console.warn(`[fetchOrganisations] ⚠️ ${orgType} - Page ${page}: Aucune donnée dans la réponse`);
          }

          // Mapper et dédupliquer par ID
          const mapped = data.map(item => mapApiAssociationToOrganisation(item));
          let addedCount = 0;
          let duplicateCount = 0;
          
          for (const org of mapped) {
            if (org.id && !seenIds.has(org.id)) {
              seenIds.add(org.id);
              allOrganisations.push(org);
              addedCount++;
              loadedCountForType++;
            } else {
              duplicateCount++;
              if (duplicateCount <= 3) {
                console.log(`[fetchOrganisations] 🔄 ${orgType} - Dupliqué ignoré: ID "${org.id}", nom "${org.nom}"`);
              }
            }
          }
          
          console.log(`[fetchOrganisations] ✅ ${orgType} - Page ${page}: ${addedCount} organisations ajoutées, ${duplicateCount} dupliquées ignorées (total ${orgType}: ${loadedCountForType})`);

          // Si pas assez de données, pas de page suivante
          if (data.length < perPage) {
            hasMore = false;
          }

          page++;
        } catch (pageError: any) {
          console.error(`[fetchOrganisations] ❌ ${orgType} - Erreur page ${page}:`, {
            error: pageError?.message || String(pageError),
            stack: pageError?.stack,
            errorType: typeof pageError
          });
          hasMore = false; // Arrêter en cas d'erreur
        }
      }
      
      console.log(`[fetchOrganisations] 📊 ${orgType} - Récapitulatif: ${loadedCountForType} organisations chargées (total attendu: ${totalCountForType || '?'}, pages: ${totalPagesForType || page - 1})`);
    }

    console.log(`[fetchOrganisations] ===== FIN DU CHARGEMENT =====`);
    console.log(`[fetchOrganisations] ✅ TOTAL: ${allOrganisations.length} organisations uniques chargées (${seenIds.size} IDs uniques)`);
    console.log(`[fetchOrganisations] 📋 Exemples d'organisations chargées:`, 
      allOrganisations.slice(0, 5).map(o => ({ 
        id: o.id, 
        nom: o.nom, 
        statut: o.statut, 
        pays: o.pays 
      }))
    );
    return allOrganisations;
  } catch (error: any) {
    console.error('Erreur lors du chargement des organisations:', error);
    throw error;
  }
}

/**
 * Classe pour gérer les données de companies/organisations avec cache
 */
export class CompaniesDataService {
  private organisationsCache: Organisation[] = [];
  private organisationsById: Map<string, Organisation> = new Map();
  // Index pour rechercher par nom (company) - insensible à la casse et aux espaces
  private organisationsByName: Map<string, Organisation> = new Map();
  private isOrganisationsLoaded = false;

  /**
   * Charge et cache les organisations (utilise le cache si déjà chargées)
   */
  async loadOrganisations(forceReload = false): Promise<Organisation[]> {
    console.log(`[loadOrganisations] 🔄 Appel de loadOrganisations (forceReload: ${forceReload})`);
    
    // Si déjà chargées et pas de rechargement forcé, retourner le cache
    if (!forceReload && this.isOrganisationsLoaded && this.organisationsCache.length > 0) {
      console.log(`[loadOrganisations] ✅ Utilisation du cache (${this.organisationsCache.length} organisations)`);
      console.log(`[loadOrganisations] 📋 Exemples du cache:`, 
        this.organisationsCache.slice(0, 3).map(o => ({ id: o.id, nom: o.nom, statut: o.statut }))
      );
      return this.organisationsCache;
    }

    console.log(`[loadOrganisations] 📡 Démarrage du chargement depuis l'API...`);
    
    try {
      this.organisationsCache = await fetchOrganisations();
      
      console.log(`[loadOrganisations] ✅ fetchOrganisations terminé, ${this.organisationsCache.length} organisations reçues`);
      
      // Créer un index par ID et par nom pour un accès rapide
      this.organisationsById.clear();
      this.organisationsByName.clear();
      
      let indexedById = 0;
      let indexedByName = 0;
      
      this.organisationsCache.forEach(org => {
        if (org.id) {
          this.organisationsById.set(org.id, org);
          indexedById++;
        }
        if (org.nom) {
          // Normaliser le nom (minuscules, sans espaces superflus) pour la recherche
          const normalizedName = org.nom.trim().toLowerCase().replace(/\s+/g, ' ');
          this.organisationsByName.set(normalizedName, org);
          indexedByName++;
        }
      });
      
      this.isOrganisationsLoaded = true;
      console.log(`[loadOrganisations] ✅ ${this.organisationsCache.length} organisations chargées et indexées`);
      console.log(`[loadOrganisations] 📊 Index: ${indexedById} par ID, ${indexedByName} par nom`);
      console.log(`[loadOrganisations] 📋 Exemples d'organisations:`, 
        this.organisationsCache.slice(0, 5).map(o => ({ 
          id: o.id, 
          nom: o.nom, 
          statut: o.statut, 
          pays: o.pays 
        }))
      );
      
      return this.organisationsCache;
    } catch (error: any) {
      console.error(`[loadOrganisations] ❌ Erreur lors du chargement des organisations:`, {
        error: error?.message || String(error),
        stack: error?.stack,
        cacheLength: this.organisationsCache.length
      });
      return this.organisationsCache; // Retourner le cache même en cas d'erreur
    }
  }

  /**
   * Obtient une organisation par son ID depuis le cache
   */
  getOrganisationById(id: string): Organisation | undefined {
    if (!id || id === '') {
      return undefined;
    }
    
    // Chercher directement par ID
    let org = this.organisationsById.get(id);
    
    // Si non trouvé, essayer de chercher dans le cache (peut-être un problème de casse ou format)
    if (!org && this.organisationsCache.length > 0) {
      org = this.organisationsCache.find(o => 
        o.id === id || 
        o.id?.toLowerCase() === id.toLowerCase() ||
        String(o.id) === String(id)
      );
      // Si trouvé, l'ajouter au Map pour un accès futur plus rapide
      if (org) {
        this.organisationsById.set(id, org);
      }
    }
    
    return org;
  }

  /**
   * Obtient une organisation par son nom (company) depuis le cache
   * Utile quand l'API envoie le nom de l'entreprise au lieu de l'ID
   */
  getOrganisationByName(name: string): Organisation | undefined {
    if (!name || name === '') {
      return undefined;
    }
    
    // Normaliser le nom pour la recherche (insensible à la casse, sans espaces superflus)
    const normalizedName = name.trim().toLowerCase().replace(/\s+/g, ' ');
    
    // Chercher dans l'index par nom (recherche exacte)
    let org = this.organisationsByName.get(normalizedName);
    
    // Si non trouvé, chercher avec correspondance partielle (fuzzy)
    if (!org && this.organisationsCache.length > 0) {
      // Essayer plusieurs stratégies de recherche
      // 1. Correspondance exacte après normalisation
      org = this.organisationsCache.find(o => {
        const orgName = o.nom?.trim().toLowerCase().replace(/\s+/g, ' ') || '';
        return orgName === normalizedName;
      });
      
      // 2. Si pas trouvé, correspondance partielle (le nom cherché est contenu dans le nom de l'org)
      if (!org) {
        org = this.organisationsCache.find(o => {
          const orgName = o.nom?.trim().toLowerCase().replace(/\s+/g, ' ') || '';
          return orgName.includes(normalizedName) || normalizedName.includes(orgName);
        });
      }
      
      // 3. Si pas trouvé, essayer de trouver avec des mots clés (ex: "APSAB" dans "APSAB Association")
      if (!org) {
        const nameWords = normalizedName.split(/\s+/).filter(w => w.length > 2); // Mots de plus de 2 caractères
        org = this.organisationsCache.find(o => {
          const orgName = o.nom?.trim().toLowerCase().replace(/\s+/g, ' ') || '';
          return nameWords.some(word => orgName.includes(word));
        });
      }
      
      // Si trouvé, l'ajouter au Map pour un accès futur plus rapide
      if (org && org.nom) {
        const orgNormalizedName = org.nom.trim().toLowerCase().replace(/\s+/g, ' ');
        this.organisationsByName.set(orgNormalizedName, org);
        // Ajouter aussi le nom recherché pour un accès direct futur
        this.organisationsByName.set(normalizedName, org);
      }
    }
    
    return org;
  }

  /**
   * Obtient toutes les organisations du cache
   */
  getOrganisations(): Organisation[] {
    return this.organisationsCache;
  }

  /**
   * Vide le cache
   */
  clearCache() {
    this.organisationsCache = [];
    this.organisationsById.clear();
    this.organisationsByName.clear();
    this.isOrganisationsLoaded = false;
  }
}

// Instance singleton pour être utilisée dans les composants
export const companiesDataService = new CompaniesDataService();


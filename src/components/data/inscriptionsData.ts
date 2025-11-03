/**
 * Service de récupération et mapping des données d'inscriptions
 * Centralise la logique de récupération depuis l'API et de mapping vers le format interne
 */

import { fanafApi } from '../../services/fanafApi';
import type { Participant, Organisation, StatutParticipant, StatutInscription } from './types';
import { companiesDataService } from './companiesData';

/**
 * Mappe les données d'inscription de l'API vers le format Participant
 */
export function mapApiRegistrationToParticipant(apiData: any): Participant {
  // La nouvelle API fournit directement 'statut' au niveau principal (ex: "membre", "non-membre", "vip", "speaker")
  const apiStatut = apiData.statut || apiData.status || apiData.membership || apiData.category;
  let statut: StatutParticipant = 'non-membre';
  
  // Mapper directement depuis l'API - les valeurs sont en minuscules
  if (apiStatut === 'vip') {
    statut = 'vip';
  } else if (apiStatut === 'member' || apiStatut === 'membre') {
    statut = 'membre';
  } else if (apiStatut === 'not_member' || apiStatut === 'non-membre' || apiStatut === 'not-member') {
    statut = 'non-membre';
  } else if (apiStatut === 'speaker') {
    statut = 'speaker';
  }
  // Si pas de statut spécifique, par défaut non-membre
  
  // La nouvelle API fournit directement 'statut_inscription' au niveau principal (ex: "finalisée", "non-finalisée")
  let statutInscriptionApi = apiData.statut_inscription || apiData.status_inscription;
  
  // Fallback: chercher dans registration.status si statut_inscription n'est pas au niveau principal
  if (!statutInscriptionApi && apiData.registration) {
    const regStatus = apiData.registration.status;
    // Mapper registration.status vers statut_inscription
    if (regStatus === 'completed') {
      statutInscriptionApi = 'finalisée';
    } else if (regStatus === 'pending' || regStatus === 'incomplete') {
      statutInscriptionApi = 'non-finalisée';
    }
  }
  
  let statutInscription: StatutInscription = 'non-finalisée';
  if (statutInscriptionApi === 'finalisée' || 
      statutInscriptionApi === 'finalized' || 
      statutInscriptionApi === 'completed' || 
      statutInscriptionApi === 'Confirmée' ||
      (apiData.registration && apiData.registration.status === 'completed') ||
      apiData.date_paiement) {
    statutInscription = 'finalisée';
  }
  
  // Générer un ID unique déterministe basé sur l'email et le nom si l'ID n'existe pas
  // Ne pas utiliser Date.now() ou Math.random() pour éviter les erreurs d'hydratation
  const generateUniqueId = () => {
    const email = apiData.email || '';
    // L'API utilise 'full_name' au lieu de first_name/last_name séparés
    const name = apiData.full_name || apiData.name || `${apiData.first_name || ''} ${apiData.last_name || ''}`.trim();
    const reference = apiData.reference || apiData.registration_number || apiData.id || '';
    
    // Priorité: référence > email+nom > email > nom > id brut
    if (reference) {
      return `reg_ref_${String(reference).replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}`;
    }
    if (email && name) {
      return `reg_${email}_${name}`.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    }
    if (email) {
      return `reg_email_${email.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}`;
    }
    if (name) {
      return `reg_name_${name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}`;
    }
    // Dernier recours: utiliser l'ID de l'API s'il existe
    if (apiData.id) {
      return `reg_api_${String(apiData.id).replace(/[^a-zA-Z0-9_]/g, '_')}`;
    }
    // Fallback: hash basé sur les données (déterministe)
    const fallbackData = JSON.stringify(apiData);
    let hash = 0;
    for (let i = 0; i < fallbackData.length; i++) {
      const char = fallbackData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `reg_hash_${Math.abs(hash).toString(36)}`;
  };
  
  // La nouvelle API fournit directement 'nom' et 'prenom' séparés
  let nom = apiData.nom || apiData.last_name || apiData.lastName || '';
  let prenom = apiData.prenom || apiData.first_name || apiData.firstName || '';
  
  // Fallback: si on a seulement full_name, l'extraire
  if (!nom && !prenom && (apiData.full_name || apiData.name)) {
    const fullName = apiData.full_name || apiData.name || '';
    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      nom = nameParts[nameParts.length - 1]; // Dernier mot = nom
      prenom = nameParts.slice(0, -1).join(' '); // Tout le reste = prénom
    } else if (nameParts.length === 1) {
      prenom = nameParts[0];
    }
  }
  
  // La nouvelle API utilise 'date_inscription' directement
  let dateInscription = apiData.date_inscription || apiData.created_at || apiData.createdAt || apiData.registration_date;
  if (!dateInscription) {
    dateInscription = new Date().toISOString();
  } else if (typeof dateInscription === 'string') {
    // S'assurer que la date est dans un format ISO valide
    try {
      new Date(dateInscription); // Tester si la date est valide
    } catch {
      dateInscription = new Date().toISOString();
    }
  }

  // L'API fournit directement 'id' au niveau principal (ex: "use_nv8O3j5QjXKdx")
  let participantId = apiData.id || apiData.participant_id || apiData.participantId;
  
  if (!participantId || participantId === '') {
    participantId = generateUniqueId();
  }
  // On garde les IDs tels quels car c'est la structure de l'API

  // L'API fournit directement 'organisation_id' au niveau principal
  // Fallback: extraire depuis l'objet 'organisation' si organisation_id n'est pas disponible
  let organisationId = apiData.organisation_id || apiData.organization_id || apiData.organisationId || '';
  
  // Si organisation_id n'est pas disponible, chercher dans l'objet organisation
  if (!organisationId && apiData.organisation) {
    if (typeof apiData.organisation === 'object' && apiData.organisation.id) {
      organisationId = apiData.organisation.id;
    }
  }
  
  // Fallback: chercher dans company (ancienne structure)
  if (!organisationId && apiData.company) {
    if (typeof apiData.company === 'object' && apiData.company.id) {
      organisationId = apiData.company.id;
    } else if (typeof apiData.company === 'string') {
      organisationId = apiData.company;
    }
  }
  
  // L'API fournit directement 'pays' au niveau principal (string)
  // Fallback: extraire depuis l'objet 'country' si pays n'est pas disponible
  let pays = '';
  
  // Priorité 1: pays direct au niveau principal (string)
  if (typeof apiData.pays === 'string' && apiData.pays.trim() !== '') {
    pays = apiData.pays;
  }
  // Priorité 2: country.name si country est un objet
  else if (apiData.country && typeof apiData.country === 'object' && !Array.isArray(apiData.country)) {
    if (apiData.country.name && typeof apiData.country.name === 'string') {
      pays = apiData.country.name;
    }
  }
  // Priorité 3: country_name ou country (si string)
  else if (typeof apiData.country_name === 'string' && apiData.country_name.trim() !== '') {
    pays = apiData.country_name;
  }
  else if (typeof apiData.country === 'string' && apiData.country.trim() !== '') {
    pays = apiData.country;
  }
  
  // L'API fournit directement 'date_paiement' au niveau principal (peut être null)
  let datePaiement = apiData.date_paiement || null;
  if (datePaiement && typeof datePaiement === 'string') {
    // S'assurer que la date est dans un format ISO valide
    try {
      new Date(datePaiement); // Tester si la date est valide
    } catch {
      datePaiement = null;
    }
  }
  
  // L'API fournit directement 'badge_genere' au niveau principal (boolean)
  // Extraire aussi l'URL du badge depuis documents.badge si disponible
  let badgeUrl: string | undefined = undefined;
  
  // Extraire l'URL du badge depuis documents.badge
  if (apiData.documents?.badge) {
    const url = apiData.documents.badge;
    // Vérifier que l'URL est valide et non vide
    if (url && 
        typeof url === 'string' &&
        url !== 'Non disponible' &&
        url !== '' &&
        url !== 'null' &&
        url !== null &&
        (url.startsWith('http') || url.startsWith('/'))) {
      badgeUrl = url;
    }
  }
  
  // Déterminer si le badge est généré
  // Priorité 1: badge_genere direct au niveau principal
  let badgeGenere = apiData.badge_genere === true || apiData.badge_generated === true;
  
  // Priorité 2: documents.has_badge (l'API peut aussi fournir cette info dans documents)
  if (!badgeGenere && apiData.documents?.has_badge === true) {
    badgeGenere = true;
  }
  
  // Priorité 3: Si badgeUrl existe et est valide, le badge est généré
  if (!badgeGenere && badgeUrl) {
    badgeGenere = true;
  }

  // Note: registration_fee n'est pas présent dans les données fournies
  // On peut essayer de le déduire du statut si nécessaire
  let registrationFee = apiData.registration_fee || apiData.registrationFee || apiData.registration_fee_type;
  
  // Si registration_fee n'est pas disponible, essayer de le déduire du statut
  if (!registrationFee) {
    if (statut === 'membre') {
      registrationFee = 'MEMBRE';
    } else if (statut === 'non-membre') {
      registrationFee = 'NON MEMBRE';
    } else if (statut === 'vip') {
      registrationFee = 'VIP';
    } else if (statut === 'speaker') {
      registrationFee = 'SPEAKER';
    }
  }

  // L'API fournit directement 'telephone' et 'contact' au niveau principal (contact est un alias de telephone)
  const telephone = apiData.telephone || apiData.contact || apiData.phone || apiData.phone_number || '';
  
  const participant: Participant = {
    id: participantId,
    nom: nom || '',
    prenom: prenom || '',
    reference: apiData.reference || apiData.registration_number || apiData.id || '',
    email: apiData.email || '',
    telephone: telephone,
    pays: pays || '',
    fonction: apiData.fonction || apiData.function || apiData.position || apiData.job_title || undefined,
    organisationId: organisationId || '',
    statut,
    statutInscription,
    dateInscription,
    datePaiement: datePaiement || undefined,
    modePaiement: apiData.mode_paiement || apiData.payment_method ? 
      (apiData.mode_paiement || apiData.payment_method || '').toLowerCase().replace(/_/g, '-').replace(' ', '-') as any : undefined,
    canalEncaissement: apiData.canal_encaissement || apiData.payment_channel || apiData.paymentChannel || undefined,
    caissier: apiData.caissier || undefined,
    badgeGenere: badgeGenere || undefined,
    badgeUrl: badgeUrl || undefined,
    checkIn: apiData.check_in === true || apiData.checked_in === true || apiData.checkIn === true || apiData.has_checked_in === true,
    checkInDate: apiData.check_in_date || apiData.checkInDate || apiData.checked_in_at || undefined,
    registrationFee: registrationFee || undefined,
  };

  // L'API fournit directement 'groupe_id' et 'nom_groupe' au niveau principal
  let groupId = apiData.groupe_id || apiData.group_id || apiData.groupId || apiData.groupeId;
  let groupName = apiData.nom_groupe || apiData.group_name || apiData.groupe_nom || apiData.groupName || apiData.groupeName;
  
  // Si groupe_id est présent, ajouter les infos de groupe au participant
  if (groupId) {
    participant.groupeId = String(groupId);
    if (groupName) {
      participant.nomGroupe = String(groupName);
    }
    // Ajouter un marqueur souple pour les consommateurs qui inspectent p.type
    (participant as any).type = 'group';
  }

  return participant;
}

/**
 * Récupère les inscriptions depuis l'API selon les catégories spécifiées avec gestion de la pagination
 */
export async function fetchRegistrations(
  categories: Array<'member' | 'not_member' | 'vip'> = ['member', 'not_member', 'vip']
): Promise<Participant[]> {
  const allRegistrations: Participant[] = [];
  // Utiliser un Set global pour dédupliquer par email ET référence
  // Note: Les participants peuvent apparaître dans plusieurs catégories, on ne garde que la première occurrence
  const usedEmails = new Set<string>();
  const usedReferences = new Set<string>();
  const usedIds = new Set<string>();
  
  // Si toutes les catégories sont demandées ou aucune catégorie spécifiée, 
  // charger toutes les inscriptions en une seule requête (plus efficace et évite les doublons)
  const shouldLoadAll = categories.length === 0 || 
                        (categories.length === 3 && 
                         categories.includes('member') && 
                         categories.includes('not_member') && 
                         categories.includes('vip'));
  
  if (shouldLoadAll) {
    // Charger toutes les inscriptions en une seule requête sans filtre catégorie
    console.log(`[fetchRegistrations] Chargement de toutes les inscriptions sans filtre de catégorie`);
    categories = []; // Vide = pas de filtre
  }
  
  // Boucle sur les catégories (ou une seule itération si catégories vide = tout charger)
  const categoriesToProcess = categories.length > 0 ? categories : [undefined];
  
  for (const category of categoriesToProcess) {
    try {
      // Définir le label de catégorie une seule fois au début de la boucle
      const categoryLabel = category || 'toutes catégories';
      
      let page = 1;
      let hasMore = true;
      // L'API semble limiter à 20 par page selon Postman, donc on commence par demander 100
      // mais on s'adapte à ce que l'API renvoie réellement
      let perPage = 100; // Essayer de charger beaucoup par page
      let totalPages = 1;
      let totalInCategory = 0;
      let participantsInCategory = 0;
      
      console.log(`[fetchRegistrations] Début du chargement ${category ? `pour la catégorie: ${category}` : 'de toutes les inscriptions'}`);
      
      while (hasMore) {
        try {
          const response = await fanafApi.getRegistrations({
            ...(category ? { category } : {}), // Ne pas envoyer category si undefined
            per_page: perPage,
            page: page,
          }) as any;
          
          console.log(`[fetchRegistrations] Réponse API pour ${categoryLabel}, page ${page}:`, {
            hasData: !!response?.data,
            dataLength: response?.data?.length || 0,
            hasMeta: !!response?.meta,
            meta: response?.meta,
            responseKeys: Object.keys(response || {})
          });
          
          // Extraire les données de la réponse
          // Nouvelle structure API: { status: 200, message: "...", data: [...] }
          let data: any[] = [];
          
          if (Array.isArray(response)) {
            data = response;
            hasMore = false; // Si c'est un tableau simple, pas de pagination
            console.log(`[fetchRegistrations] Réponse est un tableau direct, ${data.length} éléments`);
          } else if (response?.data && Array.isArray(response.data)) {
            // Nouvelle structure: { status: 200, message: "...", data: [...] }
            data = response.data;
            hasMore = false; // Pas de pagination dans la nouvelle structure
            totalInCategory = data.length;
            console.log(`[fetchRegistrations] Réponse avec structure simple: ${data.length} éléments`);
          } else if (response?.data?.data && Array.isArray(response.data.data)) {
            // Structure imbriquée: response.data.data (ancienne structure Laravel) - fallback pour compatibilité
            data = response.data.data;
            // Les métadonnées sont dans response.data (current_page, last_page, total, etc.)
            if (response.data.last_page !== undefined) {
              totalPages = response.data.last_page || 1;
              totalInCategory = response.data.total || 0;
              const currentPage = response.data.current_page || page;
              const actualPerPage = response.data.per_page;
              if (actualPerPage && actualPerPage !== perPage) {
                console.log(`[fetchRegistrations] L'API limite à ${actualPerPage} éléments par page (demandé: ${perPage})`);
                perPage = actualPerPage;
              }
              hasMore = currentPage < totalPages;
              console.log(`[fetchRegistrations] Pagination détectée (structure imbriquée): page ${currentPage}/${totalPages}, total: ${totalInCategory}, per_page réel: ${perPage}`);
            } else if (response.meta) {
              // Fallback sur meta si disponible
              totalPages = response.meta.last_page || 1;
              totalInCategory = response.meta.total || 0;
              const currentPage = response.meta.current_page || response.data.current_page || page;
              const actualPerPage = response.meta.per_page || response.data.per_page;
              if (actualPerPage && actualPerPage !== perPage) {
                console.log(`[fetchRegistrations] L'API limite à ${actualPerPage} éléments par page (demandé: ${perPage})`);
                perPage = actualPerPage;
              }
              hasMore = currentPage < totalPages;
              console.log(`[fetchRegistrations] Pagination détectée (via meta): page ${currentPage}/${totalPages}, total: ${totalInCategory}, per_page réel: ${perPage}`);
            }
          } else if (response?.results && Array.isArray(response.results)) {
            data = response.results;
            hasMore = data.length >= perPage;
          } else if (response?.items && Array.isArray(response.items)) {
            data = response.items;
            hasMore = data.length >= perPage;
          } else if (response?.registrations && Array.isArray(response.registrations)) {
            data = response.registrations;
            hasMore = data.length >= perPage;
          } else {
            console.warn(`[fetchRegistrations] Format de réponse inattendu pour ${categoryLabel}, page ${page}:`, response);
            hasMore = false;
          }
          
          console.log(`[fetchRegistrations] ${categoryLabel}, page ${page}/${totalPages || '?'}: ${data.length} éléments extraits (total attendu: ${totalInCategory || '?'})`);
          
          if (data.length === 0) {
            console.warn(`[fetchRegistrations] Aucune donnée extraite pour ${category}, page ${page}. Structure de réponse:`, {
              hasResponse: !!response,
              hasData: !!response?.data,
              hasDataData: !!response?.data?.data,
              responseType: typeof response,
              responseKeys: response ? Object.keys(response) : [],
            });
            } else {
              console.log(`[fetchRegistrations] Premier élément exemple pour ${categoryLabel}:`, {
              id: data[0]?.id,
              reference: data[0]?.reference,
              full_name: data[0]?.full_name,
              email: data[0]?.email,
              status: data[0]?.status,
              keys: Object.keys(data[0] || {}),
            });
          }
          
          // Mapper les données
          for (const item of data) {
            // Injecter la catégorie dans les données de l'API si elle n'existe pas
            // car ironiquement l'API ne renvoie pas toujours ce champ dans la réponse
            if (category && !item.category) {
              item.category = category;
            }
            
            const participant = mapApiRegistrationToParticipant(item);
            
            // Corriger organisationId si on a seulement le nom de l'entreprise (company)
            // On le fera après le chargement des organisations, car on a besoin du service pour mapper
            // Pour l'instant, on garde le mapping actuel
            
            // Log pour debug si le mapping produit un participant invalide
            if (!participant.id || !participant.email) {
              console.warn(`[fetchRegistrations] Participant mal mappé:`, {
                original: item,
                mapped: participant,
              });
            }
            
            // Créer une clé unique basée sur l'email ou la référence
            const emailKey = participant.email?.toLowerCase().trim() || '';
            const referenceKey = participant.reference?.trim() || '';
            
            // Dédupliquer : si l'email ou la référence existe déjà, ignorer ce participant
            const isDuplicate = 
              (emailKey && usedEmails.has(emailKey)) || 
              (referenceKey && usedReferences.has(referenceKey)) ||
              (participant.id && usedIds.has(participant.id));
            
            if (!isDuplicate) {
              // Si l'ID est vide ou existe déjà, générer un ID unique déterministe
              if (!participant.id || participant.id === '' || usedIds.has(participant.id)) {
                // Utiliser une approche déterministe pour éviter les erreurs d'hydratation
                if (referenceKey) {
                  participant.id = `reg_ref_${referenceKey.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}`;
                } else if (emailKey) {
                  participant.id = `reg_email_${emailKey.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}`;
                } else {
                  // Utiliser un hash déterministe basé sur les données du participant
                  const hashData = `${participant.nom}_${participant.prenom}_${category}`;
                  let hash = 0;
                  for (let i = 0; i < hashData.length; i++) {
                    const char = hashData.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash;
                  }
                  participant.id = `reg_hash_${Math.abs(hash).toString(36)}`;
                }
                
                // S'assurer que le nouvel ID est vraiment unique en ajoutant un suffixe incrémental
                let finalId = participant.id;
                let counter = 0;
                while (usedIds.has(finalId)) {
                  counter++;
                  finalId = `${participant.id}_${counter}`;
                }
                participant.id = finalId;
              }
              
              // Ajouter aux Sets de suivi
              if (emailKey) usedEmails.add(emailKey);
              if (referenceKey) usedReferences.add(referenceKey);
              usedIds.add(participant.id);
              
              allRegistrations.push(participant);
              participantsInCategory++;
            } else {
              console.log(`[fetchRegistrations] Participant dupliqué ignoré (email: ${emailKey}, ref: ${referenceKey}, id: ${participant.id})`);
            }
          }
          
          // Vérifier si on doit continuer avec la pagination
          // Si on a moins de données que demandé ET qu'on n'a pas de meta, arrêter
          if (!response?.meta && data.length < perPage) {
            hasMore = false;
            console.log(`[fetchRegistrations] Arrêt de la pagination: seulement ${data.length} éléments (demandé: ${perPage})`);
          }
          
          // Si on a chargé tous les éléments attendus selon meta, arrêter
          if (totalInCategory > 0 && participantsInCategory >= totalInCategory) {
            hasMore = false;
            console.log(`[fetchRegistrations] Tous les participants chargés: ${participantsInCategory}/${totalInCategory}`);
          }
          
          page++;
          
          // Sécurité: éviter les boucles infinies
          if (page > 100) {
            console.warn(`[fetchRegistrations] Limite de pages atteinte (100) pour ${categoryLabel}`);
            hasMore = false;
          }
        } catch (pageError: any) {
          console.error(`Erreur lors du chargement de la page ${page} pour ${categoryLabel}:`, pageError);
          hasMore = false; // Arrêter en cas d'erreur
        }
      }
      
      console.log(`[fetchRegistrations] ${categoryLabel} terminée: ${totalInCategory || '?'} total selon API, ${participantsInCategory} participants chargés dans cette catégorie, ${allRegistrations.length} participants uniques au total après déduplication globale`);
    } catch (err: any) {
      const errCategoryLabel = category || 'toutes catégories';
      console.error(`Erreur lors du chargement des inscriptions (${errCategoryLabel}):`, err);
      // Continuer avec les autres catégories même si une échoue
    }
  }
  
  console.log(`[fetchRegistrations] TOTAL: ${allRegistrations.length} participants uniques chargés pour toutes les catégories`);
  return allRegistrations;
}

/**
 * Classe pour gérer les données d'inscriptions avec cache
 */
export class InscriptionsDataService {
  private participantsCache: Participant[] = [];
  private lastLoadedCategories: Array<'member' | 'not_member' | 'vip'> | null = null;

  /**
   * Charge et cache les organisations (utilise companiesDataService)
   */
  async loadOrganisations(forceReload = false): Promise<Organisation[]> {
    return companiesDataService.loadOrganisations(forceReload);
  }

  /**
   * Vérifie si les catégories demandées correspondent à celles déjà chargées
   */
  private categoriesMatch(
    requested: Array<'member' | 'not_member' | 'vip'> | undefined,
    cached: Array<'member' | 'not_member' | 'vip'> | null
  ): boolean {
    // Si aucune catégorie spécifiée, on charge toutes
    const normalizedRequested = requested && requested.length > 0 
      ? [...requested].sort() 
      : ['member', 'not_member', 'vip'].sort();
    
    if (!cached) return false;
    
    const normalizedCached = [...cached].sort();
    return normalizedRequested.length === normalizedCached.length &&
           normalizedRequested.every((cat, i) => cat === normalizedCached[i]);
  }

  /**
   * Charge et cache les participants (utilise le cache si déjà chargées avec les mêmes catégories)
   */
  async loadParticipants(
    categories?: Array<'member' | 'not_member' | 'vip'>,
    forceReload = false
  ): Promise<Participant[]> {
    // Normaliser les catégories (undefined = toutes les catégories)
    const normalizedCategories = categories && categories.length > 0 
      ? categories 
      : ['member', 'not_member', 'vip'];
    
    // Si déjà chargées avec les mêmes catégories et pas de rechargement forcé, retourner le cache
    if (!forceReload && 
        this.participantsCache.length > 0 && 
        this.categoriesMatch(categories, this.lastLoadedCategories)) {
      console.log(`[loadParticipants] Utilisation du cache (${this.participantsCache.length} participants, catégories: ${normalizedCategories.join(', ')})`);
      return this.participantsCache;
    }

    try {
      this.participantsCache = await fetchRegistrations(categories);
      
      // Déduplication finale supplémentaire au cas où
      const uniqueParticipants = new Map<string, Participant>();
      const usedEmails = new Set<string>();
      const usedReferences = new Set<string>();
      
      for (const participant of this.participantsCache) {
        const emailKey = participant.email?.toLowerCase().trim() || '';
        const refKey = participant.reference?.trim() || '';
        
        // Créer une clé unique basée sur email ou référence
        const key = emailKey || refKey || participant.id;
        
        // Dédupliquer par email ou référence
        const isDuplicate = 
          (emailKey && usedEmails.has(emailKey)) ||
          (refKey && usedReferences.has(refKey));
        
        if (!isDuplicate && !uniqueParticipants.has(key)) {
          uniqueParticipants.set(key, participant);
          if (emailKey) usedEmails.add(emailKey);
          if (refKey) usedReferences.add(refKey);
        }
      }
      
      this.participantsCache = Array.from(uniqueParticipants.values());
      this.lastLoadedCategories = normalizedCategories as Array<'member' | 'not_member' | 'vip'>;
      
      // Corriger les organisationId qui sont en réalité des noms d'entreprise (company)
      // Les organisations doivent être déjà chargées pour que ça fonctionne
      let correctedCount = 0;
      let notFoundOrganisations = new Set<string>();
      
      // Vérifier d'abord que les organisations sont bien chargées
      const loadedOrganisations = await companiesDataService.loadOrganisations();
      if (loadedOrganisations.length === 0) {
        console.warn(`[loadParticipants] Aucune organisation chargée ! Les organisations doivent être chargées en premier avec loadOrganisations()`);
      } else {
        console.log(`[loadParticipants] ${loadedOrganisations.length} organisations disponibles pour le mapping`);
        // Afficher quelques exemples d'organisations pour debug
        const sampleOrgs = loadedOrganisations.slice(0, 5);
        console.log(`[loadParticipants] Exemples d'organisations chargées:`, 
          sampleOrgs.map(o => ({ id: o.id, nom: o.nom }))
        );
      }
      
      for (const participant of this.participantsCache) {
        if (participant.organisationId) {
          // Si organisationId ne correspond pas à un ID d'organisation, chercher par nom
          let org = companiesDataService.getOrganisationById(participant.organisationId);
          if (!org) {
            // Essayer de trouver par nom (cas où l'API a envoyé "company" au lieu de "organisation_id")
            org = companiesDataService.getOrganisationByName(participant.organisationId);
            if (org) {
              const oldOrgId = participant.organisationId;
              participant.organisationId = org.id;
              correctedCount++;
              if (correctedCount <= 5) {
                console.log(`[loadParticipants] Participant ${participant.email}: organisation "${oldOrgId}" → ID "${org.id}"`);
              }
            } else {
              // Noter les organisations non trouvées pour debug
              notFoundOrganisations.add(participant.organisationId);
            }
          }
        }
      }
      
      if (correctedCount > 0) {
        console.log(`[loadParticipants] ${correctedCount} participants ont eu leur organisationId corrigé (mapping nom -> ID)`);
      }
      
      if (notFoundOrganisations.size > 0) {
        console.warn(`[loadParticipants] ${notFoundOrganisations.size} organisations non trouvées dans le cache (peut-être pas chargées depuis l'API):`, 
          Array.from(notFoundOrganisations).slice(0, 10)
        );
      }
      
      // Log pour débugger les participants sans organisation
      const participantsWithoutOrg = this.participantsCache.filter(p => 
        !p.organisationId || p.organisationId === '' || !companiesDataService.getOrganisationById(p.organisationId)
      );
      if (participantsWithoutOrg.length > 0) {
        console.warn(`[loadParticipants] ${participantsWithoutOrg.length} participants sans organisation trouvée:`, 
          participantsWithoutOrg.map(p => ({ 
            id: p.id, 
            email: p.email, 
            organisationId: p.organisationId,
            nom: `${p.prenom} ${p.nom}`
          }))
        );
      }
      
      console.log(`[loadParticipants] ${this.participantsCache.length} participants uniques après déduplication finale (catégories: ${normalizedCategories.join(', ')})`);
      
      return this.participantsCache;
    } catch (error) {
      console.error('Erreur lors du chargement des participants:', error);
      return this.participantsCache; // Retourner le cache même en cas d'erreur
    }
  }

  /**
   * Obtient une organisation par son ID depuis le cache
   */
  getOrganisationById(id: string): Organisation | undefined {
    return companiesDataService.getOrganisationById(id);
  }

  /**
   * Obtient une organisation par son nom (company) depuis le cache
   * Utile quand l'API envoie le nom de l'entreprise au lieu de l'ID
   */
  getOrganisationByName(name: string): Organisation | undefined {
    return companiesDataService.getOrganisationByName(name);
  }

  /**
   * Obtient toutes les organisations du cache
   */
  getOrganisations(): Organisation[] {
    return companiesDataService.getOrganisations();
  }

  /**
   * Obtient tous les participants du cache
   */
  getParticipants(): Participant[] {
    return this.participantsCache;
  }

  /**
   * Vide le cache
   */
  clearCache() {
    this.participantsCache = [];
    this.lastLoadedCategories = null;
    companiesDataService.clearCache();
  }
}

// Instance singleton pour être utilisée dans les composants
export const inscriptionsDataService = new InscriptionsDataService();


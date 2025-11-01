/**
 * Service API pour communiquer avec l'API FANAF 2026
 * Base URL: https://core-f26.asacitechnologies.com
 */

const API_BASE_URL = 'https://core-f26.asacitechnologies.com';

/**
 * Classe d'erreur personnalisée pour les erreurs de connexion
 * Elle ne génère pas de stack trace verbeux pour réduire le bruit dans la console
 */
class LoginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LoginError';
    // Supprimer complètement la stack trace pour réduire le bruit
    this.stack = undefined;
    
    // Empêcher l'affichage de la stack trace dans la console
    // En définissant stack avant l'appel au constructeur parent
    Object.defineProperty(this, 'stack', {
      value: undefined,
      writable: true,
      configurable: true
    });
  }
  
  // Surcharger toString pour un affichage plus simple
  toString() {
    return this.message;
  }
}

/**
 * Classe d'erreur personnalisée pour les erreurs réseau
 * Elle ne génère pas de stack trace verbeux pour réduire le bruit dans la console
 */
class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
    // Supprimer complètement la stack trace pour réduire le bruit
    this.stack = undefined;
    
    // Empêcher l'affichage de la stack trace dans la console
    Object.defineProperty(this, 'stack', {
      value: undefined,
      writable: true,
      configurable: true
    });
  }
  
  // Surcharger toString pour un affichage plus simple
  toString() {
    return this.message;
  }
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  data: {
    current_page?: number;
    data: T[];
    first_page_url?: string;
    from?: number;
    last_page?: number;
    last_page_url?: string;
    links?: Array<{
      url: string | null;
      label: string;
      page: number | null;
      active: boolean;
    }>;
    next_page_url?: string | null;
    path?: string;
    per_page?: number;
    prev_page_url?: string | null;
    to?: number;
    total?: number;
  };
  meta?: {
    current_page?: number;
    per_page?: number;
    total?: number;
    last_page?: number;
  };
}

class FanafApiService {
  private token: string | null = null;
  private user: any | null = null;

  /**
   * Définir le token d'authentification
   */
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('fanaf_token', token);
      // Également sauvegarder dans un cookie pour le middleware
      document.cookie = `fanaf_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    }
  }

  /**
   * Définir l'utilisateur courant et persister ses infos utiles
   */
  setUser(user: any) {
    this.user = user;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('fanaf_user', JSON.stringify(user));
      } catch (_) {}
      if (user?.role) {
        document.cookie = `fanaf_role=${user.role}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      }
    }
  }

  /**
   * Récupérer le token depuis localStorage
   */
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fanaf_token');
      if (stored) {
        this.token = stored;
      }
    }
    return this.token;
  }

  /**
   * Requête générique vers l'API
   */
  private async fetchApi<T>(
    endpoint: string,
    options?: Omit<RequestInit, 'body'> & { body?: BodyInit | null | Record<string, any>; requireAuth?: boolean }
  ): Promise<T> {
    const token = this.getToken();
    const requireAuth = options?.requireAuth !== false; // Par défaut, l'authentification est requise
    
    // Vérifier que le token est présent pour tous les endpoints
    if (requireAuth && !token) {
      throw new Error('Token d\'authentification manquant. Veuillez vous connecter.');
    }
    
    // Le token est toujours ajouté s'il est disponible (même pour les endpoints avec requireAuth: false)
    // Cela permet à l'API de potentiellement offrir plus de données ou fonctionnalités pour les utilisateurs authentifiés
    
    // Déterminer si le body est FormData pour ne pas ajouter Content-Type dans ce cas
    const isFormData = options?.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string> || {}),
    };

    // Ne pas ajouter Content-Type pour FormData (le navigateur le fait automatiquement)
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    // Ajouter le token d'authentification si disponible
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Ajouter Accept pour FormData aussi
    if (isFormData && !headers['Accept']) {
      headers['Accept'] = 'application/json';
    }

    try {
      // Gérer le body : FormData reste tel quel, les objets JS sont convertis en JSON
      // Si c'est déjà une string (JSON stringifié), la laisser tel quel
      let body: BodyInit | null | undefined;
      const rawBody = options?.body;
      if (rawBody !== null && rawBody !== undefined) {
        // Si c'est déjà une string (JSON stringifié), Blob, ArrayBuffer, FormData, ou URLSearchParams, le laisser tel quel
        if (typeof rawBody === 'string' || 
            rawBody instanceof Blob || 
            rawBody instanceof ArrayBuffer || 
            rawBody instanceof FormData || 
            rawBody instanceof URLSearchParams) {
          // Déjà dans un format compatible, laisser tel quel
          body = rawBody as BodyInit;
        } else if (typeof rawBody === 'object') {
          // C'est un objet JS, le convertir en JSON
          body = JSON.stringify(rawBody);
        } else {
          body = rawBody as BodyInit;
        }
      } else {
        body = rawBody;
      }
      
      // Extraire requireAuth des options avant de les passer à fetch
      const { requireAuth: _, ...fetchOptions } = options || {};
      
      // Détecter si c'est une tentative de connexion pour mieux gérer les erreurs réseau
      const isLoginEndpoint = endpoint.includes('/password-login') || 
                              endpoint.includes('/login') || 
                              endpoint.includes('/signin') ||
                              (endpoint.includes('/auth') && endpoint.includes('login'));
      const isLoginAttempt = !requireAuth && isLoginEndpoint;

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
        body,
      }).catch((fetchError) => {
        // Gérer les erreurs réseau (CORS, connexion refusée, timeout, etc.)
        const errorMessage = fetchError.message || 'Impossible de joindre le serveur';
        
        // Créer un message d'erreur plus clair
        let userMessage = 'Erreur de connexion réseau';
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          userMessage = 'Impossible de joindre le serveur. Vérifiez votre connexion internet.';
        } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
          userMessage = 'La connexion a expiré. Veuillez réessayer.';
        } else if (errorMessage.includes('CORS') || errorMessage.includes('cors')) {
          userMessage = 'Erreur de configuration serveur. Contactez l\'administrateur.';
        }
        
        // Logger différemment selon le type d'endpoint
        if (isLoginAttempt) {
          console.warn(`[fanafApi] Erreur réseau lors de la connexion à ${endpoint}:`, errorMessage);
        } else {
          console.warn(`[fanafApi] Erreur réseau lors de l'appel à ${endpoint}:`, fetchError);
        }
        
        // Utiliser NetworkError pour les erreurs réseau
        throw new NetworkError(userMessage);
      });

      // Tenter de parser la réponse, même en cas d'erreur HTTP
      let responseData: any;
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      const isHtml = contentType && contentType.includes('text/html');
      
      // Lire le texte de la réponse une seule fois
      let text = '';
      try {
        text = await response.text();
      } catch (textError) {
        // Si on ne peut pas lire le texte, utiliser un message par défaut
        text = '';
      }
      
      // Si c'est du HTML (comme une page 404), extraire un message clair
      if (isHtml || (text && (text.trim().startsWith('<!DOCTYPE html>') || text.trim().startsWith('<html')))) {
        // Pour les 404, message spécifique
        if (response.status === 404) {
          responseData = { 
            message: `Endpoint non trouvé: ${endpoint}. Vérifiez que l'endpoint est correct.`,
            error: 'NOT_FOUND'
          };
        } else {
          responseData = { 
            message: `Erreur HTTP ${response.status}: Le serveur a retourné une page HTML au lieu d'une réponse JSON.`,
            error: 'HTML_RESPONSE'
          };
        }
      } else if (isJson && text) {
        // Parser comme JSON
        try {
          responseData = JSON.parse(text);
        } catch (parseError) {
          // Si le parsing JSON échoue, utiliser le texte brut comme message
          responseData = { message: text || `Erreur HTTP: ${response.status}` };
        }
      } else if (text) {
        // Si c'est du texte mais pas JSON ni HTML, essayer de l'utiliser comme message
        responseData = { message: text || `Erreur HTTP: ${response.status}` };
      } else {
        responseData = { message: `Erreur HTTP: ${response.status}` };
      }

      if (!response.ok) {
        // Extraire le message d'erreur de différentes structures possibles
        let errorMessage = `Erreur HTTP: ${response.status}`;
        
        // Pour les erreurs de validation (422), formater les erreurs spécifiques
        if (response.status === 422 && responseData?.errors) {
          const formatValidationErrors = (errors: any): string => {
            if (typeof errors === 'string') {
              return errors;
            }
            
            if (Array.isArray(errors)) {
              return errors.map((e: any) => 
                typeof e === 'string' ? e : e.message || String(e)
              ).join(', ');
            }
            
            if (typeof errors === 'object' && errors !== null) {
              // Format Laravel: { field: ["message1", "message2"], ... }
              const errorParts: string[] = [];
              for (const [field, messages] of Object.entries(errors)) {
                if (Array.isArray(messages)) {
                  messages.forEach((msg: any) => {
                    errorParts.push(`${field}: ${typeof msg === 'string' ? msg : String(msg)}`);
                  });
                } else if (typeof messages === 'string') {
                  errorParts.push(`${field}: ${messages}`);
                } else {
                  errorParts.push(`${field}: ${String(messages)}`);
                }
              }
              return errorParts.length > 0 ? errorParts.join('; ') : 'Erreur de validation';
            }
            
            return String(errors);
          };
          
          errorMessage = `Erreur de validation: ${formatValidationErrors(responseData.errors)}`;
        } else if (responseData) {
          // Essayer différentes structures courantes
          // Priorité 1: Gérer spécifiquement { success: false, message: "..." }
          if (responseData.success === false && responseData.message) {
            errorMessage = typeof responseData.message === 'string' 
              ? responseData.message 
              : String(responseData.message);
          } else if (responseData.message) {
            // Priorité 2: Vérifier message directement (structure standard)
            errorMessage = typeof responseData.message === 'string'
              ? responseData.message
              : String(responseData.message);
          } else if (responseData.error) {
            // Priorité 3: Vérifier error (structure alternative)
            errorMessage = typeof responseData.error === 'string' 
              ? responseData.error 
              : responseData.error.message || String(responseData.error);
          } else if (responseData.errors) {
            if (typeof responseData.errors === 'string') {
              errorMessage = responseData.errors;
            } else if (Array.isArray(responseData.errors)) {
              errorMessage = responseData.errors.map((e: any) => 
                typeof e === 'string' ? e : e.message || String(e)
              ).join(', ');
            } else if (responseData.errors.message) {
              errorMessage = responseData.errors.message;
            }
          } else if (typeof responseData === 'string') {
            errorMessage = responseData;
          }
        }
        
        // Ne pas logger comme erreur si c'est une erreur d'authentification attendue
        // (401/403 sont des erreurs métier normales)
        const isAuthError = response.status === 401 || response.status === 403;
        
        // Détecter si c'est une tentative de connexion (endpoint public)
        // Plus spécifique : détecter les endpoints de connexion/authentification
        const isLoginEndpoint = endpoint.includes('/password-login') || 
                                endpoint.includes('/login') || 
                                endpoint.includes('/signin') ||
                                (endpoint.includes('/auth') && endpoint.includes('login'));
        const isLoginAttempt = !requireAuth && isLoginEndpoint;
        
        // Logger différemment selon le type d'erreur
        const isNotFound = response.status === 404;
        const isServerError = response.status >= 500;
        const isHtmlResponse = responseData?.error === 'HTML_RESPONSE';
        
        if (isAuthError && isLoginAttempt) {
          // Pour les tentatives de connexion échouées, logger en warn (moins bruyant)
          console.warn(`Tentative de connexion échouée [${endpoint}]:`, errorMessage);
        } else if (isNotFound) {
          // Pour les erreurs 404, logger en warn (endpoint peut ne pas exister)
          console.warn(`Endpoint non trouvé [${endpoint}]:`, errorMessage);
        } else if (isServerError && isHtmlResponse) {
          // Pour les erreurs serveur avec HTML (500+), logger en warn
          // car c'est souvent une erreur côté serveur qui sera corrigée par l'équipe backend
          console.warn(`Erreur serveur [${endpoint}]:`, errorMessage);
        } else if (!isAuthError) {
          // Pour les autres erreurs, logger en erreur
          console.error(`Erreur API [${endpoint}]:`, errorMessage);
        }
        
        // Pour les erreurs d'authentification, nettoyer le token et rediriger vers la connexion
        // SAUF si c'est un endpoint public (requireAuth: false, comme la connexion)
        // Les identifiants invalides sont normaux lors d'une tentative de connexion
        if (isAuthError && requireAuth && typeof window !== 'undefined') {
          console.warn('Token invalide ou expiré, nettoyage de la session...');
          this.token = null;
          this.user = null;
          localStorage.removeItem('fanaf_token');
          localStorage.removeItem('fanaf_user');
          document.cookie = 'fanaf_token=; path=/; max-age=0; SameSite=Lax';
          document.cookie = 'fanaf_role=; path=/; max-age=0; SameSite=Lax';
          
          // Rediriger vers la page de connexion si on n'y est pas déjà
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signin')) {
            window.location.href = '/login';
          }
        }
        
        // Utiliser LoginError pour les tentatives de connexion (moins verbeux)
        // Note: La console affichera quand même le message d'erreur car c'est le comportement standard de JavaScript
        // mais la stack trace sera minimisée grâce à LoginError
        if (isLoginAttempt && isAuthError) {
          const loginErr = new LoginError(errorMessage);
          throw loginErr;
        }
        
        throw new Error(errorMessage);
      }

      // Vérifier si la réponse contient success: false (certaines API retournent 200 avec success: false)
      // Surtout pour les endpoints de connexion
      if (responseData && typeof responseData === 'object' && responseData.success === false) {
        // Détecter si c'est une tentative de connexion
        const isLoginEndpoint = endpoint.includes('/password-login') || 
                                endpoint.includes('/login') || 
                                endpoint.includes('/signin') ||
                                (endpoint.includes('/auth') && endpoint.includes('login'));
        const isLoginAttempt = !requireAuth && isLoginEndpoint;
        
        // Extraire le message d'erreur
        const errorMsg = responseData.message || 'Erreur lors de la requête';
        
        // Logger différemment selon le type d'endpoint
        if (isLoginAttempt) {
          console.warn(`Tentative de connexion échouée [${endpoint}]:`, errorMsg);
          // Utiliser LoginError pour les tentatives de connexion échouées
          throw new LoginError(errorMsg);
        } else {
          // Pour les autres endpoints, traiter comme une erreur normale
          throw new Error(errorMsg);
        }
      }

      return responseData as T;
    } catch (error) {
      // Gérer les erreurs de connexion différemment
      if (error instanceof LoginError) {
        // Pour les erreurs de connexion, ne pas logger dans la console
        // L'erreur sera gérée silencieusement par le formulaire
        // et un message user-friendly sera affiché à l'utilisateur
        throw error;
      }
      
      // Gérer les erreurs réseau différemment
      if (error instanceof NetworkError) {
        // Pour les erreurs réseau, propager l'erreur sans re-logger
        // Le message est déjà clair et user-friendly
        throw error;
      }
      
      // Si c'est déjà une Error, la propager telle quelle
      if (error instanceof Error) {
        // Ne pas re-logger ici pour éviter les doublons (surtout 401/403)
        throw error;
      }
      // Sinon, créer une nouvelle Error
      throw new Error(`Erreur inconnue: ${String(error)}`);
    }
  }

  // ==================== AUTHENTIFICATION ====================

  /**
   * Connexion avec email/password
   */
  async passwordLogin(email: string, password: string) {
    // Log pour débugger ce qui est envoyé
    console.log('Tentative de connexion avec:', { email, passwordLength: password?.length });
    
    const response = await this.fetchApi<{
      token?: string;
      access_token?: string;
      data?: {
        token?: string;
        access_token?: string;
        user?: {
          id: string;
          email: string;
          name?: string;
        };
      };
      user?: {
        id: string;
        email: string;
        name?: string;
      };
    }>('/api/v1/admin-auth/password-login', {
      method: 'POST',
      body: JSON.stringify({ 
        email: email.trim(),
        password: password
      }),
      requireAuth: false, // La connexion ne nécessite pas de token
    });

    // Gérer différentes structures de réponse possibles
    const token = response.token || response.access_token || response.data?.token || response.data?.access_token;
    const user = (response as any).user || (response as any).data?.user;
    
    if (token) {
      this.setToken(token);
      console.log('Token sauvegardé avec succès');
    } else {
      console.warn('Aucun token reçu dans la réponse:', response);
    }

    if (user) {
      this.setUser(user);
      console.log('Utilisateur sauvegardé avec succès');
    }

    return response;
  }

  /**
   * Déconnexion - Supprime le token et nettoie la session
   */
  logout() {
    this.token = null;
    this.user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fanaf_token');
      localStorage.removeItem('fanaf_user');
      // Supprimer également le cookie
      document.cookie = 'fanaf_token=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'fanaf_role=; path=/; max-age=0; SameSite=Lax';
      console.log('Token supprimé, utilisateur déconnecté');
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && token !== '';
  }

  /**
   * Récupérer l'utilisateur courant
   */
  getCurrentUser(): any | null {
    if (this.user) return this.user;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('fanaf_user');
        if (raw) {
          this.user = JSON.parse(raw);
          return this.user;
        }
      } catch (_) {}
    }
    return null;
  }

  // ==================== PARTICIPANTS ====================

  /**
   * Récupérer tous les participants
   * @deprecated Utilisez getRegistrations() à la place. Conserve pour compatibilité.
   */
  async getParticipants(params?: {
    page?: number;
    per_page?: number;
    category?: 'member' | 'not_member' | 'vip';
  }): Promise<any> {
    // Unification des données: participants et registrations proviennent de la même source
    return this.getRegistrations({
      category: params?.category,
      per_page: params?.per_page,
      page: params?.page,
    });
  }

  // ==================== COMPANIES/ORGANISATIONS ====================

  /**
   * Récupérer toutes les companies/organisations
   * Le token d'authentification est automatiquement ajouté via fetchApi
   */
  async getCompanies(params?: {
  page?: number;
  per_page?: number;
  type?: 'company' | 'association';
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.type) queryParams.append('type', params.type);

    const query = queryParams.toString();
    const endpoint = `/api/v1/admin/companies${query ? `?${query}` : ''}`;
    // fetchApi ajoute automatiquement le token d'authentification dans le header Authorization
    return this.fetchApi<PaginatedResponse<any>>(endpoint);
  }

  /**
   * @deprecated Utilisez getCompanies() à la place. Conserve pour compatibilité.
   */
  async getAssociations(params?: {
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<any>> {
    return this.getCompanies(params);
  }

  // ==================== SPONSORS ====================

  /**
   * Récupérer tous les sponsors
   */
  async getSponsors(params?: {
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

    const query = queryParams.toString();
    const endpoint = `/api/v1/admin/sponsors${query ? `?${query}` : ''}`;
    return this.fetchApi<PaginatedResponse<any>>(endpoint);
  }

  /**
   * Récupérer les types de sponsor
   */
  async getSponsorTypes(): Promise<any> {
    return this.fetchApi<any>('/api/v1/admin/sponsor-types');
  }

  /**
   * Créer un sponsor spécial
   */
  async createSponsor(data: {
    name: string;
    sponsor_type_id: string;
    sponsor_logo?: File | string;
    sponsor_website_url?: string;
    sponsor_email?: string;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('sponsor_type_id', data.sponsor_type_id);
    
    // L'API attend sponsor_logo comme une URL (chaîne de max 1024 caractères)
    // Si c'est un fichier, on ne peut pas l'envoyer directement en base64 car c'est trop long
    // On doit soit uploader le fichier séparément d'abord, soit l'omettre pour l'instant
    if (data.sponsor_logo) {
      if (data.sponsor_logo instanceof File) {
        // Pour un fichier, on ne peut pas l'envoyer en base64 (trop long)
        // Il faudrait uploader le fichier séparément d'abord pour obtenir une URL
        // Pour l'instant, on omettra le logo ou on pourrait ajouter un endpoint d'upload séparé
        console.warn('Le logo sous forme de fichier ne peut pas être envoyé directement. Upload séparé requis.');
        // Ne pas ajouter le logo pour l'instant - l'utilisateur pourra l'ajouter après création
        // TODO: Implémenter un endpoint d'upload de fichier pour obtenir une URL
      } else if (typeof data.sponsor_logo === 'string') {
        // Si c'est déjà une URL, l'envoyer directement
        if (data.sponsor_logo.startsWith('http') || data.sponsor_logo.startsWith('/')) {
          // Vérifier que l'URL n'est pas trop longue (max 1024 caractères)
          if (data.sponsor_logo.length > 1024) {
            console.warn('L\'URL du logo dépasse 1024 caractères, elle ne sera pas envoyée');
          } else {
            formData.append('sponsor_logo', data.sponsor_logo);
          }
        } else if (data.sponsor_logo.startsWith('data:')) {
          // Base64 data URL - trop long pour être envoyé directement
          // Il faudrait uploader le fichier séparément d'abord
          console.warn('Le logo en base64 est trop long pour être envoyé directement. Upload séparé requis.');
        } else {
          // Autre format de string - l'envoyer tel quel si pas trop long
          if (data.sponsor_logo.length <= 1024) {
            formData.append('sponsor_logo', data.sponsor_logo);
          } else {
            console.warn('Le logo dépasse 1024 caractères, il ne sera pas envoyé');
          }
        }
      }
    }
    
    if (data.sponsor_website_url) {
      formData.append('sponsor_website_url', data.sponsor_website_url);
    }
    
    if (data.sponsor_email) {
      formData.append('sponsor_email', data.sponsor_email);
    }

    // Debug: afficher les données envoyées (sans le fichier)
    console.log('FormData envoyé:', {
      name: data.name,
      sponsor_type_id: data.sponsor_type_id,
      sponsor_email: data.sponsor_email,
      sponsor_website_url: data.sponsor_website_url,
      has_logo: !!data.sponsor_logo,
      logo_type: data.sponsor_logo instanceof File ? 'File' : typeof data.sponsor_logo,
      url: `${API_BASE_URL}/api/v1/admin/sponsors/special-create`,
    });

    // Utiliser fetchApi pour bénéficier de la gestion centralisée du token et des erreurs
    return this.fetchApi<any>('/api/v1/admin/sponsors/special-create', {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Créer un référent pour un sponsor
   */
  async createSponsorReferent(sponsorId: string, data: {
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    phone: string;
    job_title: string;
    civility: string;
  }): Promise<any> {
    return this.fetchApi<any>(`/api/v1/admin/sponsors/${sponsorId}/referent`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== NETWORKING ====================

  /**
   * Récupérer les demandes de rendez-vous
   */
  async getNetworkingRequests(params?: {
    page?: number;
    per_page?: number;
    target?: 'user' | 'sponsor';
    type?: 'participant' | 'sponsor'; // Déprécié, utiliser 'target' à la place
    status?: string;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    // Utiliser 'target' si fourni, sinon convertir 'type' en 'target' pour compatibilité
    if (params?.target) {
      queryParams.append('target', params.target);
    } else if (params?.type) {
      // Conversion: 'participant' -> 'user', 'sponsor' -> 'sponsor'
      queryParams.append('target', params.type === 'participant' ? 'user' : 'sponsor');
    }
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    const endpoint = `/api/v1/admin/networking/requests${query ? `?${query}` : ''}`;
    return this.fetchApi<PaginatedResponse<any>>(endpoint);
  }

  /**
   * Accepter une demande de rendez-vous
   */
  async acceptNetworkingRequest(requestId: string) {
    return this.fetchApi(`/api/v1/admin/networking/requests/${requestId}/accept`, {
      method: 'POST',
    });
  }

  /**
   * Refuser une demande de rendez-vous
   */
  async refuseNetworkingRequest(requestId: string) {
    return this.fetchApi(`/api/v1/admin/networking/requests/${requestId}/refuse`, {
      method: 'POST',
    });
  }

  /**
   * Valider une demande de rendez-vous (sponsors)
   */
  async validateNetworkingRequest(requestId: string) {
    return this.fetchApi(`/api/v1/admin/networking/requests/${requestId}/validate`, {
      method: 'POST',
    });
  }

  // ==================== REGISTRATIONS/INSCRIPTIONS ====================

  /**
   * Récupérer les inscriptions/participants
   * Le token d'authentification est automatiquement ajouté via fetchApi
   * @param category - member | not_member | vip (optionnel - si non fourni, récupère tout)
   * @returns Promise avec la structure: { status: 200, message: string, data: [...] }
   */
  async getRegistrations(params?: {
    category?: 'member' | 'not_member' | 'vip';
    per_page?: number;
    page?: number;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    // Utiliser l'endpoint /participants (remplace /registrations)
    const endpoint = `/api/v1/admin/participants${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    // fetchApi ajoute automatiquement le token d'authentification dans le header Authorization
    return this.fetchApi<any>(endpoint);
  }

  /**
   * Créer une inscription individuelle
   * @param data - Données de l'inscription
   * @returns Promise avec la réponse de l'API
   */
  async createRegistration(data: {
    civility: string;
    first_name: string;
    last_name: string;
    email: string;
    country_id: string;
    phone: string;
    registration_fee_id: string;
    registration_type: 'individual' | 'group';
    passport_number?: string;
    job_title?: string;
    is_association?: boolean;
    company_name?: string;
    company_country_id?: string;
    company_sector?: string;
    company_description?: string;
    company_website?: string;
    company_phone?: string;
    company_email?: string;
    company_address?: string;
  }): Promise<any> {
    return this.fetchApi<any>('/api/v1/admin/registrations/simple', {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Créer une inscription groupée (bulk)
   * @param data - Données de l'inscription groupée
   * @returns Promise avec la réponse de l'API
   */
  async createBulkRegistration(data: {
    registration_fee_id: string;
    registration_type: 'group';
    is_association?: boolean;
    company_name?: string;
    company_country_id?: string;
    company_sector?: string;
    company_description?: string;
    company_website?: string;
    company_phone?: string;
    company_email?: string;
    company_address?: string;
    users: Array<{
      civility: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      country_id: string;
      passport_number?: string;
      job_title?: string;
      is_lead: boolean;
    }>;
  }): Promise<any> {
    return this.fetchApi<any>('/api/v1/admin/registrations/bulk', {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Récupérer les types d'inscription (registration types/fees)
   * @returns Promise avec la liste des types d'inscription
   */
  async getRegistrationTypes(): Promise<{
    status: number;
    message: string;
    data: Array<{
      id: string;
      name: string;
      slug: string;
      amount: string;
      amount_formatted: string;
      valid_from: string;
      valid_until: string;
    }>;
  }> {
    // Le token sera ajouté automatiquement s'il est disponible
    return this.fetchApi<{
      status: number;
      message: string;
      data: Array<{
        id: string;
        name: string;
        slug: string;
        amount: string;
        amount_formatted: string;
        valid_from: string;
        valid_until: string;
      }>;
    }>('/api/v1/registration-types', { requireAuth: false });
  }

  /**
   * Récupérer la liste des pays
   * @returns Promise avec la liste des pays
   */
  async getCountries(): Promise<{
    status: number;
    message: string;
    data: Array<{
      id: string;
      name: string;
      code: string;
      alpha2: string | null;
      flag_url: string;
      phone_code: string;
      currency_code: string;
      currency_symbol: string;
      created_at: string;
      updated_at: string;
    }>;
  }> {
    // Le token sera ajouté automatiquement s'il est disponible
    return this.fetchApi<{
      status: number;
      message: string;
      data: Array<{
        id: string;
        name: string;
        code: string;
        alpha2: string | null;
        flag_url: string;
        phone_code: string;
        currency_code: string;
        currency_symbol: string;
        created_at: string;
        updated_at: string;
      }>;
    }>('/api/v1/common/countries', { requireAuth: false });
  }

  // ==================== FLIGHT PLANS ====================

  /**
   * Récupérer les statistiques des plans de vol
   */
  async getFlightPlansStats() {
    return this.fetchApi<any>('/api/v1/admin/flight-plans/stats');
  }

  /**
   * Récupérer tous les plans de vol
   */
  async getFlightPlans(params?: {
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

    const query = queryParams.toString();
    const endpoint = `/api/v1/admin/flight-plans${query ? `?${query}` : ''}`;
    return this.fetchApi<PaginatedResponse<any>>(endpoint);
  }

  // ==================== BADGE SCANS ====================

  /**
   * Récupérer les compteurs de scans de badges par statut
   */
  async getBadgeScansCounters() {
    return this.fetchApi<any>('/api/v1/admin/dashboard/badge-scans/counters');
  }

  // ==================== PAYMENTS/PAIEMENTS ====================

  /**
   * Récupérer les paiements
   */
  async getPayments(params?: {
    page?: number;
    per_page?: number;
    payment_method?: string;
    payment_provider?: string;
    state?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.payment_method) queryParams.append('payment_method', params.payment_method);
    if (params?.payment_provider) queryParams.append('payment_provider', params.payment_provider);
    if (params?.state) queryParams.append('state', params.state);

    const query = queryParams.toString();
    const endpoint = `/api/v1/admin/payments${query ? `?${query}` : ''}`;
    return this.fetchApi<any>(endpoint);
  }

  // ==================== DOCUMENTS (BADGES/INVITATIONS/FACTURES) ====================

  /**
   * Récupérer les documents par utilisateur (badges, invitations, factures)
   */
  async getDocuments(): Promise<any> {
    return this.fetchApi<any>('/api/v1/admin/documents');
  }
}

export const fanafApi = new FanafApiService();


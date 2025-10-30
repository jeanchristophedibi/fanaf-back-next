/**
 * Service API pour communiquer avec l'API FANAF 2026
 * Base URL: https://core-f26.asacitechnologies.com
 */

const API_BASE_URL = 'https://core-f26.asacitechnologies.com';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    total?: number;
    per_page?: number;
    current_page?: number;
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
    options?: RequestInit
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Tenter de parser la réponse, même en cas d'erreur HTTP
      let responseData: any;
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      try {
        const text = await response.text();
        if (isJson && text) {
          responseData = JSON.parse(text);
        } else {
          responseData = { message: text || `Erreur HTTP: ${response.status}` };
        }
      } catch (parseError) {
        responseData = { message: `Erreur HTTP: ${response.status}` };
      }

      if (!response.ok) {
        // Log pour débugger la structure exacte de la réponse
        console.log('Response status:', response.status);
        console.log('Response data:', responseData);
        
        // Extraire le message d'erreur de différentes structures possibles
        let errorMessage = `Erreur HTTP: ${response.status}`;
        
        if (responseData) {
          // Essayer différentes structures courantes
          if (responseData.error) {
            errorMessage = typeof responseData.error === 'string' 
              ? responseData.error 
              : responseData.error.message || String(responseData.error);
          } else if (responseData.message) {
            errorMessage = responseData.message;
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
        if (!isAuthError) {
          console.error(`Erreur API [${endpoint}]:`, errorMessage);
        }
        
        throw new Error(errorMessage);
      }

      return responseData as T;
    } catch (error) {
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
   */
  async getParticipants(params?: {
    page?: number;
    per_page?: number;
    category?: 'member' | 'not_member' | 'vip';
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.category) queryParams.append('category', params.category);

    const query = queryParams.toString();
    const endpoint = `/api/v1/admin/participants${query ? `?${query}` : ''}`;
    return this.fetchApi<PaginatedResponse<any>>(endpoint);
  }

  // ==================== COMPANIES/ORGANISATIONS ====================

  /**
   * Récupérer toutes les companies/organisations
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

  // ==================== REGISTRATIONS/INSCRIPTIONS ====================

  /**
   * Récupérer les inscriptions/registrations
   * @param category - member | not_member | vip (optionnel - si non fourni, récupère tout)
   */
  async getRegistrations(params?: {
    category?: 'member' | 'not_member' | 'vip';
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    // Utiliser l'endpoint /registrations qui correspond à la structure de réponse observée
    const endpoint = `/api/v1/admin/registrations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchApi<PaginatedResponse<any>>(endpoint);
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


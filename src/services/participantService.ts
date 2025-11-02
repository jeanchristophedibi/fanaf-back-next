import axiosInstance from '@/lib/axios'

export interface ParticipantFilters {
  search?: string
  page?: number
  per_page?: number
  assignment_id?: string
  payment_method?: string
  organization_id?: string
}

class ParticipantService {
  private baseUrl = '/admin/participants'
  private baseUrlRegistration = '/admin/registrations'
  private baseUrlOperateur = '/admin/operateurs'
  private baseUrlOrganisations = '/admin/companies'
  private baseUrlDashboard = '/admin/dashboard'
  /**
   * Récupérer tous les participants avec pagination
   */
  async getAll(filters?: ParticipantFilters): Promise<any> {
    const params = new URLSearchParams()
    
    if (filters?.search) {
      params.append('q', filters.search)
    }
    if (filters?.page) {
      params.append('page', filters.page.toString())
    }
    if (filters?.per_page) {
      params.append('per_page', filters.per_page.toString())
    }
    if (filters?.assignment_id) {
      params.append('assignment_id', filters.assignment_id)
    }
    if (filters?.payment_method) {
      params.append('payment_method', filters.payment_method)
    }
    if (filters?.organization_id) {
      params.append('organization_id', filters.organization_id)
    }

    const response = await axiosInstance.get<any>(
      `${this.baseUrl}?${params.toString()}`
    )
    return response.data
  }

  /**
   * Rechercher des participants avec filtres
   */
  async search(query: string, filters?: Omit<ParticipantFilters, 'search'>): Promise<any> {
    return this.getAll({ search: query, ...filters })
  }

  /**
   * Rechercher des participants avec filtres
   */
  /**
   * Récupérer les stats des paiements en attente
   */
  async getStats(filters?: ParticipantFilters): Promise<any> {
    const params = new URLSearchParams()
    
    if (filters?.search) {
      params.append('q', filters.search)
    }
    if (filters?.page) {
      params.append('page', filters.page.toString())
    }
    if (filters?.per_page) {
      params.append('per_page', filters.per_page.toString())
    }

    const response = await axiosInstance.get<any>(
      `${this.baseUrlOperateur}/stats?${params.toString()}`
    )
    return response.data
  }

  /**
   *  Confirmation de remise du badge
   */
  async confirmRemiseBadge(registrationId: string): Promise<any> {
    const response = await axiosInstance.post<any>(`${this.baseUrlRegistration}/${registrationId}/badge/increment`)
    return response.data
  }

  /**
   *  Confirmation de remise du kit
   */
  async confirmRemiseKit(registrationId: string): Promise<any> {
    const response = await axiosInstance.post<any>(`${this.baseUrlRegistration}/${registrationId}/kit/increment`)
    return response.data
  }

  /**
   *  Régénérer le badge
   */
  async refreshDocument(id: string): Promise<any> {
    const response = await axiosInstance.post<any>(`${this.baseUrlOperateur}/${id}/document/refresh`)
    return response.data
  }

  /**
   * Récupérer le top 5 des organisations
   */
  async getStatsByType(): Promise<any> {
    const response = await axiosInstance.get<any>(`${this.baseUrlDashboard}/participant-type-distribution`)
    return response.data
  }

  /**
   * Récupérer le top 5 des organisations
   */
  async getTopOrganisations(): Promise<any> {
    const response = await axiosInstance.get<any>(`${this.baseUrlOrganisations}/top-associations-by-registrations`)
    return response.data
  }
}

// Export d'une instance singleton
export const participantService = new ParticipantService()
export default participantService 
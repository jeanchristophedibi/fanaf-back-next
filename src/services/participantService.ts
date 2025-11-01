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
   *  Confirmation de remise
   */
  async confirmRemise(id: string): Promise<any> {
    const response = await axiosInstance.post<any>(`${this.baseUrlRegistration}/${id}/kit/collect`)
    return response.data
  }
}

// Export d'une instance singleton
export const participantService = new ParticipantService()
export default participantService 
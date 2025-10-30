import axiosInstance from '@/lib/axios'

export interface ParticipantFilters {
  search?: string
  page?: number
  per_page?: number
  assignment_id?: string
}

class ParticipantService {
  private baseUrl = '/admin/participants'

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

    const response = await axiosInstance.get<any>(
      `${this.baseUrl}?${params.toString()}`
    )
    return response.data
  }

  /**
   * Rechercher des constats
   */
  async search(query: string): Promise<any> {
    return this.getAll({ search: query })
  }
}

// Export d'une instance singleton
export const participantService = new ParticipantService()
export default participantService 
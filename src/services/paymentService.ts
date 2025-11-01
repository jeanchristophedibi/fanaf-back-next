import axiosInstance from '@/lib/axios'

export interface PaymentFilters {
  search?: string
  page?: number
  per_page?: number
  assignment_id?: string
  payment_method?: string
  payment_provider?: string
  state?: string
}

class PaymentService {
  private baseUrl = '/admin/payments'
  private baseUrlRegistration = '/admin/registrations'

  /**
   * Récupérer tous les paiements avec pagination
   */
  async getAll(filters?: PaymentFilters): Promise<any> {
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
    if (filters?.payment_provider) {
      params.append('payment_provider', filters.payment_provider)
    }
    if (filters?.state) {
      params.append('state', filters.state)
    }

    const response = await axiosInstance.get<any>(
      `${this.baseUrl}?${params.toString()}`
    )
    return response.data
  }

  /**
   * Récupérer les stats des paiements
   */
  async getStats(filters?: PaymentFilters): Promise<any> {
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
      `${this.baseUrl}/summary?${params.toString()}`
    )
    return response.data
  }

  /**
   * Récupérer tous les paiements en attente avec pagination
   */
  async getAllEnAttente(filters?: PaymentFilters): Promise<any> {
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
      `${this.baseUrlRegistration}/pending?${params.toString()}`
    )
    return response.data
  }

  /**
   * Récupérer les stats des paiements en attente
   */
  async getStatsEnAttente(filters?: PaymentFilters): Promise<any> {
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
      `${this.baseUrl}/stats?${params.toString()}`
    )
    return response.data
  }

  /**
   * Rechercher des paiements avec filtres
   */
  async search(query: string, filters?: Omit<PaymentFilters, 'search'>): Promise<any> {
    return this.getAll({ search: query, ...filters })
  }

  /**
   * Valider un paiement en attente
   */
  async validatePayment(id: string, modePaiement: string): Promise<any> {
    const response = await axiosInstance.post<any>(`${this.baseUrlRegistration}/${id}/finalize`, {
      payment_method: modePaiement
    });
    return response.data;
  }
}

// Export d'une instance singleton
export const paymentService = new PaymentService()
export default paymentService 
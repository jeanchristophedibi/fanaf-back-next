import axiosInstance from '@/lib/axios'
import { ParticipantFilters } from './participantService'

export interface PaymentFilters {
  search?: string
  page?: number
  per_page?: number
  payment_method?: string
  payment_provider?: string
  state?: string
  start?: string
  end?: string
  organisation?: string
  caissier?: string
  category?: string
}

class PaymentService {
  private baseUrl = '/admin/payments'
  private baseUrlRegistration = '/admin/registrations'
  private baseUrlCaisse = '/admin/operateurs/caisse'

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
  
    if (filters?.payment_method) {
      params.append('payment_method', filters.payment_method)
    }
    if (filters?.payment_provider) {
      params.append('payment_provider', filters.payment_provider)
    }
    if (filters?.state) {
      params.append('state', filters.state)
    }
    if (filters?.start) {
      params.append('start', filters.start)
    }
    if (filters?.end) {
      params.append('end', filters.end)
    }
    if (filters?.organisation) {
      params.append('organisation', filters.organisation)
    }
    if (filters?.caissier) {
      params.append('caissier', filters.caissier)
    }
    if (filters?.category) {
      params.append('participant', filters.category)
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

    const response = await axiosInstance.get<any>(
      `${this.baseUrl}/stats?${params.toString()}`
    )
    return response.data
  }

  /**
   * Récupérer les stats des paiements par mode de paiement
   */
  async getStatsPaymentMethodDistribution(filters?: PaymentFilters): Promise<any> {
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
      `${this.baseUrl}/transactions-by-method?${params.toString()}`
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
   * Rechercher des participants avec filtres
   */
  async getStatsOperateur(filters?: PaymentFilters): Promise<any> {
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

    if (filters?.start) {
      params.append('start', filters.start)
    }
    if (filters?.end) {
      params.append('end', filters.end)
    }

    const response = await axiosInstance.get<any>(
      `${this.baseUrlCaisse}/stats?${params.toString()}`
    )
    return response.data
  }

  /**
   * Récupérer la liste des organisations
   */
  async getOrganisations(): Promise<any> {
    const response = await axiosInstance.get<any>('/admin/companies')
    return response.data
  }

  /**
   * Récupérer la liste des caissiers
   */
  async getCashiers(): Promise<any> {
    const response = await axiosInstance.get<any>('/admin/users?role=operateur-caisse')
    return response.data
  }

  /**
   * Valider un paiement en attente
   */
  async validatePayment(id: string, data: any): Promise<any> {
    // Logger le contenu
    if (data instanceof FormData) {
      console.log('PaymentService - FormData reçu:');
      for (const [key, value] of data.entries()) {
        console.log(`  ${key}:`, value);
      }
    } else {
      console.log('PaymentService - Data reçu:', data);
    }
    
    const response = await axiosInstance.post<any>(
      `${this.baseUrlRegistration}/${id}/finalize`, 
      data
    );
    return response.data;
  }
}

// Export d'une instance singleton
export const paymentService = new PaymentService()
export default paymentService 
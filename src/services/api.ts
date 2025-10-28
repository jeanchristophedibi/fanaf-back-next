/**
 * Service API pour communiquer avec le serveur Supabase Edge Functions
 * Mode MOCK activé - utilise les données mockées locales
 */

import { mockParticipants, mockOrganisations } from '../components/data/mockData';

// Mode MOCK activé pour le développement
const USE_MOCK_DATA = true;

// URL de base de l'API (à adapter selon votre déploiement)
// Pour le développement local, utiliser localhost ou l'URL Supabase
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // En production, l'URL peut être définie via une variable d'environnement
    const envApiUrl = (window as any).__ENV__?.VITE_API_URL;
    if (envApiUrl) return envApiUrl;
  }
  return 'https://clyzgrxohdduaetvbyxq.supabase.co/functions/v1/make-server-c3e5f95c';
};

const API_BASE_URL = getApiBaseUrl();

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        // En mode mock, on ignore les erreurs 401/404
        if (response.status === 401 || response.status === 404) {
          console.warn(`API non disponible pour ${endpoint} (mode mock actif)`);
          // Retourner une valeur par défaut selon le type attendu
          if (endpoint.includes('/paiements')) {
            return { paiements: [] } as T;
          } else if (endpoint.includes('/stats')) {
            return { stats: {} } as T;
          } else if (endpoint.includes('/reference')) {
            return { reference: `REF-${Date.now()}` } as T;
          }
          return {} as T;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      // En mode mock, afficher un avertissement au lieu d'une erreur
      console.warn(`API endpoint [${endpoint}] non disponible (mode mock actif)`);
      // Retourner une valeur par défaut
      return { paiements: [], stats: {}, reference: '' } as T;
    }
  }

  // ==================== PARTICIPANTS ====================

  /**
   * Générer une nouvelle référence participant
   */
  async generateParticipantReference(): Promise<string> {
    const response = await this.fetchApi<{ reference: string }>(
      '/participants/generate-reference',
      { method: 'POST' }
    );
    return response.reference;
  }

  // ==================== PAIEMENTS ====================

  /**
   * Créer un nouveau paiement
   */
  async createPaiement(participantId: string, statutParticipant: string) {
    return this.fetchApi('/paiements/create', {
      method: 'POST',
      body: JSON.stringify({ participant_id: participantId, statut_participant: statutParticipant }),
    });
  }

  /**
   * Enregistrer une transaction (versement)
   */
  async addTransaction(data: {
    paiement_id: string;
    montant: number;
    mode_paiement: string;
    numero_transaction?: string;
    numero_cheque?: string;
    caissier_id: string;
    caissier_nom: string;
    notes?: string;
  }) {
    return this.fetchApi('/paiements/add-transaction', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Récupérer tous les paiements avec détails participant
   */
  async getAllPaiements() {
    if (USE_MOCK_DATA) {
      // Retourner les paiements mockés (participants finalisés)
      return mockParticipants
        .filter(p => p.statutInscription === 'finalisée')
        .map(p => ({
          id: p.id,
          participant_id: p.id,
          participant: {
            nom: p.nom,
            prenom: p.prenom,
            reference: p.reference,
            organisation: mockOrganisations.find(o => o.id === p.organisationId)?.nom || 'N/A'
          },
          montant_attendu: p.statut === 'non-membre' ? 400000 : p.statut === 'membre' ? 350000 : 0,
          montant_paye: p.statut === 'vip' || p.statut === 'speaker' ? 0 : (p.statut === 'non-membre' ? 400000 : 350000),
          mode_paiement: p.modePaiement || 'espèce',
          date_paiement: p.datePaiement || p.dateInscription,
          caissier: p.caissier || 'N/A'
        }));
    }
    
    const response = await this.fetchApi<{ paiements: any[] }>('/paiements/all');
    return response.paiements;
  }

  /**
   * Récupérer les transactions d'un paiement
   */
  async getPaiementTransactions(paiementId: string) {
    const response = await this.fetchApi<{ transactions: any[] }>(
      `/paiements/${paiementId}/transactions`
    );
    return response.transactions;
  }

  // ==================== FINANCE ====================

  /**
   * Récupérer les statistiques financières
   */
  async getFinanceStats() {
    const response = await this.fetchApi<{ stats: any }>('/finance/stats');
    return response.stats;
  }

  // ==================== STATISTIQUES DASHBOARD ====================

  /**
   * Récupérer les statistiques du dashboard
   */
  async getDashboardStats() {
    if (USE_MOCK_DATA) {
      // Retourner les stats mockées
      const finalises = mockParticipants.filter(p => p.statutInscription === 'finalisée');
      const enAttente = mockParticipants.filter(p => p.statutInscription === 'non-finalisée');
      
      return {
        participants: {
          total: mockParticipants.length,
          membres: mockParticipants.filter(p => p.statut === 'membre' && p.statutInscription === 'finalisée').length,
          nonMembres: mockParticipants.filter(p => p.statut === 'non-membre' && p.statutInscription === 'finalisée').length,
          vip: mockParticipants.filter(p => p.statut === 'vip').length,
          speakers: mockParticipants.filter(p => p.statut === 'speaker').length,
          enAttente: enAttente.length,
        },
        organisations: {
          total: mockOrganisations.length,
          membres: mockOrganisations.filter(o => o.statut === 'membre').length,
          nonMembres: mockOrganisations.filter(o => o.statut === 'non-membre').length,
          sponsors: mockOrganisations.filter(o => o.statut === 'sponsor').length,
        },
        paiements: {
          total_attendu: finalises.reduce((sum, p) => {
            if (p.statut === 'vip' || p.statut === 'speaker') return sum;
            return sum + (p.statut === 'non-membre' ? 400000 : 350000);
          }, 0),
          total_encaisse: finalises.reduce((sum, p) => {
            if (p.statut === 'vip' || p.statut === 'speaker') return sum;
            return sum + (p.statut === 'non-membre' ? 400000 : 350000);
          }, 0),
          total_restant: 0,
          paiements_complets: finalises.filter(p => p.statut !== 'vip' && p.statut !== 'speaker').length,
          paiements_partiels: 0,
          paiements_en_attente: enAttente.length,
        }
      };
    }
    
    const response = await this.fetchApi<{ stats: any }>('/stats/dashboard');
    return response.stats;
  }
}

export const apiService = new ApiService();


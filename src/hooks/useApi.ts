'use client';

import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { supabase } from '../utils/supabase/client';

interface DashboardStats {
  participants: {
    total: number;
    membres: number;
    nonMembres: number;
    vip: number;
    speakers: number;
    enAttente: number;
  };
  organisations: {
    total: number;
    membres: number;
    nonMembres: number;
    sponsors: number;
  };
  rendezVous: {
    total: number;
    rdvSponsors: number;
    rdvParticipants: number;
  };
  paiements: {
    total_attendu: number;
    total_encaisse: number;
    total_restant: number;
    paiements_complets: number;
    paiements_partiels: number;
    paiements_en_attente: number;
  };
}

export function useApi() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [organisations, setOrganisations] = useState<any[]>([]);
  const [paiements, setPaiements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les participants depuis Supabase
  const fetchParticipants = async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        console.warn('Table participants non disponible (utilisation des mocks)');
        return;
      }
      setParticipants(data || []);
    } catch (err) {
      // Ignorer silencieusement si la table n'existe pas (mode mock)
      console.warn('Récupération participants échouée (mode mock actif)');
    }
  };

  // Récupérer les organisations depuis Supabase
  const fetchOrganisations = async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('organisations')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        console.warn('Table organisations non disponible (utilisation des mocks)');
        return;
      }
      setOrganisations(data || []);
    } catch (err) {
      // Ignorer silencieusement si la table n'existe pas (mode mock)
      console.warn('Récupération organisations échouée (mode mock actif)');
    }
  };

  // Récupérer les statistiques du dashboard
  const fetchDashboardStats = async () => {
    try {
      const stats = await apiService.getDashboardStats();
      setDashboardStats(stats);
    } catch (err) {
      // Ignorer silencieusement si l'API n'est pas disponible (mode mock)
      console.warn('Récupération stats dashboard échouée (mode mock actif)');
    }
  };

  // Récupérer tous les paiements
  const fetchPaiements = async () => {
    try {
      const data = await apiService.getAllPaiements();
      setPaiements(data);
    } catch (err) {
      // Ignorer silencieusement si l'API n'est pas disponible (mode mock)
      console.warn('Récupération paiements échouée (mode mock actif)');
    }
  };

  // Charger toutes les données au montage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchParticipants(),
          fetchOrganisations(),
          fetchDashboardStats(),
          fetchPaiements(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Écouter les changements en temps réel pour participants
    const channel = supabase
      .channel('participants-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants' },
        () => {
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    dashboardStats,
    participants,
    organisations,
    paiements,
    loading,
    error,
    refetch: {
      participants: fetchParticipants,
      organisations: fetchOrganisations,
      dashboardStats: fetchDashboardStats,
      paiements: fetchPaiements,
    },
  };
}


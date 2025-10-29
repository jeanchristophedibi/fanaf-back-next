'use client';

import { useState, useEffect, useCallback } from 'react';
import { fanafApi } from '../services/fanafApi';

interface UseFanafApiOptions {
  enabled?: boolean;
  autoFetch?: boolean;
}

/**
 * Hook pour utiliser l'API FANAF 2026
 */
export function useFanafApi(options: UseFanafApiOptions = {}) {
  const { enabled = true, autoFetch = false } = options;

  const [participants, setParticipants] = useState<any[]>([]);
  const [associations, setAssociations] = useState<any[]>([]);
  const [networkingRequests, setNetworkingRequests] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [flightPlans, setFlightPlans] = useState<any[]>([]);
  const [badgeScansCounters, setBadgeScansCounters] = useState<any>(null);
  const [flightPlansStats, setFlightPlansStats] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch functions
  const fetchParticipants = useCallback(async (params?: { page?: number; per_page?: number; category?: 'member' | 'not_member' | 'vip' }) => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fanafApi.getParticipants(params);
      setParticipants(response.data || []);
      return response;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération des participants');
      console.error('Erreur fetchParticipants:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const fetchAssociations = useCallback(async (params?: { page?: number; per_page?: number }) => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fanafApi.getAssociations(params);
      setAssociations(response.data || []);
      return response;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération des associations');
      console.error('Erreur fetchAssociations:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const fetchNetworkingRequests = useCallback(async (params?: { page?: number; per_page?: number; type?: 'participant' | 'sponsor'; status?: string }) => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fanafApi.getNetworkingRequests(params);
      setNetworkingRequests(response.data || []);
      return response;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération des demandes de rendez-vous');
      console.error('Erreur fetchNetworkingRequests:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const fetchRegistrations = useCallback(async (params?: { category?: 'member' | 'not_member' | 'vip'; per_page?: number; page?: number }) => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fanafApi.getRegistrations(params);
      setRegistrations(response.data || []);
      return response;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération des inscriptions');
      console.error('Erreur fetchRegistrations:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const fetchFlightPlans = useCallback(async (params?: { page?: number; per_page?: number }) => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fanafApi.getFlightPlans(params);
      setFlightPlans(response.data || []);
      return response;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération des plans de vol');
      console.error('Erreur fetchFlightPlans:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const fetchFlightPlansStats = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const stats = await fanafApi.getFlightPlansStats();
      setFlightPlansStats(stats);
      return stats;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération des stats des plans de vol');
      console.error('Erreur fetchFlightPlansStats:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const fetchBadgeScansCounters = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const counters = await fanafApi.getBadgeScansCounters();
      setBadgeScansCounters(counters);
      return counters;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération des compteurs de scans');
      console.error('Erreur fetchBadgeScansCounters:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && enabled) {
      // Fetch initial data
      fetchParticipants();
      fetchAssociations();
      fetchNetworkingRequests();
      fetchBadgeScansCounters();
      fetchFlightPlansStats();
    }
  }, [autoFetch, enabled]);

  return {
    // Data
    participants,
    associations,
    networkingRequests,
    registrations,
    flightPlans,
    badgeScansCounters,
    flightPlansStats,

    // State
    loading,
    error,

    // Fetch functions
    fetchParticipants,
    fetchAssociations,
    fetchNetworkingRequests,
    fetchRegistrations,
    fetchFlightPlans,
    fetchFlightPlansStats,
    fetchBadgeScansCounters,

    // Direct API access
    api: fanafApi,
  };
}


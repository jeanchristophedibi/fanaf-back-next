"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "../ui/card";
import { Mic } from "lucide-react";
import { useDynamicInscriptions } from "../hooks/useDynamicInscriptions";
import { inscriptionsDataService } from "../data/inscriptionsData";
import { motion } from "motion/react";
import { AnimatedStat } from "../AnimatedStat";
import { Skeleton } from "../ui/skeleton";
import paymentService from '@/services/paymentService';

export function WidgetSpeakers() {
  const { participants: allParticipants } = useDynamicInscriptions();

  // Charger les participants speakers avec React Query
  const { data: apiParticipants = [], isLoading } = useQuery({
    queryKey: ['widgetSpeakers'],
    queryFn: async () => {
      try {
        // Charger toutes les inscriptions puis filtrer les speakers
        const loaded = await inscriptionsDataService.loadParticipants(undefined);
        console.log('[WidgetSpeakers] Participants chargés:', loaded?.length || 0);
        
        if (!loaded || !Array.isArray(loaded)) {
          console.warn('[WidgetSpeakers] Données invalides ou vides');
          return [];
        }
        
        const speakers = loaded
          .filter((p) => {
            if (!p) return false;
            // Filtrer sur registration_fee au lieu de statut
            // L'API renvoie "SPEAKER" en majuscules avec diverses variations
            const registrationFee = p.registrationFee || (p as any).registration_fee || '';
            const feeUpper = registrationFee ? String(registrationFee).toUpperCase().trim() : '';
            const isSpeaker = feeUpper === 'SPEAKER' || feeUpper === 'SPEAKER_TYPE';
            
            // Fallback sur statut si registration_fee n'est pas disponible
            if (!registrationFee) {
              const statut: any = p.statut || (p as any).status || (p as any).type;
              const statutUpper = statut ? String(statut).toUpperCase().trim() : '';
              return statutUpper === 'SPEAKER';
            }
            
            return isSpeaker;
          })
          .filter((p): p is NonNullable<typeof p> => p !== null && p !== undefined);
        
        console.log('[WidgetSpeakers] Speakers filtrés:', speakers.length);
        return speakers;
      } catch (e) {
        console.error('Erreur chargement Speakers:', e);
        return [];
      }
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const safeAllParticipants = Array.isArray(allParticipants) ? allParticipants : [];
  const participants = apiParticipants.length > 0 
    ? apiParticipants 
    : safeAllParticipants.filter(p => {
        if (!p) return false;
        const statut: any = p.statut || (p as any).status || (p as any).type;
        const statutUpper = statut ? String(statut).toUpperCase().trim() : '';
        return statutUpper === 'SPEAKER';
      });

  // Charger les paiements en attente depuis l'API
  const { data: pendingPaymentsResponse, isLoading: isLoadingPending } = useQuery({
    queryKey: ['pendingPayments', 'widgetSpeakers'],
    queryFn: async () => {
      try {
        const response = await paymentService.getAllEnAttente();
        return response?.data?.data || [];
      } catch (error) {
        console.error('[WidgetSpeakers] Erreur lors du chargement des paiements en attente:', error);
        return [];
      }
    },
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 2 * 60 * 1000, // 2 minutes en cache
    refetchOnWindowFocus: false,
  });

  const pendingPayments = pendingPaymentsResponse || [];

  const statsQuery = useQuery({
    queryKey: ['widgetSpeakers', 'stats', participants, pendingPayments],
    queryFn: () => {
      try {
        if (!participants || participants.length === 0) {
          return { total: 0, finalises: 0, enAttente: 0 };
        }

        // Filtrer les speakers en utilisant la même logique que dans la requête principale
        const speakers = participants.filter(p => {
          if (!p) return false;
          const registrationFee = p.registrationFee || (p as any).registration_fee || '';
          const feeUpper = registrationFee ? String(registrationFee).toUpperCase().trim() : '';
          const isSpeaker = feeUpper === 'SPEAKER' || feeUpper === 'SPEAKER_TYPE';
          
          if (!registrationFee) {
            const statut: any = p.statut || (p as any).status || (p as any).type;
            const statutUpper = statut ? String(statut).toUpperCase().trim() : '';
            return statutUpper === 'SPEAKER';
          }
          
          return isSpeaker;
        });
        const finalises = speakers.filter(p => p && p.statutInscription === 'finalisée').length;
        
        // Compter les paiements en attente depuis l'API pour les speakers uniquement
        // Note: Les speakers sont généralement exonérés, donc ce sera probablement 0
        const enAttenteFromAPI = (pendingPayments || []).filter((item: any) => {
          try {
            if (!item) return false;
            const registrationFee = item.user?.registration_fee || item.registration?.type || '';
            const feeUpper = registrationFee ? String(registrationFee).toUpperCase().trim() : '';
            const isSpeaker = feeUpper === 'SPEAKER' || feeUpper === 'SPEAKER_TYPE';
            return isSpeaker;
          } catch (error) {
            console.error('Erreur lors du filtrage des paiements:', error);
            return false;
          }
        }).length;
        
        // Utiliser le compte depuis l'API si disponible, sinon fallback sur le calcul local
        const enAttente = enAttenteFromAPI > 0 
          ? enAttenteFromAPI 
          : speakers.filter(p => p && p.statutInscription === 'non-finalisée').length;
        
        return { total: speakers.length, finalises, enAttente };
      } catch (error) {
        console.error('Erreur lors du calcul des statistiques speakers:', error);
        return { total: 0, finalises: 0, enAttente: 0 };
      }
    },
    enabled: true,
    staleTime: 0,
  });

  const stats = statsQuery.data ?? { total: 0, finalises: 0, enAttente: 0 };

  if (isLoading || isLoadingPending) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-t-4 border-t-yellow-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-orange-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-t-4 border-t-yellow-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Speakers</p>
                <AnimatedStat value={stats.total} className="text-3xl text-gray-900" />
                <p className="text-xs text-gray-500 mt-1">Inscriptions speakers</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-t-4 border-t-green-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Finalisées</p>
                <AnimatedStat value={stats.finalises} className="text-3xl text-gray-900" />
                <p className="text-xs text-gray-500 mt-1">Inscriptions confirmées</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-t-4 border-t-orange-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">En attente</p>
                <AnimatedStat value={stats.enAttente} className="text-3xl text-gray-900" />
                <p className="text-xs text-gray-500 mt-1">En attente de confirmation</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
    </div>
  );
}

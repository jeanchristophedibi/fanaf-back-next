"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "../ui/card";
import { Users } from "lucide-react";
import { useDynamicInscriptions } from "../hooks/useDynamicInscriptions";
import { inscriptionsDataService } from "../data/inscriptionsData";
import { motion } from "motion/react";
import { AnimatedStat } from "../AnimatedStat";
import { Skeleton } from "../ui/skeleton";
import paymentService from '@/services/paymentService';

export function WidgetNonMembres() {
  const { participants: allParticipants } = useDynamicInscriptions();

  // Charger les participants non-membres avec React Query
  // Charger toutes les catégories pour être sûr d'avoir tous les non-membres
  const { data: apiParticipants = [], isLoading } = useQuery({
    queryKey: ['widgetNonMembres'],
    queryFn: async () => {
      try {
        // Charger toutes les catégories pour avoir toutes les données, puis filtrer localement
        const loadedParticipants = await inscriptionsDataService.loadParticipants(undefined);
        console.log('[WidgetNonMembres] Participants chargés:', loadedParticipants?.length || 0);
        
        if (!loadedParticipants || !Array.isArray(loadedParticipants)) {
          console.warn('[WidgetNonMembres] Données invalides ou vides');
          return [];
        }
        
        const nonMembres = loadedParticipants
          .filter(p => {
            if (!p) return false;
            // Filtrer sur registration_fee au lieu de statut
            // L'API renvoie "NON MEMBRE" en majuscules
            const registrationFee = p.registrationFee || (p as any).registration_fee || '';
            const feeUpper = registrationFee.toUpperCase().trim();
            const isNotMember = feeUpper === 'NON MEMBRE' || feeUpper === 'NON MEMBER' || 
                              feeUpper === 'NOT MEMBER' || feeUpper === 'NOT_MEMBER' ||
                              feeUpper === 'NON-MEMBRE' || feeUpper === 'NOT-MEMBER';
            
            // Fallback sur statut si registration_fee n'est pas disponible
            if (!registrationFee) {
              const statut: any = p.statut || (p as any).status || (p as any).type;
              return statut === 'non-membre' || statut === 'not_member' || statut === 'not-member' || statut === 'Not Member';
            }
            
            return isNotMember;
          })
          .filter((p): p is NonNullable<typeof p> => p !== null && p !== undefined);
        
        console.log('[WidgetNonMembres] Non-membres filtrés:', nonMembres.length);
        if (nonMembres.length > 0) {
          console.log('[WidgetNonMembres] Exemple non-membre:', {
            id: nonMembres[0].id,
            nom: nonMembres[0].nom,
            statut: nonMembres[0].statut,
            registrationFee: nonMembres[0].registrationFee,
            statutInscription: nonMembres[0].statutInscription
          });
        }
        return nonMembres;
      } catch (err) {
        console.error('Erreur lors du chargement des non-membres:', err);
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
    : safeAllParticipants.filter(p => p && p.statut === 'non-membre');

  // Charger les paiements en attente depuis l'API
  const { data: pendingPaymentsResponse, isLoading: isLoadingPending } = useQuery({
    queryKey: ['pendingPayments', 'widgetNonMembres'],
    queryFn: async () => {
      try {
        const response = await paymentService.getAllEnAttente();
        return response?.data?.data || [];
      } catch (error) {
        console.error('[WidgetNonMembres] Erreur lors du chargement des paiements en attente:', error);
        return [];
      }
    },
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 2 * 60 * 1000, // 2 minutes en cache
    refetchOnWindowFocus: false,
  });

  const pendingPayments = pendingPaymentsResponse || [];

  const statsQuery = useQuery({
    queryKey: ['widgetNonMembres', 'stats', participants, pendingPayments],
    queryFn: () => {
      try {
        if (!participants || participants.length === 0) {
          return { total: 0, finalises: 0, enAttente: 0 };
        }

        const nonMembres = participants.filter(p => p && p.statut === 'non-membre');
        const finalises = nonMembres.filter(p => p && p.statutInscription === 'finalisée').length;
        
        // Compter les paiements en attente depuis l'API pour les non-membres uniquement
        const enAttenteFromAPI = (pendingPayments || []).filter((item: any) => {
          try {
            if (!item) return false;
            const registrationFee = item.user?.registration_fee || '';
            const isNotMember = registrationFee === 'not_member' || registrationFee === 'non-membre' || 
                               registrationFee === 'non_membre' ||
                               item.registration?.type === 'not_member' || item.registration?.type === 'non-membre';
            return isNotMember;
          } catch (error) {
            console.error('Erreur lors du filtrage des paiements:', error);
            return false;
          }
        }).length;
        
        // Utiliser le compte depuis l'API si disponible, sinon fallback sur le calcul local
        const enAttente = enAttenteFromAPI > 0 
          ? enAttenteFromAPI 
          : nonMembres.filter(p => p && p.statutInscription === 'non-finalisée').length;
        
        return {
          total: nonMembres.length,
          finalises,
          enAttente
        };
      } catch (error) {
        console.error('Erreur lors du calcul des statistiques non-membres:', error);
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
        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-36 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-orange-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Non-Membres</p>
              <AnimatedStat value={stats.total} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Inscriptions non-membres</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Finalisées</p>
              <AnimatedStat value={stats.finalises} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Inscriptions payées</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-t-4 border-t-orange-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En attente</p>
              <AnimatedStat value={stats.enAttente} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Paiement en attente</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

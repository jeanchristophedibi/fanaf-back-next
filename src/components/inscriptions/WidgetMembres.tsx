"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "../ui/card";
import { UserCheck } from "lucide-react";
import { inscriptionsDataService } from "../data/inscriptionsData";
import { motion } from "motion/react";
import { AnimatedStat } from "../AnimatedStat";
import { Skeleton } from "../ui/skeleton";
import paymentService from '@/services/paymentService';

export function WidgetMembres() {
  // Charger les participants membres avec React Query
  // Charger toutes les catégories pour être sûr d'avoir tous les membres
  const { data: participants = [], isLoading } = useQuery({
    queryKey: ['widgetMembres'],
    queryFn: async () => {
      try {
        // Charger toutes les catégories pour avoir toutes les données, puis filtrer localement
        const loaded = await inscriptionsDataService.loadParticipants(undefined);
        console.log('[WidgetMembres] Participants chargés:', loaded?.length || 0);
        
        if (!loaded || !Array.isArray(loaded)) {
          console.warn('[WidgetMembres] Données invalides ou vides');
          return [];
        }
        
        const membres = loaded
          .filter((p) => {
            if (!p) return false;
            // Filtrer sur registration_fee au lieu de statut
            // L'API renvoie "MEMBRE" en majuscules avec diverses variations
            const registrationFee = p.registrationFee || (p as any).registration_fee || '';
            const feeUpper = registrationFee ? registrationFee.toUpperCase().trim() : '';
            const isMember = feeUpper === 'MEMBRE' || feeUpper === 'MEMBER' || 
                            feeUpper === 'M_MEMBER' || feeUpper === 'M-MEMBER' ||
                            feeUpper === 'MEMBRE_TYPE';
            
            // Fallback sur statut si registration_fee n'est pas disponible
            if (!registrationFee) {
              const statut: any = p.statut || (p as any).status || (p as any).type;
              const statutUpper = statut ? String(statut).toUpperCase().trim() : '';
              return statutUpper === 'MEMBRE' || statutUpper === 'MEMBER' || 
                     statutUpper === 'M_MEMBER' || statutUpper === 'M-MEMBER';
            }
            
            return isMember;
          })
          .filter((p): p is NonNullable<typeof p> => p !== null && p !== undefined);
        
        console.log('[WidgetMembres] Membres filtrés:', membres.length);
        if (membres.length > 0) {
          console.log('[WidgetMembres] Exemple membre:', {
            id: membres[0].id,
            nom: membres[0].nom,
            statut: membres[0].statut,
            registrationFee: membres[0].registrationFee,
            statutInscription: membres[0].statutInscription
          });
        }
        
        return membres;
      } catch (e) {
        console.error('Erreur chargement membres:', e);
        return [];
      }
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Charger les paiements en attente depuis l'API
  const { data: pendingPaymentsResponse, isLoading: isLoadingPending } = useQuery({
    queryKey: ['pendingPayments', 'widgetMembres'],
    queryFn: async () => {
      try {
        const response = await paymentService.getAllEnAttente();
        return response?.data?.data || [];
      } catch (error) {
        console.error('[WidgetMembres] Erreur lors du chargement des paiements en attente:', error);
        return [];
      }
    },
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 2 * 60 * 1000, // 2 minutes en cache
    refetchOnWindowFocus: false,
  });

  const pendingPayments = pendingPaymentsResponse || [];

  const statsQuery = useQuery({
    queryKey: ['widgetMembres', 'stats', participants, pendingPayments],
    queryFn: () => {
      try {
        if (!participants || participants.length === 0) {
          return { total: 0, finalises: 0, enAttente: 0 };
        }

        // Filtrer les membres en utilisant la même logique que dans la requête principale
        const membres = participants.filter(p => {
          if (!p) return false;
          const registrationFee = p.registrationFee || (p as any).registration_fee || '';
          const feeUpper = registrationFee ? String(registrationFee).toUpperCase().trim() : '';
          const isMember = feeUpper === 'MEMBRE' || feeUpper === 'MEMBER' || 
                          feeUpper === 'M_MEMBER' || feeUpper === 'M-MEMBER' ||
                          feeUpper === 'MEMBRE_TYPE';
          
          if (!registrationFee) {
            const statut: any = p.statut || (p as any).status || (p as any).type;
            const statutUpper = statut ? String(statut).toUpperCase().trim() : '';
            return statutUpper === 'MEMBRE' || statutUpper === 'MEMBER' || 
                   statutUpper === 'M_MEMBER' || statutUpper === 'M-MEMBER';
          }
          
          return isMember;
        });
        const finalises = membres.filter(p => p && p.statutInscription === 'finalisée').length;
        
        // Compter les paiements en attente depuis l'API pour les membres uniquement
        const enAttenteFromAPI = (pendingPayments || []).filter((item: any) => {
          try {
            if (!item) return false;
            const registrationFee = item.user?.registration_fee || item.registration?.type || '';
            const feeUpper = registrationFee ? String(registrationFee).toUpperCase().trim() : '';
            const isMember = feeUpper === 'MEMBRE' || feeUpper === 'MEMBER' || 
                            feeUpper === 'M_MEMBER' || feeUpper === 'M-MEMBER' ||
                            feeUpper === 'MEMBRE_TYPE';
            return isMember;
          } catch (error) {
            console.error('Erreur lors du filtrage des paiements:', error);
            return false;
          }
        }).length;
        
        // Utiliser le compte depuis l'API si disponible, sinon fallback sur le calcul local
        const enAttente = enAttenteFromAPI > 0 
          ? enAttenteFromAPI 
          : membres.filter(p => p && p.statutInscription === 'non-finalisée').length;
        
        return { total: membres.length, finalises, enAttente };
      } catch (error) {
        console.error('Erreur lors du calcul des statistiques membres:', error);
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
        <Card className="border-t-4 border-t-purple-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-t-4 border-t-purple-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Membres</p>
              <AnimatedStat value={stats.total} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Inscriptions membres</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
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
              <p className="text-xs text-gray-500 mt-1">Inscriptions payées</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
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
              <p className="text-xs text-gray-500 mt-1">Paiement en attente</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

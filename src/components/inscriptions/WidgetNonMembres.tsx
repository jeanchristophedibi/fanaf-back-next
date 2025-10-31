"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "../ui/card";
import { Users } from "lucide-react";
import { useDynamicInscriptions } from "../hooks/useDynamicInscriptions";
import { inscriptionsDataService } from "../data/inscriptionsData";
import { motion } from "motion/react";
import { AnimatedStat } from "../AnimatedStat";
import { Skeleton } from "../ui/skeleton";

export function WidgetNonMembres() {
  const { participants: allParticipants } = useDynamicInscriptions();

  // Charger les participants non-membres avec React Query
  const { data: apiParticipants = [], isLoading } = useQuery({
    queryKey: ['widgetNonMembres'],
    queryFn: async () => {
      try {
        const loadedParticipants = await inscriptionsDataService.loadParticipants(['not_member']);
        return loadedParticipants.filter(p => p.statut === 'non-membre');
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
  
  const participants = apiParticipants.length > 0 ? apiParticipants : allParticipants.filter(p => p.statut === 'non-membre');

  const statsQuery = useQuery({
    queryKey: ['widgetNonMembres', 'stats', participants],
    queryFn: () => {
      const nonMembres = participants.filter(p => p.statut === 'non-membre');
      const finalises = nonMembres.filter(p => p.statutInscription === 'finalisée').length;
      const enAttente = nonMembres.filter(p => p.statutInscription === 'non-finalisée').length;
      
      return {
        total: nonMembres.length,
        finalises,
        enAttente
      };
    },
    enabled: true,
    staleTime: 0,
  });

  const stats = statsQuery.data ?? { total: 0, finalises: 0, enAttente: 0 };

  if (isLoading) {
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

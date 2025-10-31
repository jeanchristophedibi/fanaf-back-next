"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "../ui/card";
import { Plane, TrendingUp } from "lucide-react";
import { planVolDataService } from "../data/planvolData";
import { motion } from "motion/react";
import { AnimatedStat } from "../AnimatedStat";
import { Skeleton } from "../ui/skeleton";

export function WidgetPlanVol() {
  // Charger les plans de vol avec React Query
  const { data: plansVol = [], isLoading: loading } = useQuery({
    queryKey: ['widgetPlanVol'],
    queryFn: async () => {
      try {
        return await planVolDataService.loadFlightPlans();
      } catch (error) {
        console.error('Erreur lors du chargement des plans de vol:', error);
        return [];
      }
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Query pour calculer les statistiques à partir des données
  const statsQuery = useQuery({
    queryKey: ['widgetPlanVol', 'stats', plansVol],
    queryFn: () => {
      const arrivees = plansVol.filter((pv: any) => pv.type === 'arrivee');
      const departs = plansVol.filter((pv: any) => pv.type === 'depart');
      return {
        total: plansVol.length,
        arrivees: arrivees.length,
        departs: departs.length
      };
    },
    enabled: true,
    staleTime: 0,
  });

  const stats = statsQuery.data ?? { total: 0, arrivees: 0, departs: 0 };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-t-4 border-t-orange-500">
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
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
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
        <Card className="border-t-4 border-t-orange-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Plans de Vol</p>
              <AnimatedStat value={stats.total} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Vols enregistrés</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
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
              <p className="text-sm text-gray-600 mb-1">Total Arrivées</p>
              <AnimatedStat value={stats.arrivees} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Vols d'arrivée</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white rotate-[-45deg]" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Départs</p>
              <AnimatedStat value={stats.departs} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Vols de départ</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white rotate-[45deg]" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

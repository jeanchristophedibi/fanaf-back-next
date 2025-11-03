"use client";

import { useQuery } from '@tanstack/react-query';
import { Award, Trophy, Star } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { sponsorsDataService } from "../data/sponsorsData";
import { motion } from "motion/react";
import { AnimatedStat } from "../AnimatedStat";
import { Skeleton } from "../ui/skeleton";
import type { Organisation } from '../data/types';

export function WidgetSponsors() {
  // Charger les sponsors avec React Query
  const { data: sponsors = [], isLoading } = useQuery({
    queryKey: ['widgetSponsors'],
    queryFn: async () => {
      try {
        const loaded = await sponsorsDataService.loadSponsors();
        if (!loaded || !Array.isArray(loaded)) {
          return [];
        }
        return loaded
          .filter((s): s is NonNullable<typeof s> => s !== null && s !== undefined);
      } catch (error) {
        console.error('Erreur lors du chargement des sponsors:', error);
        return [];
      }
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Query pour les statistiques des sponsors par type
  const statsQuery = useQuery({
    queryKey: ['widgetSponsors', 'stats', sponsors],
    queryFn: () => {
      try {
        if (!sponsors || sponsors.length === 0) {
          return { total: 0, argent: 0, gold: 0, autres: 0 };
        }

        const total = sponsors.length;
        const argent = sponsors.filter(s => s && s.secteurActivite === 'ARGENT').length;
        const gold = sponsors.filter(s => s && s.secteurActivite === 'GOLD').length;
        const autres = sponsors.filter(s => 
          s && s.secteurActivite && 
          s.secteurActivite !== 'ARGENT' && 
          s.secteurActivite !== 'GOLD'
        ).length;
        
        return { total, argent, gold, autres };
      } catch (error) {
        console.error('Erreur lors du calcul des statistiques sponsors:', error);
        return { total: 0, argent: 0, gold: 0, autres: 0 };
      }
    },
    enabled: true,
    staleTime: 0,
  });

  const stats = statsQuery.data ?? { total: 0, argent: 0, gold: 0, autres: 0 };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-gray-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-yellow-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </CardContent>
        </Card>
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
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total sponsors</p>
              <AnimatedStat value={stats.total} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Tous les sponsors</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-t-4 border-t-yellow-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sponsors GOLD</p>
              <AnimatedStat value={stats.gold} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Niveau Gold</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-t-4 border-t-gray-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sponsors ARGENT</p>
              <AnimatedStat value={stats.argent} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Niveau Argent</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-t-4 border-t-purple-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Autres sponsors</p>
              <AnimatedStat value={stats.autres} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Autres types</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Mic } from "lucide-react";
import { useDynamicInscriptions } from "../hooks/useDynamicInscriptions";
import { inscriptionsDataService } from "../data/inscriptionsData";
import { motion } from "motion/react";
import { AnimatedStat } from "../AnimatedStat";
import { Skeleton } from "../ui/skeleton";

export function WidgetSpeakers() {
  const { participants: mockParticipants } = useDynamicInscriptions();
  const [apiParticipants, setApiParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        // Charger toutes les inscriptions puis filtrer les speakers
        const loaded = await inscriptionsDataService.loadParticipants(undefined);
        setApiParticipants(loaded.filter((p) => p.statut === 'speaker'));
      } catch (e) {
        console.error('Erreur chargement Speakers:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const participants = apiParticipants.length > 0 ? apiParticipants : mockParticipants.filter(p => p.statut === 'speaker');

  const stats = useMemo(() => {
    const speakers = participants.filter(p => p.statut === 'speaker');
    const finalises = speakers.filter(p => p.statutInscription === 'finalisée').length;
    const enAttente = speakers.filter(p => p.statutInscription === 'non-finalisée').length;
    return { total: speakers.length, finalises, enAttente };
  }, [participants]);

  if (isLoading) {
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

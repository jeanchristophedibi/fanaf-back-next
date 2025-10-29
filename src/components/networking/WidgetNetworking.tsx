"use client";

import { useMemo, useState, useEffect } from "react";
import { Calendar, Users, Building2, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import type { RendezVous } from "../data/mockData";
import { networkingDataService } from "../data/networkingData";
import { motion } from "motion/react";
import { AnimatedStat } from "../AnimatedStat";
import { Skeleton } from "../ui/skeleton";

export function WidgetNetworking() {
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const requests = await networkingDataService.loadNetworkingRequests();
        if (mounted) setRendezVous(requests);
      } catch (error) {
        console.error('Erreur lors du chargement des rendez-vous:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const stats = useMemo(() => {
    const rdvParticipants = rendezVous.filter(r => r.type === 'participant');
    const rdvSponsors = rendezVous.filter(r => r.type === 'sponsor');
    const rdvAcceptes = rendezVous.filter(r => r.statut === 'acceptée').length;
    const rdvEnAttente = rendezVous.filter(r => r.statut === 'en-attente').length;
    
    return {
      participants: rdvParticipants.length,
      sponsors: rdvSponsors.length,
      acceptes: rdvAcceptes,
      enAttente: rdvEnAttente,
      total: rendezVous.length
    };
  }, [rendezVous]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border-t-4 border-t-purple-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="w-12 h-12 rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-t-4 border-t-purple-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total RDV</p>
              <AnimatedStat value={stats.total} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Tous les rendez-vous</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">RDV Participants</p>
              <AnimatedStat value={stats.participants} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Entre participants</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
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
              <p className="text-sm text-gray-600 mb-1">RDV Sponsors</p>
              <AnimatedStat value={stats.sponsors} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Avec sponsors</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Acceptés</p>
              <AnimatedStat value={stats.acceptes} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Rendez-vous confirmés</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-t-4 border-t-yellow-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En attente</p>
              <AnimatedStat value={stats.enAttente} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">En attente de réponse</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


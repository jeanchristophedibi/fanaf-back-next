"use client";

import { useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { Mic } from "lucide-react";
import { useDynamicInscriptions } from "../hooks/useDynamicInscriptions";
import { motion } from "motion/react";
import { AnimatedStat } from "../AnimatedStat";

export function WidgetSpeakers() {
  const { participants } = useDynamicInscriptions();

  const stats = useMemo(() => {
    const speakers = participants.filter(p => p.statut === 'speaker');
    const finalises = speakers.filter(p => p.statutInscription === 'finalisée').length;
    const enAttente = speakers.filter(p => p.statutInscription === 'non-finalisée').length;
    
    return {
      total: speakers.length,
      finalises,
      enAttente
    };
  }, [participants]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 mb-1">Total Speakers</p>
                <AnimatedStat value={stats.total} className="text-3xl text-yellow-900" />
              </div>
              <div className="bg-yellow-600 p-3 rounded-lg">
                <Mic className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">Finalisées</p>
                <AnimatedStat value={stats.finalises} className="text-3xl text-green-900" />
                <p className="text-xs text-green-600 mt-1">Inscriptions confirmées</p>
              </div>
              <div className="bg-green-600 p-3 rounded-lg">
                <Mic className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 mb-1">En attente</p>
                <AnimatedStat value={stats.enAttente} className="text-3xl text-orange-900" />
                <p className="text-xs text-orange-600 mt-1">En attente de confirmation</p>
              </div>
              <div className="bg-orange-600 p-3 rounded-lg">
                <Mic className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


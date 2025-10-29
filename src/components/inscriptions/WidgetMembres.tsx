"use client";

import { useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { UserCheck } from "lucide-react";
import { useDynamicInscriptions } from "../hooks/useDynamicInscriptions";
import { motion } from "motion/react";
import { AnimatedStat } from "../AnimatedStat";

export function WidgetMembres() {
  const { participants } = useDynamicInscriptions();

  const stats = useMemo(() => {
    const membres = participants.filter(p => p.statut === 'membre');
    const finalises = membres.filter(p => p.statutInscription === 'finalisée').length;
    const enAttente = membres.filter(p => p.statutInscription === 'non-finalisée').length;
    
    return {
      total: membres.length,
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
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 mb-1">Total Membres</p>
                <AnimatedStat value={stats.total} className="text-3xl text-purple-900" />
              </div>
              <div className="bg-purple-600 p-3 rounded-lg">
                <UserCheck className="w-8 h-8 text-white" />
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
                <p className="text-xs text-green-600 mt-1">Inscriptions payées</p>
              </div>
              <div className="bg-green-600 p-3 rounded-lg">
                <UserCheck className="w-8 h-8 text-white" />
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
                <p className="text-xs text-orange-600 mt-1">Paiement en attente</p>
              </div>
              <div className="bg-orange-600 p-3 rounded-lg">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


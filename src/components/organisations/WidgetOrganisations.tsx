"use client";

import { useMemo } from "react";
import { Building2, Users, Briefcase, Award } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { useDynamicInscriptions } from "../hooks/useDynamicInscriptions";
import { motion } from "motion/react";
import { AnimatedStat } from "../AnimatedStat";

export function WidgetOrganisations() {
  const { organisations } = useDynamicInscriptions({ includeOrganisations: true });

  // Statistiques pour la vue "liste"
  const stats = useMemo(() => {
    const membre = organisations.filter(o => o.statut === 'membre').length;
    const nonMembre = organisations.filter(o => o.statut === 'non-membre').length;
    const sponsor = organisations.filter(o => o.statut === 'sponsor').length;
    
    return { membre, nonMembre, sponsor, total: organisations.length };
  }, [organisations]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total organisations</p>
              <AnimatedStat value={stats.total} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Toutes les organisations</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-t-4 border-t-teal-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Associations membre</p>
              <AnimatedStat value={stats.membre} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Membres FANAF</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
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
        <Card className="border-t-4 border-t-gray-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Entreprises</p>
              <AnimatedStat value={stats.nonMembre} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Non-membres</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sponsors</p>
              <AnimatedStat value={stats.sponsor} className="text-3xl text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Organisations sponsor</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


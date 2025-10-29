"use client";

import { Card } from "../../ui/card";
import { Coins, Building2, TrendingUp } from "lucide-react";
import { useDynamicInscriptions } from "../../hooks/useDynamicInscriptions";
import { motion } from "motion/react";
import { useMemo } from "react";
import { getOrganisationById } from "../../data/mockData";

export function StatsPaiements() {
  const { participants } = useDynamicInscriptions();
  
  // Calculer les statistiques pour les paiements finalisés
  const stats = useMemo(() => {
    return participants
      .filter(p => p.statutInscription === 'finalisée')
      .reduce((acc, participant) => {
        acc.totalPaiements++;
        
        const organisation = getOrganisationById(participant.organisationId);
        let tarif = 0;
        if (participant.statut === 'non-membre') {
          tarif = 400000;
        } else if (participant.statut === 'membre') {
          tarif = 350000;
        }
        
        acc.totalMontant += tarif;
        
        // Canal d'encaissement
        const canal = participant.canalEncaissement || 'externe';
        if (canal === 'externe') {
          acc.paiementsExterne++;
          acc.montantExterne += tarif;
        } else if (canal === 'asapay') {
          acc.paiementsAsapay++;
          acc.montantAsapay += tarif;
        }
        
        return acc;
      }, {
        totalPaiements: 0,
        totalMontant: 0,
        paiementsExterne: 0,
        montantExterne: 0,
        paiementsAsapay: 0,
        montantAsapay: 0
      });
  }, [participants]);

  return (
    <div className="grid grid-cols-3 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-700">Total paiements</p>
              <p className="text-3xl text-blue-900">{stats.totalPaiements}</p>
              <p className="text-xs text-blue-600 mt-1">
                {stats.totalMontant.toLocaleString()} FCFA
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-700">Canal Externe</p>
              <p className="text-3xl text-blue-900">{stats.paiementsExterne}</p>
              <p className="text-xs text-blue-600 mt-1">
                {stats.montantExterne.toLocaleString()} FCFA
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-orange-700">Canal ASAPAY</p>
              <p className="text-3xl text-orange-900">{stats.paiementsAsapay}</p>
              <p className="text-xs text-orange-600 mt-1">
                {stats.montantAsapay.toLocaleString()} FCFA
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

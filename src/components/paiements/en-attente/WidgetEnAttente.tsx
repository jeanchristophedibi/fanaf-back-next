"use client";

import { Card } from "../../ui/card";
import { Coins, Banknote, Building2, FileText } from "lucide-react";
import { useDynamicInscriptions } from "../../hooks/useDynamicInscriptions";
import { motion } from "motion/react";
import { AlertCircle } from "lucide-react";
import { AnimatedStat } from "../../AnimatedStat";
import { type ModePaiement } from '../../data/types';
import { getOrganisationById } from '../../data/helpers';
import { useState, useMemo, useEffect } from "react";


export function WidgetEnAttente() {
  const { participants } = useDynamicInscriptions();
  
  // Calculer les statistiques pour les paiements en attente
  const stats = participants.reduce((acc, participant) => {
    if (participant.statutInscription === 'non-finalisée') {
      acc.total++;
      
      // Compter par mode de paiement
      const mode = participant.modePaiement || 'espèce';
      
      if (mode === 'espèce') {
        acc.cash++;
      } else if (mode === 'virement') {
        acc.virement++;
      } else if (mode === 'chèque') {
        acc.cheque++;
      }
    }
    return acc;
  }, {
    total: 0,
    cash: 0,
    virement: 0,
    cheque: 0
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-orange-700">Total en attente</p>
            <p className="text-3xl text-orange-900">{stats.total}</p>
          </div>
        </div>
      </Card>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="p-6 border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
            <Banknote className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Cash</p>
            <p className="text-3xl text-gray-900">{stats.cash}</p>
          </div>
        </div>
      </Card>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="p-6 border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Banknote className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Virement</p>
            <p className="text-3xl text-gray-900">{stats.virement}</p>
          </div>
        </div>
      </Card>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="p-6 border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <Banknote className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Chèque</p>
            <p className="text-3xl text-gray-900">{stats.cheque}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  </div>

  );
}

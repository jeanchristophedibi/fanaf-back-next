'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { 
  CheckCircle2, 
  Clock, 
  Wallet,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { AnimatedStat } from '../../../components/AnimatedStat';
import { toast } from 'sonner';
import paymentService from '@/services/paymentService';
import { motion } from 'motion/react';
import { WidgetEnAttenteOperateur } from '@/components/paiements/en-attente/WidgetEnAttenteOperateur';

type DashboardStats = {
  finalized: {
    count: number;
    total_amount: number;
  };
  pending: {
    count: number;
    total_amount: number;
  };
  collected: number;
  pending_amount: number;
  provisional: number;
  by_status: {
    completed: {
      count: number;
      total_amount: number;
    };
    confirmed: {
      count: number;
      total_amount: number;
    };
    cancelled: {
      count: number;
      total_amount: number;
    };
    failed: {
      count: number;
      total_amount: number;
    };
    refunded: {
      count: number;
      total_amount: number;
    };
  };
};

export default function OperateurCaisseDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await paymentService.getStatsOperateur();
        console.log('Stats paiements:', response);
        setStats(response?.data || response);
      } catch (error) {
        console.error('Erreur récupération stats:', error);
        toast?.error('Impossible de récupérer les statistiques');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord des paiements</h1>
        <p className="text-gray-600">Vue d'ensemble des encaissements FANAF 2026</p>
      </div>

      {/* Résumé financier */}
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <Wallet className="w-5 h-5" />
            Résumé financier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Montant encaissé */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm text-gray-600">Montant encaissé</p>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-2xl text-green-600 mb-1">
                    <AnimatedStat value={stats?.collected || 0 } /> FCFA
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Montant en attente */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm text-gray-600">Montant en attente</p>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-2xl text-red-600 mb-1">
                    <AnimatedStat value={stats?.pending_amount || 0} /> FCFA
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Total prévisionnel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm text-gray-600">Total prévisionnel</p>
                  </div>
                  <p className="text-2xl text-blue-600 mb-1">
                    <AnimatedStat value={stats?.provisional || 0} /> FCFA
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques des paiements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total paiements */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 h-full">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl text-green-900 mb-3">
                <AnimatedStat value={stats?.finalized?.count || 0} />
              </div>
              <p className="text-lg text-green-700 font-medium">Total paiements</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Paiements en attente */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 h-full">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-2xl text-orange-900 mb-3">
                <AnimatedStat value={stats?.pending?.count || 0} />
              </div>
              <p className="text-lg text-orange-700 font-medium">Paiements en attente</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Répartition par mode de paiement */}
      <WidgetEnAttenteOperateur />
    </div>
    
  );
}

"use client";

import { Card } from "../../ui/card";
import { Coins, Banknote, Building2, FileText } from "lucide-react";
import { motion } from "motion/react";
import { AlertCircle } from "lucide-react";
import { AnimatedStat } from "../../AnimatedStat";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import paymentService from "@/services/paymentService";


export function WidgetEnAttenteOperateur() {
  type PaymentStats = {
    totals: {
      count: number;
      amount: number;
      fees: number;
    };
    by_method: Array<{
      payment_method: string;
      count: number;
      total_amount: number;
    }>;
  };

  const [statsData, setStatsData] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await paymentService.getStatsEnAttente();
        console.log('Stats paiements en attente:', response);
        setStatsData(response?.data || response);
      } catch (error) {
        console.error('Erreur récupération stats:', error);
        toast?.error('Impossible de récupérer les statistiques');
        setStatsData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Calculer les statistiques pour l'affichage
  const stats = useMemo(() => {
    if (!statsData) {
      return {
        total: 0,
        cash: 0,
        virement: 0,
        cheque: 0,
        asapay: 0,
      };
    }

    const methodStats = {
      total: statsData.totals?.count || 0,
      cash: 0,
      virement: 0,
      cheque: 0,
      asapay: 0,
    };

    // Parser les stats par méthode de paiement
    statsData.by_method?.forEach((method) => {
      if (method.payment_method === 'cash') {
        methodStats.cash = method.count;
      } else if (method.payment_method === 'virement' || method.payment_method === 'transfer') {
        methodStats.virement = method.count;
      } else if (method.payment_method === 'cheque' || method.payment_method === 'check') {
        methodStats.cheque = method.count;
      } else if (method.payment_method === 'asapay') {
        methodStats.asapay = method.count;
      }
    });

    return methodStats;
  }, [statsData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    
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
            <p className="text-sm text-gray-600">Espèce</p>
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
            <p className="text-sm text-orange-700">AsaPay</p>
            <p className="text-3xl text-orange-900">{stats.asapay}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  </div>

  );
}
export default WidgetEnAttenteOperateur;  
"use client";

import { Card } from "../../ui/card";
import { Coins, Banknote, Building2, FileText, CreditCard, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import { AlertCircle } from "lucide-react";
import { AnimatedStat } from "../../AnimatedStat";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import paymentService from "@/services/paymentService";


export function WidgetEnAttenteOperateur() {
  type PaymentMethod = {
    payment_method: string;
    label: string;
    count: number;
    total_amount: number;
    total_fees: number;
  };

  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await paymentService.getStatsEnAttente();
        console.log('Stats paiements en attente:', response);
        setStatsData(response?.data?.data || response);
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="p-6 border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
            <Banknote className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Espèce</p>
            <p className="text-2xl text-gray-900">
              <AnimatedStat value={statsData?.cash?.count || 0} />
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
      <Card className="p-6 border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Banknote className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Virement</p>
            <p className="text-2xl text-gray-900">
              <AnimatedStat value={statsData?.virement?.count || 0} />
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
      <Card className="p-6 border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <Banknote className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Chèque</p>
            <p className="text-2xl text-gray-900">
              <AnimatedStat value={statsData?.cheque?.count || 0} />
            </p>
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
          <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">AsaPay</p>
            <p className="text-2xl text-gray-900">
              <AnimatedStat value={statsData?.asapay?.count || 0} />
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  </div>

  );
}
export default WidgetEnAttenteOperateur;  
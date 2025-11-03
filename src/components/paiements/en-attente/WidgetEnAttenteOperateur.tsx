"use client";

import { Card } from "../../ui/card";
import { Coins, Banknote, Building2, FileText, CreditCard, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import { AlertCircle } from "lucide-react";
import { AnimatedStat } from "../../AnimatedStat";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import paymentService from "@/services/paymentService";

type PaymentMethodStats = {
  payment_method: string;
  label: string;
  payment_provider_system: string;
  count: number;
  total_amount: number;
  total_fees: number;
  mobile_money_provider?: string;
};

type PaymentStats = {
  totals: {
    count: number;
    amount: number;
    fees: number;
  };
  asapay: PaymentMethodStats;
  bank_transfer: PaymentMethodStats;
  check: PaymentMethodStats;
  cash: PaymentMethodStats;
  card: PaymentMethodStats;
  mobile_money_moov: PaymentMethodStats;
  mobile_money_wave: PaymentMethodStats;
  mobile_money_mtn: PaymentMethodStats;
  mobile_money_orange: PaymentMethodStats;
};

export function WidgetEnAttenteOperateur() {
  const [statsData, setStatsData] = useState<PaymentStats | null>(null);
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
        const errorMsg = (error as any)?.message || 'Impossible de récupérer les statistiques';
        toast.error(errorMsg, { duration: 5000 });
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
            <p className="text-sm text-gray-600">{statsData?.cash?.label || "Espèces"}</p>
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
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">{statsData?.bank_transfer?.label || "Virement bancaire"}</p>
            <p className="text-2xl text-gray-900">
              <AnimatedStat value={statsData?.bank_transfer?.count || 0} />
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
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">{statsData?.check?.label || "Chèque"}</p>
            <p className="text-2xl text-gray-900">
              <AnimatedStat value={statsData?.check?.count || 0} />
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
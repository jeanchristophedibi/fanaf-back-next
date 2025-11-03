'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Banknote, Building, FileText, Smartphone, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import paymentService from '@/services/paymentService';
import { AnimatedStat } from '../AnimatedStat';

type PaymentMethodData = {
  method: string;
  label: string;
  count: number;
  total_amount: number;
  percentage: number;
  payment_provider_systems: string;
};

type PaymentMethodsResponse = {
  cash: PaymentMethodData;
  bank_transfer: PaymentMethodData;
  check: PaymentMethodData;
  mobile_money: PaymentMethodData;
  card: PaymentMethodData;
  totals: {
    count: number;
    total_amount: number;
  };
};

const getIcon = (method: string) => {
  switch (method) {
    case 'cash':
      return <Banknote className="w-6 h-6 text-white" />;
    case 'bank_transfer':
      return <Building className="w-6 h-6 text-white" />;
    case 'check':
      return <FileText className="w-6 h-6 text-white" />;
    case 'mobile_money':
      return <Smartphone className="w-6 h-6 text-white" />;
    case 'card':
      return <Banknote className="w-6 h-6 text-white" />;
    default:
      return null;
  }
};

const getColors = (method: string) => {
  switch (method) {
    case 'cash':
      return { bg: 'from-green-50 to-emerald-50', iconBg: 'bg-green-600', text: 'text-green-600', border: 'border-green-200' };
    case 'bank_transfer':
      return { bg: 'from-blue-50 to-cyan-50', iconBg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200' };
    case 'check':
      return { bg: 'from-purple-50 to-pink-50', iconBg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-200' };
    case 'mobile_money':
      return { bg: 'from-orange-50 to-amber-50', iconBg: 'bg-orange-600', text: 'text-orange-600', border: 'border-orange-200' };
    case 'card':
      return { bg: 'from-indigo-50 to-blue-50', iconBg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-200' };
    default:
      return { bg: 'from-gray-50 to-gray-100', iconBg: 'bg-gray-400', text: 'text-gray-600', border: 'border-gray-200' };
  }
};

export function PaymentMethodDistributionWidget() {
  const [paymentMethodsData, setPaymentMethodsData] = useState<PaymentMethodsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setIsLoading(true);
      try {
        const response = await paymentService.getStatsPaymentMethodDistribution();
        console.log('Stats paiements par mode de paiement:', response);
        setPaymentMethodsData(response?.data || response);
      } catch (error) {
        console.error('Erreur récupération stats paiements par mode de paiement:', error);
        const errorMsg = (error as any)?.message || 'Impossible de récupérer les stats paiements par mode de paiement';
        toast.error(errorMsg, { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaymentMethods();
  }, []);

  // Convert object to array for display
  const displayMethods = paymentMethodsData ? [
    paymentMethodsData.cash,
    paymentMethodsData.bank_transfer,
    paymentMethodsData.check,
    paymentMethodsData.mobile_money,
  ].filter(Boolean) : [];

  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Répartition par mode de paiement</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6 border-gray-200 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Répartition par mode de paiement
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayMethods.map((methodData, index) => {
          const { bg, iconBg, text, border } = getColors(methodData.method);
          return (
            <motion.div
              key={methodData.method}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className={`p-6 bg-gradient-to-br ${bg} ${border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center shadow-sm`}>
                      {getIcon(methodData.method)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{methodData.label}</p>
                      <p className={`text-2xl font-semibold ${text}`}>
                        <AnimatedStat value={methodData.count} />
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}


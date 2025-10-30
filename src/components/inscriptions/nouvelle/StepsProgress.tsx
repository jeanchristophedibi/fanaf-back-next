'use client';

import React from 'react';
import { Card } from '../../ui/card';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

export interface EtapeItem {
  numero: number;
  titre: string;
  icon: any;
}

interface StepsProgressProps {
  etapes: EtapeItem[];
  etapeActuelle: number;
}

export const StepsProgress: React.FC<StepsProgressProps> = ({ etapes, etapeActuelle }) => {
  return (
    <Card className="p-8 border-0 rounded-xl bg-white/80 backdrop-blur-sm">
      <div className="relative">
        <div className="absolute top-6 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full" />
        <motion.div
          className="absolute top-6 left-0 h-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${((etapeActuelle - 1) / (etapes.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
        <div className="relative flex justify-between">
          {etapes.map((etape, index) => {
            const Icon = etape.icon;
            const isActive = etapeActuelle === etape.numero;
            const isCompleted = etapeActuelle > etape.numero;
            return (
              <motion.div key={etape.numero} className="flex flex-col items-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <motion.div
                  className={`relative w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all duration-300 border-4 border-white ${
                    isCompleted ? 'bg-gradient-to-br from-green-500 to-emerald-600' : isActive ? 'bg-gradient-to-br from-orange-600 to-amber-600' : 'bg-gradient-to-br from-gray-200 to-gray-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-7 h-7 text-white" strokeWidth={3} /> : <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-500'}`} />}
                </motion.div>
                <p className={`text-sm transition-all duration-300 text-center max-w-[100px] ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>{etape.titre}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};



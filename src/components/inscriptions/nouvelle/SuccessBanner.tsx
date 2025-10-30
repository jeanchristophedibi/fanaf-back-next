'use client';

import React from 'react';
import { Card } from '../../ui/card';
import { motion } from 'motion/react';
import { CheckCircle, Sparkles } from 'lucide-react';

interface SuccessBannerProps {
  participantPrenom?: string;
  participantsCount: number;
  isExonere?: boolean;
}

export const SuccessBanner: React.FC<SuccessBannerProps> = ({ participantPrenom, participantsCount }) => {
  return (
    <Card className="relative overflow-hidden border-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
      <div className="relative p-8">
        <div className="flex items-center gap-6 text-white">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-blue-600" />
          </motion.div>
          <div className="flex-1">
            <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="text-3xl mb-2">
              Inscription créée avec succès !
            </motion.h2>
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="text-lg opacity-90">
              {participantsCount} participant{participantsCount > 1 ? 's' : ''} inscrit{participantsCount > 1 ? 's' : ''}{participantPrenom ? ` • Merci ${participantPrenom}` : ''}
            </motion.p>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <Sparkles className="w-4 h-4" />
              <span>En attente de paiement</span>
            </motion.div>
          </div>
        </div>
      </div>
    </Card>
  );
};



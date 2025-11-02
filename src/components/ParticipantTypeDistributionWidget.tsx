'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import participantService from '@/services/participantService';

type ParticipantStats = {
  participants: number;
  by_type: {
    member: number;
    not_member: number;
    vip: number;
    speaker: number;
  };
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'member':
      return { dot: 'bg-blue-600', bar: 'bg-blue-600' };
    case 'not_member':
      return { dot: 'bg-orange-600', bar: 'bg-orange-600' };
    case 'vip':
      return { dot: 'bg-purple-600', bar: 'bg-purple-600' };
    case 'speaker':
      return { dot: 'bg-green-600', bar: 'bg-green-600' };
    default:
      return { dot: 'bg-gray-400', bar: 'bg-gray-400' };
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'member':
      return 'Membres';
    case 'not_member':
      return 'Non-membres';
    case 'vip':
      return 'VIP';
    case 'speaker':
      return 'Speakers';
    default:
      return type;
  }
};

export function ParticipantTypeDistributionWidget() {
  const [stats, setStats] = useState<ParticipantStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await participantService.getStats();
        console.log('Stats participants par type:', response);
        setStats(response?.data || response);
      } catch (error) {
        console.error('Erreur récupération stats participants:', error);
        toast?.error('Impossible de récupérer les statistiques des participants');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Répartition par type de participant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const types = [
    { key: 'member', count: stats?.by_type?.member || 0 },
    { key: 'not_member', count: stats?.by_type?.not_member || 0 },
    { key: 'vip', count: stats?.by_type?.vip || 0 },
    { key: 'speaker', count: stats?.by_type?.speaker || 0 },
  ];

  const totalParticipants = stats?.participants || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-600" />
          Répartition par type de participant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {types.map((type, index) => {
            const { dot, bar } = getTypeColor(type.key);
            const percentage = totalParticipants > 0 ? (type.count / totalParticipants) * 100 : 0;
            
            return (
              <motion.div
                key={type.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${dot} rounded-full`}></div>
                    <span className="text-sm text-gray-700">{getTypeLabel(type.key)}</span>
                  </div>
                  <span className="text-gray-900">{type.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`${bar} h-2 rounded-full`}
                  ></motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-teal-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Total badges générés</span>
            <span className="text-lg font-semibold text-teal-700">{totalParticipants}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


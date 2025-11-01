'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge as BadgeUI } from '../../../components/ui/badge';
import { 
  IdCard, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Users, 
  Building, 
  TrendingUp,
  Award,
  Calendar
} from 'lucide-react';
import { AnimatedStat } from '../../../components/AnimatedStat';
import { toast } from 'sonner';
import participantService from '@/services/participantService';

type DashboardStats = {
  pending_payments: number;
  finalized_registrations: number;
  grouped_registrations: number;
  participants: number;
  last_24h: number;
  by_type: {
    member: number;
    not_member: number;
    vip: number;
  };
};

export default function OperateurBadgeDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await participantService.getStats();
        console.log('Stats participants:', response);
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
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-teal-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              Badges générés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatedStat value={stats?.finalized_registrations || 0} className="text-3xl text-gray-900 mb-1" />
            <p className="text-xs text-gray-500">Documents disponibles</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              Paiements en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatedStat value={stats?.pending_payments || 0} className="text-3xl text-gray-900 mb-1" />
            <p className="text-xs text-gray-500">À finaliser</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Dernières 24h
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatedStat value={stats?.last_24h || 0} className="text-3xl text-gray-900 mb-1" />
            <p className="text-xs text-gray-500">Nouvelles inscriptions</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Total participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatedStat value={stats?.participants || 0} className="text-3xl text-gray-900 mb-1" />
            <p className="text-xs text-gray-500">Inscrits</p>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Répartition par type de participant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-gray-700">Membres</span>
                  </div>
                  <span className="text-gray-900">{stats?.by_type?.member || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.participants ? ((stats?.by_type?.member || 0) / stats.participants) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    <span className="text-sm text-gray-700">Non-membres</span>
                  </div>
                  <span className="text-gray-900">{stats?.by_type?.not_member || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.participants ? ((stats?.by_type?.not_member || 0) / stats.participants) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <span className="text-sm text-gray-700">VIP</span>
                  </div>
                  <span className="text-gray-900">{stats?.by_type?.vip || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.participants ? ((stats?.by_type?.vip || 0) / stats.participants) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-teal-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Total participants</span>
                <span className="text-lg text-teal-700">{stats?.participants || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inscriptions groupées */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-teal-600" />
              Types d'inscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl text-blue-900 mb-2">{stats?.grouped_registrations || 0}</div>
                <div className="text-sm text-blue-700">Inscriptions groupées</div>
                <div className="text-xs text-blue-600 mt-1">Entreprises et associations</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl text-teal-900 mb-2">
                  {(stats?.participants || 0) - (stats?.grouped_registrations || 0)}
                </div>
                <div className="text-sm text-teal-700">Inscriptions individuelles</div>
                <div className="text-xs text-teal-600 mt-1">Participants individuels</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indicateurs de performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            Indicateurs de performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl text-gray-900 mb-1">
                {stats?.participants 
                  ? ((stats.finalized_registrations / stats.participants) * 100).toFixed(1) 
                  : 0}%
              </div>
              <div className="text-sm text-gray-600">Taux de finalisation</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl text-gray-900 mb-1">
                {(stats?.by_type?.member || 0) + (stats?.by_type?.not_member || 0)}
              </div>
              <div className="text-sm text-gray-600">Participants payants</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl text-gray-900 mb-1">
                {stats?.by_type?.vip || 0}
              </div>
              <div className="text-sm text-gray-600">Invités VIP</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer info */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <IdCard className="w-5 h-5 text-teal-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-teal-900 mb-1">
              À propos des badges
            </h3>
            <p className="text-sm text-teal-700">
              Les badges sont générés automatiquement lorsque le statut d'inscription passe à "finalisée". 
              Vous pouvez télécharger les badges individuels ou groupés depuis la section Documents.
            </p>
          </div> 
        </div>
      </div>
    </div>
  );
}

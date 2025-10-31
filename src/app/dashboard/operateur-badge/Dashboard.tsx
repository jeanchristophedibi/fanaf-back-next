'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { useDynamicInscriptions } from '../../../components/hooks/useDynamicInscriptions';
import { getOrganisationById } from '../../../components/data/helpers';
import { AnimatedStat } from '../../../components/AnimatedStat';

export default function OperateurBadgeDashboard() {
  const { participants } = useDynamicInscriptions();

  // Query pour les statistiques globales
  const statsQuery = useQuery({
    queryKey: ['operateurBadgeDashboard', 'stats', participants],
    queryFn: () => {
      const finalisés = participants.filter(p => p.statutInscription === 'finalisée');
      const enAttente = participants.filter(p => 
        p.statutInscription === 'non-finalisée' && 
        (p.statut === 'membre' || p.statut === 'non-membre')
      );
      const exonérés = participants.filter(p => 
        p.statut === 'vip' || p.statut === 'speaker'
      );

      // Documents générés aujourd'hui (simulation)
      const aujourdhui = new Date().toISOString().split('T')[0];
      const aujourdhuiDocs = finalisés.filter(p => {
        // Simulation: on considère que 30% des documents ont été générés aujourd'hui
        return Math.random() > 0.7;
      }).length;

      // Par type de participant
      const parType = {
        membre: finalisés.filter(p => p.statut === 'membre').length,
        nonMembre: finalisés.filter(p => p.statut === 'non-membre').length,
        vip: finalisés.filter(p => p.statut === 'vip').length,
        speaker: finalisés.filter(p => p.statut === 'speaker').length,
      };

      // Top 5 organisations
      const orgStats = new Map<string, number>();
      finalisés.forEach(p => {
        const count = orgStats.get(p.organisationId) || 0;
        orgStats.set(p.organisationId, count + 1);
      });
      
      const topOrganisations = Array.from(orgStats.entries())
        .map(([orgId, count]) => ({
          org: getOrganisationById(orgId),
          count
        }))
        .filter(item => item.org !== undefined)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        badgesGénérés: finalisés.length,
        badgesEnAttente: enAttente.length,
        documentsAujourdhui: aujourdhuiDocs,
        exonérés: exonérés.length,
        total: participants.length,
        parType,
        topOrganisations
      };
    },
    enabled: true,
    staleTime: 0,
  });

  const stats = statsQuery.data ?? {
    badgesGénérés: 0,
    badgesEnAttente: 0,
    documentsAujourdhui: 0,
    exonérés: 0,
    total: 0,
    parType: { membre: 0, nonMembre: 0, vip: 0, speaker: 0 },
    topOrganisations: []
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <IdCard className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Tableau de bord Opérateur Badge</h2>
            <p className="text-teal-100">Suivi de la génération des badges et documents</p>
          </div>
        </div>
      </div>

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
            <AnimatedStat value={stats.badgesGénérés} className="text-3xl text-gray-900 mb-1" />
            <p className="text-xs text-gray-500">Documents disponibles</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              Badges en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatedStat value={stats.badgesEnAttente} className="text-3xl text-gray-900 mb-1" />
            <p className="text-xs text-gray-500">Paiements à finaliser</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Aujourd'hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatedStat value={stats.documentsAujourdhui} className="text-3xl text-gray-900 mb-1" />
            <p className="text-xs text-gray-500">Documents générés</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Participants VIP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatedStat value={stats.exonérés} className="text-3xl text-gray-900 mb-1" />
            <p className="text-xs text-gray-500">VIP & Speakers</p>
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
                  <span className="text-gray-900">{stats.parType.membre}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.badgesGénérés > 0 ? (stats.parType.membre / stats.badgesGénérés) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    <span className="text-sm text-gray-700">Non-membres</span>
                  </div>
                  <span className="text-gray-900">{stats.parType.nonMembre}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.badgesGénérés > 0 ? (stats.parType.nonMembre / stats.badgesGénérés) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <span className="text-sm text-gray-700">VIP</span>
                  </div>
                  <span className="text-gray-900">{stats.parType.vip}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.badgesGénérés > 0 ? (stats.parType.vip / stats.badgesGénérés) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-gray-700">Speakers</span>
                  </div>
                  <span className="text-gray-900">{stats.parType.speaker}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.badgesGénérés > 0 ? (stats.parType.speaker / stats.badgesGénérés) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-teal-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Total badges générés</span>
                <span className="text-lg text-teal-700">{stats.badgesGénérés}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top organisations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              Top 5 Organisations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topOrganisations.map((item, index) => (
                <div key={item.org!.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-teal-50 text-teal-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-900">{item.org!.nom}</span>
                      <span className="text-sm text-gray-600">{item.count} badges</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-teal-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${(item.count / stats.badgesGénérés) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {stats.topOrganisations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Building className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune organisation pour le moment</p>
              </div>
            )}
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
                {stats.badgesGénérés > 0 
                  ? ((stats.badgesGénérés / stats.total) * 100).toFixed(1) 
                  : 0}%
              </div>
              <div className="text-sm text-gray-600">Taux de finalisation</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl text-gray-900 mb-1">
                {stats.parType.membre + stats.parType.nonMembre}
              </div>
              <div className="text-sm text-gray-600">Participants payants</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl text-gray-900 mb-1">
                {stats.exonérés}
              </div>
              <div className="text-sm text-gray-600">Invités spéciaux</div>
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

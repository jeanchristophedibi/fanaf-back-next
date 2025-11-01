import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Users, Building2, Calendar, DollarSign, Award } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Skeleton } from './ui/skeleton';
import { inscriptionsDataService } from './data/inscriptionsData';
import { companiesDataService } from './data/companiesData';
import { networkingDataService } from './data/networkingData';

export function DashboardAnalytics() {
  // Charger les données avec React Query
  const { data: organisationsData = [], isLoading: organisationsLoading } = useQuery({
    queryKey: ['dashboardAnalyticsOrganisations'],
    queryFn: async () => {
      try {
        return await companiesDataService.loadOrganisations();
      } catch (error) {
        console.error('Erreur lors du chargement des organisations:', error);
        return [];
      }
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: participantsData = [], isLoading: participantsLoading } = useQuery({
    queryKey: ['dashboardAnalyticsParticipants'],
    queryFn: async () => {
      try {
        return await inscriptionsDataService.loadParticipants(['member', 'not_member', 'vip']);
      } catch (error) {
        console.error('Erreur lors du chargement des participants:', error);
        return [];
      }
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: rendezVousData = [], isLoading: rendezVousLoading } = useQuery({
    queryKey: ['dashboardAnalyticsRendezVous'],
    queryFn: async () => {
      try {
        return await networkingDataService.loadNetworkingRequests();
      } catch (error) {
        console.error('Erreur lors du chargement des rendez-vous:', error);
        return [];
      }
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const loading = organisationsLoading || participantsLoading || rendezVousLoading;
  const participants = participantsData;
  const organisations = organisationsData;
  const rendezVous = rendezVousData;

  // Query pour les données du graphique d'évolution des inscriptions
  const inscriptionsEvolutionQuery = useQuery({
    queryKey: ['dashboardAnalytics', 'inscriptionsEvolution', participants],
    queryFn: () => {
    // Regrouper par mois (YYYY-MM)
    const counts = new Map<string, number>();
    for (const p of participants) {
      const d = p.dateInscription ? new Date(p.dateInscription) : null;
      if (!d || isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    // Générer les 8 derniers mois
    const now = new Date();
    const months: string[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    const monthLabel = (key: string) => {
      const [y, m] = key.split('-');
      const d = new Date(Number(y), Number(m) - 1, 1);
      return d.toLocaleString(undefined, { month: 'short' });
    };
    let cumulative = 0;
    const data = months.map((key) => {
      const val = counts.get(key) || 0;
      cumulative += val;
      return { mois: monthLabel(key), inscriptions: cumulative, objectif: cumulative };
    });
    return data;
    },
    enabled: true,
    staleTime: 0,
  });

  const inscriptionsEvolution = inscriptionsEvolutionQuery.data ?? [];

  // Query pour la répartition par pays
  const topPaysQuery = useQuery({
    queryKey: ['dashboardAnalytics', 'topPays', participants],
    queryFn: () => {
    const paysData = participants.reduce((acc, p) => {
      const pays = p.pays || 'N/A';
      acc[pays] = (acc[pays] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(paysData)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 6)
      .map(([pays, count]) => ({ pays, participants: count as number }));
    },
    enabled: true,
    staleTime: 0,
  });

  const topPays = topPaysQuery.data ?? [];

  // Query pour la répartition par statut
  const statutChartDataQuery = useQuery({
    queryKey: ['dashboardAnalytics', 'statutChart', participants],
    queryFn: () => {
    const labels: Record<string, string> = {
      'membre': 'Membre',
      'non-membre': 'Non-membre',
      'vip': 'VIP',
      'speaker': 'Speaker'
    };
    const byStatus = participants.reduce((acc, p) => {
      acc[p.statut] = (acc[p.statut] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(byStatus).map(([statut, value]) => ({
      name: labels[statut] || statut,
      value: value as number,
    }));
    },
    enabled: true,
    staleTime: 0,
  });

  const statutChartData = statutChartDataQuery.data ?? [];

  const COLORS = ['#ea580c', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Query pour la répartition des organisations
  const orgByTypeQuery = useQuery({
    queryKey: ['dashboardAnalytics', 'orgByType', organisations],
    queryFn: () => ({
      membre: organisations.filter((o) => o.statut === 'membre').length,
      'non-membre': organisations.filter((o) => o.statut === 'non-membre').length,
      sponsor: organisations.filter((o) => o.statut === 'sponsor').length,
    }),
    enabled: true,
    staleTime: 0,
  });

  const orgByType = orgByTypeQuery.data ?? { membre: 0, 'non-membre': 0, sponsor: 0 };

  // Query pour les rendez-vous participants par statut
  const rdvParticipantsByStatutQuery = useQuery({
    queryKey: ['dashboardAnalytics', 'rdvParticipantsByStatut', rendezVous],
    queryFn: () => ({
      acceptee: rendezVous.filter((r) => r.type === 'participant' && r.statut === 'acceptée').length,
      enAttente: rendezVous.filter((r) => r.type === 'participant' && r.statut === 'en-attente').length,
      occupee: rendezVous.filter((r) => r.type === 'participant' && r.statut === 'occupée').length,
    }),
    enabled: true,
    staleTime: 0,
  });

  const rdvParticipantsByStatut = rdvParticipantsByStatutQuery.data ?? { acceptee: 0, enAttente: 0, occupee: 0 };

  // Query pour les rendez-vous sponsors par statut
  const rdvSponsorsByStatutQuery = useQuery({
    queryKey: ['dashboardAnalytics', 'rdvSponsorsByStatut', rendezVous],
    queryFn: () => ({
      acceptee: rendezVous.filter((r) => r.type === 'sponsor' && r.statut === 'acceptée').length,
      enAttente: rendezVous.filter((r) => r.type === 'sponsor' && r.statut === 'en-attente').length,
      occupee: rendezVous.filter((r) => r.type === 'sponsor' && r.statut === 'occupée').length,
    }),
    enabled: true,
    staleTime: 0,
  });

  const rdvSponsorsByStatut = rdvSponsorsByStatutQuery.data ?? { acceptee: 0, enAttente: 0, occupee: 0 };

  const comparisonData = {
    inscriptions: { actuel: participants.length, precedent: Math.max(participants.length - 20, 0), variation: 0 },
    organisations: { actuel: organisations.length, precedent: Math.max(organisations.length - 10, 0), variation: 0 },
    reservations: { actuel: 0, precedent: 0, variation: 0 },
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-56 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <Skeleton className="h-[360px] w-full" />
          <Skeleton className="h-[360px] w-full" />
          <Skeleton className="h-[420px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Analytics & Statistiques</h2>
        </div>
        <Badge className="bg-orange-100 text-orange-700 px-4 py-2">
          Mis à jour en temps réel
        </Badge>
      </div>

      {/* KPIs (sans comparaison) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl text-gray-900">{comparisonData.inscriptions.actuel}</p>
              <p className="text-sm text-gray-600">Participants</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl text-gray-900">{comparisonData.organisations.actuel}</p>
              <p className="text-sm text-gray-600">Organisations</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl text-gray-900">0</p>
              <p className="text-sm text-gray-600">Stands Réservés</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sections pleine largeur */}
      <div className="grid grid-cols-1 gap-6">
        {/* Évolution des inscriptions */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-100 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-gray-900">Évolution des inscriptions</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={inscriptionsEvolution}>
                <defs>
                  <linearGradient id="colorInscriptions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorObjectif" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="mois" 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px', fontWeight: '500' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px', fontWeight: '500' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', fontWeight: '500' }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="inscriptions"
                  stroke="#ea580c"
                  strokeWidth={3}
                  fill="url(#colorInscriptions)"
                  name="Inscriptions (cumul)"
                  dot={{ fill: '#ea580c', r: 4, strokeWidth: 2, stroke: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="objectif"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#colorObjectif)"
                  name="Objectif"
                  dot={{ fill: '#9ca3af', r: 3, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Répartition par pays */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-100 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600" />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-gray-900">Top 6 pays représentés</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPays}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="pays" 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px', fontWeight: '500' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px', fontWeight: '500' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                />
                <Bar 
                  dataKey="participants" 
                  fill="url(#barGradient)" 
                  radius={[10, 10, 0, 0]}
                  name="Participants"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Répartition par statut */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-100 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600" />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-gray-900">Répartition par statut</h3>
            </div>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient key={`gradient-${index}`} id={`statusGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1}/>
                        <stop offset="100%" stopColor={color} stopOpacity={0.8}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={statutChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={95}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {statutChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#statusGradient${index})`}
                        stroke="#fff"
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t-2 border-gray-100">
              {statutChartData.map((entry, index) => {
                const total = statutChartData.reduce((sum, item) => sum + item.value, 0);
                const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0';
                return (
                  <div key={entry.name} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-200 border border-gray-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-700 truncate">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm text-gray-900">{entry.value}</span>
                      <Badge className="text-xs bg-purple-100 text-purple-700">{percentage}%</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Statistiques détaillées */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Statistiques détaillées</h3>
          <div className="space-y-4">
            {/* Organisations */}
            {/* <div>
              <p className="text-sm text-gray-600 mb-2">Organisations par type</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Membres</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-600"
                        style={{
                          width: `${organisations.length > 0 ? (orgByType.membre / organisations.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-900 w-8">{orgByType.membre}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Non-membres</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{
                          width: `${organisations.length > 0 ? (orgByType['non-membre'] / organisations.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-900 w-8">{orgByType['non-membre']}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Sponsors</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-600"
                        style={{
                          width: `${organisations.length > 0 ? (orgByType.sponsor / organisations.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-900 w-8">{orgByType.sponsor}</span>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Rendez-vous Participants */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">RDV Participants</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-green-50 rounded">
                  <p className="text-lg text-green-700">{rdvParticipantsByStatut.acceptee}</p>
                  <p className="text-xs text-gray-600">Acceptés</p>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded">
                  <p className="text-lg text-orange-700">{rdvParticipantsByStatut.enAttente}</p>
                  <p className="text-xs text-gray-600">En attente</p>
                </div>
                <div className="text-center p-2 bg-red-50 rounded">
                  <p className="text-lg text-red-700">{rdvParticipantsByStatut.occupee}</p>
                  <p className="text-xs text-gray-600">Occupés</p>
                </div>
              </div>
            </div>

            {/* Rendez-vous Sponsors */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">RDV Sponsors</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-green-50 rounded">
                  <p className="text-lg text-green-700">{rdvSponsorsByStatut.acceptee}</p>
                  <p className="text-xs text-gray-600">Acceptés</p>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded">
                  <p className="text-lg text-orange-700">{rdvSponsorsByStatut.enAttente}</p>
                  <p className="text-xs text-gray-600">En attente</p>
                </div>
                <div className="text-center p-2 bg-red-50 rounded">
                  <p className="text-lg text-red-700">{rdvSponsorsByStatut.occupee}</p>
                  <p className="text-xs text-gray-600">Occupés</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

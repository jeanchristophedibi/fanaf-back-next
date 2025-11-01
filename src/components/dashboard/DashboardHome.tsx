import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, BarChart3, LineChart, AlertCircle, CheckCircle, XCircle, ScanLine } from 'lucide-react';
import { DashboardAnalytics } from '../DashboardAnalytics';
import { InscriptionsEvolutionChart } from '../InscriptionsEvolutionChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AgentMissionsSection } from './AgentMissionsSection';
import { InscriptionsSection } from './InscriptionsSection';
import { OrganisationsSection } from './OrganisationsSection';
import { NetworkingSection } from './NetworkingSection';
import { loadDashboardCounts } from '../data/DashboardData';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useFanafApi } from '../../hooks/useFanafApi';
import { LoaderOverlay } from '../ui/LoaderOverlay';

interface DashboardHomeProps {
  userProfile?: 'agence' | 'fanaf' | 'agent';
}

export function DashboardHome({ userProfile = 'agence' }: DashboardHomeProps = {}) {
  const [activeTab, setActiveTab] = useState('overview');

  // Check-in counters from API
  const { badgeScansCounters, fetchBadgeScansCounters } = useFanafApi({ autoFetch: false });

  const baseSegment = userProfile === 'agence' ? 'agence' : 'admin-fanaf';
  const baseInscriptionsPath = `/dashboard/${baseSegment}/inscriptions`;
  const baseOrganisationsPath = `/dashboard/${baseSegment}/organisations`;
  const baseNetworkingPath = `/dashboard/${baseSegment}/networking`;

  // Charger les données du dashboard avec React Query
  const { data: dashboardData, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['dashboardCounts', userProfile],
    queryFn: async () => {
      const { counts, data } = await loadDashboardCounts();
      // Fetch check-in counters in parallel (ignore errors silently)
      fetchBadgeScansCounters().catch((err) => {
        console.warn('[DashboardHome] Impossible de charger les badges scans counters:', err?.message || err);
      });
      return { counts, data };
    },
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 5 * 60 * 1000, // 5 minutes en cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const participants = dashboardData?.data.participants || [];
  const inscriptionsCounts = dashboardData?.counts.inscriptions || {
    membres: 0,
    nonMembres: 0,
    vip: 0,
    speakers: 0,
    enAttenteMembres: 0,
    enAttenteNonMembres: 0,
  };
  const organisationsCounts = dashboardData?.counts.organisations || {
    membres: 0,
    nonMembres: 0,
    sponsors: 0,
  };
  const networkingCounts = dashboardData?.counts.networking || {
    rdvSponsors: 0,
    rdvParticipants: 0,
  };
  const totals = dashboardData?.counts.totals || {
    participants: 0,
    organisations: 0,
    rendezVous: 0,
  };
  const error = queryError ? (queryError as Error).message || 'Erreur lors du chargement des données' : null;

  return (
    <div className="p-8 animate-page-enter">
      {(loading || error) && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-800">
              {loading ? 'Chargement des données depuis l\'API...' : 'Erreur lors du chargement des données API'}
            </p>
          </div>
          {loading && (
            <div className="text-sm text-blue-700 animate-pulse">Loading...</div>
          )}
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-100 rounded-lg p-1 shadow-inner animate-fade-in" style={{ animationDuration: '700ms' }}>
          <TabsTrigger value="overview" className="transition-all duration-300 hover:scale-[1.02] hover:bg-orange-50 focus:ring-2 focus:ring-orange-500 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            Vue d’ensemble
          </TabsTrigger>
          <TabsTrigger value="evolution" className="transition-all duration-300 hover:scale-[1.02] hover:bg-orange-50 focus:ring-2 focus:ring-orange-500 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <LineChart className="w-4 h-4 mr-2" />
            Évolution
          </TabsTrigger>
          <TabsTrigger value="analytics" className="transition-all duration-300 hover:scale-[1.02] hover:bg-orange-50 focus:ring-2 focus:ring-orange-500 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics avancé
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <div className="space-y-6">
              <div>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-72" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <>
              <div className="animate-fade-in">
                <h1 className="text-gray-900 mb-2">Tableau de bord</h1>
                <p className="text-gray-600">
                  {userProfile === 'agent' 
                    ? 'Finalisez les paiements et gérez les documents participants' 
                    : 'Vue d\'ensemble des statistiques de l\'événement'}
                </p>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Participants</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totals.participants}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total inscrits</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Inscriptions finalisées</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{inscriptionsCounts.membres + inscriptionsCounts.nonMembres} / {totals.participants}</div>
                    <p className="text-xs text-muted-foreground mt-1">Membres + Non-membres / Total inscrits</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Organisations</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totals.organisations}</div>
                    <p className="text-xs text-muted-foreground mt-1">Membres, non-membres et sponsors</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Rendez-vous</CardTitle>
                    <LineChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totals.rendezVous}</div>
                    <p className="text-xs text-muted-foreground mt-1">Participants et sponsors</p>
                  </CardContent>
                </Card>
              </div>

              

              {userProfile === 'agent' && (
                <AgentMissionsSection 
                  statsInscriptions={inscriptionsCounts}
                  participants={participants}
                />
              )}

              <InscriptionsSection statsInscriptions={inscriptionsCounts} basePath={baseInscriptionsPath} />

              <OrganisationsSection statsOrganisations={organisationsCounts} basePath={baseOrganisationsPath} />

              <NetworkingSection statsNetworking={networkingCounts} basePath={baseNetworkingPath} />

              {/* Check-in widgets (full width, last section) - Pas affiché pour le profil fanaf */}
              {userProfile !== 'fanaf' && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Check-in</CardTitle>
                      <ScanLine className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-gray-50">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-2xl text-gray-900">{badgeScansCounters?.counts?.total ?? '-'}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-50">
                          <p className="text-xs text-green-700">Succès</p>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <p className="text-xl text-green-900">{badgeScansCounters?.counts?.success ?? '-'}</p>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-red-50">
                          <p className="text-xs text-red-700">Échecs</p>
                          <div className="flex items-center gap-1">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <p className="text-xl text-red-900">{badgeScansCounters?.counts?.failed ?? '-'}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Derniers scans (succès)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {badgeScansCounters?.groups?.success?.slice(0, 8).map((scan: any) => (
                          <div key={scan.id} className="flex items-center justify-between text-sm border-b last:border-b-0 py-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="text-gray-900 truncate">User #{scan.user_id}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-500">
                              <span className="hidden sm:inline truncate max-w-[140px]">Reg #{scan.registration_id}</span>
                              <span className="truncate max-w-[160px]">{new Date(scan.scan_at).toLocaleString('fr-FR')}</span>
                            </div>
                          </div>
                        )) || (
                          <div className="text-sm text-gray-500">Aucun scan récent</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="evolution">
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <InscriptionsEvolutionChart />
          )}
        </TabsContent>

        <TabsContent value="analytics">
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <DashboardAnalytics />
          )}
        </TabsContent>
      </Tabs>
      <LoaderOverlay isLoading={loading} message="Chargement du tableau de bord..." subMessage="Récupération des données en cours" />
    </div>
  );
}

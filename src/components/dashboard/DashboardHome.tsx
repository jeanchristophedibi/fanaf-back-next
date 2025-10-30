import React, { useEffect, useState } from 'react';
import { Users, BarChart3, LineChart, AlertCircle } from 'lucide-react';
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

interface DashboardHomeProps {
  userProfile?: 'agence' | 'fanaf' | 'agent';
}

export function DashboardHome({ userProfile = 'agence' }: DashboardHomeProps = {}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [participants, setParticipants] = useState<any[]>([]);
  const [inscriptionsCounts, setInscriptionsCounts] = useState({
    membres: 0,
    nonMembres: 0,
    vip: 0,
    speakers: 0,
    enAttenteMembres: 0,
    enAttenteNonMembres: 0,
  });
  const [organisationsCounts, setOrganisationsCounts] = useState({
    membres: 0,
    nonMembres: 0,
    sponsors: 0,
  });
  const [networkingCounts, setNetworkingCounts] = useState({
    rdvSponsors: 0,
    rdvParticipants: 0,
  });
  const [totals, setTotals] = useState({
    participants: 0,
    organisations: 0,
    rendezVous: 0,
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { counts, data } = await loadDashboardCounts();
        if (!mounted) return;
        setParticipants(data.participants);
        setInscriptionsCounts(counts.inscriptions);
        setOrganisationsCounts(counts.organisations);
        setNetworkingCounts(counts.networking);
        setTotals(counts.totals);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Erreur lors du chargement des données');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

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
                    <div className="text-2xl font-bold">{inscriptionsCounts.membres + inscriptionsCounts.nonMembres}</div>
                    <p className="text-xs text-muted-foreground mt-1">Membres + Non-membres</p>
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

              <InscriptionsSection statsInscriptions={inscriptionsCounts} />

              <OrganisationsSection statsOrganisations={organisationsCounts} />

              <NetworkingSection statsNetworking={networkingCounts} />
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
    </div>
  );
}

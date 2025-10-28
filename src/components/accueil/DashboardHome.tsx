import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, UserCheck, Award, Mic, Building2, Calendar, Handshake, TrendingUp, BarChart3, LineChart, CreditCard, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useDynamicInscriptions } from '../hooks/useDynamicInscriptions';
import { useApi } from '../../hooks/useApi';
import { DashboardAnalytics } from '../DashboardAnalytics';
import { InscriptionsEvolutionChart } from '../InscriptionsEvolutionChart';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AnimatedStat } from '../AnimatedStat';

interface DashboardHomeProps {
  userProfile?: 'agence' | 'fanaf' | 'agent';
}

export function DashboardHome({ userProfile = 'agence' }: DashboardHomeProps = {}) {
  // Hook API pour charger les données depuis Supabase
  const { 
    participants: participantsApi, 
    organisations: organisationsApi, 
    loading: apiLoading,
    error: apiError 
  } = useApi();
  
  // Hook mock pour données de fallback et autres données (rendezVous)
  const { 
    participants: participantsMock, 
    organisations: organisationsMock, 
    rendezVous, 
    reservations 
  } = useDynamicInscriptions({ 
    includeOrganisations: true, 
    includeRendezVous: true, 
    includeReservations: false // Désactivé car la rubrique stand a été retirée
  });
  
  // Utiliser les données de l'API si disponibles, sinon fallback sur mock
  const participants = participantsApi.length > 0 ? participantsApi : participantsMock;
  const organisations = organisationsApi.length > 0 ? organisationsApi : organisationsMock;
  
  const [activeTab, setActiveTab] = useState('overview');
  const [useMockData, setUseMockData] = useState(false);

  // Statistiques Inscriptions (dynamiques)
  const statsInscriptions = {
    membres: participants.filter(p => p.statut === 'membre' && p.statutInscription === 'finalisée').length,
    nonMembres: participants.filter(p => p.statut === 'non-membre' && p.statutInscription === 'finalisée').length,
    vip: participants.filter(p => p.statut === 'vip').length,
    speakers: participants.filter(p => p.statut === 'speaker').length,
    enAttenteMembres: participants.filter(p => p.statut === 'membre' && p.statutInscription === 'non-finalisée').length,
    enAttenteNonMembres: participants.filter(p => p.statut === 'non-membre' && p.statutInscription === 'non-finalisée').length,
  };

  // Section Réservations de Stand retirée car cette rubrique a été supprimée

  // Statistiques Organisations (dynamiques)
  const statsOrganisations = {
    membres: organisations.filter(o => o.statut === 'membre').length,
    nonMembres: organisations.filter(o => o.statut === 'non-membre').length,
    sponsors: organisations.filter(o => o.statut === 'sponsor').length,
  };

  // Statistiques Networking (dynamiques)
  const statsNetworking = {
    rdvSponsors: rendezVous.filter(r => r.type === 'sponsor').length,
    rdvParticipants: rendezVous.filter(r => r.type === 'participant').length,
  };

  return (
    <div className="p-8 animate-page-enter">
      {/* Indicateur de source de données - Masqué en mode mock */}
      {false && (apiLoading || participantsApi.length === 0) && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-800">
              {apiLoading ? 'Chargement des données depuis Supabase...' : 'Données mockées (API non disponible)'}
            </p>
          </div>
          {apiLoading && (
            <div className="text-sm text-blue-700 animate-pulse">Loading...</div>
          )}
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="overview" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="evolution" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <LineChart className="w-4 h-4 mr-2" />
            Évolution
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics avancé
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="animate-fade-in">
            <h1 className="text-gray-900 mb-2">Tableau de bord</h1>
            <p className="text-gray-600">
              {userProfile === 'agent' 
                ? 'Finalisez les paiements et gérez les documents participants' 
                : 'Vue d\'ensemble des statistiques de l\'événement'}
            </p>
          </div>

      {/* Section spécifique Agent FANAF */}
      {userProfile === 'agent' && (
        <div className="mb-8 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl animate-slide-up shadow-sm hover:shadow-md transition-shadow duration-300">
          <h2 className="text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Mes missions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-hover cursor-pointer border-orange-200 bg-gradient-to-br from-orange-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-gray-600">Paiements en attente</CardTitle>
                <div className="bg-orange-600 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <AnimatedStat 
                  value={statsInscriptions.enAttenteMembres + statsInscriptions.enAttenteNonMembres}
                  className="text-gray-900"
                />
                <p className="text-xs text-orange-600 mt-1">
                  {statsInscriptions.enAttenteMembres} membres + {statsInscriptions.enAttenteNonMembres} non-membres
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover cursor-pointer border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-gray-600">Paiements finalisés</CardTitle>
                <div className="bg-green-600 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <AnimatedStat 
                  value={statsInscriptions.membres + statsInscriptions.nonMembres + statsInscriptions.vip + statsInscriptions.speakers}
                  className="text-gray-900"
                />
                <p className="text-xs text-green-600 mt-1">Documents disponibles</p>
              </CardContent>
            </Card>

            <Card className="card-hover cursor-pointer border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-gray-600">Badges générés</CardTitle>
                <div className="bg-purple-600 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
                  <FileText className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <AnimatedStat 
                  value={participants.filter(p => p.statutInscription === 'finalisée' && p.badgeGenere).length}
                  className="text-gray-900"
                />
                <p className="text-xs text-purple-600 mt-1">Sur {participants.filter(p => p.statutInscription === 'finalisée').length} finalisés</p>
              </CardContent>
            </Card>

            <Card className="card-hover cursor-pointer border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-gray-600">Revenus collectés</CardTitle>
                <div className="bg-blue-600 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-gray-900">
                  {((statsInscriptions.membres * 350000) + (statsInscriptions.nonMembres * 400000)).toLocaleString()} 
                </div>
                <p className="text-xs text-blue-600 mt-1">FCFA</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Section Inscriptions */}
      <div className="mb-8 p-6 section-inscriptions rounded-xl animate-slide-up shadow-sm hover:shadow-md transition-shadow duration-300">
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Inscriptions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="card-hover cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Total</CardTitle>
              <div className="bg-blue-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
                <Users className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <AnimatedStat 
                value={statsInscriptions.membres + statsInscriptions.nonMembres + statsInscriptions.vip + statsInscriptions.speakers}
                className="text-gray-900"
              />
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Membres</CardTitle>
              <div className="bg-green-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
                <UserCheck className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <AnimatedStat value={statsInscriptions.membres} className="text-gray-900" />
              {statsInscriptions.enAttenteMembres > 0 && (
                <p className="text-xs text-orange-600 mt-1">+{statsInscriptions.enAttenteMembres} en attente</p>
              )}
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Non-Membres</CardTitle>
              <div className="bg-gray-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
                <Users className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <AnimatedStat value={statsInscriptions.nonMembres} className="text-gray-900" />
              {statsInscriptions.enAttenteNonMembres > 0 && (
                <p className="text-xs text-orange-600 mt-1">+{statsInscriptions.enAttenteNonMembres} en attente</p>
              )}
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">VIP</CardTitle>
              <div className="bg-purple-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
                <Award className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <AnimatedStat value={statsInscriptions.vip} className="text-gray-900" />
              <p className="text-xs text-purple-600 mt-1">Exonéré</p>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Speakers</CardTitle>
              <div className="bg-orange-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
                <Mic className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <AnimatedStat value={statsInscriptions.speakers} className="text-gray-900" />
              <p className="text-xs text-orange-600 mt-1">Exonéré</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section Réservations de Stand retirée car cette rubrique a été supprimée */}

      {/* Section Organisations */}
      <div className="mb-8 p-6 section-organisations rounded-xl animate-slide-up shadow-sm hover:shadow-md transition-shadow duration-300" style={{ animationDelay: '200ms' }}>
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Organisations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-hover cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Total</CardTitle>
              <div className="bg-blue-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
                <Building2 className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">{statsOrganisations.membres + statsOrganisations.nonMembres + statsOrganisations.sponsors}</div>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Membres</CardTitle>
              <div className="bg-green-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
                <Building2 className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">{statsOrganisations.membres}</div>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Non-Membres</CardTitle>
              <div className="bg-gray-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
                <Building2 className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">{statsOrganisations.nonMembres}</div>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Sponsors</CardTitle>
              <div className="bg-orange-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
                <Building2 className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">{statsOrganisations.sponsors}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section Networking */}
      <div className="p-6 section-networking rounded-xl animate-slide-up shadow-sm hover:shadow-md transition-shadow duration-300" style={{ animationDelay: '300ms' }}>
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <Handshake className="w-5 h-5" />
          Networking
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-hover cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Total RDV</CardTitle>
              <div className="bg-purple-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
                <Calendar className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">{statsNetworking.rdvSponsors + statsNetworking.rdvParticipants}</div>
              <p className="text-xs text-gray-500 mt-1">Rendez-vous programmés</p>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">RDV Participants</CardTitle>
              <div className="bg-blue-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
                <Users className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">{statsNetworking.rdvParticipants}</div>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">RDV Sponsors</CardTitle>
              <div className="bg-orange-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
                <Building2 className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">{statsNetworking.rdvSponsors}</div>
            </CardContent>
          </Card>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="evolution">
          <InscriptionsEvolutionChart />
        </TabsContent>

        <TabsContent value="analytics">
          <DashboardAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

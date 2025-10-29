import React, { useState } from 'react';
import { Users, BarChart3, LineChart, AlertCircle } from 'lucide-react';
import { useDynamicInscriptions } from '../hooks/useDynamicInscriptions';
import { useApi } from '../../hooks/useApi';
import { DashboardAnalytics } from '../DashboardAnalytics';
import { InscriptionsEvolutionChart } from '../InscriptionsEvolutionChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AgentMissionsSection } from './AgentMissionsSection';
import { InscriptionsSection } from './InscriptionsSection';
import { OrganisationsSection } from './OrganisationsSection';
import { NetworkingSection } from './NetworkingSection';

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
        <AgentMissionsSection 
          statsInscriptions={statsInscriptions}
          participants={participants}
        />
      )}

      {/* Section Inscriptions */}
      <InscriptionsSection statsInscriptions={statsInscriptions} />

      {/* Section Organisations */}
      <OrganisationsSection statsOrganisations={statsOrganisations} />

      {/* Section Networking */}
      <NetworkingSection statsNetworking={statsNetworking} />

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

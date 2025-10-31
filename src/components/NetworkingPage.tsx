import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from './ui/button';
import { List, CalendarDays } from 'lucide-react';
import type { RendezVous } from './data/types';
import { networkingDataService } from './data/networkingData';
import { CalendarView } from './networking/CalendarView';
import { WidgetNetworking } from './networking/WidgetNetworking';
import { ListeNetworking } from './networking/ListeNetworking';

export type NetworkingSubSection = 'participant' | 'sponsor' | 'liste' | 'historique';

interface NetworkingPageProps {
  subSection?: NetworkingSubSection;
  filter?: 'all' | 'participant' | 'sponsor' | 'liste';
  readOnly?: boolean;
}

export function NetworkingPage({ subSection, filter, readOnly = false }: NetworkingPageProps) {
  const activeFilter = filter || subSection;
  const [statutFilter, setStatutFilter] = useState<string>('tous');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  // Charger tous les rendez-vous via React Query - partage le cache avec les autres composants
  const { data: allRendezVous = [], isLoading } = useQuery({
    queryKey: ['networkingRequests'],
    queryFn: async () => {
      return await networkingDataService.loadNetworkingRequests();
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Filtrer les rendez-vous côté client
  const rendezVousData = (() => {
    if (activeFilter === 'participant') {
      return allRendezVous.filter(r => r.type === 'participant');
    } else if (activeFilter === 'sponsor') {
      return allRendezVous.filter(r => r.type === 'sponsor');
    }
    return allRendezVous;
  })();

  // Rendez-vous pour la vue calendrier - affiche toujours les rendez-vous acceptés + les filtres actifs
  const calendarRendezVous = (() => {
    let filtered = [...rendezVousData];

    // Filtre par sous-section (type)
    if (activeFilter === 'participant') {
      filtered = filtered.filter(r => r.type === 'participant');
    } else if (activeFilter === 'sponsor') {
      filtered = filtered.filter(r => r.type === 'sponsor');
    }

    // Pour le calendrier, on montre toujours les rendez-vous acceptés
    // Si un filtre de statut est appliqué, on l'applique aussi mais on garde toujours les acceptés
    if (statutFilter !== 'tous') {
      filtered = filtered.filter(r => r.statut === statutFilter || r.statut === 'acceptée');
    }

    return filtered;
  })();

  const getTitle = () => {
    switch (activeFilter) {
      case 'liste':
      case 'all':
        return 'Liste des rendez-vous';
      case 'participant':
        return 'Rendez-vous participant';
      case 'sponsor':
        return 'Rendez-vous sponsor';
      default:
        return 'Liste des rendez-vous';
    }
  };

  return (
    <div className="p-8 animate-page-enter">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">{getTitle()}</h1>
      </div>

      {/* Tableau de bord pour la vue liste */}
      {(activeFilter === 'liste' || activeFilter === 'all' || !activeFilter) && (
        <WidgetNetworking />
      )}

      <div className="flex items-center justify-end gap-2 mb-4">
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('table')}
          className={viewMode === 'table' ? 'bg-orange-600 hover:bg-orange-700' : ''}
        >
          <List className="w-4 h-4 mr-2" />
          Liste
        </Button>
        <Button
          variant={viewMode === 'calendar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('calendar')}
          className={viewMode === 'calendar' ? 'bg-orange-600 hover:bg-orange-700' : ''}
        >
          <CalendarDays className="w-4 h-4 mr-2" />
          Calendrier
        </Button>
      </div>

      {viewMode === 'calendar' ? (
        <CalendarView rendezVous={calendarRendezVous} readOnly={readOnly} activeFilter={activeFilter} />
      ) : (
        <ListeNetworking 
          activeFilter={activeFilter === 'historique' ? 'all' : activeFilter}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}

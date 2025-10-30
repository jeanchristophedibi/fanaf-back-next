"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Eye, Clock, User, Send, Inbox, FileText, Download } from 'lucide-react';
import { getOrganisationById } from './data/mockData';
import { useDynamicInscriptions } from './hooks/useDynamicInscriptions';
import { useFanafApi } from '../hooks/useFanafApi';
import { getApiRequestsArray, normalizeStatus, extractRequester, extractReceiver, extractOrganisationName } from './data/networkingRecap';
import { AnimatedStat } from './AnimatedStat';
import { HistoriqueRendezVousDialog } from './HistoriqueRendezVousDialog';
import { List, type Column, type RowAction, type ListAction } from './list/List';

interface ParticipantWithStats {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  organisationId: string;
  organisationName?: string;
  rendezVousEnvoyes: number;
  rendezVousRecus: number;
  totalRendezVous: number;
  statsEnvoyes: {
    acceptee: number;
    enAttente: number;
    occupee: number;
  };
  statsRecus: {
    acceptee: number;
    enAttente: number;
    occupee: number;
  };
  _searchText?: string; // Pour la recherche
}

export function HistoriqueDemandesPage() {
  const { participants, rendezVous: rendezVousData } = useDynamicInscriptions({ includeRendezVous: true });
  // Networking depuis l'API
  const { networkingRequests, fetchNetworkingRequests } = useFanafApi({ autoFetch: false });
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [isHistoriqueOpen, setIsHistoriqueOpen] = useState(false);

  useEffect(() => {
    fetchNetworkingRequests();
  }, [fetchNetworkingRequests]);

  // Calculer les statistiques pour chaque participant avec texte de recherche
  const participantsWithStats = useMemo(() => {
    // Si des données networking sont disponibles depuis l'API, les utiliser en priorité
    const apiRequests: any[] = getApiRequestsArray(networkingRequests);

    if (apiRequests.length > 0) {
      // Construire un index par participant (demandeur et destinataire)
      const statsByUser: Record<string, ParticipantWithStats> = {};

      const upsertUser = (u: any) => {
        const id = u?.id?.toString() || u?.user_id?.toString();
        if (!id) return null;
        if (!statsByUser[id]) {
          statsByUser[id] = {
            id,
            nom: u?.name || u?.nom || '',
            prenom: u?.prenom || '',
            email: u?.email || '',
            organisationId: u?.organisation_id?.toString?.() || u?.organisationId || '',
            organisationName: extractOrganisationName(u),
            rendezVousEnvoyes: 0,
            rendezVousRecus: 0,
            totalRendezVous: 0,
            statsEnvoyes: { acceptee: 0, enAttente: 0, occupee: 0 },
            statsRecus: { acceptee: 0, enAttente: 0, occupee: 0 },
          };
        }
        return statsByUser[id];
      };

      apiRequests.forEach((req) => {
        const requester = extractRequester(req);
        const receiver = extractReceiver(req);
        const status = normalizeStatus(req.status || req.statut);

        const reqUser = upsertUser(requester);
        if (reqUser) {
          reqUser.rendezVousEnvoyes += 1;
          reqUser.totalRendezVous += 1;
          if (status === 'acceptée') reqUser.statsEnvoyes.acceptee += 1;
          else if (status === 'en-attente') reqUser.statsEnvoyes.enAttente += 1;
          else if (status === 'occupée') reqUser.statsEnvoyes.occupee += 1;
        }

        const recUser = upsertUser(receiver);
        if (recUser) {
          recUser.rendezVousRecus += 1;
          recUser.totalRendezVous += 1;
          if (status === 'acceptée') recUser.statsRecus.acceptee += 1;
          else if (status === 'en-attente') recUser.statsRecus.enAttente += 1;
          else if (status === 'occupée') recUser.statsRecus.occupee += 1;
        }
      });

      return Object.values(statsByUser).map((p) => {
        const organisation = p.organisationName ? null : getOrganisationById(p.organisationId);
        return {
          ...p,
          _searchText: `${p.nom} ${p.prenom} ${p.email} ${p.organisationName || organisation?.nom || ''}`.toLowerCase(),
        } as ParticipantWithStats;
      });
    }

    // Fallback: ancienne logique locale
    return participants.map(participant => {
      const rendezVousEnvoyes = rendezVousData.filter(rdv => rdv.demandeurId === participant.id);
      const rendezVousRecus = rendezVousData.filter(rdv => rdv.recepteurId === participant.id);
      const totalRendezVous = rendezVousEnvoyes.length + rendezVousRecus.length;

      const statsEnvoyes = {
        acceptee: rendezVousEnvoyes.filter(rdv => rdv.statut === 'acceptée').length,
        enAttente: rendezVousEnvoyes.filter(rdv => rdv.statut === 'en-attente').length,
        occupee: rendezVousEnvoyes.filter(rdv => rdv.statut === 'occupée').length,
      };

      const statsRecus = {
        acceptee: rendezVousRecus.filter(rdv => rdv.statut === 'acceptée').length,
        enAttente: rendezVousRecus.filter(rdv => rdv.statut === 'en-attente').length,
        occupee: rendezVousRecus.filter(rdv => rdv.statut === 'occupée').length,
      };

      const organisation = getOrganisationById(participant.organisationId);
      const searchText = `${participant.nom} ${participant.prenom} ${participant.email} ${organisation?.nom || ''}`.toLowerCase();

      return {
        ...participant,
        rendezVousEnvoyes: rendezVousEnvoyes.length,
        rendezVousRecus: rendezVousRecus.length,
        totalRendezVous,
        statsEnvoyes,
        statsRecus,
        _searchText: searchText,
      } as ParticipantWithStats;
    });
  }, [participants, rendezVousData, networkingRequests]);

  // Statistiques globales
  const stats = useMemo(() => {
    const apiRequests: any[] = getApiRequestsArray(networkingRequests);

    const source = apiRequests.length > 0 ? apiRequests : rendezVousData;

    const totalDemandes = source.length;
    const demandesAcceptees = source.filter((rdv: any) => normalizeStatus(rdv.status || rdv.statut) === 'acceptée').length;
    const demandesEnAttente = source.filter((rdv: any) => normalizeStatus(rdv.status || rdv.statut) === 'en-attente').length;
    const demandesOccupees = source.filter((rdv: any) => normalizeStatus(rdv.status || rdv.statut) === 'occupée').length;

    return {
      totalDemandes,
      demandesAcceptees,
      demandesEnAttente,
      demandesOccupees,
      participantsActifs: participantsWithStats.filter(p => p.totalRendezVous > 0).length,
    };
  }, [rendezVousData, participantsWithStats, networkingRequests]);

  const handleViewHistorique = (participantId: string) => {
    setSelectedParticipantId(participantId);
    setIsHistoriqueOpen(true);
  };

  // Colonnes pour le composant List
  const columns: Column<ParticipantWithStats>[] = [
    {
      key: 'participant',
      header: 'Participant',
      sortable: true,
      sortKey: 'nom',
      render: (p) => (
        <div>
          <p className="text-gray-900">{p.prenom} {p.nom}</p>
          <p className="text-xs text-gray-500">{p.email}</p>
        </div>
      ),
    },
    {
      key: 'organisation',
      header: 'Organisation',
      sortable: true,
      render: (p) => {
        if (p.organisationName) {
          return <span className="text-gray-600">{p.organisationName}</span>;
        }
        const organisation = getOrganisationById(p.organisationId);
        return <span className="text-gray-600">{organisation?.nom || 'N/A'}</span>;
      },
    },
    {
      key: 'envoyees',
      header: 'Envoyées',
      sortable: true,
      render: (p) => (
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Send className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">{p.rendezVousEnvoyes}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'recues',
      header: 'Reçues',
      sortable: true,
      render: (p) => (
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Inbox className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">{p.rendezVousRecus}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      render: (p) => (
        <div className="text-center">
          <Badge className="bg-blue-100 text-blue-800">
            {p.totalRendezVous}
          </Badge>
        </div>
      ),
    },
    {
      key: 'statutEnvoyees',
      header: 'Statut Envoyées',
      render: (p) => (
        <div className="flex gap-1">
          {p.statsEnvoyes.acceptee > 0 && (
            <Badge className="bg-green-100 text-green-700 text-xs">
              {p.statsEnvoyes.acceptee} ✓
            </Badge>
          )}
          {p.statsEnvoyes.enAttente > 0 && (
            <Badge className="bg-orange-100 text-orange-700 text-xs">
              {p.statsEnvoyes.enAttente} ⏳
            </Badge>
          )}
          {p.statsEnvoyes.occupee > 0 && (
            <Badge className="bg-red-100 text-red-700 text-xs">
              {p.statsEnvoyes.occupee} ✗
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'statutRecues',
      header: 'Statut Reçues',
      render: (p) => (
        <div className="flex gap-1">
          {p.statsRecus.acceptee > 0 && (
            <Badge className="bg-green-100 text-green-700 text-xs">
              {p.statsRecus.acceptee} ✓
            </Badge>
          )}
          {p.statsRecus.enAttente > 0 && (
            <Badge className="bg-orange-100 text-orange-700 text-xs">
              {p.statsRecus.enAttente} ⏳
            </Badge>
          )}
          {p.statsRecus.occupee > 0 && (
            <Badge className="bg-red-100 text-red-700 text-xs">
              {p.statsRecus.occupee} ✗
            </Badge>
          )}
        </div>
      ),
    },
  ];

  // Pas d'actions par ligne dans le récap

  // Actions en masse
  const buildActions: ListAction<ParticipantWithStats>[] = [
    {
      label: 'Exporter les sélectionnés',
      icon: <Download className="w-4 h-4" />,
      onClick: (selectedItems: ParticipantWithStats[]) => {
        const csvContent = [
          exportHeaders.join(','),
          ...selectedItems.map(exportData).map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historique-demandes-selectionnes-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      variant: 'outline',
    },
  ];

  // Export CSV
  const exportHeaders = ['Participant', 'Email', 'Organisation', 'Demandes Envoyées', 'Demandes Reçues', 'Total', 'Acceptées (E)', 'En Attente (E)', 'Occupées (E)', 'Acceptées (R)', 'En Attente (R)', 'Occupées (R)'];
  const exportData = (p: ParticipantWithStats) => {
        const organisation = getOrganisationById(p.organisationId);
        return [
          `${p.prenom} ${p.nom}`,
          p.email,
          organisation?.nom || '',
      String(p.rendezVousEnvoyes),
      String(p.rendezVousRecus),
      String(p.totalRendezVous),
      String(p.statsEnvoyes.acceptee),
      String(p.statsEnvoyes.enAttente),
      String(p.statsEnvoyes.occupee),
      String(p.statsRecus.acceptee),
      String(p.statsRecus.enAttente),
      String(p.statsRecus.occupee),
    ];
  };

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl text-gray-900">Historique des Demandes</h2>
        <p className="text-sm text-gray-500">
          Vue d'ensemble de toutes les demandes de rendez-vous par participant
        </p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Demandes</p>
                <AnimatedStat value={stats.totalDemandes} />
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Acceptées</p>
                <AnimatedStat value={stats.demandesAcceptees} />
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En Attente</p>
                <AnimatedStat value={stats.demandesEnAttente} />
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Occupées</p>
                <AnimatedStat value={stats.demandesOccupees} />
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Inbox className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Participants Actifs</p>
                <AnimatedStat value={stats.participantsActifs} />
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des participants avec List */}
      <List
        data={participantsWithStats}
        columns={columns}
        getRowId={(p) => p.id}
        searchPlaceholder="Rechercher un participant..."
        searchKeys={['_searchText', 'nom', 'prenom', 'email']}
        filterTitle="Récap des demandes"
        exportFilename={`historique-demandes-fanaf-2026-${new Date().toISOString().split('T')[0]}`}
        exportHeaders={exportHeaders}
        exportData={exportData}
        itemsPerPage={10}
        readOnly={true}
        enableSelection={true}
        buildActions={buildActions}
        emptyMessage="Aucun participant trouvé"
      />

      {/* Dialog de l'historique */}
      {selectedParticipantId && (
        <HistoriqueRendezVousDialog
          isOpen={isHistoriqueOpen}
          onClose={() => {
            setIsHistoriqueOpen(false);
            setSelectedParticipantId(null);
          }}
          participantId={selectedParticipantId}
          rendezVousList={(getApiRequestsArray(networkingRequests).length > 0 ? getApiRequestsArray(networkingRequests) : rendezVousData) as any}
        />
      )}
    </div>
  );
}

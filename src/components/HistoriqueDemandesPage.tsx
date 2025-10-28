import React, { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Search, Download, Eye, Calendar, Clock, User, Building2, Send, Inbox, FileText } from 'lucide-react';
import { getParticipantById, getReferentSponsor, getOrganisationById } from './data/mockData';
import { useDynamicInscriptions } from './hooks/useDynamicInscriptions';
import { AnimatedStat } from './AnimatedStat';
import { HistoriqueRendezVousDialog } from './HistoriqueRendezVousDialog';
import { toast } from 'sonner';

const statutRdvColors: Record<string, string> = {
  'acceptée': 'bg-green-100 text-green-800',
  'en-attente': 'bg-orange-100 text-orange-800',
  'occupée': 'bg-red-100 text-red-800',
};

export function HistoriqueDemandesPage() {
  const { participants, rendezVous: rendezVousData } = useDynamicInscriptions({ includeRendezVous: true });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [isHistoriqueOpen, setIsHistoriqueOpen] = useState(false);

  // Calculer les statistiques pour chaque participant
  const participantsWithStats = useMemo(() => {
    return participants.map(participant => {
      const rendezVousEnvoyes = rendezVousData.filter(rdv => rdv.demandeurId === participant.id);
      const rendezVousRecus = rendezVousData.filter(rdv => rdv.recepteurId === participant.id);
      const totalRendezVous = rendezVousEnvoyes.length + rendezVousRecus.length;

      // Compter par statut
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

      return {
        ...participant,
        rendezVousEnvoyes: rendezVousEnvoyes.length,
        rendezVousRecus: rendezVousRecus.length,
        totalRendezVous,
        statsEnvoyes,
        statsRecus,
      };
    });
  }, [participants, rendezVousData]);

  // Filtrer par recherche
  const filteredParticipants = useMemo(() => {
    if (!searchTerm) return participantsWithStats;

    const lowerSearch = searchTerm.toLowerCase();
    return participantsWithStats.filter(p => {
      const organisation = getOrganisationById(p.organisationId);
      return (
        p.nom.toLowerCase().includes(lowerSearch) ||
        p.prenom.toLowerCase().includes(lowerSearch) ||
        p.email.toLowerCase().includes(lowerSearch) ||
        organisation?.nom.toLowerCase().includes(lowerSearch)
      );
    });
  }, [participantsWithStats, searchTerm]);

  // Statistiques globales
  const stats = useMemo(() => {
    const totalDemandes = rendezVousData.length;
    const demandesAcceptees = rendezVousData.filter(rdv => rdv.statut === 'acceptée').length;
    const demandesEnAttente = rendezVousData.filter(rdv => rdv.statut === 'en-attente').length;
    const demandesOccupees = rendezVousData.filter(rdv => rdv.statut === 'occupée').length;

    return {
      totalDemandes,
      demandesAcceptees,
      demandesEnAttente,
      demandesOccupees,
      participantsActifs: participantsWithStats.filter(p => p.totalRendezVous > 0).length,
    };
  }, [rendezVousData, participantsWithStats]);

  const handleViewHistorique = (participantId: string) => {
    setSelectedParticipantId(participantId);
    setIsHistoriqueOpen(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['Participant', 'Email', 'Organisation', 'Demandes Envoyées', 'Demandes Reçues', 'Total', 'Acceptées (E)', 'En Attente (E)', 'Occupées (E)', 'Acceptées (R)', 'En Attente (R)', 'Occupées (R)'].join(','),
      ...filteredParticipants.map(p => {
        const organisation = getOrganisationById(p.organisationId);
        return [
          `${p.prenom} ${p.nom}`,
          p.email,
          organisation?.nom || '',
          p.rendezVousEnvoyes,
          p.rendezVousRecus,
          p.totalRendezVous,
          p.statsEnvoyes.acceptee,
          p.statsEnvoyes.enAttente,
          p.statsEnvoyes.occupee,
          p.statsRecus.acceptee,
          p.statsRecus.enAttente,
          p.statsRecus.occupee,
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historique-demandes-fanaf-2026-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Historique des demandes exporté avec succès');
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

      {/* Barre de recherche et export */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un participant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleExport}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des participants */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Organisation</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Send className="w-4 h-4" />
                      Envoyées
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Inbox className="w-4 h-4" />
                      Reçues
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead>Statut Envoyées</TableHead>
                  <TableHead>Statut Reçues</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      Aucun participant trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParticipants.map((participant) => {
                    const organisation = getOrganisationById(participant.organisationId);
                    
                    return (
                      <TableRow key={participant.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="text-gray-900">{participant.prenom} {participant.nom}</p>
                            <p className="text-xs text-gray-500">{participant.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{organisation?.nom || 'N/A'}</TableCell>
                        <TableCell className="text-center">
                          <span className="text-gray-900">{participant.rendezVousEnvoyes}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-gray-900">{participant.rendezVousRecus}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-blue-100 text-blue-800">
                            {participant.totalRendezVous}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {participant.statsEnvoyes.acceptee > 0 && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                {participant.statsEnvoyes.acceptee} ✓
                              </Badge>
                            )}
                            {participant.statsEnvoyes.enAttente > 0 && (
                              <Badge className="bg-orange-100 text-orange-700 text-xs">
                                {participant.statsEnvoyes.enAttente} ⏳
                              </Badge>
                            )}
                            {participant.statsEnvoyes.occupee > 0 && (
                              <Badge className="bg-red-100 text-red-700 text-xs">
                                {participant.statsEnvoyes.occupee} ✗
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {participant.statsRecus.acceptee > 0 && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                {participant.statsRecus.acceptee} ✓
                              </Badge>
                            )}
                            {participant.statsRecus.enAttente > 0 && (
                              <Badge className="bg-orange-100 text-orange-700 text-xs">
                                {participant.statsRecus.enAttente} ⏳
                              </Badge>
                            )}
                            {participant.statsRecus.occupee > 0 && (
                              <Badge className="bg-red-100 text-red-700 text-xs">
                                {participant.statsRecus.occupee} ✗
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewHistorique(participant.id)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            disabled={participant.totalRendezVous === 0}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de l'historique */}
      {selectedParticipantId && (
        <HistoriqueRendezVousDialog
          isOpen={isHistoriqueOpen}
          onClose={() => {
            setIsHistoriqueOpen(false);
            setSelectedParticipantId(null);
          }}
          participantId={selectedParticipantId}
          rendezVousList={rendezVousData}
        />
      )}
    </div>
  );
}

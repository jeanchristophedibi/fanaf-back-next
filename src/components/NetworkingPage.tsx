import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Search, Filter, Eye, Check, X, Download, Calendar as CalendarIcon, User, List, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { getParticipantById, getReferentSponsor, getOrganisationById, updateRendezVous, type RendezVous, type StatutRendezVous } from './data/mockData';
import { useDynamicInscriptions } from './hooks/useDynamicInscriptions';
import { AnimatedStat } from './AnimatedStat';
import { toast } from 'sonner';
import { CalendarView } from './CalendarView';

export type NetworkingSubSection = 'participant' | 'sponsor' | 'liste' | 'historique';

const statutRdvColors = {
  'acceptée': 'bg-green-100 text-green-800',
  'occupée': 'bg-red-100 text-red-800',
  'en-attente': 'bg-yellow-100 text-yellow-800',
  'annulée': 'bg-gray-100 text-gray-800',
};

interface NetworkingPageProps {
  subSection?: NetworkingSubSection;
  filter?: 'all' | 'participant' | 'sponsor' | 'liste';
  readOnly?: boolean;
}

export function NetworkingPage({ subSection, filter, readOnly = false }: NetworkingPageProps) {
  const { rendezVous: rendezVousData } = useDynamicInscriptions({ includeRendezVous: true });
  const activeFilter = filter || subSection;
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState<string>('tous');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Rendez-vous filtrés pour la vue tableau
  const filteredRendezVous = useMemo(() => {
    let filtered = [...rendezVousData];

    // Filtre par sous-section (type)
    if (activeFilter === 'participant') {
      filtered = filtered.filter(r => r.type === 'participant');
    } else if (activeFilter === 'sponsor') {
      filtered = filtered.filter(r => r.type === 'sponsor');
    }
    // Si activeFilter est 'all' ou 'liste' ou undefined, on ne filtre pas

    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(r => {
        const demandeur = getParticipantById(r.demandeurId);
        if (!demandeur) return false;
        
        // Recherche dans le nom du demandeur
        if (demandeur.nom.toLowerCase().includes(searchLower)) return true;
        if (demandeur.prenom.toLowerCase().includes(searchLower)) return true;
        
        // Recherche dans le nom complet du demandeur
        const nomCompletDemandeur1 = `${demandeur.prenom} ${demandeur.nom}`.toLowerCase();
        const nomCompletDemandeur2 = `${demandeur.nom} ${demandeur.prenom}`.toLowerCase();
        if (nomCompletDemandeur1.includes(searchLower) || nomCompletDemandeur2.includes(searchLower)) return true;
        
        // Pour les rendez-vous sponsors, recherche dans le référent
        if (r.type === 'sponsor') {
          const referentSponsor = getReferentSponsor(r.recepteurId);
          if (referentSponsor) {
            if (referentSponsor.nom.toLowerCase().includes(searchLower)) return true;
            if (referentSponsor.prenom.toLowerCase().includes(searchLower)) return true;
            if (referentSponsor.organisationNom.toLowerCase().includes(searchLower)) return true;
            
            const nomCompletReferent1 = `${referentSponsor.prenom} ${referentSponsor.nom}`.toLowerCase();
            const nomCompletReferent2 = `${referentSponsor.nom} ${referentSponsor.prenom}`.toLowerCase();
            if (nomCompletReferent1.includes(searchLower) || nomCompletReferent2.includes(searchLower)) return true;
          }
        } else {
          // Pour les rendez-vous participants, recherche dans le récepteur
          const recepteur = getParticipantById(r.recepteurId);
          if (recepteur) {
            if (recepteur.nom.toLowerCase().includes(searchLower)) return true;
            if (recepteur.prenom.toLowerCase().includes(searchLower)) return true;
            
            const nomCompletRecepteur1 = `${recepteur.prenom} ${recepteur.nom}`.toLowerCase();
            const nomCompletRecepteur2 = `${recepteur.nom} ${recepteur.prenom}`.toLowerCase();
            if (nomCompletRecepteur1.includes(searchLower) || nomCompletRecepteur2.includes(searchLower)) return true;
          }
        }
        
        return false;
      });
    }

    // Filtre par statut
    if (statutFilter !== 'tous') {
      filtered = filtered.filter(r => r.statut === statutFilter);
    }

    return filtered;
  }, [rendezVousData, activeFilter, searchTerm, statutFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRendezVous.length / itemsPerPage);
  const paginatedRendezVous = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRendezVous.slice(startIndex, endIndex);
  }, [filteredRendezVous, currentPage]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statutFilter, activeFilter]);

  // Rendez-vous pour la vue calendrier - affiche toujours les rendez-vous acceptés + les filtres actifs
  const calendarRendezVous = useMemo(() => {
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
  }, [rendezVousData, activeFilter, statutFilter]);

  const DetailsDialog = ({ rendezVous }: { rendezVous: RendezVous }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [commentaire, setCommentaire] = useState(rendezVous.commentaire || '');
    const demandeur = getParticipantById(rendezVous.demandeurId);
    const demandeurOrganisation = demandeur ? getOrganisationById(demandeur.organisationId) : undefined;
    const recepteur = getParticipantById(rendezVous.recepteurId);
    const recepteurOrganisation = recepteur ? getOrganisationById(recepteur.organisationId) : undefined;
    const referentSponsor = rendezVous.type === 'sponsor' ? getReferentSponsor(rendezVous.recepteurId) : undefined;

    if (!demandeur) return null;
    if (rendezVous.type === 'participant' && !recepteur) return null;
    if (rendezVous.type === 'sponsor' && !referentSponsor) return null;

    const handleAction = (newStatut: StatutRendezVous) => {
      // Mettre à jour le rendez-vous dans les données globales
      updateRendezVous(rendezVous.id, {
        statut: newStatut,
        commentaire: commentaire || undefined,
      });
      setIsOpen(false);
      
      const messages = {
        'acceptée': 'Rendez-vous accepté',
        'occupée': 'Rendez-vous refusé (occupé)',
        'en-attente': 'Rendez-vous mis en attente',
        'annulée': 'Rendez-vous annulé',
      };
      
      toast.success(messages[newStatut] || 'Statut mis à jour');
    };

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
            <Eye className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la demande de rendez-vous</DialogTitle>
            <DialogDescription>
              Informations complètes sur la demande de rendez-vous
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Type de rendez-vous */}
            <div>
              <Label className="text-gray-700">Type de rendez-vous</Label>
              <p className="mt-1 text-gray-900">
                <Badge className={rendezVous.type === 'participant' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                  {rendezVous.type === 'participant' ? 'Participant' : 'Sponsor'}
                </Badge>
              </p>
            </div>

            {/* Demandeur */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700">Demandeur</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-gray-900">{demandeur.prenom} {demandeur.nom}</p>
                  <p className="text-sm text-gray-600 mt-1">{demandeur.email}</p>
                  <p className="text-sm text-gray-600">{demandeur.telephone}</p>
                  {demandeurOrganisation && (
                    <p className="text-sm text-gray-600 mt-1">Organisation: {demandeurOrganisation.nom}</p>
                  )}
                </div>
              </div>

              {/* Récepteur ou Référent Sponsor */}
              <div>
                <Label className="text-gray-700 flex items-center gap-2">
                  {rendezVous.type === 'sponsor' ? (
                    <>
                      <User className="w-4 h-4 text-orange-600" />
                      Référent Sponsor
                    </>
                  ) : (
                    'Récepteur'
                  )}
                </Label>
                {rendezVous.type === 'sponsor' && referentSponsor ? (
                  <div className="mt-1 p-3 bg-orange-50 rounded-md border border-orange-200">
                    <p className="text-gray-900">{referentSponsor.prenom} {referentSponsor.nom}</p>
                    <p className="text-sm text-orange-700 mt-1">{referentSponsor.fonction}</p>
                    <p className="text-sm text-gray-600 mt-1">{referentSponsor.email}</p>
                    <p className="text-sm text-gray-600">{referentSponsor.telephone}</p>
                    <p className="text-sm text-gray-600 mt-1">Organisation: {referentSponsor.organisationNom}</p>
                  </div>
                ) : recepteur ? (
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-gray-900">{recepteur.prenom} {recepteur.nom}</p>
                    <p className="text-sm text-gray-600 mt-1">{recepteur.email}</p>
                    <p className="text-sm text-gray-600">{recepteur.telephone}</p>
                    {recepteurOrganisation && (
                      <p className="text-sm text-gray-600 mt-1">Organisation: {recepteurOrganisation.nom}</p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Date et heure */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700">Date</Label>
                <p className="mt-1 text-gray-900">
                  {new Date(rendezVous.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <Label className="text-gray-700">Heure</Label>
                <p className="mt-1 text-gray-900">{rendezVous.heure}</p>
              </div>
            </div>

            {/* Statut */}
            <div>
              <Label className="text-gray-700">Statut</Label>
              <div className="mt-1">
                <Badge className={statutRdvColors[rendezVous.statut]}>
                  {rendezVous.statut}
                </Badge>
              </div>
            </div>

            {/* Commentaire - éditable pour les sponsors */}
            <div>
              <Label className="text-gray-700">Commentaire</Label>
              {activeFilter === 'sponsor' || rendezVous.type === 'sponsor' ? (
                <Textarea
                  placeholder="Ajouter un commentaire (optionnel)..."
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              ) : (
                <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-gray-900">{rendezVous.commentaire || 'Aucun commentaire'}</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            {!readOnly && (activeFilter === 'sponsor' || rendezVous.type === 'sponsor') ? (
              <>
                <Button
                  onClick={() => handleAction('occupée')}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <X className="w-4 h-4" />
                  Refuser (Occupé)
                </Button>
                <Button
                  onClick={() => handleAction('acceptée')}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4" />
                  Accepter
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsOpen(false)} variant="outline">
                Fermer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const ActionDialog = ({ rendezVous }: { rendezVous: RendezVous }) => {
    const [commentaire, setCommentaire] = useState(rendezVous.commentaire || '');
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = (newStatut: StatutRendezVous) => {
      // Mettre à jour le rendez-vous dans les données globales
      updateRendezVous(rendezVous.id, {
        statut: newStatut,
        commentaire: commentaire || undefined,
      });
      setIsOpen(false);
      
      const messages = {
        'acceptée': 'Rendez-vous accepté',
        'occupée': 'Rendez-vous refusé (occupé)',
        'en-attente': 'Rendez-vous mis en attente',
        'annulée': 'Rendez-vous annulé',
      };
      
      toast.success(messages[newStatut] || 'Statut mis à jour');
    };

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Actions sur le rendez-vous</DialogTitle>
            <DialogDescription>
              Accepter, refuser ou mettre en attente la demande de rendez-vous
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="commentaire">Commentaire</Label>
              <Textarea
                id="commentaire"
                placeholder="Ajouter un commentaire (optionnel)..."
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => handleAction('occupée')}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <X className="w-4 h-4" />
              Refuser (Occupé)
            </Button>
            <Button
              onClick={() => handleAction('acceptée')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4" />
              Accepter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

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

  const getTotalRendezVous = () => {
    if (activeFilter === 'participant') {
      return rendezVousData.filter(r => r.type === 'participant').length;
    } else if (activeFilter === 'sponsor') {
      return rendezVousData.filter(r => r.type === 'sponsor').length;
    }
    return rendezVousData.length;
  };

  // Statistiques pour la vue "liste"
  const stats = useMemo(() => {
    const rdvParticipants = rendezVousData.filter(r => r.type === 'participant');
    const rdvSponsors = rendezVousData.filter(r => r.type === 'sponsor');
    const rdvAcceptes = rendezVousData.filter(r => r.statut === 'acceptée').length;
    const rdvEnAttente = rendezVousData.filter(r => r.statut === 'en-attente').length;
    
    return {
      participants: rdvParticipants.length,
      sponsors: rdvSponsors.length,
      acceptes: rdvAcceptes,
      enAttente: rdvEnAttente,
      total: rendezVousData.length
    };
  }, [rendezVousData]);

  const exportToCSV = () => {
    const headers = ['Type', 'Demandeur', 'Email Demandeur', 'Récepteur', 'Email Récepteur', 'Organisation', 'Date', 'Heure', 'Statut', 'Commentaire'];
    const csvContent = [
      headers.join(','),
      ...filteredRendezVous.map(rdv => {
        const demandeur = getParticipantById(rdv.demandeurId);
        const recepteur = getParticipantById(rdv.recepteurId);
        const referentSponsor = rdv.type === 'sponsor' ? getReferentSponsor(rdv.recepteurId) : undefined;
        
        // Pour les rendez-vous sponsor, utiliser les infos du référent
        const recepteurNom = rdv.type === 'sponsor' && referentSponsor 
          ? `${referentSponsor.prenom} ${referentSponsor.nom}`
          : `${recepteur?.prenom || ''} ${recepteur?.nom || ''}`;
        const recepteurEmail = rdv.type === 'sponsor' && referentSponsor 
          ? referentSponsor.email
          : recepteur?.email || '';
        const organisationNom = rdv.type === 'sponsor' && referentSponsor 
          ? referentSponsor.organisationNom
          : '';
        
        return [
          rdv.type,
          `${demandeur?.prenom} ${demandeur?.nom}`,
          demandeur?.email || '',
          recepteurNom,
          recepteurEmail,
          organisationNom,
          new Date(rdv.date).toLocaleDateString('fr-FR'),
          rdv.heure,
          rdv.statut,
          rdv.commentaire || ''
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rendez-vous-${activeFilter || 'all'}-fanaf.csv`;
    a.click();
  };

  return (
    <div className="p-8 animate-page-enter">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">{getTitle()}</h1>
        <p className="text-gray-600">
          {filteredRendezVous.length} rendez-vous sur {getTotalRendezVous()}
        </p>
      </div>

      {/* Tableau de bord pour la vue liste */}
      {(activeFilter === 'liste' || activeFilter === 'all') && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 mb-1">Total RDV</p>
                  <p className="text-3xl text-orange-900">{stats.total}</p>
                </div>
                <CalendarIcon className="w-10 h-10 text-orange-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 mb-1">RDV Participants</p>
                  <p className="text-3xl text-blue-900">{stats.participants}</p>
                </div>
                <CalendarIcon className="w-10 h-10 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 mb-1">RDV Sponsors</p>
                  <p className="text-3xl text-purple-900">{stats.sponsors}</p>
                </div>
                <CalendarIcon className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 mb-1">RDV Acceptés</p>
                  <p className="text-3xl text-green-900">{stats.acceptes}</p>
                </div>
                <Check className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 mb-1">En attente</p>
                  <p className="text-3xl text-yellow-900">{stats.enAttente}</p>
                </div>
                <CalendarIcon className="w-10 h-10 text-yellow-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres et recherche
            </div>
            <div className="flex items-center gap-2">
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={activeFilter === 'sponsor' ? "Rechercher par nom (demandeur ou référent)..." : "Rechercher par nom (demandeur ou récepteur)..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statutFilter} onValueChange={setStatutFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="acceptée">Acceptée</SelectItem>
                <SelectItem value="occupée">Occupée</SelectItem>
                <SelectItem value="en-attente">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredRendezVous.length} rendez-vous trouvé(s)
            </p>
            <Button onClick={exportToCSV} variant="outline" size="sm" disabled={filteredRendezVous.length === 0 || readOnly}>
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'calendar' ? (
        <CalendarView rendezVous={calendarRendezVous} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Demandeur</TableHead>
                    <TableHead>{activeFilter === 'sponsor' ? 'Référent Sponsor' : 'Récepteur'}</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Heure</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRendezVous.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        Aucun rendez-vous trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRendezVous.map((rdv) => {
                      const demandeur = getParticipantById(rdv.demandeurId);
                      const recepteur = getParticipantById(rdv.recepteurId);
                      const referentSponsor = rdv.type === 'sponsor' ? getReferentSponsor(rdv.recepteurId) : undefined;

                      if (!demandeur) return null;
                      if (rdv.type === 'participant' && !recepteur) return null;
                      if (rdv.type === 'sponsor' && !referentSponsor) return null;

                      return (
                        <TableRow key={rdv.id}>
                          <TableCell>
                            <div>
                              <p className="text-gray-900">{demandeur.prenom} {demandeur.nom}</p>
                              <p className="text-xs text-gray-500">{demandeur.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {rdv.type === 'sponsor' && referentSponsor ? (
                              <div>
                                <p className="text-gray-900">{referentSponsor.prenom} {referentSponsor.nom}</p>
                                <p className="text-xs text-orange-600">{referentSponsor.fonction}</p>
                                <p className="text-xs text-gray-500">{referentSponsor.organisationNom}</p>
                              </div>
                            ) : recepteur ? (
                              <div>
                                <p className="text-gray-900">{recepteur.prenom} {recepteur.nom}</p>
                                <p className="text-xs text-gray-500">{recepteur.email}</p>
                              </div>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {new Date(rdv.date).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="text-gray-600">{rdv.heure}</TableCell>
                          <TableCell>
                            <Badge className={statutRdvColors[rdv.statut]}>
                              {rdv.statut}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DetailsDialog rendezVous={rdv} />
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
      )}

      {/* Pagination (uniquement en mode liste) */}
      {viewMode === 'table' && filteredRendezVous.length > 0 && totalPages > 1 && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages} ({filteredRendezVous.length} résultat{filteredRendezVous.length > 1 ? 's' : ''})
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? "bg-orange-600 hover:bg-orange-700" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

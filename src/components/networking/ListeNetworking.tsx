"use client";

import { useState, useMemo } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Eye, Check, X, User, Download, Mail } from 'lucide-react';
import { getParticipantById, getReferentSponsor, getOrganisationById, updateRendezVous, type RendezVous, type StatutRendezVous } from '../data/mockData';
import { toast } from 'sonner';
import { List, type Column, type ListAction, type RowAction } from '../list/List';

const statutRdvColors: Record<string, string> = {
  'acceptée': 'bg-green-100 text-green-800',
  'occupée': 'bg-red-100 text-red-800',
  'en-attente': 'bg-yellow-100 text-yellow-800',
  'annulée': 'bg-gray-100 text-gray-800',
};

interface ListeNetworkingProps {
  rendezVous: RendezVous[];
  activeFilter?: 'participant' | 'sponsor' | 'all' | 'liste' | 'historique';
  readOnly?: boolean;
}

export function ListeNetworking({ rendezVous, activeFilter, readOnly = false }: ListeNetworkingProps) {
  const [statutFilter, setStatutFilter] = useState<string>('tous');
  const [selectedRendezVous, setSelectedRendezVous] = useState<RendezVous[]>([]);

  // Enrichir les rendez-vous avec des champs de recherche calculés
  const rendezVousWithSearch = useMemo(() => {
    return rendezVous.map(rdv => {
      const demandeur = getParticipantById(rdv.demandeurId);
      const recepteur = rdv.type === 'participant' ? getParticipantById(rdv.recepteurId) : null;
      const referentSponsor = rdv.type === 'sponsor' ? getReferentSponsor(rdv.recepteurId) : null;
      
      return {
        ...rdv,
        _searchDemandeur: demandeur ? `${demandeur.prenom} ${demandeur.nom} ${demandeur.email}`.toLowerCase() : '',
        _searchRecepteur: rdv.type === 'sponsor' && referentSponsor 
          ? `${referentSponsor.prenom} ${referentSponsor.nom} ${referentSponsor.organisationNom} ${referentSponsor.email}`.toLowerCase()
          : recepteur ? `${recepteur.prenom} ${recepteur.nom} ${recepteur.email}`.toLowerCase() : '',
      };
    });
  }, [rendezVous]);

  // Filtrer les rendez-vous selon activeFilter et statutFilter
  const filteredRendezVous = useMemo(() => {
    let filtered = [...rendezVousWithSearch];

    // Filtre par type (ignorer 'historique' pour la liste)
    if (activeFilter === 'participant') {
      filtered = filtered.filter(r => r.type === 'participant');
    } else if (activeFilter === 'sponsor') {
      filtered = filtered.filter(r => r.type === 'sponsor');
    }
    // Si activeFilter est 'all', 'liste', 'historique' ou undefined, on ne filtre pas par type

    // Filtre par statut
    if (statutFilter !== 'tous') {
      filtered = filtered.filter(r => r.statut === statutFilter);
    }

    return filtered;
  }, [rendezVousWithSearch, activeFilter, statutFilter]);

  // État pour gérer l'ouverture du dialog par ligne
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  // Dialog de détails
  const DetailsDialog = ({ rendezVous }: { rendezVous: RendezVous }) => {
    const isOpen = openDialogId === rendezVous.id;
    const setIsOpen = (open: boolean) => {
      if (open) {
        setOpenDialogId(rendezVous.id);
      } else {
        setOpenDialogId(null);
      }
    };
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
      updateRendezVous(rendezVous.id, {
        statut: newStatut,
        commentaire: commentaire || undefined,
      });
      setIsOpen(false);
      
      const messages: Record<string, string> = {
        'acceptée': 'Rendez-vous accepté',
        'occupée': 'Rendez-vous refusé (occupé)',
        'en-attente': 'Rendez-vous mis en attente',
        'annulée': 'Rendez-vous annulé',
      };
      
      toast.success(messages[newStatut] || 'Statut mis à jour');
    };

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la demande de rendez-vous</DialogTitle>
            <DialogDescription>
              Informations complètes sur la demande de rendez-vous
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label className="text-gray-700">Type de rendez-vous</Label>
              <p className="mt-1 text-gray-900">
                <Badge className={rendezVous.type === 'participant' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                  {rendezVous.type === 'participant' ? 'Participant' : 'Sponsor'}
                </Badge>
              </p>
            </div>

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
                <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                  {rendezVous.type === 'sponsor' && referentSponsor ? (
                    <>
                      <p className="text-gray-900">{referentSponsor.prenom} {referentSponsor.nom}</p>
                      <p className="text-sm text-orange-600">{referentSponsor.fonction}</p>
                      <p className="text-sm text-gray-600">{referentSponsor.email}</p>
                      <p className="text-sm text-gray-600">{referentSponsor.telephone}</p>
                      <p className="text-sm text-gray-600 mt-1">Organisation: {referentSponsor.organisationNom}</p>
                    </>
                  ) : recepteur ? (
                    <>
                      <p className="text-gray-900">{recepteur.prenom} {recepteur.nom}</p>
                      <p className="text-sm text-gray-600">{recepteur.email}</p>
                      <p className="text-sm text-gray-600">{recepteur.telephone}</p>
                      {recepteurOrganisation && (
                        <p className="text-sm text-gray-600 mt-1">Organisation: {recepteurOrganisation.nom}</p>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </div>

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

            <div>
              <Label className="text-gray-700">Statut</Label>
              <div className="mt-1">
                <Badge className={statutRdvColors[rendezVous.statut]}>
                  {rendezVous.statut}
                </Badge>
              </div>
            </div>

            <div>
              <Label className="text-gray-700">Commentaire</Label>
              {(activeFilter === 'sponsor' || rendezVous.type === 'sponsor') && !readOnly ? (
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

  // Colonnes pour le composant List
  const columns: Column<RendezVous>[] = [
    {
      key: 'demandeur',
      header: 'Demandeur',
      sortable: true,
      render: (rdv) => {
        const demandeur = getParticipantById(rdv.demandeurId);
        if (!demandeur) return <span className="text-gray-400">N/A</span>;
        return (
          <div>
            <p className="text-gray-900">{demandeur.prenom} {demandeur.nom}</p>
            <p className="text-xs text-gray-500">{demandeur.email}</p>
          </div>
        );
      },
      sortKey: 'demandeurId'
    },
    {
      key: 'recepteur',
      header: activeFilter === 'sponsor' ? 'Référent Sponsor' : 'Récepteur',
      sortable: true,
      render: (rdv) => {
        const referentSponsor = rdv.type === 'sponsor' ? getReferentSponsor(rdv.recepteurId) : undefined;
        const recepteur = rdv.type === 'participant' ? getParticipantById(rdv.recepteurId) : undefined;
        
        if (rdv.type === 'sponsor' && referentSponsor) {
          return (
            <div>
              <p className="text-gray-900">{referentSponsor.prenom} {referentSponsor.nom}</p>
              <p className="text-xs text-orange-600">{referentSponsor.fonction}</p>
              <p className="text-xs text-gray-500">{referentSponsor.organisationNom}</p>
            </div>
          );
        } else if (recepteur) {
          return (
            <div>
              <p className="text-gray-900">{recepteur.prenom} {recepteur.nom}</p>
              <p className="text-xs text-gray-500">{recepteur.email}</p>
            </div>
          );
        }
        return <span className="text-gray-400">N/A</span>;
      },
      sortKey: 'recepteurId'
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (rdv) => (
        <span className="text-gray-600">
          {new Date(rdv.date).toLocaleDateString('fr-FR')}
        </span>
      )
    },
    {
      key: 'heure',
      header: 'Heure',
      sortable: true,
      render: (rdv) => (
        <span className="text-gray-600">{rdv.heure}</span>
      )
    },
    {
      key: 'statut',
      header: 'Statut',
      sortable: true,
      render: (rdv) => (
        <Badge className={statutRdvColors[rdv.statut]}>
          {rdv.statut}
        </Badge>
      )
    },
  ];

  // Composant de filtre personnalisé
  const filterComponent = (
    <Select value={statutFilter} onValueChange={setStatutFilter}>
      <SelectTrigger>
        <SelectValue placeholder="Statut" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="tous">Tous les statuts</SelectItem>
        <SelectItem value="acceptée">Acceptée</SelectItem>
        <SelectItem value="occupée">Occupée</SelectItem>
        <SelectItem value="en-attente">En attente</SelectItem>
        <SelectItem value="annulée">Annulée</SelectItem>
      </SelectContent>
    </Select>
  );

  // Export CSV
  const exportHeaders = ['Type', 'Demandeur', 'Email Demandeur', 'Récepteur', 'Email Récepteur', 'Organisation', 'Date', 'Heure', 'Statut', 'Commentaire'];
  
  const exportData = (rdv: RendezVous) => {
    const demandeur = getParticipantById(rdv.demandeurId);
    const recepteur = getParticipantById(rdv.recepteurId);
    const referentSponsor = rdv.type === 'sponsor' ? getReferentSponsor(rdv.recepteurId) : undefined;
    
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
      `${demandeur?.prenom || ''} ${demandeur?.nom || ''}`,
      demandeur?.email || '',
      recepteurNom,
      recepteurEmail,
      organisationNom,
      new Date(rdv.date).toLocaleDateString('fr-FR'),
      rdv.heure,
      rdv.statut,
      rdv.commentaire || ''
    ];
  };

  // Gestion de la sélection
  const handleSelectionChange = (selectedItems: RendezVous[]) => {
    setSelectedRendezVous(selectedItems);
  };

  // Actions par ligne
  const rowActions: RowAction<RendezVous>[] = useMemo(() => [
    {
      label: 'Voir',
      icon: <Eye className="w-4 h-4" />,
      onClick: (rdv) => {
        setOpenDialogId(rdv.id);
      },
      variant: 'ghost',
      className: 'h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50',
      title: 'Voir les détails',
      shouldShow: () => true, // Toujours afficher
    },
    {
      label: 'Accepter',
      icon: <Check className="w-4 h-4" />,
      onClick: (rdv) => {
        updateRendezVous(rdv.id, { statut: 'acceptée' });
        toast.success('Rendez-vous accepté');
      },
      variant: 'ghost',
      className: 'h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50',
      title: 'Accepter',
      shouldShow: (rdv) => !readOnly && (activeFilter === 'sponsor' || rdv.type === 'sponsor'),
    },
    {
      label: 'Refuser',
      icon: <X className="w-4 h-4" />,
      onClick: (rdv) => {
        updateRendezVous(rdv.id, { statut: 'occupée' });
        toast.success('Rendez-vous refusé');
      },
      variant: 'ghost',
      className: 'h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50',
      title: 'Refuser',
      shouldShow: (rdv) => !readOnly && (activeFilter === 'sponsor' || rdv.type === 'sponsor'),
    },
  ], [readOnly, activeFilter]);

  // Actions en masse
  const buildActions: ListAction<RendezVous>[] = [
    {
      label: 'Exporter les sélectionnés',
      icon: <Download className="w-4 h-4" />,
      onClick: (selectedItems) => {
        const csvContent = [
          exportHeaders.join(','),
          ...selectedItems.map(exportData).map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rendez-vous-selectionnes-${activeFilter || 'all'}-fanaf.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success(`Export de ${selectedItems.length} rendez-vous...`);
      },
      variant: 'outline'
    },
    {
      label: 'Envoyer email',
      icon: <Mail className="w-4 h-4" />,
      onClick: (selectedItems) => {
        toast.info(`Envoi d'email pour ${selectedItems.length} rendez-vous...`);
        // TODO: Implémenter l'envoi d'email
      },
      variant: 'outline'
    }
  ];

  // Gestion de l'export
  const handleExport = (filteredData: RendezVous[]) => {
    // Si des éléments sont sélectionnés, exporter seulement ceux-ci
    // Sinon, exporter tous les éléments filtrés
    const dataToExport = selectedRendezVous.length > 0 ? selectedRendezVous : filteredData;
    
    const csvContent = [
      exportHeaders.join(','),
      ...dataToExport.map(exportData).map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rendez-vous-${activeFilter || 'all'}-fanaf.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
    <List
      data={filteredRendezVous}
      columns={columns}
      getRowId={(rdv) => rdv.id}
      searchPlaceholder={activeFilter === 'sponsor' ? "Rechercher par nom (demandeur ou référent)..." : "Rechercher par nom (demandeur ou récepteur)..."}
      searchKeys={['_searchDemandeur', '_searchRecepteur', 'date', 'heure', 'statut']}
      filterComponent={filterComponent}
      filterTitle="Rendez-vous"
      exportFilename={`rendez-vous-${activeFilter || 'all'}-fanaf`}
      exportHeaders={exportHeaders}
      exportData={exportData}
      onExport={handleExport}
      itemsPerPage={10}
      readOnly={readOnly}
      enableSelection={true}
      buildActions={buildActions}
      rowActions={rowActions}
      rowActionsWidth="w-40"
      onSelectionChange={handleSelectionChange}
      emptyMessage="Aucun rendez-vous trouvé"
    />
      {/* Rendu des dialogs pour chaque rendez-vous */}
      <div style={{ display: 'none' }}>
        {filteredRendezVous.map((rdv) => (
          <DetailsDialog key={rdv.id} rendezVous={rdv} />
        ))}
      </div>
    </>
  );
}


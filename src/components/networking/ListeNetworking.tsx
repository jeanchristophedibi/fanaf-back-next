"use client";

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Eye, Check, X, User, Download, Mail, Loader2 } from 'lucide-react';
import { getParticipantById, getReferentSponsor, getOrganisationById } from '../data/helpers';

// Types pour RendezVous (temporaires jusqu'à ce qu'ils soient définis dans types.ts)
export interface RendezVous {
  id: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  demandeurId: string;
  recepteurId: string;
  type: 'participant' | 'sponsor';
  statut: StatutRendezVous;
  sujet?: string;
  notes?: string;
  commentaire?: string;
}

export type StatutRendezVous = 'acceptée' | 'en-attente' | 'occupée' | 'annulée';
import { networkingDataService } from '../data/networkingData';
import { fanafApi } from '../../services/fanafApi';
import { toast } from 'sonner';
import { List, type Column, type ListAction, type RowAction } from '../list/List';

const statutRdvColors: Record<string, string> = {
  'acceptée': 'bg-green-100 text-green-800',
  'occupée': 'bg-red-100 text-red-800',
  'en-attente': 'bg-yellow-100 text-yellow-800',
  'annulée': 'bg-gray-100 text-gray-800',
};

interface ListeNetworkingProps {
  activeFilter?: 'participant' | 'sponsor' | 'all' | 'liste' | 'historique';
  readOnly?: boolean;
}

export function ListeNetworking({ activeFilter, readOnly = false }: ListeNetworkingProps) {
  const queryClient = useQueryClient();
  const [statutFilter, setStatutFilter] = useState<string>('tous');
  const [selectedRendezVous, setSelectedRendezVous] = useState<RendezVous[]>([]);
  
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
  const rendezVous = (() => {
    let filtered = [...allRendezVous];
    
    // Filtre par type
    if (activeFilter === 'participant') {
      filtered = filtered.filter(r => r.type === 'participant');
    } else if (activeFilter === 'sponsor') {
      filtered = filtered.filter(r => r.type === 'sponsor');
    }
    
    // Filtre par statut
    if (statutFilter !== 'tous') {
      filtered = filtered.filter(r => r.statut === statutFilter);
    }
    
    return filtered;
  })();

  // Enrichir les rendez-vous avec des champs de recherche calculés
  const rendezVousWithSearch = (() => {
    return rendezVous.map(rdv => {
      const apiDemandeur: any = (rdv as any).demandeur;
      const apiRecepteur: any = (rdv as any).recepteur;
      const demandeur = getParticipantById(rdv.demandeurId);
      const recepteur = rdv.type === 'participant' ? getParticipantById(rdv.recepteurId) : null;
      const referentSponsor = rdv.type === 'sponsor' ? getReferentSponsor(rdv.recepteurId) : null;

      const demandeurName = apiDemandeur?.name || (demandeur ? `${demandeur.prenom} ${demandeur.nom}` : '');
      const demandeurEmail = demandeur?.email || '';

      const recepteurName = rdv.type === 'sponsor'
        ? referentSponsor ? `${referentSponsor.prenom} ${referentSponsor.nom}` : (apiRecepteur?.name || '')
        : apiRecepteur?.name || (recepteur ? `${recepteur.prenom} ${recepteur.nom}` : '');
      const recepteurEmail = rdv.type === 'sponsor'
        ? referentSponsor?.email || ''
        : recepteur?.email || '';
      const recepteurOrg = rdv.type === 'sponsor' ? (getOrganisationById(rdv.recepteurId)?.nom || '') : '';

      return {
        ...rdv,
        _apiDemandeur: apiDemandeur, // pour l'affichage conditionnel
        _apiRecepteur: apiRecepteur,
        _searchDemandeur: `${demandeurName} ${demandeurEmail}`.trim().toLowerCase(),
        _searchRecepteur: `${recepteurName} ${recepteurEmail} ${recepteurOrg}`.trim().toLowerCase(),
      } as any;
    });
  })();

  // Filtrer les rendez-vous selon activeFilter et statutFilter
  const filteredRendezVous = (() => {
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
  })();

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
    const [isLoading, setIsLoading] = useState(false);
    const apiDemandeur: any = (rendezVous as any)._apiDemandeur;
    const apiRecepteur: any = (rendezVous as any)._apiRecepteur;
    const demandeur = getParticipantById(rendezVous.demandeurId);
    const recepteur = getParticipantById(rendezVous.recepteurId);
    const demandeurOrganisation = demandeur ? getOrganisationById(demandeur.organisationId) : undefined;
    const recepteurOrganisation = recepteur ? getOrganisationById(recepteur.organisationId) : undefined;
    const referentSponsor = rendezVous.type === 'sponsor' ? getReferentSponsor(rendezVous.recepteurId) : undefined;

    const handleAction = async (newStatut: StatutRendezVous) => {
      setIsLoading(true);
      try {
        // Appeler l'API pour accepter/valider ou refuser
        // Pour les sponsors, utiliser /validate, pour les participants utiliser /accept
        if (newStatut === 'acceptée') {
          if (rendezVous.type === 'sponsor') {
            await fanafApi.validateNetworkingRequest(rendezVous.id);
          } else {
            await fanafApi.acceptNetworkingRequest(rendezVous.id);
          }
        } else if (newStatut === 'occupée') {
          await fanafApi.refuseNetworkingRequest(rendezVous.id);
        }
        
        // Mettre à jour le cache local
        networkingDataService.updateRequest(rendezVous.id, {
          statut: newStatut,
          commentaire: commentaire || undefined,
        });
        
        // Invalider les queries React Query pour forcer le rechargement
        queryClient.invalidateQueries({ queryKey: ['networkingRequests'] });
        
        setIsOpen(false);
        
        const messages: Record<string, string> = {
          'acceptée': 'Rendez-vous accepté',
          'occupée': 'Rendez-vous refusé (occupé)',
          'en-attente': 'Rendez-vous mis en attente',
          'annulée': 'Rendez-vous annulé',
        };
        
        toast.success(messages[newStatut] || 'Statut mis à jour');
      } catch (error: any) {
        console.error('Erreur lors de la mise à jour du rendez-vous:', error);
        toast.error(error?.message || 'Erreur lors de la mise à jour du rendez-vous');
      } finally {
        setIsLoading(false);
      }
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
                  <p className="text-gray-900">{apiDemandeur?.name || (demandeur ? `${demandeur.prenom} ${demandeur.nom}` : 'N/A')}</p>
                  {apiDemandeur?.company && (
                    <p className="text-sm text-gray-600">{apiDemandeur.company}</p>
                  )}
                  {apiDemandeur?.job_title && (
                    <p className="text-sm text-gray-600">{apiDemandeur.job_title}</p>
                  )}
                  {apiDemandeur?.country && (
                    <p className="text-sm text-gray-600">{apiDemandeur.country}</p>
                  )}
                  {!apiDemandeur?.name && demandeur && (
                    <>
                      <p className="text-sm text-gray-600 mt-1">{demandeur.email}</p>
                      <p className="text-sm text-gray-600">{demandeur.telephone}</p>
                      {demandeurOrganisation && (
                        <p className="text-sm text-gray-600 mt-1">Organisation: {demandeurOrganisation.nom}</p>
                      )}
                    </>
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
                  {apiRecepteur?.name ? (
                    <>
                      <p className="text-gray-900">{apiRecepteur.name}</p>
                      {apiRecepteur.job_title && (
                        <p className="text-sm text-orange-600">{apiRecepteur.job_title}</p>
                      )}
                      {apiRecepteur.company && (
                        <p className="text-sm text-gray-600">{apiRecepteur.company}</p>
                      )}
                      {apiRecepteur.country && (
                        <p className="text-sm text-gray-600">{apiRecepteur.country}</p>
                      )}
                    </>
                  ) : (
                    <>
                      {recepteur && (
                        <>
                          <p className="text-gray-900">{recepteur.prenom} {recepteur.nom}</p>
                          <p className="text-sm text-gray-600">{recepteur.email}</p>
                          <p className="text-sm text-gray-600">{recepteur.telephone}</p>
                          {recepteurOrganisation && (
                            <p className="text-sm text-gray-600 mt-1">Organisation: {recepteurOrganisation.nom}</p>
                          )}
                        </>
                      )}
                      {!recepteur && referentSponsor && (
                        <>
                          <p className="text-gray-900">{referentSponsor.prenom} {referentSponsor.nom}</p>
                          <p className="text-sm text-orange-600">{referentSponsor.fonction}</p>
                          {getOrganisationById(rendezVous.recepteurId) && (
                            <p className="text-sm text-gray-600">{getOrganisationById(rendezVous.recepteurId)?.nom}</p>
                          )}
                        </>
                      )}
                    </>
                  )}
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
                <p className="mt-1 text-gray-900">{rendezVous.heureDebut} - {rendezVous.heureFin}</p>
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
            {!readOnly && (activeFilter === 'sponsor' || rendezVous.type === 'sponsor') && rendezVous.statut === 'en-attente' ? (
              <Button
                onClick={() => handleAction('acceptée')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Accepter
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={() => setIsOpen(false)} 
                variant="outline"
                disabled={isLoading}
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
              >
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
        const apiDemandeur: any = (rdv as any)._apiDemandeur;
        const demandeur = getParticipantById(rdv.demandeurId);
        if (!apiDemandeur && !demandeur) return <span className="text-gray-400">N/A</span>;
        const name = apiDemandeur?.name || (demandeur ? `${demandeur.prenom} ${demandeur.nom}` : '');
        const email = demandeur?.email;
        return (
          <div>
            <p className="text-gray-900">{name}</p>
            {email && <p className="text-xs text-gray-500">{email}</p>}
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
        const apiRecepteur: any = (rdv as any)._apiRecepteur;
        const recepteur = getParticipantById(rdv.recepteurId);
        const referentSponsor = rdv.type === 'sponsor' ? getReferentSponsor(rdv.recepteurId) : undefined;

        // Priorité aux données API pour un affichage cohérent côté liste
        if (apiRecepteur?.name) {
          return (
            <div>
              <p className="text-gray-900">{apiRecepteur.name}</p>
              {apiRecepteur.company && <p className="text-xs text-gray-500">{apiRecepteur.company}</p>}
            </div>
          );
        }
        // Fallback local participant
        if (recepteur) {
          return (
            <div>
              <p className="text-gray-900">{recepteur.prenom} {recepteur.nom}</p>
              <p className="text-xs text-gray-500">{recepteur.email}</p>
            </div>
          );
        }
        // Dernier recours: référent sponsor si aucun nom d'utilisateur récepteur disponible
        if (referentSponsor) {
          return (
            <div>
              <p className="text-gray-900">{referentSponsor.prenom} {referentSponsor.nom}</p>
              <p className="text-xs text-orange-600">{referentSponsor.fonction}</p>
              {getOrganisationById(rdv.recepteurId) && (
                <p className="text-xs text-gray-500">{getOrganisationById(rdv.recepteurId)?.nom}</p>
              )}
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
        <span className="text-gray-600">{rdv.heureDebut} - {rdv.heureFin}</span>
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
  const exportHeaders = ['Type', 'Demandeur', 'Récepteur', 'Organisation', 'Date', 'Heure', 'Statut', 'Commentaire'];
  
  const exportData = (rdv: RendezVous) => {
    const apiDemandeur: any = (rdv as any)._apiDemandeur;
    const apiRecepteur: any = (rdv as any)._apiRecepteur;
    const demandeur = getParticipantById(rdv.demandeurId);
    const recepteur = getParticipantById(rdv.recepteurId);
    const referentSponsor = rdv.type === 'sponsor' ? getReferentSponsor(rdv.recepteurId) : undefined;

    const demandeurNom = apiDemandeur?.name || `${demandeur?.prenom || ''} ${demandeur?.nom || ''}`.trim();
    const recepteurNom = apiRecepteur?.name
      ? apiRecepteur.name
      : (recepteur ? `${recepteur.prenom} ${recepteur.nom}` : referentSponsor ? `${referentSponsor.prenom} ${referentSponsor.nom}` : '');
    const organisationNom = apiRecepteur?.company || (getOrganisationById(rdv.recepteurId)?.nom || '');

    return [
      rdv.type,
      demandeurNom,
      recepteurNom,
      organisationNom,
      new Date(rdv.date).toLocaleDateString('fr-FR'),
      `${rdv.heureDebut} - ${rdv.heureFin}`,
      rdv.statut,
      rdv.commentaire || ''
    ];
  };

  // Gestion de la sélection
  const handleSelectionChange = (selectedItems: RendezVous[]) => {
    setSelectedRendezVous(selectedItems);
  };

  // Actions par ligne
  const rowActions: RowAction<RendezVous>[] = [
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
  ];

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
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
            </div>
            <p className="text-sm font-medium text-gray-700">Chargement des rendez-vous...</p>
          </div>
        </div>
      )}
      <List
      data={filteredRendezVous}
      columns={columns}
      getRowId={(rdv) => rdv.id}
      searchPlaceholder={activeFilter === 'sponsor' ? "Rechercher par nom (demandeur ou référent)..." : "Rechercher par nom (demandeur ou récepteur)..."}
      searchKeys={['_searchDemandeur', '_searchRecepteur', 'date', 'heure', 'statut'] as unknown as (keyof RendezVous)[]}
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


"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { planVolDataService } from '../data/planvolData';
import { inscriptionsDataService } from '../data/inscriptionsData';
import { companiesDataService } from '../data/companiesData';
import { Download, Plane, Search, Calendar, AlertCircle, Eye, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { List, type Column, type ListAction } from '../list/List';

interface GroupedPlanVol {
  participantId: string;
  arrivee: any | null;
  depart: any | null;
  _searchText?: string; // Pour la recherche
  nom?: string; // Pour le tri
  prenom?: string; // Pour le tri
  organisation?: string; // Pour le tri
  _arriveeDate?: number; // Timestamp pour le tri
  _departDate?: number; // Timestamp pour le tri
}

export function ListePlanVol() {
  const [plansVol, setPlansVol] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [organisations, setOrganisations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données depuis l'API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Charger les plans de vol, participants et organisations
        const [plans, part, orgs] = await Promise.all([
          planVolDataService.loadFlightPlans(),
          inscriptionsDataService.loadParticipants(),
          companiesDataService.loadOrganisations(),
        ]);
        setPlansVol(plans);
        setParticipants(part);
        setOrganisations(orgs);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des plans de vol');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Fonction helper pour obtenir un participant par ID
  const getParticipantById = (id: string) => {
    return participants.find(p => p.id === id);
  };

  // Fonction helper pour obtenir une organisation par ID
  const getOrganisationById = (id: string) => {
    return organisations.find(o => o.id === id);
  };

  const [showFilters, setShowFilters] = useState(false);
  const [tempTypeVolFilters, setTempTypeVolFilters] = useState<string[]>([]);
  const [tempOrganisationFilters, setTempOrganisationFilters] = useState<string[]>([]);
  const [tempPaysVolFilters, setTempPaysVolFilters] = useState<string[]>([]);
  const [tempDateDebut, setTempDateDebut] = useState<string>('');
  const [tempDateFin, setTempDateFin] = useState<string>('');

  const [appliedTypeVolFilters, setAppliedTypeVolFilters] = useState<string[]>([]);
  const [appliedOrganisationFilters, setAppliedOrganisationFilters] = useState<string[]>([]);
  const [appliedPaysVolFilters, setAppliedPaysVolFilters] = useState<string[]>([]);
  const [appliedDateDebut, setAppliedDateDebut] = useState<string>('');
  const [appliedDateFin, setAppliedDateFin] = useState<string>('');

  // Sélection
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

  const uniquePaysVol = useMemo(() => {
    const allPlansVol = [...planVolDataService.getFlightPlansByType('arrivee'), ...planVolDataService.getFlightPlansByType('depart')];
    const paysSet = new Set<string>();
    allPlansVol.forEach(pv => {
      const participant = getParticipantById(pv.participantId);
      if (participant) paysSet.add(participant.pays);
    });
    return Array.from(paysSet).sort();
  }, []);

  const activeFiltersCount = appliedTypeVolFilters.length + appliedOrganisationFilters.length + (appliedDateDebut ? 1 : 0) + (appliedDateFin ? 1 : 0) + appliedPaysVolFilters.length;

  const handleApplyFilters = () => {
    setAppliedTypeVolFilters(tempTypeVolFilters);
    setAppliedOrganisationFilters(tempOrganisationFilters);
    setAppliedPaysVolFilters(tempPaysVolFilters);
    setAppliedDateDebut(tempDateDebut);
    setAppliedDateFin(tempDateFin);
    setShowFilters(false);
    toast.success('Filtres appliqués');
  };

  const handleResetFilters = () => {
    setTempTypeVolFilters([]);
    setTempOrganisationFilters([]);
    setTempPaysVolFilters([]);
    setTempDateDebut('');
    setTempDateFin('');
    setAppliedTypeVolFilters([]);
    setAppliedOrganisationFilters([]);
    setAppliedPaysVolFilters([]);
    setAppliedDateDebut('');
    setAppliedDateFin('');
    toast.success('Filtres réinitialisés');
  };

  // Groupement et filtrage des plans de vol
  const groupedPlansVol = useMemo(() => {
    let allPlansVol = [...planVolDataService.getFlightPlansByType('arrivee'), ...planVolDataService.getFlightPlansByType('depart')];

    // Filtres par type de vol
    if (appliedTypeVolFilters.length > 0) {
      allPlansVol = allPlansVol.filter(pv => appliedTypeVolFilters.includes(pv.type));
    }

    // Filtres par organisation
    if (appliedOrganisationFilters.length > 0) {
      allPlansVol = allPlansVol.filter(pv => {
        const participant = getParticipantById(pv.participantId);
        return participant && appliedOrganisationFilters.includes(participant.organisationId);
      });
    }

    // Filtres par pays
    if (appliedPaysVolFilters.length > 0) {
      allPlansVol = allPlansVol.filter(pv => {
        const participant = getParticipantById(pv.participantId);
        return participant && appliedPaysVolFilters.includes(participant.pays);
      });
    }

    // Filtres par période
    if (appliedDateDebut || appliedDateFin) {
      allPlansVol = allPlansVol.filter(pv => {
        const volDate = new Date(pv.date);
        volDate.setHours(0, 0, 0, 0);
        if (appliedDateDebut) {
          const dateDebut = new Date(appliedDateDebut);
          dateDebut.setHours(0, 0, 0, 0);
          if (volDate < dateDebut) return false;
        }
        if (appliedDateFin) {
          const dateFin = new Date(appliedDateFin);
          dateFin.setHours(0, 0, 0, 0);
          if (volDate > dateFin) return false;
        }
        return true;
      });
    }

    // Groupement par participant
    const participantMap = new Map<string, GroupedPlanVol>();
    allPlansVol.forEach(pv => {
      if (!participantMap.has(pv.participantId)) {
        participantMap.set(pv.participantId, { participantId: pv.participantId, arrivee: null, depart: null });
      }
      const entry = participantMap.get(pv.participantId)!;
      if (pv.type === 'arrivee') entry.arrivee = pv; 
      else entry.depart = pv;
    });

    // Enrichir avec des champs de recherche et de tri
    const grouped = Array.from(participantMap.values()).map(group => {
      const participant = getParticipantById(group.participantId);
      const organisation = participant ? getOrganisationById(participant.organisationId) : null;
      
      const searchTerms = [
        participant?.nom || '',
        participant?.prenom || '',
        organisation?.nom || '',
        group.arrivee?.numeroVol || '',
        group.depart?.numeroVol || '',
        group.arrivee?.aeroport || '',
        group.depart?.aeroport || '',
      ].filter(Boolean).join(' ').toLowerCase();
      
      return {
        ...group,
        _searchText: searchTerms,
        nom: participant?.nom?.toLowerCase() || '',
        prenom: participant?.prenom?.toLowerCase() || '',
        organisation: organisation?.nom?.toLowerCase() || '',
        _arriveeDate: group.arrivee ? new Date(group.arrivee.date).getTime() : 0,
        _departDate: group.depart ? new Date(group.depart.date).getTime() : 0
      };
    });

    // Tri par défaut par date (arrivée ou départ)
    grouped.sort((a, b) => {
      const dateA = a.arrivee?.date || a.depart?.date || '';
      const dateB = b.arrivee?.date || b.depart?.date || '';
      if (dateA && dateB) {
        const cmp = new Date(dateA).getTime() - new Date(dateB).getTime();
        if (cmp !== 0) return cmp;
        const heureA = a.arrivee?.heure || a.depart?.heure || '';
        const heureB = b.arrivee?.heure || b.depart?.heure || '';
        return heureA.localeCompare(heureB);
      }
      return 0;
    });

    return grouped;
  }, [appliedTypeVolFilters, appliedOrganisationFilters, appliedPaysVolFilters, appliedDateDebut, appliedDateFin, plansVol, participants, organisations]);

  const isArrivingTomorrow = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const arrivalDate = new Date(dateString);
    arrivalDate.setHours(0, 0, 0, 0);
    return arrivalDate.getTime() === tomorrow.getTime();
  };

  // Dialog de détails
  const DetailsDialog = ({ group }: { group: GroupedPlanVol }) => {
    const participant = getParticipantById(group.participantId);
    if (!participant) return null;

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
            <Eye className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-orange-600" />
              Plan de vol - {participant.prenom} {participant.nom}
            </DialogTitle>
            <DialogDescription>
              Détails des vols d'arrivée et de départ du participant
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-sm text-green-800">Arrivée</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                {group.arrivee ? (
                  <>
                    <div>Vol: <Badge className="bg-green-100 text-green-800">{group.arrivee.numeroVol}</Badge></div>
                    <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {new Date(group.arrivee.date).toLocaleDateString('fr-FR')} • 🕐 {group.arrivee.heure}</div>
                    <div>Aéroport: {group.arrivee.aeroport}</div>
                  </>
                ) : (
                  <span className="text-xs text-gray-500">Aucune arrivée</span>
                )}
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm text-blue-800">Départ</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                {group.depart ? (
                  <>
                    <div>Vol: <Badge className="bg-blue-100 text-blue-800">{group.depart.numeroVol}</Badge></div>
                    <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {new Date(group.depart.date).toLocaleDateString('fr-FR')} • 🕐 {group.depart.heure}</div>
                    <div>Aéroport: {group.depart.aeroport}</div>
                  </>
                ) : (
                  <span className="text-xs text-gray-500">Aucun départ</span>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Colonnes pour le composant List
  const columns: Column<GroupedPlanVol>[] = [
    {
      key: 'nom',
      header: 'Nom',
      sortable: true,
      render: (group) => {
        const participant = getParticipantById(group.participantId);
        return <span className="text-gray-900">{participant?.nom || 'N/A'}</span>;
      },
      sortKey: 'nom'
    },
    {
      key: 'prenom',
      header: 'Prénom',
      sortable: true,
      render: (group) => {
        const participant = getParticipantById(group.participantId);
        return <span className="text-gray-900">{participant?.prenom || 'N/A'}</span>;
      },
      sortKey: 'prenom'
    },
    {
      key: 'organisation',
      header: 'Organisation',
      sortable: true,
      render: (group) => {
        const participant = getParticipantById(group.participantId);
        const organisation = participant ? getOrganisationById(participant.organisationId) : null;
        return <span className="text-gray-600">{organisation?.nom || 'N/A'}</span>;
      },
      sortKey: 'organisation'
    },
    {
      key: 'pays',
      header: 'Pays',
      sortable: false,
      render: (group) => {
        const participant = getParticipantById(group.participantId);
        return <span className="text-gray-600">{participant?.pays || 'N/A'}</span>;
      }
    },
    {
      key: 'arrivee',
      header: 'Arrivée',
      sortable: true,
      render: (group) => {
        const participant = getParticipantById(group.participantId);
        const isImminentArrival = group.arrivee && isArrivingTomorrow(group.arrivee.date);
        
        if (!group.arrivee) {
          return <span className="text-xs text-gray-400">Aucune arrivée</span>;
        }
        
        return (
          <div className="space-y-1 bg-green-50/50 p-2 rounded">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 text-xs">{group.arrivee.numeroVol}</Badge>
              {isImminentArrival && (
                <Badge className="bg-red-500 text-white flex items-center gap-1 animate-pulse text-xs">
                  <AlertCircle className="w-3 h-3" />
                  Demain
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar className="w-3 h-3" />
              {new Date(group.arrivee.date).toLocaleDateString('fr-FR')}
            </div>
            <div className="text-xs text-gray-600">🕐 {group.arrivee.heure}</div>
            <div className="text-xs text-gray-500">De: {group.arrivee.aeroportOrigine?.split(' - ')[1] || 'N/A'}</div>
          </div>
        );
      },
      sortKey: '_arriveeDate' // Le tri se fera sur la date d'arrivée
    },
    {
      key: 'depart',
      header: 'Départ',
      sortable: true,
      render: (group) => {
        if (!group.depart) {
          return <span className="text-xs text-gray-400">Aucun départ</span>;
        }
        
        return (
          <div className="space-y-1 bg-blue-50/50 p-2 rounded">
            <Badge className="bg-blue-100 text-blue-800 text-xs">{group.depart.numeroVol}</Badge>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar className="w-3 h-3" />
              {new Date(group.depart.date).toLocaleDateString('fr-FR')}
            </div>
            <div className="text-xs text-gray-600">🕐 {group.depart.heure}</div>
            <div className="text-xs text-gray-500">Vers: {group.depart.aeroportDestination?.split(' - ')[1] || 'N/A'}</div>
          </div>
        );
      },
      sortKey: '_departDate' // Le tri se fera sur la date de départ
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (group) => <DetailsDialog group={group} />
    }
  ];

  // Composant de filtre personnalisé
  const filterComponent = (
    <div className="space-y-4">
      <Button 
        variant={showFilters ? 'default' : 'outline'} 
        size="sm" 
        onClick={() => setShowFilters(!showFilters)} 
        className="gap-2 w-full md:w-auto"
      >
        <Search className="w-4 h-4" />
        Filtres
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-1 bg-orange-600 text-white">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      {showFilters && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm mb-3 block text-gray-900">Type de vol</Label>
              <div className="space-y-2">
                {['arrivee', 'depart'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-vol-${type}`}
                      checked={tempTypeVolFilters.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTempTypeVolFilters([...tempTypeVolFilters, type]);
                        } else {
                          setTempTypeVolFilters(tempTypeVolFilters.filter(t => t !== type));
                        }
                      }}
                    />
                    <label htmlFor={`type-vol-${type}`} className="text-sm cursor-pointer capitalize">
                      {type === 'arrivee' ? 'Arrivée' : 'Départ'}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm mb-3 block text-gray-900">Période</Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Date de début</Label>
                  <Input type="date" value={tempDateDebut} onChange={(e) => setTempDateDebut(e.target.value)} className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Date de fin</Label>
                  <Input type="date" value={tempDateFin} onChange={(e) => setTempDateFin(e.target.value)} className="text-sm" />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm mb-3 block text-gray-900">Pays</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {uniquePaysVol.map((pays) => (
                  <div key={pays} className="flex items-center space-x-2">
                    <Checkbox
                      id={`pays-vol-${pays}`}
                      checked={tempPaysVolFilters.includes(pays)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTempPaysVolFilters([...tempPaysVolFilters, pays]);
                        } else {
                          setTempPaysVolFilters(tempPaysVolFilters.filter(p => p !== pays));
                        }
                      }}
                    />
                    <label htmlFor={`pays-vol-${pays}`} className="text-sm cursor-pointer">
                      {pays}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm mb-3 block text-gray-900">Organisation</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {organisations.slice(0, 12).map((org) => (
                  <div key={org.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`org-planvol-${org.id}`}
                      checked={tempOrganisationFilters.includes(org.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTempOrganisationFilters([...tempOrganisationFilters, org.id]);
                        } else {
                          setTempOrganisationFilters(tempOrganisationFilters.filter(o => o !== org.id));
                        }
                      }}
                    />
                    <label htmlFor={`org-planvol-${org.id}`} className="text-sm cursor-pointer truncate">
                      {org.nom}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Réinitialiser
            </Button>
            <Button size="sm" onClick={handleApplyFilters} className="bg-orange-600 hover:bg-orange-700">
              Appliquer les filtres
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Export CSV
  const exportHeaders = ['Nom', 'Prénom', 'Organisation', 'Vol Arrivée', 'Date Arrivée', 'Heure Arrivée', 'Vol Départ', 'Date Départ', 'Heure Départ'];
  
  const exportData = (group: GroupedPlanVol) => {
    const participant = getParticipantById(group.participantId);
    const organisation = participant ? getOrganisationById(participant.organisationId) : null;
    return [
      participant?.nom || '',
      participant?.prenom || '',
      organisation?.nom || '',
      group.arrivee?.numeroVol || 'N/A',
      group.arrivee ? new Date(group.arrivee.date).toLocaleDateString('fr-FR') : 'N/A',
      group.arrivee?.heure || 'N/A',
      group.depart?.numeroVol || 'N/A',
      group.depart ? new Date(group.depart.date).toLocaleDateString('fr-FR') : 'N/A',
      group.depart?.heure || 'N/A'
    ];
  };

  // Actions en masse
  const buildActions: ListAction<GroupedPlanVol>[] = [
    {
      label: 'Exporter les sélectionnés',
      icon: <Download className="w-4 h-4" />,
      onClick: (selectedItems) => {
        toast.success(`Export de ${selectedItems.length} participant(s)...`);
        // L'export sera géré par onExport
      },
      variant: 'outline'
    },
    {
      label: 'Envoyer email',
      icon: <Mail className="w-4 h-4" />,
      onClick: (selectedItems) => {
        toast.info(`Envoi d'email pour ${selectedItems.length} participant(s)...`);
        // TODO: Implémenter l'envoi d'email
      },
      variant: 'outline'
    }
  ];

  // Gestion de la sélection
  const handleSelectionChange = (selectedItems: GroupedPlanVol[]) => {
    setSelectedGroups(new Set(selectedItems.map(item => item.participantId)));
  };

  const handleExport = (filteredData: GroupedPlanVol[]) => {
    const dataToExport = selectedGroups.size > 0
      ? filteredData.filter(g => selectedGroups.has(g.participantId))
      : filteredData;
    
    const csvContent = [
      exportHeaders.join(','),
      ...dataToExport.map(exportData)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan-de-vol-fanaf.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <List
      data={groupedPlansVol}
      columns={columns}
      getRowId={(group) => group.participantId}
      searchPlaceholder="Rechercher par nom, prénom, numéro de vol, organisation, aéroport..."
      searchKeys={['_searchText']}
      filterComponent={filterComponent}
      filterTitle="Plan de vol"
      exportFilename="plan-de-vol-fanaf"
      exportHeaders={exportHeaders}
      exportData={exportData}
      onExport={handleExport}
      itemsPerPage={10}
      enableSelection={true}
      buildActions={buildActions}
      onSelectionChange={handleSelectionChange}
      loading={loading}
      emptyMessage="Aucun participant trouvé"
    />
  );
}

export default ListePlanVol;

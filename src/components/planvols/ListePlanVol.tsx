"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { useDynamicInscriptions } from '../hooks/useDynamicInscriptions';
import { getOrganisationById, getPlanVolByType, getParticipantById, getPlanVolByParticipant } from '../data/mockData';
import { Download, Plane, Search, TrendingUp, Calendar, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { toast } from 'sonner';

export function ListePlanVol() {
  const { participants: mockParticipants, organisations: mockOrganisations } = useDynamicInscriptions({ includeOrganisations: true });

  const [searchTerm, setSearchTerm] = useState('');
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

  // Tri et pagination
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const uniquePaysVol = useMemo(() => {
    const allPlansVol = [...getPlanVolByType('arrivee'), ...getPlanVolByType('depart')];
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

  const groupedPlansVol = useMemo(() => {
    let allPlansVol = [...getPlanVolByType('arrivee'), ...getPlanVolByType('depart')];

    if (searchTerm) {
      allPlansVol = allPlansVol.filter(pv => {
        const participant = getParticipantById(pv.participantId);
        if (!participant) return false;
        const organisation = getOrganisationById(participant.organisationId);
        return (
          participant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          participant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pv.numeroVol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          organisation?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pv.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pv.aeroport.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (appliedTypeVolFilters.length > 0) {
      allPlansVol = allPlansVol.filter(pv => appliedTypeVolFilters.includes(pv.type));
    }

    if (appliedOrganisationFilters.length > 0) {
      allPlansVol = allPlansVol.filter(pv => {
        const participant = getParticipantById(pv.participantId);
        return participant && appliedOrganisationFilters.includes(participant.organisationId);
      });
    }

    if (appliedPaysVolFilters.length > 0) {
      allPlansVol = allPlansVol.filter(pv => {
        const participant = getParticipantById(pv.participantId);
        return participant && appliedPaysVolFilters.includes(participant.pays);
      });
    }

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

    const participantMap = new Map();
    allPlansVol.forEach(pv => {
      if (!participantMap.has(pv.participantId)) {
        participantMap.set(pv.participantId, { participantId: pv.participantId, arrivee: null, depart: null });
      }
      const entry = participantMap.get(pv.participantId);
      if (pv.type === 'arrivee') entry.arrivee = pv; else entry.depart = pv;
    });

    const grouped = Array.from(participantMap.values());
    grouped.sort((a: any, b: any) => {
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
  }, [searchTerm, appliedTypeVolFilters, appliedOrganisationFilters, appliedPaysVolFilters, appliedDateDebut, appliedDateFin]);

  // Tri des groupes
  const sortedGroups = useMemo(() => {
    const arr = [...groupedPlansVol];
    if (!sortColumn) return arr;
    const getValue = (g: any) => {
      const participant = getParticipantById(g.participantId);
      switch (sortColumn) {
        case 'nom':
          return (participant?.nom || '').toLowerCase();
        case 'prenom':
          return (participant?.prenom || '').toLowerCase();
        case 'organisation':
          return (getOrganisationById(participant?.organisationId || '')?.nom || '').toLowerCase();
        case 'arrivee':
          return g.arrivee ? new Date(g.arrivee.date).getTime() : 0;
        case 'depart':
          return g.depart ? new Date(g.depart.date).getTime() : 0;
        default:
          return 0;
      }
    };
    arr.sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (typeof va === 'string' && typeof vb === 'string') {
        return sortDirection === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDirection === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return arr;
  }, [groupedPlansVol, sortColumn, sortDirection]);

  const totalPages = Math.ceil(sortedGroups.length / itemsPerPage);
  const paginatedGroups = sortedGroups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const planVolStats = useMemo(() => {
    const arrivees = getPlanVolByType('arrivee');
    const departs = getPlanVolByType('depart');
    return { total: arrivees.length + departs.length, arrivees: arrivees.length, departs: departs.length };
  }, []);

  const exportToCSV = () => {
    const headers = ['Nom', 'Prénom', 'Organisation', 'Vol Arrivée', 'Date Arrivée', 'Heure Arrivée', 'Vol Départ', 'Date Départ', 'Heure Départ'];
    const csvContent = [
      headers.join(','),
      ...groupedPlansVol.map((group: any) => {
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
        ].join(',');
      })
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan-de-vol-fanaf.csv`;
    a.click();
  };

  const isArrivingTomorrow = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const arrivalDate = new Date(dateString);
    arrivalDate.setHours(0, 0, 0, 0);
    return arrivalDate.getTime() === tomorrow.getTime();
  };

  return (
    <div className="p-8">
      {/* Stats */}
     

      {/* Filtres */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Recherche et Filtres
            </div>
            <Button variant={showFilters ? 'default' : 'outline'} size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <Search className="w-4 h-4" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 bg-orange-600 text-white">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom, prénom, numéro de vol, organisation, aéroport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {showFilters && (
            <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm mb-3 block text-gray-900">Type de vol</Label>
                  <div className="space-y-2">
                    {['arrivee', 'depart'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`type-vol-${type}`}
                          checked={tempTypeVolFilters.includes(type)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            if (checked) setTempTypeVolFilters([...tempTypeVolFilters, type]);
                            else setTempTypeVolFilters(tempTypeVolFilters.filter(t => t !== type));
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
                        <input
                          type="checkbox"
                          id={`pays-vol-${pays}`}
                          checked={tempPaysVolFilters.includes(pays)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            if (checked) setTempPaysVolFilters([...tempPaysVolFilters, pays]);
                            else setTempPaysVolFilters(tempPaysVolFilters.filter(p => p !== pays));
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
                    {mockOrganisations.slice(0, 12).map((org) => (
                      <div key={org.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`org-planvol-${org.id}`}
                          checked={tempOrganisationFilters.includes(org.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            if (checked) setTempOrganisationFilters([...tempOrganisationFilters, org.id]);
                            else setTempOrganisationFilters(tempOrganisationFilters.filter(o => o !== org.id));
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

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {groupedPlansVol.length} participant(s) trouvé(s)
              {activeFiltersCount > 0 && (
                <span className="ml-2 text-orange-600">({activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''})</span>
              )}
            </p>
            <Button onClick={exportToCSV} variant="outline" size="sm" disabled={groupedPlansVol.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </CardContent>

        <CardHeader>
          <CardTitle>Plan de vol par participant</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort('nom')} className="cursor-pointer select-none">
                    <div className="flex items-center gap-1">
                      Nom
                      {sortColumn === 'nom' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-50" />}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('prenom')} className="cursor-pointer select-none">
                    <div className="flex items-center gap-1">
                      Prénom
                      {sortColumn === 'prenom' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-50" />}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('organisation')} className="cursor-pointer select-none">
                    <div className="flex items-center gap-1">
                      Organisation
                      {sortColumn === 'organisation' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-50" />}
                    </div>
                  </TableHead>
                  <TableHead>Pays</TableHead>
                  <TableHead onClick={() => handleSort('arrivee')} className="bg-green-50 cursor-pointer select-none">
                    <div className="flex items-center gap-1">
                      Arrivée
                      {sortColumn === 'arrivee' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-50" />}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('depart')} className="bg-blue-50 cursor-pointer select-none">
                    <div className="flex items-center gap-1">
                      Départ
                      {sortColumn === 'depart' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-50" />}
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      Aucun participant trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedGroups.map((group: any) => {
                    const participant = getParticipantById(group.participantId);
                    if (!participant) return null;
                    const organisation = getOrganisationById(participant.organisationId);
                    const isImminentArrival = group.arrivee && isArrivingTomorrow(group.arrivee.date);
                    return (
                      <TableRow key={group.participantId}>
                        <TableCell className="text-gray-900">{participant.nom}</TableCell>
                        <TableCell className="text-gray-900">{participant.prenom}</TableCell>
                        <TableCell className="text-gray-600">{organisation?.nom || 'N/A'}</TableCell>
                        <TableCell className="text-gray-600">{participant.pays}</TableCell>
                        <TableCell className="bg-green-50/50">
                          {group.arrivee ? (
                            <div className="space-y-1">
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
                          ) : (
                            <span className="text-xs text-gray-400">Aucune arrivée</span>
                          )}
                        </TableCell>
                        <TableCell className="bg-blue-50/50">
                          {group.depart ? (
                            <div className="space-y-1">
                              <Badge className="bg-blue-100 text-blue-800 text-xs">{group.depart.numeroVol}</Badge>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Calendar className="w-3 h-3" />
                                {new Date(group.depart.date).toLocaleDateString('fr-FR')}
                              </div>
                              <div className="text-xs text-gray-600">🕐 {group.depart.heure}</div>
                              <div className="text-xs text-gray-500">Vers: {group.depart.aeroportDestination?.split(' - ')[1] || 'N/A'}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Aucun départ</span>
                          )}
                        </TableCell>
                        <TableCell>
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

      {/* Pagination */}
      {sortedGroups.length > 0 && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

export default ListePlanVol;
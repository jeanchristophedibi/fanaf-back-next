import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Search, Filter, Eye, Download, Store } from 'lucide-react';
import { getOrganisationById, getParticipantById, getReferentSponsor, getParticipantsByOrganisation } from './data/helpers';

import { useDynamicInscriptions } from './hooks/useDynamicInscriptions';
import { AnimatedStat } from './AnimatedStat';

export type ReservationSubSection = 'liste' | '9m2' | '12m2';

const statutPaiementColors = {
  'payé': 'bg-green-100 text-green-800',
  'non-payé': 'bg-red-100 text-red-800',
};

interface ReservationsPageProps {
  subSection?: ReservationSubSection;
  filter?: 'all' | '9m2' | '12m2';
  readOnly?: boolean;
}

export function ReservationsPage({ subSection, filter, readOnly = false }: ReservationsPageProps) {
  const { reservations } = useDynamicInscriptions({ includeReservations: true });
  const activeFilter = filter || subSection;
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReservations = useMemo(() => {
    let filtered = [...reservations];

    // Filtre par sous-section (dimension)
    if (activeFilter === '9m2') {
      filtered = filtered.filter(r => r.dimension === '9m²');
    } else if (activeFilter === '12m2') {
      filtered = filtered.filter(r => r.dimension === '12m²');
    }

    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(r => {
        const participant = getParticipantById(r.participantId);
        if (!participant) return false;
        const organisation = getOrganisationById(participant.organisationId);
        
        // Recherche dans le numéro de stand
        if (r.numeroStand.toLowerCase().includes(searchLower)) return true;
        
        // Recherche dans le nom
        if (participant.nom.toLowerCase().includes(searchLower)) return true;
        
        // Recherche dans le prénom
        if (participant.prenom.toLowerCase().includes(searchLower)) return true;
        
        // Recherche dans nom complet (prénom + nom ou nom + prénom)
        const nomComplet1 = `${participant.prenom} ${participant.nom}`.toLowerCase();
        const nomComplet2 = `${participant.nom} ${participant.prenom}`.toLowerCase();
        if (nomComplet1.includes(searchLower) || nomComplet2.includes(searchLower)) return true;
        
        // Recherche dans l'email
        if (participant.email.toLowerCase().includes(searchLower)) return true;
        
        // Recherche dans l'organisation
        if (organisation?.nom.toLowerCase().includes(searchLower)) return true;
        
        return false;
      });
    }

    return filtered;
  }, [reservations, searchTerm, subSection]);

  const getTitle = () => {
    switch (subSection) {
      case 'liste':
        return 'Liste des stands';
      case '9m2':
        return 'Stand 9m²';
      case '12m2':
        return 'Stand 12m²';
    }
  };

  const getTotalReservations = () => {
    if (subSection === '9m2') {
      return reservations.filter(r => r.dimension === '9m²').length;
    } else if (subSection === '12m2') {
      return reservations.filter(r => r.dimension === '12m²').length;
    }
    return reservations.length;
  };

  // Statistiques pour la vue "liste"
  const stats = useMemo(() => {
    const stands9m2 = reservations.filter(r => r.dimension === '9m²');
    const stands12m2 = reservations.filter(r => r.dimension === '12m²');
    
    return {
      stands9m2: stands9m2.length,
      stands12m2: stands12m2.length,
      total: reservations.length
    };
  }, [reservations]);

  const exportToCSV = () => {
    const headers = ['N° Stand', 'Participant', 'Email', 'Organisation', 'Dimension', 'Date Réservation'];
    const csvContent = [
      headers.join(','),
      ...filteredReservations.map(r => {
        const participant = getParticipantById(r.participantId);
        const organisation = participant ? getOrganisationById(participant.organisationId) : null;
        return [
          r.numeroStand,
          participant ? `${participant.prenom} ${participant.nom}` : '',
          participant?.email || '',
          organisation?.nom || '',
          r.dimension,
          new Date(r.dateReservation).toLocaleDateString('fr-FR')
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations-stands-${subSection}-fanaf.csv`;
    a.click();
  };

  return (
    <div className="p-8 animate-page-enter">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">{getTitle()}</h1>
        <p className="text-gray-600">
          {filteredReservations.length} réservation(s) sur {getTotalReservations()}
        </p>
      </div>

      {/* Tableau de bord pour la vue liste */}
      {(subSection === 'liste' || filter === 'all') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 mb-1">Total stands</p>
                  <p className="text-3xl text-purple-900">{stats.total}</p>
                  <p className="text-xs text-purple-600 mt-1">Réservations</p>
                </div>
                <Store className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 mb-1">Stands 9m²</p>
                  <p className="text-3xl text-blue-900">{stats.stands9m2}</p>
                  <p className="text-xs text-blue-600 mt-1">Réservations</p>
                </div>
                <Store className="w-10 h-10 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 mb-1">Stands 12m²</p>
                  <p className="text-3xl text-green-900">{stats.stands12m2}</p>
                  <p className="text-xs text-green-600 mt-1">Réservations</p>
                </div>
                <Store className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher par n° stand, nom, email ou organisation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredReservations.length} réservation(s) trouvée(s)
            </p>
            <Button 
              onClick={exportToCSV} 
              variant="outline" 
              size="sm" 
              disabled={filteredReservations.length === 0 || readOnly}
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Stand</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead>Organisation</TableHead>
                  <TableHead>Dimension</TableHead>
                  <TableHead>Date réservation</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      Aucune réservation trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReservations.map((reservation) => {
                    const participant = getParticipantById(reservation.participantId);
                    const organisation = participant ? getOrganisationById(participant.organisationId) : null;
                    
                    if (!participant) return null;

                    return (
                      <TableRow key={reservation.id}>
                        <TableCell>
                          <Badge variant="outline" className="text-gray-900">
                            {reservation.numeroStand}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-gray-900">{participant.nom} {participant.prenom}</p>
                            <p className="text-xs text-gray-500">{participant.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{organisation?.nom || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{reservation.dimension}</Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(reservation.dateReservation).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Détails de la réservation</DialogTitle>
                                <DialogDescription>
                                  Informations complètes sur la réservation du stand
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="p-3 bg-purple-50 rounded-lg">
                                  <p className="text-sm text-gray-500">Numéro de stand</p>
                                  <p className="text-gray-900 text-xl">{reservation.numeroStand}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Nom</p>
                                    <p className="text-gray-900">{participant.nom}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Prénom</p>
                                    <p className="text-gray-900">{participant.prenom}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Email</p>
                                  <p className="text-gray-900">{participant.email}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Contact</p>
                                  <p className="text-gray-900">{participant.telephone}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Organisation</p>
                                  <p className="text-gray-900">{organisation?.nom || 'N/A'}</p>
                                </div>
                                <div className="border-t pt-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Dimension</p>
                                    <p className="text-gray-900">{reservation.dimension}</p>
                                  </div>
                                  <div className="mt-4">
                                    <p className="text-sm text-gray-500">Date de réservation</p>
                                    <p className="text-gray-900">
                                      {new Date(reservation.dateReservation).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>
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
    </div>
  );
}

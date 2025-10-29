"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { Search, Filter, Eye, Download, User, QrCode, History, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { getParticipantsByOrganisation } from "../data/mockData";
import { useDynamicInscriptions } from "../hooks/useDynamicInscriptions";
import { BadgeReferentGenerator } from "../BadgeReferentGenerator";
import { HistoriqueRendezVousDialog } from "../HistoriqueRendezVousDialog";
import type { OrganisationSubSection } from "../../app/dashboard/agence/Dashboard";

const statutOrgColors = {
  'membre': 'bg-teal-100 text-teal-800',
  'non-membre': 'bg-gray-100 text-gray-800',
  'sponsor': 'bg-amber-100 text-amber-800',
};

const statutOrgLabels = {
  'membre': 'Association membre',
  'non-membre': 'Entreprise',
  'sponsor': 'Sponsor',
};

interface ListeOrganisationsProps {
  subSection?: OrganisationSubSection;
  filter?: 'all' | 'membre' | 'non-membre' | 'sponsor';
  readOnly?: boolean;
}

export function ListeOrganisations({ subSection, filter, readOnly = false }: ListeOrganisationsProps) {
  const { organisations, rendezVous } = useDynamicInscriptions({ includeOrganisations: true, includeRendezVous: true });
  const activeFilter = filter || subSection;
  const [searchTerm, setSearchTerm] = useState('');
  const [paysFilter, setPaysFilter] = useState<string>('tous');
  const [historiqueParticipantId, setHistoriqueParticipantId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // État pour le tri
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const filteredOrganisations = useMemo(() => {
    let filtered = [...organisations];

    // Filtre par sous-section (statut)
    if (activeFilter && activeFilter !== 'all' && activeFilter !== 'liste') {
      filtered = filtered.filter(o => o.statut === activeFilter);
    }

    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(o =>
        o.nom.toLowerCase().includes(searchLower) ||
        o.email.toLowerCase().includes(searchLower) ||
        o.pays.toLowerCase().includes(searchLower) ||
        o.contact.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par pays
    if (paysFilter !== 'tous') {
      filtered = filtered.filter(o => o.pays === paysFilter);
    }

    // Tri
    if (sortConfig) {
      filtered.sort((a, b) => {
        const key = sortConfig.key as keyof typeof a;
        const aRaw = a[key];
        const bRaw = b[key];
        
        let aValue: string | number;
        let bValue: string | number;
        
        // Gérer les dates
        if (sortConfig.key === 'dateCreation') {
          aValue = new Date(aRaw as any).getTime();
          bValue = new Date(bRaw as any).getTime();
        } else {
          // Gérer les strings
          aValue = String(aRaw || '').toLowerCase();
          bValue = String(bRaw || '').toLowerCase();
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [organisations, searchTerm, paysFilter, activeFilter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredOrganisations.length / itemsPerPage);
  const paginatedOrganisations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrganisations.slice(startIndex, endIndex);
  }, [filteredOrganisations, currentPage]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, paysFilter, activeFilter]);

  // Récupérer la liste unique des pays
  const paysList = useMemo(() => {
    const pays = new Set(organisations.map(o => o.pays));
    return Array.from(pays).sort();
  }, [organisations]);

  // Fonction de tri
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Réinitialiser à la page 1 lors du tri
  };

  // Composant pour afficher la section référent avec badge
  const ReferentSection = ({ 
    referent, 
    organisationNom, 
    organisationId 
  }: { 
    referent: typeof organisations[0]['referent'], 
    organisationNom: string,
    organisationId: string
  }) => {
    const [isBadgeOpen, setIsBadgeOpen] = useState(false);

    if (!referent) return null;

    // Trouver le participant correspondant au référent pour avoir son ID
    const referentParticipant = getParticipantsByOrganisation(organisationId).find(
      p => p.statut === 'referent'
    );

    return (
      <>
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-orange-600" />
              <h3 className="text-gray-900">Référent (contact pour les rendez-vous)</h3>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsBadgeOpen(true)}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Badge référent
              </Button>
              {referentParticipant && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setHistoriqueParticipantId(referentParticipant.id)}
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                >
                  <History className="w-4 h-4 mr-2" />
                  Historique RDV
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 bg-orange-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Nom complet</p>
              <p className="text-gray-900">{referent.prenom} {referent.nom}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fonction</p>
              <p className="text-gray-900">{referent.fonction}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{referent.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Téléphone</p>
              <p className="text-gray-900">{referent.telephone}</p>
            </div>
          </div>
        </div>
        <BadgeReferentGenerator
          referent={referent}
          organisationNom={organisationNom}
          organisationId={organisationId}
          isOpen={isBadgeOpen}
          onClose={() => setIsBadgeOpen(false)}
        />
      </>
    );
  };

  const exportToCSV = () => {
    const headers = ['Nom', 'Email', 'Contact', 'Pays', 'Statut', 'Nombre de Participants'];
    const csvContent = [
      headers.join(','),
      ...filteredOrganisations.map(org => {
        const participants = getParticipantsByOrganisation(org.id);
        return [
          org.nom,
          org.email,
          org.contact,
          org.pays,
          org.statut,
          participants.length
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `organisations-${subSection || filter || 'liste'}-fanaf.csv`;
    a.click();
  };

  return (
    <>
      <Card className="mb-6 rounded-b-none border-b-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email, pays ou contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={paysFilter} onValueChange={setPaysFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les pays</SelectItem>
                {paysList.map(pays => (
                  <SelectItem key={pays} value={pays}>{pays}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredOrganisations.length} organisation(s) trouvée(s)
            </p>
            <Button 
              onClick={exportToCSV} 
              variant="outline" 
              size="sm" 
              disabled={filteredOrganisations.length === 0 || readOnly}
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </CardContent>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button onClick={() => handleSort('nom')} className="flex items-center gap-1 hover:text-gray-700">
                      Nom de l'organisation
                      {sortConfig?.key === 'nom' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort('contact')} className="flex items-center gap-1 hover:text-gray-700">
                      Contact
                      {sortConfig?.key === 'contact' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort('email')} className="flex items-center gap-1 hover:text-gray-700">
                      Email
                      {sortConfig?.key === 'email' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort('pays')} className="flex items-center gap-1 hover:text-gray-700">
                      Pays
                      {sortConfig?.key === 'pays' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort('dateCreation')} className="flex items-center gap-1 hover:text-gray-700">
                      Date de création
                      {sortConfig?.key === 'dateCreation' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort('statut')} className="flex items-center gap-1 hover:text-gray-700">
                      Statut
                      {sortConfig?.key === 'statut' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </button>
                  </TableHead>
                  {(subSection === 'sponsor' || filter === 'sponsor') && <TableHead>Référent</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrganisations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={(subSection === 'sponsor' || filter === 'sponsor') ? 8 : 7} className="text-center text-gray-500 py-8">
                      Aucune organisation trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrganisations.map((organisation) => {
                    const participants = getParticipantsByOrganisation(organisation.id);
                    
                    return (
                      <TableRow key={organisation.id}>
                        <TableCell className="text-gray-900">{organisation.nom}</TableCell>
                        <TableCell className="text-gray-600">{organisation.contact}</TableCell>
                        <TableCell className="text-gray-600">{organisation.email}</TableCell>
                        <TableCell>{organisation.pays}</TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(organisation.dateCreation).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Badge className={statutOrgColors[organisation.statut]}>
                            {statutOrgLabels[organisation.statut]}
                          </Badge>
                        </TableCell>
                        {(subSection === 'sponsor' || filter === 'sponsor') && (
                          <TableCell>
                            {organisation.referent ? (
                              <div className="text-sm">
                                <p className="text-gray-900">{organisation.referent.prenom} {organisation.referent.nom}</p>
                                <p className="text-xs text-orange-600">{organisation.referent.fonction}</p>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Aucun référent</span>
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{organisation.nom}</DialogTitle>
                                <DialogDescription>
                                  Informations détaillées sur l'organisation et ses participants
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Contact</p>
                                    <p className="text-gray-900">{organisation.contact}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-gray-900">{organisation.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Pays</p>
                                    <p className="text-gray-900">{organisation.pays}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Statut</p>
                                    <Badge className={`${statutOrgColors[organisation.statut]} mt-1`}>
                                      {statutOrgLabels[organisation.statut]}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Informations du référent pour les sponsors */}
                                {organisation.statut === 'sponsor' && organisation.referent && (
                                  <ReferentSection 
                                    referent={organisation.referent}
                                    organisationNom={organisation.nom}
                                    organisationId={organisation.id}
                                  />
                                )}

                                <div className="border-t pt-4">
                                  <h3 className="text-gray-900 mb-4">
                                    Participants de cette organisation ({participants.length})
                                  </h3>
                                  {participants.length === 0 ? (
                                    <p className="text-sm text-gray-500">Aucun participant inscrit</p>
                                  ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                      {participants.map(participant => (
                                        <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                          <div>
                                            <p className="text-sm text-gray-900">
                                              {participant.prenom} {participant.nom}
                                            </p>
                                            <p className="text-xs text-gray-500">{participant.email}</p>
                                          </div>
                                          <Badge className="text-xs">
                                            {participant.statut}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  )}
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

      {/* Pagination */}
      {filteredOrganisations.length > 0 && totalPages > 1 && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages} ({filteredOrganisations.length} résultat{filteredOrganisations.length > 1 ? 's' : ''})
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

      {/* Dialogue historique rendez-vous */}
      {historiqueParticipantId && (
        <HistoriqueRendezVousDialog
          isOpen={!!historiqueParticipantId}
          onClose={() => setHistoriqueParticipantId(null)}
          participantId={historiqueParticipantId}
          rendezVousList={rendezVous}
        />
      )}
    </>
  );
}


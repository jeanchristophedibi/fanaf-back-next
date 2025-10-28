'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { Search, Download, Filter, Users, UserCheck, Award, Mic, Eye, FileDown, User, Mail, Phone, Globe, Building, Calendar, FileText, X, QrCode, Package, Receipt, CheckCircle2, Clock } from 'lucide-react';
import { getOrganisationById, type Participant } from '../data/mockData';
import { useDynamicInscriptions } from '../hooks/useDynamicInscriptions';
import { AnimatedStat } from '../AnimatedStat';
import { toast } from 'sonner';
import { BadgeGenerator } from '../BadgeGenerator';
import { ReceiptGenerator } from '../ReceiptGenerator';
import JSZip from 'jszip';

interface ListeInscriptionsProps {
    readOnly?: boolean;
    userProfile?: 'agence' | 'fanaf' | 'asaci';
}
export function ListeInscriptions({ readOnly = false, userProfile = 'agence' }: ListeInscriptionsProps = {}) {
    const { participants, organisations } = useDynamicInscriptions({ includeOrganisations: true });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // États pour les filtres multi-sélection (avant validation)
    const [tempStatutFilters, setTempStatutFilters] = useState<string[]>([]);
    const [tempStatutInscriptionFilters, setTempStatutInscriptionFilters] = useState<string[]>([]);
    const [tempOrganisationFilters, setTempOrganisationFilters] = useState<string[]>([]);
    const [tempPaysFilters, setTempPaysFilters] = useState<string[]>([]);
    
    // États pour les filtres appliqués (après validation)
    const [appliedStatutFilters, setAppliedStatutFilters] = useState<string[]>([]);
    const [appliedStatutInscriptionFilters, setAppliedStatutInscriptionFilters] = useState<string[]>([]);
    const [appliedOrganisationFilters, setAppliedOrganisationFilters] = useState<string[]>([]);
    const [appliedPaysFilters, setAppliedPaysFilters] = useState<string[]>([]);
    
    const [showFilters, setShowFilters] = useState(false);
    const [isDownloadingBadges, setIsDownloadingBadges] = useState(false);
    
    const statutColors: Record<string, string> = {
        'membre': 'bg-purple-100 text-purple-800',
        'non-membre': 'bg-amber-100 text-amber-800',
        'vip': 'bg-cyan-100 text-cyan-800',
        'speaker': 'bg-yellow-100 text-yellow-800',
    };
    
    const statutInscriptionColors: Record<string, string> = {
        'finalisée': 'bg-emerald-100 text-emerald-800',
        'non-finalisée': 'bg-red-100 text-red-800',
    };
    
    const getStatutPaiementLabel = (p: Participant) => {
        if (p.statut === 'vip' || p.statut === 'speaker') return 'exonéré';
        return p.statutInscription;
    };
    
    const activeFiltersCount = appliedStatutFilters.length + appliedStatutInscriptionFilters.length + appliedOrganisationFilters.length + appliedPaysFilters.length;
    
    const handleResetFilters = () => {
        setTempStatutFilters([]);
        setTempStatutInscriptionFilters([]);
        setTempOrganisationFilters([]);
        setTempPaysFilters([]);
        setAppliedStatutFilters([]);
        setAppliedStatutInscriptionFilters([]);
        setAppliedOrganisationFilters([]);
        setAppliedPaysFilters([]);
        toast.success('Filtres réinitialisés');
    };
    
    const handleApplyFilters = () => {
        setAppliedStatutFilters(tempStatutFilters);
        setAppliedStatutInscriptionFilters(tempStatutInscriptionFilters);
        setAppliedOrganisationFilters(tempOrganisationFilters);
        setAppliedPaysFilters(tempPaysFilters);
        setShowFilters(false);
        toast.success('Filtres appliqués');
    };
    
    const downloadAllBadges = async () => {
        toast.info('Fonction de téléchargement non implémentée');
    };
    
    const exportToCSV = () => {
        toast.info('Fonction d\'export non implémentée');
    };
    
    const filteredParticipants = participants.filter(participant => {
        const org = getOrganisationById(participant.organisationId);
        const matchesSearch = participant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            participant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            participant.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            participant.telephone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            participant.pays.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (org?.nom || '').toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesStatut = appliedStatutFilters.length === 0 || appliedStatutFilters.includes(participant.statut);
        const matchesStatutInscription = appliedStatutInscriptionFilters.length === 0 || appliedStatutInscriptionFilters.includes(participant.statutInscription);
        const matchesOrganisation = appliedOrganisationFilters.length === 0 || appliedOrganisationFilters.includes(participant.organisationId);
        const matchesPays = appliedPaysFilters.length === 0 || appliedPaysFilters.includes(participant.pays);
        
        return matchesSearch && matchesStatut && matchesStatutInscription && matchesOrganisation && matchesPays;
    });
    
    const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
    const paginatedParticipants = filteredParticipants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    
    
    const uniquePays = [...new Set(participants.map(p => p.pays))].sort();
    
    const badgesGenerables = filteredParticipants.filter(p => p.statutInscription === 'finalisée').length;
    
    const ParticipantDetailsDialog = ({ participant }: { participant: Participant }) => {
        const [isOpen, setIsOpen] = useState(false);
        const organisation = getOrganisationById(participant.organisationId);
        
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Eye className="w-4 h-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Détails du Participant
                        </DialogTitle>
                        <DialogDescription>
                            Informations complètes de {participant.prenom} {participant.nom}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        {/* Informations personnelles */}
                        <div className="space-y-3">
                            <div>
                                <Label className="text-xs text-gray-500">Référence</Label>
                                <p className="text-sm font-medium mt-1">{participant.reference}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Nom complet</Label>
                                <p className="text-sm font-medium mt-1">{participant.prenom} {participant.nom}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Email</Label>
                                <p className="text-sm mt-1 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {participant.email}
                                </p>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Téléphone</Label>
                                <p className="text-sm mt-1 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {participant.telephone}
                                </p>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Pays</Label>
                                <p className="text-sm mt-1 flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    {participant.pays}
                                </p>
                            </div>
                        </div>
                        
                        {/* Statuts et organisation */}
                        <div className="space-y-3">
                            <div>
                                <Label className="text-xs text-gray-500">Statut Participant</Label>
                                <div className="mt-1">
                                    <Badge className={`${statutColors[participant.statut]} text-xs`}>
                                        {participant.statut}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Statut Inscription</Label>
                                <div className="mt-1">
                                    <Badge className={`${statutInscriptionColors[getStatutPaiementLabel(participant)]} text-xs`}>
                                        {getStatutPaiementLabel(participant)}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Organisation</Label>
                                <p className="text-sm mt-1 flex items-center gap-1">
                                    <Building className="w-3 h-3" />
                                    {organisation?.nom || 'N/A'}
                                </p>
                            </div>
                            {participant.modePaiement && (
                                <div>
                                    <Label className="text-xs text-gray-500">Mode de paiement</Label>
                                    <p className="text-sm mt-1 capitalize">{participant.modePaiement}</p>
                                </div>
                            )}
                            <div>
                                <Label className="text-xs text-gray-500">Date d'inscription</Label>
                                <p className="text-sm mt-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(participant.dateInscription).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    };
    
    return (
<div>
<Card className="mb-3">
  <CardContent className="p-3">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4" />
        <span className="text-sm">Recherche et Filtres</span>
      </div>
      <Button 
        variant={showFilters ? "default" : "outline"}
        size="sm"
        onClick={() => setShowFilters(!showFilters)}
        className="gap-2 h-7 text-xs"
      >
        <Filter className="w-3 h-3" />
        Filtres
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-1 bg-orange-600 text-white text-xs h-4 px-1">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>
    </div>
    {/* Champ de recherche */}
    <div className="relative mb-2">
      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
      <Input
        placeholder="Rechercher par nom, prénom, email, référence, téléphone, pays, organisation..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-8 h-8 text-sm"
      />
    </div>

    {/* Panneau de filtres multi-sélection */}
    {showFilters && (
      <div className="border border-gray-200 rounded-lg p-2 mb-2 bg-gray-50 animate-slide-down">
        <div className="grid grid-cols-4 gap-3">
          {/* Filtre Statut Participant */}
          <div>
            <Label className="text-xs mb-1.5 block text-gray-900">Statut Participant</Label>
            <div className="space-y-1">
              {['membre', 'non-membre', 'vip', 'speaker'].map((statut) => (
                <div key={statut} className="flex items-center space-x-1.5">
                  <Checkbox
                    id={`statut-${statut}`}
                    checked={tempStatutFilters.includes(statut)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setTempStatutFilters([...tempStatutFilters, statut]);
                      } else {
                        setTempStatutFilters(tempStatutFilters.filter(s => s !== statut));
                      }
                    }}
                    className="h-3 w-3"
                  />
                  <label
                    htmlFor={`statut-${statut}`}
                    className="text-xs cursor-pointer capitalize"
                  >
                    {statut}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Filtre Statut Inscription */}
          <div>
            <Label className="text-xs mb-1.5 block text-gray-900">Statut Inscription</Label>
            <div className="space-y-1">
              {['finalisée', 'non-finalisée', 'exonéré'].map((statut) => (
                <div key={statut} className="flex items-center space-x-1.5">
                  <Checkbox
                    id={`statut-inscription-${statut}`}
                    checked={tempStatutInscriptionFilters.includes(statut)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setTempStatutInscriptionFilters([...tempStatutInscriptionFilters, statut]);
                      } else {
                        setTempStatutInscriptionFilters(tempStatutInscriptionFilters.filter(s => s !== statut));
                      }
                    }}
                    className="h-3 w-3"
                  />
                  <label
                    htmlFor={`statut-inscription-${statut}`}
                    className="text-xs cursor-pointer capitalize"
                  >
                    {statut}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Filtre Organisation */}
          <div>
            <Label className="text-xs mb-1.5 block text-gray-900">Organisation</Label>
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {organisations.slice(0, 6).map((org) => (
                <div key={org.id} className="flex items-center space-x-1.5">
                  <Checkbox
                    id={`org-${org.id}`}
                    checked={tempOrganisationFilters.includes(org.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setTempOrganisationFilters([...tempOrganisationFilters, org.id]);
                      } else {
                        setTempOrganisationFilters(tempOrganisationFilters.filter(o => o !== org.id));
                      }
                    }}
                    className="h-3 w-3"
                  />
                  <label
                    htmlFor={`org-${org.id}`}
                    className="text-xs cursor-pointer truncate"
                  >
                    {org.nom}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Filtre Pays */}
          <div>
            <Label className="text-xs mb-1.5 block text-gray-900">Pays</Label>
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {uniquePays.slice(0, 6).map((pays) => (
                <div key={pays} className="flex items-center space-x-1.5">
                  <Checkbox
                    id={`pays-${pays}`}
                    checked={tempPaysFilters.includes(pays)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setTempPaysFilters([...tempPaysFilters, pays]);
                      } else {
                        setTempPaysFilters(tempPaysFilters.filter(p => p !== pays));
                      }
                    }}
                    className="h-3 w-3"
                  />
                  <label
                    htmlFor={`pays-${pays}`}
                    className="text-xs cursor-pointer"
                  >
                    {pays}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Boutons d'action */}
        <div className="flex justify-end gap-1.5">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleResetFilters}
            className="h-7 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Réinitialiser
          </Button>
          <Button 
            size="sm"
            onClick={handleApplyFilters}
            className="bg-orange-600 hover:bg-orange-700 h-7 text-xs"
          >
            Appliquer les filtres
          </Button>
        </div>
      </div>
    )}

    <div className="flex justify-between items-center">
      <div className="text-xs text-gray-600">
        <p>
          {filteredParticipants.length} participant(s) sur {participants.length}
          {activeFiltersCount > 0 && (
            <span className="ml-1 text-orange-600">
              ({activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''})
            </span>
          )}
        </p>
      </div>
      <div className="flex gap-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={downloadAllBadges} 
                variant="default"
                className="bg-orange-600 hover:bg-orange-700 text-white h-7 text-xs"
                disabled={badgesGenerables === 0 || isDownloadingBadges || readOnly}
              >
                {isDownloadingBadges ? (
                  <>
                    <Package className="w-3 h-3 mr-1 animate-pulse" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Package className="w-3 h-3 mr-1" />
                    Télécharger badges ({badgesGenerables})
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {badgesGenerables > 0 
                  ? `Téléchargera ${badgesGenerables} badge(s) - inscriptions finalisées uniquement` 
                  : `Aucun badge générable - aucune inscription finalisée`
                }
              </p>
              {filteredParticipants.length > badgesGenerables && (
                <p className="text-xs text-orange-400 mt-1">
                  {filteredParticipants.length - badgesGenerables} participant(s) exclu(s) - paiement en attente
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={exportToCSV} 
                variant="outline" 
                disabled={filteredParticipants.length === 0}
                className="h-7 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                CSV
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {activeFiltersCount > 0 
                  ? `Exportera ${filteredParticipants.length} participant(s) filtrés` 
                  : `Exportera tous les ${filteredParticipants.length} participants`
                }
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  </CardContent>
</Card>

{filteredParticipants.length > badgesGenerables && (
  <Card className="border-orange-200 bg-orange-50">
    <CardContent className="p-3">
      <div className="flex items-start gap-2">
        <QrCode className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs text-orange-900">
            <span className="font-medium">{filteredParticipants.length - badgesGenerables} participant(s)</span> ne peuvent pas encore générer leur badge car leur inscription n'est pas finalisée (paiement en attente).
          </p>
          <p className="text-xs text-orange-700 mt-1">
            Les badges seront disponibles uniquement après validation du paiement.
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
)}

<Card>
  <CardContent className="p-0">
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="h-8">
            <TableHead className="text-xs py-1.5">Référence</TableHead>
            <TableHead className="text-xs py-1.5">Participant</TableHead>
            <TableHead className="text-xs py-1.5">Contact</TableHead>
            <TableHead className="text-xs py-1.5">Organisation</TableHead>
            <TableHead className="text-xs py-1.5">Pays</TableHead>
            <TableHead className="text-xs py-1.5">Statut Participant</TableHead>
            <TableHead className="text-xs py-1.5">Statut Inscription</TableHead>
            <TableHead className="text-xs py-1.5">Mode de paiement</TableHead>
            <TableHead className="text-xs py-1.5">Date d'inscription</TableHead>
            <TableHead className="text-xs py-1.5">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredParticipants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-gray-500 py-4 text-xs">
                Aucun participant trouvé
              </TableCell>
            </TableRow>
          ) : (
            paginatedParticipants.map((participant) => {
              const organisation = getOrganisationById(participant.organisationId);
              return (
                <TableRow key={participant.id} className="h-9">
                  <TableCell className="text-gray-900 py-1.5 text-xs">{participant.reference}</TableCell>
                  <TableCell className="py-1.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-gray-900">{participant.prenom} {participant.nom}</span>
                      <div className="flex items-center gap-1">
                        <Mail className="w-2.5 h-2.5 text-gray-400" />
                        <span className="text-xs text-gray-500 truncate max-w-[200px]">{participant.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 py-1.5 text-xs">{participant.telephone}</TableCell>
                  <TableCell className="text-gray-600 py-1.5 text-xs">{organisation?.nom || 'N/A'}</TableCell>
                  <TableCell className="py-1.5 text-xs">{participant.pays}</TableCell>
                  <TableCell className="py-1.5">
                    <Badge className={`${statutColors[participant.statut]} text-xs h-5 px-1.5`}>
                      {participant.statut}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1.5">
                    <Badge className={`${statutInscriptionColors[getStatutPaiementLabel(participant)]} text-xs h-5 px-1.5`}>
                      {getStatutPaiementLabel(participant)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1.5 text-xs">
                    {getStatutPaiementLabel(participant) === 'finalisée' && participant.modePaiement ? (
                      <div className="flex items-center gap-1">
                        <span>
                          {participant.modePaiement === 'espèce' && '💵'}
                          {participant.modePaiement === 'carte bancaire' && '💳'}
                          {participant.modePaiement === 'orange money' && '🟠'}
                          {participant.modePaiement === 'wave' && '🌊'}
                          {participant.modePaiement === 'virement' && '🏦'}
                        </span>
                        <span className="text-gray-700 capitalize">{participant.modePaiement}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600 py-1.5 text-xs">
                    {new Date(participant.dateInscription).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="py-1.5">
                    <ParticipantDetailsDialog participant={participant} />
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
{filteredParticipants.length > 0 && totalPages > 1 && (
  <div className="mt-4 flex items-center justify-center">
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
        
        {/* Pages */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          // N'afficher que certaines pages pour éviter trop de boutons
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
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
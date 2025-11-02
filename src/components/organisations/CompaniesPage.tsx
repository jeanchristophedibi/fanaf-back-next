"use client";

import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import { Search, Filter, Eye, Download, Building2, ChevronLeft, ChevronRight, UserPlus, Power, Loader2 } from 'lucide-react';
import { useFanafApi } from '../../hooks/useFanafApi';
import { mapApiAssociationToOrganisation, companiesDataService } from '../data/companiesData';
import type { Organisation } from '../data/types';
import { toast } from 'sonner';
import { CreateCompanyDialog } from './CreateCompanyDialog';

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

export function CompaniesPage() {
  const { api } = useFanafApi();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('tous');
  const [selectedStatut, setSelectedStatut] = useState<string>('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<Organisation | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const itemsPerPage = 20;

  // Query pour charger les compagnies depuis l'API avec pagination complète
  const companiesQuery = useQuery({
    queryKey: ['adminAsaciCompanies', 'all'],
    queryFn: async () => {
      try {
        const allCompanies: Organisation[] = [];
        const perPage = 100;

        // Charger tous les types : company et association
        for (const orgType of ['company', 'association'] as const) {
          let page = 1;
          let hasMore = true;

          while (hasMore) {
            try {
              console.log(`[CompaniesPage] Chargement ${orgType} - Page ${page}`);
              
              const response = await api.getCompanies({
                type: orgType,
                per_page: perPage,
                page: page,
              }) as any;

              // Extraire les données des réponses
              const extractData = (response: any): any[] => {
                if (Array.isArray(response?.data?.data)) {
                  return response.data.data;
                }
                if (Array.isArray(response?.data)) {
                  return response.data;
                }
                if (Array.isArray(response)) {
                  return response;
                }
                return [];
              };

              const data = extractData(response);
              
              // Mapper et ajouter les compagnies
              const mapped = data.map((item: any) => mapApiAssociationToOrganisation(item));
              allCompanies.push(...mapped);

              console.log(`[CompaniesPage] ${orgType} - Page ${page}: ${data.length} compagnies chargées`);

              // Déterminer s'il y a une page suivante
              if (response?.data?.last_page !== undefined) {
                const totalPages = response.data.last_page || 1;
                hasMore = page < totalPages;
                console.log(`[CompaniesPage] ${orgType} - Total: ${response.data.total || 0} (${totalPages} pages)`);
              } else if (response?.meta?.last_page !== undefined) {
                const totalPages = response.meta.last_page || 1;
                hasMore = page < totalPages;
                console.log(`[CompaniesPage] ${orgType} - Total: ${response.meta.total || 0} (${totalPages} pages)`);
              } else {
                // Si pas d'info de pagination, continuer si on a reçu exactement perPage éléments
                hasMore = data.length === perPage;
              }

              // Si pas assez de données, pas de page suivante
              if (data.length < perPage) {
                hasMore = false;
              }

              page++;
            } catch (pageError) {
              console.error(`[CompaniesPage] Erreur lors du chargement ${orgType} page ${page}:`, pageError);
              hasMore = false; // Arrêter en cas d'erreur
            }
          }
        }

        console.log(`[CompaniesPage] Total chargé: ${allCompanies.length} compagnies`);
        return allCompanies;
      } catch (error) {
        console.error('Erreur lors du chargement des compagnies:', error);
        toast.error('Impossible de charger les compagnies');
        return [] as Organisation[];
      }
    },
    enabled: true,
    staleTime: 30 * 1000, // Cache pendant 30 secondes
    gcTime: 5 * 60 * 1000, // Garder en cache pendant 5 minutes
  });

  const allCompanies = companiesQuery.data ?? [];
  const isLoading = companiesQuery.isLoading;

  // Mutation pour basculer le statut d'une compagnie
  const toggleStatusMutation = useMutation({
    mutationFn: async (companyId: string) => {
      // Trouver la compagnie pour connaître son état actuel
      const company = allCompanies.find(c => c.id === companyId);
      const currentStatus = company?.is_active !== false ? 'actif' : 'inactif';
      console.log('[CompaniesPage] ===== TOGGLE STATUS =====');
      console.log('[CompaniesPage] Company ID:', companyId);
      console.log('[CompaniesPage] État actuel:', currentStatus);
      console.log('[CompaniesPage] is_active actuel:', company?.is_active);
      console.log('[CompaniesPage] Nouvel état attendu:', currentStatus === 'actif' ? 'inactif' : 'actif');
      
      return await api.toggleCompanyStatus(companyId);
    },
    onSuccess: async (response, companyId) => {
      console.log('[CompaniesPage] ===== SUCCÈS TOGGLE STATUS =====');
      console.log('[CompaniesPage] Company ID:', companyId);
      console.log('[CompaniesPage] Réponse complète:', response);
      console.log('[CompaniesPage] Response.data:', response?.data);
      console.log('[CompaniesPage] Response.is_active:', response?.data?.is_active);
      
      // Invalider tous les caches liés aux compagnies/organisations
      
      // 1. Invalider le cache adminAsaciCompanies (utilisé dans cette page)
      await queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          if (!Array.isArray(key) || key.length === 0) return false;
          return key[0] === 'adminAsaciCompanies';
        },
        refetchType: 'active',
      });

      // 2. Invalider le cache organisations (utilisé dans d'autres composants)
      await queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          if (!Array.isArray(key) || key.length === 0) return false;
          return key[0] === 'organisations';
        },
        refetchType: 'active',
      });

      // 3. Recharger immédiatement les requêtes actives
      await queryClient.refetchQueries({
        predicate: (query) => {
          const key = query.queryKey;
          if (!Array.isArray(key) || key.length === 0) return false;
          return key[0] === 'adminAsaciCompanies' || key[0] === 'organisations';
        },
      });

      // 4. Vider le cache interne du service companiesDataService
      // Note: Ce cache est utilisé dans d'autres composants, donc on doit le forcer à se recharger
      companiesDataService.clearCache();

      console.log('[CompaniesPage] Tous les caches invalidés et données rechargées');

      toast.success('Statut de la compagnie mis à jour avec succès');
    },
    onError: (error: any) => {
      console.error('[CompaniesPage] ===== ERREUR TOGGLE STATUS =====');
      console.error('[CompaniesPage] Company ID:', error?.companyId || 'unknown');
      console.error('[CompaniesPage] Erreur complète:', error);
      
      // Extraire le message d'erreur depuis différentes structures
      let errorMessage = 'Erreur lors de la mise à jour du statut';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.originalError?.message) {
        errorMessage = error.originalError.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors) {
        // Format Laravel validation errors
        const errors = error.response.data.errors;
        if (Array.isArray(errors)) {
          errorMessage = errors.map((e: any) => e.message || e.detail || String(e)).join(', ');
        } else if (typeof errors === 'object') {
          errorMessage = Object.entries(errors)
            .map(([key, values]: [string, any]) => {
              if (Array.isArray(values)) {
                return `${key}: ${values.join(', ')}`;
              }
              return `${key}: ${values}`;
            })
            .join('; ');
        }
      }
      
      console.error('[CompaniesPage] Message d\'erreur final:', errorMessage);
      toast.error(errorMessage, {
        description: error?.companyId ? `Compagnie ID: ${error.companyId}` : undefined,
        duration: 5000,
      });
    },
  });

  // Filtrer les compagnies
  const filteredCompanies = allCompanies.filter((company: Organisation) => {
    const matchesSearch = 
      company.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.pays.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'tous' || 
      (selectedType === 'company' && company.statut === 'non-membre') ||
      (selectedType === 'association' && company.statut === 'membre');
    
    const matchesStatut = selectedStatut === 'tous' || company.statut === selectedStatut;
    
    return matchesSearch && matchesType && matchesStatut;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

  // Calculer les statistiques
  const stats = {
    total: allCompanies.length,
    membres: allCompanies.filter((c: Organisation) => c.statut === 'membre').length,
    nonMembres: allCompanies.filter((c: Organisation) => c.statut === 'non-membre').length,
    sponsors: allCompanies.filter((c: Organisation) => c.statut === 'sponsor').length,
  };

  const handleExport = () => {
    console.log('Export des données...');
    // Logique d'export CSV
    const csvContent = [
      ['Nom', 'Email', 'Contact', 'Pays', 'Statut', 'Secteur', 'Date création'].join(','),
      ...filteredCompanies.map((c: Organisation) => [
        c.nom,
        c.email || '',
        c.contact || '',
        c.pays,
        c.statut,
        c.secteurActivite || '',
        new Date(c.dateCreation || '').toLocaleDateString('fr-FR'),
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `compagnies-fanaf-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export CSV réussi');
  };

  return (
    <div className="p-8 space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-gray-900 mb-2">Gestion des Compagnies</h1>
        <p className="text-gray-600">Gestion des entreprises et associations participantes à FANAF 2026</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-600">Toutes les compagnies</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Associations membres</p>
                <div className="text-3xl font-bold text-teal-900">{stats.membres}</div>
              </div>
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-600">Associations membres FANAF</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Entreprises</p>
                <div className="text-3xl font-bold text-gray-900">{stats.nonMembres}</div>
              </div>
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-600">Entreprises non-membres</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sponsors</p>
                <div className="text-3xl font-bold text-amber-900">{stats.sponsors}</div>
              </div>
              <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-600">Sponsors partenaires</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Liste des compagnies</CardTitle>
            <div className="flex gap-2">
              <Button 
                className="bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Nouvelle compagnie
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email, contact, pays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les types</SelectItem>
                  <SelectItem value="company">Entreprises</SelectItem>
                  <SelectItem value="association">Associations</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatut} onValueChange={setSelectedStatut}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les statuts</SelectItem>
                  <SelectItem value="membre">Membre</SelectItem>
                  <SelectItem value="non-membre">Non-membre</SelectItem>
                  <SelectItem value="sponsor">Sponsor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tableau */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Pays</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actif</TableHead>
                  <TableHead>Secteur</TableHead>
                  <TableHead>Date création</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                      Aucune compagnie trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCompanies.map((company: Organisation) => {
                    const isActive = company.is_active !== false; // Par défaut true si undefined
                    const isToggling = toggleStatusMutation.isPending;
                    
                    return (
                      <TableRow key={company.id}>
                        <TableCell className="text-gray-900 font-medium">{company.nom}</TableCell>
                        <TableCell className="text-gray-600">{company.email || '-'}</TableCell>
                        <TableCell className="text-gray-600">{company.contact || '-'}</TableCell>
                        <TableCell className="text-gray-600">{company.pays}</TableCell>
                        <TableCell>
                          <Badge className={statutOrgColors[company.statut]}>
                            {statutOrgLabels[company.statut]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">{company.secteurActivite || '-'}</TableCell>
                        <TableCell className="text-gray-600">
                          {company.dateCreation 
                            ? new Date(company.dateCreation).toLocaleDateString('fr-FR')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => toggleStatusMutation.mutate(company.id)}
                              disabled={isToggling}
                              title={isActive ? 'Désactiver la compagnie' : 'Activer la compagnie'}
                            >
                              {isToggling ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Power className={`w-4 h-4 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                              )}
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                  onClick={() => setSelectedCompany(company)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Détails de la compagnie</DialogTitle>
                              <DialogDescription>
                                Informations complètes de l'organisation
                              </DialogDescription>
                            </DialogHeader>
                            {selectedCompany && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Nom</p>
                                    <p className="text-gray-900 font-medium">{selectedCompany.nom}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Statut</p>
                                    <Badge className={statutOrgColors[selectedCompany.statut]}>
                                      {statutOrgLabels[selectedCompany.statut]}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Actif</p>
                                    <Badge className={selectedCompany.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                      {selectedCompany.is_active !== false ? 'Actif' : 'Inactif'}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-gray-900">{selectedCompany.email || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Contact</p>
                                    <p className="text-gray-900">{selectedCompany.contact || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Pays</p>
                                    <p className="text-gray-900">{selectedCompany.pays}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Secteur d'activité</p>
                                    <p className="text-gray-900">{selectedCompany.secteurActivite || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Date de création</p>
                                    <p className="text-gray-900">
                                      {selectedCompany.dateCreation 
                                        ? new Date(selectedCompany.dateCreation).toLocaleDateString('fr-FR')
                                        : '-'
                                      }
                                    </p>
                                  </div>
                                </div>
                                {selectedCompany.referent && (
                                  <div className="border-t pt-4">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Référent</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-gray-500">Nom complet</p>
                                        <p className="text-gray-900">
                                          {selectedCompany.referent.prenom} {selectedCompany.referent.nom}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">Fonction</p>
                                        <p className="text-gray-900">{selectedCompany.referent.fonction}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="text-gray-900">{selectedCompany.referent.email}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">Téléphone</p>
                                        <p className="text-gray-900">{selectedCompany.referent.telephone}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Résumé */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredCompanies.length)} sur {filteredCompanies.length} compagnie(s)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredCompanies.length > 0 && totalPages > 1 && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages} ({filteredCompanies.length} résultat{filteredCompanies.length > 1 ? 's' : ''})
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

      {/* Dialogue de création de compagnie */}
      <CreateCompanyDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          // La liste sera automatiquement rafraîchie via invalidateQueries
          queryClient.invalidateQueries({ 
            predicate: (query) => {
              const key = query.queryKey;
              if (!Array.isArray(key) || key.length === 0) return false;
              return key[0] === 'adminAsaciCompanies';
            }
          });
        }}
      />
    </div>
  );
}


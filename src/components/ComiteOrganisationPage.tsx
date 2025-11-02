import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Search, Filter, Eye, Download, UserPlus, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProfilMembre, MembreComite } from './data/types';
import { CreateMembreDialog } from './comite/CreateMembreDialog';
import { useFanafApi } from '../hooks/useFanafApi';

const profilColors = {
  'cashier': 'bg-blue-100 text-blue-800',
  'scan_agent': 'bg-purple-100 text-purple-800',
  'agent_registration': 'bg-green-100 text-green-800',
  'badge_operator': 'bg-yellow-100 text-yellow-800',
};

const profilLabels = {
  'cashier': 'Caissier',
  'scan_agent': 'Agent de scan',
  'agent_registration': 'Agent d\'inscription',
  'badge_operator': 'Agent de badge',
};

/**
 * Mappe les données d'utilisateur de l'API vers le format MembreComite
 */
function mapApiUserToMembreComite(apiData: any, defaultProfil?: ProfilMembre): MembreComite {
  // Mapper le rôle API vers le profil
  const mapRoleToProfil = (role: string): ProfilMembre => {
    if (role === 'cashier') return 'cashier';
    if (role === 'scan_agent') return 'scan_agent';
    if (role === 'agent_registration') return 'agent_registration';
    if (role === 'badge_operator') return 'badge_operator';
    // Par défaut, utiliser le profil fourni ou 'cashier'
    return defaultProfil || 'cashier';
  };

  const role = apiData.role || apiData.user_role || apiData.type || '';
  const profil = mapRoleToProfil(role);

  // Générer un ID déterministe basé sur les données de l'utilisateur pour éviter les erreurs d'hydratation
  const generateDeterministicId = (userData: any): string => {
    const id = userData.id || userData.user_id;
    if (id) return String(id);
    
    // Utiliser l'email comme base pour l'ID si disponible
    const email = userData.email || '';
    if (email) {
      const emailKey = email.toLowerCase().trim().replace(/[^a-zA-Z0-9_]/g, '_');
      return `user_email_${emailKey}`;
    }
    
    // Sinon, utiliser un hash déterministe basé sur les données
    const hashData = `${userData.first_name || userData.prenom || ''}_${userData.last_name || userData.nom || ''}_${role}`;
    let hash = 0;
    for (let i = 0; i < hashData.length; i++) {
      const char = hashData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `user_hash_${Math.abs(hash).toString(36)}`;
  };

  return {
    id: generateDeterministicId(apiData),
    nom: apiData.last_name || apiData.nom || apiData.name?.split(' ')[0] || '',
    prenom: apiData.first_name || apiData.prenom || apiData.name?.split(' ').slice(1).join(' ') || '',
    email: apiData.email || '',
    telephone: apiData.phone || apiData.telephone || apiData.contact || '',
    profil,
    dateCreation: apiData.created_at || apiData.date_creation || apiData.dateCreation || new Date().toISOString(),
    // badge_url est mappé depuis les deux sources: getScanAgents() et getStaff()
    // Supporte différents formats: badge_url (snake_case) ou badgeUrl (camelCase)
    badge_url: apiData.badge_url || apiData.badgeUrl || undefined,
  };
}

export function ComiteOrganisationPage() {
  const { api } = useFanafApi();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfil, setSelectedProfil] = useState<string>('tous');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Query pour charger les membres du comité depuis l'API
  const membresComiteQuery = useQuery({
    queryKey: ['comiteOrganisation', 'membres'],
    queryFn: async () => {
      try {
        // Charger les agents de scan et le staff
        const [scanAgentsResponse, staffResponse] = await Promise.all([
          api.getScanAgents(),
          api.getStaff(),
        ]);

        // Extraire les données des réponses
        const scanAgents = Array.isArray(scanAgentsResponse?.data?.data) 
          ? scanAgentsResponse.data.data 
          : Array.isArray(scanAgentsResponse?.data) 
          ? scanAgentsResponse.data 
          : Array.isArray(scanAgentsResponse) 
          ? scanAgentsResponse 
          : [];
        
        const staff = Array.isArray(staffResponse?.data?.data) 
          ? staffResponse.data.data 
          : Array.isArray(staffResponse?.data) 
          ? staffResponse.data 
          : Array.isArray(staffResponse) 
          ? staffResponse 
          : [];

        // Créer un Set des IDs des agents de scan pour éviter les doublons
        const scanAgentIds = new Set(scanAgents.map((agent: any) => agent.id || agent.user_id || '').filter(Boolean));

        // Combiner les deux listes, en évitant les doublons
        const allUsers = [...scanAgents];
        staff.forEach((user: any) => {
          const userId = user.id || user.user_id || '';
          // Ne pas ajouter si déjà présent dans scanAgents
          if (!scanAgentIds.has(userId)) {
            allUsers.push(user);
          }
        });

        // Mapper vers MembreComite
        const membres = allUsers.map((user: any) => {
          // Pour les agents de scan, forcer le profil scan_agent
          const userId = user.id || user.user_id || '';
          const isFromScanAgents = scanAgentIds.has(userId) || user.role === 'scan_agent';
          return mapApiUserToMembreComite(user, isFromScanAgents ? 'scan_agent' : undefined);
        });

        // Supprimer les doublons basés sur l'ID
        const uniqueMembres = Array.from(
          new Map(membres.map(m => [m.id, m])).values()
        );

        return uniqueMembres;
      } catch (error) {
        console.error('Erreur lors du chargement des membres du comité:', error);
        return [] as MembreComite[];
      }
    },
    enabled: true,
    staleTime: 30 * 1000, // Cache pendant 30 secondes
    gcTime: 5 * 60 * 1000, // Garder en cache pendant 5 minutes
  });

  const membresComite = membresComiteQuery.data ?? [];

  // Filtrer les membres
  const filteredMembres = membresComite.filter((membre: MembreComite) => {
    const matchesSearch = 
      membre.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membre.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membre.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membre.telephone.includes(searchTerm);
    
    const matchesProfil = selectedProfil === 'tous' || membre.profil === selectedProfil;
    
    return matchesSearch && matchesProfil;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMembres.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMembres = filteredMembres.slice(startIndex, endIndex);

  // Calculer les statistiques
  const stats = {
    total: membresComite.length,
    caissiers: membresComite.filter((m: MembreComite) => m.profil === 'cashier').length,
    agentsScan: membresComite.filter((m: MembreComite) => m.profil === 'scan_agent').length,
    agentsRegistration: membresComite.filter((m: MembreComite) => m.profil === 'agent_registration').length,
    badgeOperators: membresComite.filter((m: MembreComite) => m.profil === 'badge_operator').length,
// "cashier", "agent_registration", "badge_operator", "scan_agent"

  };

  const handleMembreCreated = () => {
    // Rafraîchir la liste des membres
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const key = query.queryKey;
        if (!Array.isArray(key) || key.length === 0) return false;
        return key[0] === 'comiteOrganisation';
      }
    });
  };

  const handleDownloadBadge = (membre: MembreComite) => {
    if (!membre.badge_url) {
      console.warn('Aucune URL de badge disponible pour ce membre:', membre);
      return;
    }

    // Créer un lien temporaire pour télécharger le badge
    const link = document.createElement('a');
    link.href = membre.badge_url;
    link.download = `badge_${membre.prenom}_${membre.nom}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    console.log('Export des données...');
    // Logique d'export
  };

  return (
    <div className="p-8 space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-gray-900 mb-2">Comité d'Organisation</h1>
        <p className="text-gray-600">Gestion des membres du comité organisateur de FANAF 2026</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm opacity-90">Total Membres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl">{stats.total}</div>
              <Users className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm opacity-90">Caissiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl">{stats.caissiers}</div>
              <Users className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm opacity-90">Agents de Scan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl">{stats.agentsScan}</div>
              <Users className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Liste des membres</CardTitle>
            <div className="flex gap-2">
              <Button 
                className="bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Nouveau membre
              </Button>
              <CreateMembreDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={handleMembreCreated}
              />
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email, téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedProfil} onValueChange={setSelectedProfil}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrer par profil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les profils</SelectItem>
                  <SelectItem value="scan_agent">Agent de scan</SelectItem>
                  <SelectItem value="agent_registration">Agent d'inscription</SelectItem>
                  <SelectItem value="badge_operator">Agent de badge</SelectItem>
                  <SelectItem value="cashier">Caissier</SelectItem>
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
                  <TableHead>Prénom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Profil</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembres.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      Aucun membre trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMembres.map((membre: MembreComite) => (
                    <TableRow key={membre.id}>
                      <TableCell className="text-gray-900">{membre.nom}</TableCell>
                      <TableCell className="text-gray-900">{membre.prenom}</TableCell>
                      <TableCell className="text-gray-600">{membre.email}</TableCell>
                      <TableCell className="text-gray-600">{membre.telephone}</TableCell>
                      <TableCell>
                        <Badge className={profilColors[membre.profil]}>
                          {profilLabels[membre.profil]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(membre.dateCreation).toLocaleDateString('fr-FR')}
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
                              <DialogTitle>Détails du membre</DialogTitle>
                              <DialogDescription>
                                Informations complètes et téléchargement du badge
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-4 bg-orange-50 rounded-lg text-center">
                                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl">
                                  {membre.prenom.charAt(0)}{membre.nom.charAt(0)}
                                </div>
                                <p className="text-xl text-gray-900">{membre.prenom} {membre.nom}</p>
                                <Badge className={`${profilColors[membre.profil]} mt-2`}>
                                  {profilLabels[membre.profil]}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-3">
                                <div>
                                  <p className="text-sm text-gray-500">Email</p>
                                  <p className="text-gray-900">{membre.email}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Contact</p>
                                  <p className="text-gray-900">{membre.telephone}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Date de création</p>
                                  <p className="text-gray-900">
                                    {new Date(membre.dateCreation).toLocaleDateString('fr-FR')}
                                  </p>
                                </div>
                              </div>

                              <div className="border-t pt-4">
                                <Button 
                                  className="w-full bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                                  onClick={() => handleDownloadBadge(membre)}
                                  disabled={!membre.badge_url}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  {membre.badge_url ? 'Télécharger le badge' : 'Badge non disponible'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Résumé */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>Affichage de {filteredMembres.length} membre(s) sur {membresComite.length}</p>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredMembres.length > 0 && totalPages > 1 && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages} ({filteredMembres.length} résultat{filteredMembres.length > 1 ? 's' : ''})
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

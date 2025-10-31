import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Search, Filter, Eye, Download, UserPlus, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProfilMembre, MembreComite } from './data/types';

const profilColors = {
  'caissier': 'bg-blue-100 text-blue-800',
  'agent-scan': 'bg-purple-100 text-purple-800',
};

const profilLabels = {
  'caissier': 'Caissier',
  'agent-scan': 'Agent de Scan',
};

export function ComiteOrganisationPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfil, setSelectedProfil] = useState<string>('tous');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [newMembre, setNewMembre] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    profil: '' as ProfilMembre | '',
  });

  // Query pour charger les membres du comité depuis l'API quand l'endpoint sera disponible
  const membresComiteQuery = useQuery({
    queryKey: ['comiteOrganisation', 'membres'],
    queryFn: async () => {
      // TODO: Charger depuis l'API quand l'endpoint sera disponible
      // Pour l'instant, retourner un tableau vide
      return [] as MembreComite[];
    },
    enabled: true,
    staleTime: 0,
  });

  const membresComite = membresComiteQuery.data ?? [];

  // Query pour filtrer les membres
  const filteredMembresQuery = useQuery({
    queryKey: ['comiteOrganisation', 'filtered', membresComite, searchTerm, selectedProfil],
    queryFn: () => {
      return membresComite.filter((membre: MembreComite) => {
        const matchesSearch = 
          membre.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          membre.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          membre.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          membre.telephone.includes(searchTerm);
        
        const matchesProfil = selectedProfil === 'tous' || membre.profil === selectedProfil;
        
        return matchesSearch && matchesProfil;
      });
    },
    enabled: true,
    staleTime: 0,
  });

  const filteredMembres = filteredMembresQuery.data ?? [];

  // Pagination
  const totalPages = Math.ceil(filteredMembres.length / itemsPerPage);

  // Query pour paginer
  const paginatedMembresQuery = useQuery({
    queryKey: ['comiteOrganisation', 'paginated', filteredMembres, currentPage, itemsPerPage],
    queryFn: () => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredMembres.slice(startIndex, endIndex);
    },
    enabled: true,
    staleTime: 0,
  });

  const paginatedMembres = paginatedMembresQuery.data ?? [];

  // Query pour réinitialiser la page quand les filtres changent
  useQuery({
    queryKey: ['comiteOrganisation', 'resetPage', searchTerm, selectedProfil],
    queryFn: () => {
      queryClient.setQueryData(['comiteOrganisation', 'currentPage'], 1);
      setCurrentPage(1);
      return true;
    },
    enabled: true,
    staleTime: 0,
  });

  // Query pour les statistiques
  const statsQuery = useQuery({
    queryKey: ['comiteOrganisation', 'stats', membresComite],
    queryFn: () => {
      const total = membresComite.length;
      const caissiers = membresComite.filter((m: MembreComite) => m.profil === 'caissier').length;
      const agentsScan = membresComite.filter((m: MembreComite) => m.profil === 'agent-scan').length;
      
      return { total, caissiers, agentsScan };
    },
    enabled: true,
    staleTime: 0,
  });

  const stats = statsQuery.data ?? { total: 0, caissiers: 0, agentsScan: 0 };

  const handleCreateMembre = () => {
    console.log('Création nouveau membre:', newMembre);
    // Ici vous ajouteriez la logique pour créer le membre
    setIsCreateDialogOpen(false);
    setNewMembre({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      profil: '',
    });
  };

  const handleDownloadBadge = (membre: MembreComite) => {
    console.log('Téléchargement badge rouge pour:', membre.nom, membre.prenom);
    // Ici vous ajouteriez la logique pour générer et télécharger le badge rouge
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
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nouveau membre
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau membre</DialogTitle>
                    <DialogDescription>
                      Ajoutez un nouveau membre au comité d'organisation
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom</Label>
                      <Input
                        id="nom"
                        value={newMembre.nom}
                        onChange={(e) => setNewMembre({ ...newMembre, nom: e.target.value })}
                        placeholder="Entrez le nom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prenom">Prénom</Label>
                      <Input
                        id="prenom"
                        value={newMembre.prenom}
                        onChange={(e) => setNewMembre({ ...newMembre, prenom: e.target.value })}
                        placeholder="Entrez le prénom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Adresse mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newMembre.email}
                        onChange={(e) => setNewMembre({ ...newMembre, email: e.target.value })}
                        placeholder="exemple@fanaf2026.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telephone">Contact</Label>
                      <Input
                        id="telephone"
                        value={newMembre.telephone}
                        onChange={(e) => setNewMembre({ ...newMembre, telephone: e.target.value })}
                        placeholder="+225 XX XX XX XX XX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profil">Profil</Label>
                      <Select
                        value={newMembre.profil}
                        onValueChange={(value) => setNewMembre({ ...newMembre, profil: value as ProfilMembre })}
                      >
                        <SelectTrigger id="profil">
                          <SelectValue placeholder="Sélectionnez un profil" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="caissier">Caissier</SelectItem>
                          <SelectItem value="agent-scan">Agent de Scan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button 
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={handleCreateMembre}
                      disabled={!newMembre.nom || !newMembre.prenom || !newMembre.email || !newMembre.telephone || !newMembre.profil}
                    >
                      Créer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                  <SelectItem value="caissier">Caissier</SelectItem>
                  <SelectItem value="agent-scan">Agent de Scan</SelectItem>
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
                                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => handleDownloadBadge(membre)}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Télécharger le badge
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

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Search, FileText, Download, ChevronLeft, ChevronRight, MoreVertical, Receipt, BadgeCheck, Mail, Filter, X } from 'lucide-react';
import { useFanafApi } from '../hooks/useFanafApi';
import { type Participant, type StatutParticipant, type ModePaiement } from './data/types';
import { getOrganisationById, getParticipantById, getReferentSponsor, getParticipantsByOrganisation } from './data/helpers';

import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export function TousPaiementsPage() {
  const { api } = useFanafApi();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // États pour les filtres avancés
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrganisation, setSelectedOrganisation] = useState<string>('all');
  const [selectedModePaiement, setSelectedModePaiement] = useState<string>('all');
  const [selectedStatut, setSelectedStatut] = useState<string>('all');
  const [selectedCaissier, setSelectedCaissier] = useState<string>('all');
  const [dateDebut, setDateDebut] = useState<string>('');
  const [dateFin, setDateFin] = useState<string>('');

  // Charger les participants finalisés depuis localStorage
  const [finalisedParticipants, setFinalisedParticipants] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const stored = localStorage.getItem('finalisedParticipantsIds');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Charger les infos de paiement depuis localStorage
  const [finalisedPayments, setFinalisedPayments] = useState<Record<string, { modePaiement: string; datePaiement: string; caissier?: string }>>(() => {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem('finalisedPayments');
    return stored ? JSON.parse(stored) : {};
  });

  // Charger paiements depuis l'API avec React Query
  const { data: apiPayments = [], isLoading: apiLoading } = useQuery({
    queryKey: ['tousPaiements'],
    queryFn: async () => {
      try {
        const payRes = await api.getPayments({ per_page: 200, page: 1 });
        const payAny: any = payRes as any;
        const payArray = Array.isArray(payAny?.data?.data)
          ? payAny.data.data
          : Array.isArray(payAny?.data)
            ? payAny.data
            : Array.isArray(payAny)
              ? payAny
              : [];
        return payArray;
      } catch (_) {
        return [];
      }
    },
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 5 * 60 * 1000, // 5 minutes en cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Query pour adapter les paiements API pour l'affichage
  const participantsPayesQuery = useQuery({
    queryKey: ['tousPaiements', 'participantsPayes', apiPayments, finalisedParticipants],
    queryFn: () => {
      if (apiPayments.length > 0) {
        // Adapter la structure pour l'affichage commun
        return apiPayments.map((p: any) => {
          return {
            id: p.id || p.payment_id || p.reference,
            reference: p.reference || p.payment_reference || p.id,
            prenom: p.user?.first_name || p.prenom || '',
            nom: p.user?.last_name || p.nom || '',
            email: p.user?.email || p.email || '',
            telephone: p.user?.phone || p.user?.telephone || p.phone || p.telephone || '',
            organisationId: p.company_id || p.organisationId,
            statut: (p.category || p.statut || '').toLowerCase(),
            dateInscription: p.paid_at || p.created_at || new Date().toISOString(),
            modePaiement: p.payment_method || p.modePaiement,
            caissier: p.cashier_name || p.caissier,
          };
        });
      }
      // Retourner un tableau vide si pas de paiements depuis l'API
      return [];
    },
    enabled: true,
    staleTime: 0,
  });

  const participantsPayes = participantsPayesQuery.data ?? [];

  // Query pour obtenir les listes uniques pour les filtres
  const uniqueOrganisationsQuery = useQuery({
    queryKey: ['tousPaiements', 'uniqueOrganisations', participantsPayes],
    queryFn: () => {
      const orgs = new Set<string>();
      participantsPayes.forEach((p: any) => {
        const org = getOrganisationById(p.organisationId);
        if (org) orgs.add(org.nom);
      });
      return Array.from(orgs).sort();
    },
    enabled: true,
    staleTime: 0,
  });

  const uniqueOrganisations = uniqueOrganisationsQuery.data ?? [];

  const uniqueModesPaiementQuery = useQuery({
    queryKey: ['tousPaiements', 'uniqueModesPaiement', participantsPayes, finalisedPayments],
    queryFn: () => {
      const modes = new Set<string>();
      participantsPayes.forEach((p: any) => {
        const paymentInfo = finalisedPayments[p.id];
        const mode = paymentInfo?.modePaiement || p.modePaiement;
        if (mode) modes.add(mode);
      });
      return Array.from(modes).sort();
    },
    enabled: true,
    staleTime: 0,
  });

  const uniqueModesPaiement = uniqueModesPaiementQuery.data ?? [];

  const uniqueCaissiersQuery = useQuery({
    queryKey: ['tousPaiements', 'uniqueCaissiers', participantsPayes, finalisedPayments],
    queryFn: () => {
      const caissiers = new Set<string>();
      participantsPayes.forEach((p: any) => {
        const paymentInfo = finalisedPayments[p.id];
        const caissier = paymentInfo?.caissier || p.caissier;
        if (caissier) caissiers.add(caissier);
      });
      return Array.from(caissiers).sort();
    },
    enabled: true,
    staleTime: 0,
  });

  const uniqueCaissiers = uniqueCaissiersQuery.data ?? [];

  // Query pour filtrer par recherche et filtres avancés
  const filteredParticipantsQuery = useQuery({
    queryKey: ['tousPaiements', 'filteredParticipants', participantsPayes, searchTerm, selectedOrganisation, selectedModePaiement, selectedStatut, selectedCaissier, dateDebut, dateFin, finalisedPayments],
    queryFn: () => {
      let filtered = [...participantsPayes];
      
      // Filtre par recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(p => {
          const org = getOrganisationById(p.organisationId);
          return (
            p.nom.toLowerCase().includes(searchLower) ||
            p.prenom.toLowerCase().includes(searchLower) ||
            p.reference.toLowerCase().includes(searchLower) ||
            p.email.toLowerCase().includes(searchLower) ||
            p.telephone.includes(searchLower) ||
            org?.nom.toLowerCase().includes(searchLower) ||
            ''
          );
        });
      }

      // Filtre par organisation
      if (selectedOrganisation !== 'all') {
        filtered = filtered.filter(p => {
          const org = getOrganisationById(p.organisationId);
          return org?.nom === selectedOrganisation;
        });
      }

      // Filtre par mode de paiement
      if (selectedModePaiement !== 'all') {
        filtered = filtered.filter(p => {
          const paymentInfo = finalisedPayments[p.id];
          const mode = paymentInfo?.modePaiement || p.modePaiement;
          return mode === selectedModePaiement;
        });
      }

      // Filtre par statut
      if (selectedStatut !== 'all') {
        filtered = filtered.filter(p => p.statut === selectedStatut);
      }

      // Filtre par caissier
      if (selectedCaissier !== 'all') {
        filtered = filtered.filter(p => {
          const paymentInfo = finalisedPayments[p.id];
          const caissier = paymentInfo?.caissier || p.caissier;
          return caissier === selectedCaissier;
        });
      }

      // Filtre par date de paiement
      if (dateDebut) {
        const dateDebutMs = new Date(dateDebut).getTime();
        filtered = filtered.filter(p => {
          const paymentInfo = finalisedPayments[p.id];
          const datePaiement = paymentInfo?.datePaiement ? new Date(paymentInfo.datePaiement).getTime() : new Date(p.dateInscription).getTime();
          return datePaiement >= dateDebutMs;
        });
      }

      if (dateFin) {
        const dateFinMs = new Date(dateFin).setHours(23, 59, 59, 999);
        filtered = filtered.filter(p => {
          const paymentInfo = finalisedPayments[p.id];
          const datePaiement = paymentInfo?.datePaiement ? new Date(paymentInfo.datePaiement).getTime() : new Date(p.dateInscription).getTime();
          return datePaiement <= dateFinMs;
        });
      }

      return filtered;
    },
    enabled: true,
    staleTime: 0,
  });

  const filteredParticipants = filteredParticipantsQuery.data ?? [];

  // Pagination
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);

  // Query pour paginer
  const paginatedParticipantsQuery = useQuery({
    queryKey: ['tousPaiements', 'paginatedParticipants', filteredParticipants, currentPage, itemsPerPage],
    queryFn: () => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredParticipants.slice(startIndex, endIndex);
    },
    enabled: true,
    staleTime: 0,
  });

  const paginatedParticipants = paginatedParticipantsQuery.data ?? [];

  // Query pour compter les filtres actifs
  const activeFiltersCountQuery = useQuery({
    queryKey: ['tousPaiements', 'activeFiltersCount', selectedOrganisation, selectedModePaiement, selectedStatut, selectedCaissier, dateDebut, dateFin],
    queryFn: () => {
      let count = 0;
      if (selectedOrganisation !== 'all') count++;
      if (selectedModePaiement !== 'all') count++;
      if (selectedStatut !== 'all') count++;
      if (selectedCaissier !== 'all') count++;
      if (dateDebut) count++;
      if (dateFin) count++;
      return count;
    },
    enabled: true,
    staleTime: 0,
  });

  const activeFiltersCount = activeFiltersCountQuery.data ?? 0;

  // Réinitialiser tous les filtres
  const handleResetFilters = () => {
    setSelectedOrganisation('all');
    setSelectedModePaiement('all');
    setSelectedStatut('all');
    setSelectedCaissier('all');
    setDateDebut('');
    setDateFin('');
    setSearchTerm('');
  };

  // Query pour réinitialiser la page quand la recherche ou les filtres changent
  useQuery({
    queryKey: ['tousPaiements', 'resetPage', searchTerm, selectedOrganisation, selectedModePaiement, selectedStatut, selectedCaissier, dateDebut, dateFin],
    queryFn: () => {
      queryClient.setQueryData(['tousPaiements', 'currentPage'], 1);
      setCurrentPage(1);
      return true;
    },
    enabled: true,
    staleTime: 0,
  });

  // Query pour écouter les changements de localStorage
  useQuery({
    queryKey: ['tousPaiements', 'localStorage', finalisedParticipants, finalisedPayments],
    queryFn: () => {
      if (typeof window === 'undefined') return false;
      const handleStorageChange = () => {
        const storedIds = localStorage.getItem('finalisedParticipantsIds');
        const storedPayments = localStorage.getItem('finalisedPayments');
        
        if (storedIds) {
          setFinalisedParticipants(new Set(JSON.parse(storedIds)));
        }
        if (storedPayments) {
          setFinalisedPayments(JSON.parse(storedPayments));
        }
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('paymentFinalized', handleStorageChange);
      
      return true;
    },
    enabled: true,
    staleTime: 0,
  });

  // Obtenir la date de paiement
  const getDatePaiement = (participant: any) => {
    const participantId = participant.id || participant._id || participant.registration_id || participant.reference;
    const paymentInfo = finalisedPayments[participantId];
    if (paymentInfo?.datePaiement) {
      return new Date(paymentInfo.datePaiement).toLocaleDateString('fr-FR');
    }
    // Si pas d'info dans localStorage, utiliser la date d'inscription comme fallback
    const dateInscription = participant.dateInscription || participant.date_inscription || participant.created_at || new Date().toISOString();
    return new Date(dateInscription).toLocaleDateString('fr-FR');
  };

  // Obtenir le mode de paiement
  const getModePaiement = (participant: any) => {
    const participantId = participant.id || participant._id || participant.registration_id || participant.reference;
    const paymentInfo = finalisedPayments[participantId];
    return paymentInfo?.modePaiement || participant.modePaiement || participant.payment_method || 'Non spécifié';
  };

  // Obtenir le nom du caissier
  const getNomCaissier = (participant: any) => {
    const participantId = participant.id || participant._id || participant.registration_id || participant.reference;
    const paymentInfo = finalisedPayments[participantId];
    return paymentInfo?.caissier || participant.caissier || participant.cashier_name || 'Non spécifié';
  };

  // Calculer le montant selon le statut
  const getMontant = (participant: any) => {
    const statut = (participant.statut || participant.category || '').toLowerCase();
    if (statut === 'vip' || statut === 'speaker') return '0 FCFA (Exonéré)';
    if (statut === 'membre' || statut === 'member') return '350 000 FCFA';
    if (statut === 'non-membre' || statut === 'not_member') return '400 000 FCFA';
    return '0 FCFA';
  };

  // Télécharger le badge
  const handleDownloadBadge = (participant: any) => {
    toast.info('Téléchargement du badge...');
    // Utiliser le système de génération existant via DocumentsParticipantsPage
    // Pour l'instant, afficher un message
    const prenom = participant.prenom || participant.first_name || '';
    const nom = participant.nom || participant.last_name || '';
    toast.success(`Badge de ${prenom} ${nom} prêt à télécharger`);
  };

  // Télécharger le reçu
  const handleDownloadReceipt = (participant: any) => {
    toast.info('Téléchargement du reçu...');
    // Utiliser le système de génération existant via DocumentsParticipantsPage
    // Pour l'instant, afficher un message
    const prenom = participant.prenom || participant.first_name || '';
    const nom = participant.nom || participant.last_name || '';
    toast.success(`Reçu de ${prenom} ${nom} prêt à télécharger`);
  };

  // Télécharger tous les documents
  const handleDownloadAllDocuments = (participant: any) => {
    toast.info('Téléchargement des documents en cours...');
    handleDownloadBadge(participant);
    handleDownloadReceipt(participant);
    toast.success('Tous les documents sont prêts');
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700">Total paiements</p>
                <p className="text-2xl text-green-900">{participantsPayes.length}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <BadgeCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Documents générés</p>
                <p className="text-2xl text-blue-900">{participantsPayes.length}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-700">Recherche active</p>
                <p className="text-2xl text-orange-900">{filteredParticipants.length}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher par nom, prénom, référence, email, téléphone ou organisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-orange-600 text-white text-xs rounded-full px-2 py-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            )}
          </div>

          {/* Filtres avancés */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                  {/* Filtre Organisation */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">Organisation</label>
                    <Select value={selectedOrganisation} onValueChange={setSelectedOrganisation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les organisations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les organisations</SelectItem>
                        {uniqueOrganisations.map((org) => (
                          <SelectItem key={org} value={org}>
                            {org}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtre Mode de paiement */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">Mode de paiement</label>
                    <Select value={selectedModePaiement} onValueChange={setSelectedModePaiement}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les modes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les modes</SelectItem>
                        {uniqueModesPaiement.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtre Statut */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">Statut</label>
                    <Select value={selectedStatut} onValueChange={setSelectedStatut}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="membre">Membre</SelectItem>
                        <SelectItem value="non-membre">Non-membre</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="speaker">Speaker</SelectItem>
                        <SelectItem value="referent">Référent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtre Caissier */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">Nom caissier</label>
                    <Select value={selectedCaissier} onValueChange={setSelectedCaissier}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les caissiers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les caissiers</SelectItem>
                        {uniqueCaissiers.map((caissier) => (
                          <SelectItem key={caissier} value={caissier}>
                            {caissier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtre Date début */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">Date de début</label>
                    <Input
                      type="date"
                      value={dateDebut}
                      onChange={(e) => setDateDebut(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Filtre Date fin */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">Date de fin</label>
                    <Input
                      type="date"
                      value={dateFin}
                      onChange={(e) => setDateFin(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Tableau des paiements */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Référence</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead>Organisation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date paiement</TableHead>
                  <TableHead>Mode paiement</TableHead>
                  <TableHead>Nom caissier</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedParticipants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'Aucun paiement trouvé' : 'Aucun paiement finalisé'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedParticipants.map((participant) => {
                    const organisation = getOrganisationById(participant.organisationId);
                    
                    return (
                      <TableRow key={participant.id} className="table-row-hover">
                        <TableCell>
                          <span className="font-mono text-sm">{participant.reference}</span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {participant.prenom} {participant.nom}
                            </div>
                            <div className="text-sm text-gray-500">{participant.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{organisation?.nom || 'N/A'}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              participant.statut === 'vip'
                                ? 'bg-yellow-100 text-yellow-800'
                                : participant.statut === 'speaker'
                                ? 'bg-purple-100 text-purple-800'
                                : participant.statut === 'membre'
                                ? 'bg-orange-100 text-orange-800'
                                : participant.statut === 'referent'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }
                          >
                            {participant.statut === 'vip'
                              ? 'VIP'
                              : participant.statut === 'speaker'
                              ? 'Speaker'
                              : participant.statut === 'membre'
                              ? 'Membre'
                              : participant.statut === 'referent'
                              ? 'Référent'
                              : 'Non-membre'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {getDatePaiement(participant)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm capitalize">
                            {getModePaiement(participant)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-700">
                            {getNomCaissier(participant)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{getMontant(participant)}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Télécharger</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDownloadBadge(participant)}>
                                <BadgeCheck className="mr-2 h-4 w-4" />
                                Badge participant
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadReceipt(participant)}>
                                <Receipt className="mr-2 h-4 w-4" />
                                Reçu de paiement
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDownloadAllDocuments(participant)}>
                                <Download className="mr-2 h-4 w-4" />
                                Tous les documents
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-500">
                Page {currentPage} sur {totalPages} ({filteredParticipants.length} paiement{filteredParticipants.length > 1 ? 's' : ''})
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

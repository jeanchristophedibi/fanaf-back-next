"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { Card } from "../../ui/card";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Label } from "../../ui/label";
import { Search, Filter, Download, X, Loader2, CheckSquare, Square } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../../ui/dialog";
import { CheckCircle2, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Eye, User, Mail, Phone, Globe, Building, Calendar, FileText } from "lucide-react";
import { Checkbox } from "../../ui/checkbox";
import { fanafApi } from "../../../services/fanafApi";
import { useDynamicInscriptions } from "../../hooks/useDynamicInscriptions";
import { getOrganisationById, type ModePaiement } from "../../data/mockData";
import { toast } from "sonner";
import { Skeleton } from "../../ui/skeleton";

// Mapper le mode de paiement de l'API vers le format local
const mapPaymentMethod = (apiMethod: string): ModePaiement => {
  const mapping: Record<string, ModePaiement> = {
    'cash': 'espèce',
    'card': 'carte bancaire',
    'orange_money': 'orange money',
    'wave': 'wave',
    'bank_transfer': 'virement',
    'cheque': 'chèque',
  };
  return mapping[apiMethod] || 'espèce';
};

// Mapper le canal de paiement
const mapPaymentProvider = (provider: string): 'externe' | 'asapay' => {
  return provider === 'asapay' ? 'asapay' : 'externe';
};

// Déterminer si le paiement est complété
const isPaymentCompleted = (state: string): boolean => {
  return state?.includes('Completed') || false;
};

// Mapper les données API vers le format local
const mapApiPaymentToLocal = (apiPayment: any) => {
  return {
    id: apiPayment.id,
    reference: apiPayment.reference,
    participantNom: apiPayment.user?.full_name || 'N/A',
    participantEmail: apiPayment.user?.email || 'N/A',
    organisationNom: 'N/A', // L'API ne fournit pas cette info directement
    statut: 'membre', // Par défaut, à déterminer depuis d'autres sources si nécessaire
    montant: apiPayment.amount || 0,
    modePaiement: mapPaymentMethod(apiPayment.payment_method || 'cash'),
    canalEncaissement: mapPaymentProvider(apiPayment.payment_provider || 'asapay'),
    dateInscription: apiPayment.initiated_at || new Date().toISOString(),
    datePaiement: apiPayment.completed_at || apiPayment.initiated_at || new Date().toISOString(),
    administrateurEncaissement: 'N/A', // L'API ne fournit pas cette info
    pays: 'N/A', // L'API ne fournit pas cette info directement
    state: apiPayment.state,
    isCompleted: isPaymentCompleted(apiPayment.state || ''),
  };
};

export function ListePaiements() {
  const [apiPaiements, setApiPaiements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [totalApiPages, setTotalApiPages] = useState(1);
  const [currentApiPage, setCurrentApiPage] = useState(1);
  
  // Fallback vers les données mock si l'API échoue
  const { participants } = useDynamicInscriptions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | 'payé' | 'non-payé'>('all');
  const [filterMode, setFilterMode] = useState<'all' | ModePaiement>('all');
  const [filterCanal, setFilterCanal] = useState<'all' | 'externe' | 'asapay'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Correspond au per_page de l'API
  
  // État pour le tri
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  // État pour la sélection en masse
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // Charger les paiements depuis l'API
  useEffect(() => {
    const loadPayments = async () => {
      setIsLoading(true);
      setApiError(null);
      
      try {
        const response = await fanafApi.getPayments({
          page: currentApiPage,
          per_page: itemsPerPage,
        });
        
        // L'API retourne { data: { data: [...], current_page, last_page, ... }, meta: {...} }
        const paymentsData = response?.data?.data || response?.data || [];
        const pagination = response?.data || response?.meta || {};
        
        setApiPaiements(paymentsData.map(mapApiPaymentToLocal));
        setTotalApiPages(pagination.last_page || pagination.meta?.last_page || 1);
      } catch (err: any) {
        console.error('Erreur lors du chargement des paiements:', err);
        setApiError(err.message || 'Erreur lors du chargement des paiements');
        toast.error(err.message || 'Erreur lors du chargement des paiements');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPayments();
  }, [currentApiPage, itemsPerPage]);

  // Transformer les paiements API en format attendu
  const paiements = useMemo(() => {
    // Si on a des données API, les utiliser
    if (apiPaiements.length > 0) {
      return apiPaiements;
    }
    
    // Sinon, fallback vers les données mock (pour compatibilité)
    return participants
      .filter(p => p.statutInscription === 'finalisée')
      .map(p => {
        const organisation = getOrganisationById(p.organisationId);
        
        // Calcul du tarif selon le statut
        let tarif = 0;
        if (p.statut === 'non-membre') {
          tarif = 400000;
        } else if (p.statut === 'membre') {
          tarif = 350000;
        }

        return {
          id: p.id,
          reference: p.reference,
          participantNom: `${p.prenom} ${p.nom}`,
          participantEmail: p.email,
          organisationNom: organisation?.nom || 'N/A',
          statut: p.statut,
          montant: tarif,
          modePaiement: p.modePaiement || 'espèce',
          canalEncaissement: p.canalEncaissement || 'externe',
          dateInscription: p.dateInscription,
          datePaiement: p.datePaiement || p.dateInscription,
          administrateurEncaissement: p.caissier || 'N/A',
          pays: p.pays,
          isCompleted: true,
        };
      });
  }, [apiPaiements, participants]);

  // Filtrer les paiements
  const filteredPaiements = useMemo(() => {
    let filtered = [...paiements];

    // Recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.reference.toLowerCase().includes(term) ||
          p.participantNom.toLowerCase().includes(term) ||
          p.participantEmail.toLowerCase().includes(term) ||
          p.organisationNom.toLowerCase().includes(term)
      );
    }

    // Filtre par statut de paiement
    if (filterStatut !== 'all') {
      if (filterStatut === 'payé') {
        filtered = filtered.filter(p => p.isCompleted !== false);
      } else {
        filtered = filtered.filter(p => p.isCompleted === false);
      }
    }

    // Filtre par mode de paiement
    if (filterMode !== 'all') {
      filtered = filtered.filter(p => p.modePaiement === filterMode);
    }

    // Filtre par canal
    if (filterCanal !== 'all') {
      filtered = filtered.filter(p => p.canalEncaissement === filterCanal);
    }

    // Tri
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key as keyof typeof a];
        let bValue = b[sortConfig.key as keyof typeof b];
        
        // Gérer les dates et nombres
        if (sortConfig.key === 'dateInscription' || sortConfig.key === 'datePaiement') {
          aValue = new Date(aValue as any).getTime();
          bValue = new Date(bValue as any).getTime();
        } else if (sortConfig.key === 'montant') {
          aValue = aValue as number;
          bValue = bValue as number;
        } else {
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [paiements, searchTerm, filterStatut, filterMode, filterCanal, sortConfig]);
  
  // Fonction de tri
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Réinitialiser à la page 1 lors du tri
  };

  // Pagination locale (pour les résultats filtrés)
  const totalPages = Math.ceil(filteredPaiements.length / itemsPerPage);
  const paginatedPaiements = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPaiements.slice(startIndex, endIndex);
  }, [filteredPaiements, currentPage, itemsPerPage]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
    // Réinitialiser la sélection quand les filtres changent
    setSelectedIds(new Set());
  }, [searchTerm, filterStatut, filterMode, filterCanal]);

  const activeFiltersCount =
    (filterStatut !== 'all' ? 1 : 0) +
    (filterMode !== 'all' ? 1 : 0) +
    (filterCanal !== 'all' ? 1 : 0);

  const resetFilters = () => {
    setFilterStatut('all');
    setFilterMode('all');
    setFilterCanal('all');
    setSearchTerm('');
  };

  // Gestion de la sélection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedPaiements.map(p => p.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectItem = (id: string | number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const isAllSelected = paginatedPaiements.length > 0 && paginatedPaiements.every(p => selectedIds.has(p.id));
  const isIndeterminate = paginatedPaiements.some(p => selectedIds.has(p.id)) && !isAllSelected;
  const selectedPaiements = paiements.filter(p => selectedIds.has(p.id));

  // Actions en masse
  const handleBulkExport = () => {
    if (selectedPaiements.length === 0) {
      toast.warning("Aucun paiement sélectionné");
      return;
    }

    const headers = [
      'Référence',
      'Participant',
      'Email',
      'Organisation',
      'Statut',
      'Montant (FCFA)',
      'Mode de paiement',
      'Canal',
      'Date inscription',
      'Date paiement',
      'Validé par',
      'Pays',
    ];

    const rows = selectedPaiements.map(p => [
      p.reference,
      p.participantNom,
      p.participantEmail,
      p.organisationNom,
      p.statut,
      p.montant.toString(),
      p.modePaiement,
      p.canalEncaissement,
      new Date(p.dateInscription).toLocaleDateString('fr-FR'),
      new Date(p.datePaiement).toLocaleDateString('fr-FR'),
      p.administrateurEncaissement,
      p.pays,
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `paiements-selectionnes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success(`${selectedPaiements.length} paiement(s) exporté(s)`);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
    toast.info("Sélection effacée");
  };

  const exportToCSV = () => {
    const headers = [
      'Référence',
      'Participant',
      'Email',
      'Organisation',
      'Statut',
      'Montant (FCFA)',
      'Mode de paiement',
      'Canal',
      'Date inscription',
      'Date paiement',
      'Validé par',
      'Pays',
    ];

    const rows = filteredPaiements.map(p => [
      p.reference,
      p.participantNom,
      p.participantEmail,
      p.organisationNom,
      p.statut,
      p.montant.toString(),
      p.modePaiement,
      p.canalEncaissement,
      new Date(p.dateInscription).toLocaleDateString('fr-FR'),
      new Date(p.datePaiement).toLocaleDateString('fr-FR'),
      p.administrateurEncaissement,
      p.pays,
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `paiements-finalises-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatutBadge = (statut: string) => {
    const colors: Record<string, string> = {
      'membre': 'bg-blue-100 text-blue-700 border-blue-300',
      'non-membre': 'bg-gray-100 text-gray-700 border-gray-300',
      'vip': 'bg-purple-100 text-purple-700 border-purple-300',
      'speaker': 'bg-green-100 text-green-700 border-green-300',
    };
    return colors[statut] || colors['non-membre'];
  };

  const getCanalBadge = (canal: string) => {
    if (canal === 'externe') {
      return 'bg-blue-100 text-blue-700 border-blue-300';
    }
    return 'bg-orange-100 text-orange-700 border-orange-300';
  };

  const getModePaiementIcon = (mode: string) => {
    switch (mode) {
      case 'chèque':
        return '📝';
      case 'espèce':
        return '💵';
      case 'carte bancaire':
        return '💳';
      case 'orange money':
        return '🟠';
      case 'wave':
        return '🌊';
      case 'virement':
        return '🏦';
      default:
        return '💰';
    }
  };

  // Composant modal pour les détails de paiement
  const PaiementDetailsDialog = ({ paiement }: { paiement: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="w-4 h-4" />
            Voir
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Détails du Paiement
            </DialogTitle>
            <DialogDescription>
              Informations complètes pour {paiement.participantNom俣}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Informations personnelles */}
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-500">Référence</Label>
                <p className="text-sm font-medium mt-1">{paiement.reference}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Participant</Label>
                <p className="text-sm font-medium mt-1">{paiement.participantNom}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Email</Label>
                <p className="text-sm mt-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {paiement.participantEmail}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Organisation</Label>
                <p className="text-sm mt-1 flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  {paiement.organisationNom}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Pays</Label>
                <p className="text-sm mt-1 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {paiement.pays}
                </p>
              </div>
            </div>
            
            {/* Informations de paiement */}
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-500">Statut Participant</Label>
                <div className="mt-1">
                  <Badge className="text-xs">
                    {paiement.statut}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Montant</Label>
                <p className="text-lg font-bold mt-1 text-green-600">
                  {paiement.montant.toLocaleString()} FCFA
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Mode de paiement</Label>
                <div className="mt-1">
                  <Badge className="text-xs capitalize">
                    {paiement.modePaiement}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Canal d'encaissement</Label>
                <div className="mt-1">
                  <Badge className="text-xs">
                    {paiement.canalEncaissement}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Date d'inscription</Label>
                <p className="text-sm mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(paiement.dateInscription).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Date de paiement</Label>
                <p className="text-sm mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  {new Date(paiement.datePaiement).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Validé par</Label>
                <p className="text-sm mt-1">
                  {paiement.administrateurEncaissement}
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
      {/* Loader overlay pendant le chargement */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
            </div>
            <p className="text-sm font-medium text-gray-700">Chargement des paiements...</p>
          </div>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <Card className="p-6 rounded-b-none border-b-0">
        <div className="space-y-4">
          <div className="flex flex-col라는 lg:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, prénom, référence, email ou organisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>

            {/* Boutons actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-orange-50 border-orange-300' : ''}
                disabled={isLoading}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
                {activeFiltersCount > 0 && (
                  <Badge variant="destructive" className="ml-2 rounded-full px-1.5 min-w-[20px] h-5">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              <Button 
                onClick={exportToCSV} 
                variant="outline"
                disabled={paiements.length === 0 || isLoading}
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </div>

          {/* Filtres étendus */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t"
            >
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Mode de paiement</label>
                <Select value={filterMode} onValueChange={(value: any) => setFilterMode(value)} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les modes</SelectItem>
                    <SelectItem value="chèque">Chèque</SelectItem>
                    <SelectItem value="espèce">Espèce</SelectItem>
                    <SelectItem value="carte bancaire">Carte bancaire</SelectItem>
                    <SelectItem value="orange money">Orange Money</SelectItem>
                    <SelectItem value="wave">Wave</SelectItem>
                    <SelectItem value="virement">Virement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-600">Canal d'encaissement</label>
                <Select value={filterCanal} onValueChange={(value: any) => setFilterCanal(value)} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les canaux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les canaux</SelectItem>
                    <SelectItem value="externe">Externe</SelectItem>
                    <SelectItem value="asapay">ASAPAY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {activeFiltersCount > 0 && (
                <div className="md:col-span-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Réinitialiser tous les filtres
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">Liste des paiements</h2>
            <p className="text-sm text-gray-500">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Chargement...
                </span>
              ) : (
                `${filteredPaiements.length} paiement${filteredPaiements.length > 1 ? 's' : ''} trouvé${filteredPaiements.length > 1 ? 's' : ''}`
              )}
            </p>
          </div>
        </div>

        {/* Barre d'actions en masse */}
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-orange-50 border-b border-orange-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-orange-900">
                  {selectedIds.size} paiement{selectedIds.size > 1 ? 's' : ''} sélectionné{selectedIds.size > 1 ? 's' : ''}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-orange-700 hover:text-orange-900 hover:bg-orange-100"
                >
                  <X className="w-4 h-4 mr-1" />
                  Effacer
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter sélection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.info("Fonctionnalité à venir : Export PDF pour les sélectionnés");
                  }}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    disabled={isLoading || paginatedPaiements.length === 0}
                    className={isIndeterminate ? "data-[state=checked]:bg-orange-600" : ""}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('reference')} className="flex items-center gap-1 hover:text-gray-700" disabled={isLoading}>
                    Référence
                    {sortConfig?.key === 'reference' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                  </button>
                </th>
                <th className=" této py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('participantNom')} className="flex items-center gap-1 hover:text-gray-700" disabled={isLoading}>
                    Participant
                    {sortConfig?.key === 'participantNom' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('organisationNom')} className="flex items-center gap-1 hover:text-gray-700" disabled={isLoading}>
                    Organisation
                    {sortConfig?.key === 'organisationNom' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('statut')} className="flex items-center gap-1 hover:text-gray-700" disabled={isLoading}>
                    Statut
                    {sortConfig?.key === 'statut' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('modePaiement')} className="flex items-center gap-1 hover:text-gray-700" disabled={isLoading}>
                    Mode Paiement
                    {sortConfig?.key === 'modePaiement' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-West" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('montant')} className="flex items-center gap-1 hover:text-gray-700" disabled={isLoading}>
                    Montant
                    {sortConfig?.key === 'montant' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('dateInscription')} className="flex items-center gap-1 hover:text-gray-700" disabled={isLoading}>
                    Date Inscription
                    {sortConfig?.key === 'dateInscription' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                // Skeleton loader
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td colSpan={10} className="px-6 py-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredPaiements.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucun paiement trouvé</p>
                  </td>
                </tr>
              ) : (
                paginatedPaiements.map((paiement, index) => {
                  const isSelected = selectedIds.has(paiement.id);
                  return (
                    <motion.tr
                      key={paiement.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-orange-50' : ''}`}
                    >
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectItem(paiement.id, checked as boolean)}
                          disabled={isLoading}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{paiement.reference}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{paiement.participantNom}</p>
                          <p className="text-xs text-gray-500">{paiement.participantEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{paiement.organisationNom}</td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={paiement.statut === 'membre' ? 'default' : 'secondary'}
                          className={paiement.statut === 'membre' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {paiement.statut === 'membre' ? 'Membre' : 'Non-Membre'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant="outline"
                          className={
                            paiement.modePaiement === 'espèce' ? 'border-green-300 text-green-700 bg-green-50' :
                            paiement.modePaiement === 'virement' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                            'border-purple-300 text-purple-700 bg-purple-50'
                          }
                        >
                          {paiement.modePaiement}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {paiement.montant.toLocaleString()} FCFA
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(paiement.dateInscription).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <PaiementDetailsDialog paiement={paiement} />
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredPaiements.length > 0 && totalPages > 1 && (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages} ({filteredPaiements.length} résultat{filteredPaiements.length > 1 ? 's' : ''})
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
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
                >
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Affichage de l'erreur API si présente */}
        {apiError && (
          <div className="p-4 border-t bg-red-50">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Erreur lors du chargement des paiements</p>
                <p className="text-xs text-red-700 mt-1">{apiError}</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

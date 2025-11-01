"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { Card } from "../../ui/card";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Label } from "../../ui/label";
import { Search, Filter, Download, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../../ui/dialog";
import { CheckCircle2, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Eye, User, Mail, Phone, Globe, Building, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import paymentService from "@/services/paymentService";

type ModePaiement = 'espèce' | 'virement' | 'chèque' | 'carte bancaire' | 'orange money' | 'wave';

export function ListePaiements() {
  type Transaction = {
    id: string;
    reference: string;
    payment_method: string;
    payment_provider: string;
    amount: number;
    fees: number;
    state: string;
    initiated_at: string;
    completed_at: string | null;
    failed_at: string | null;
    user: {
      full_name: string;
      email: string;
      organization: {
        id: string;
        name: string;
      } | null;
      country: {
        id: string;
        name: string;
        code: string | null;
        flag: string;
      } | null;
    };
  };

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | 'payé' | 'non-payé'>('all');
  const [filterMode, setFilterMode] = useState<'all' | ModePaiement>('all');
  const [filterCanal, setFilterCanal] = useState<'all' | 'externe' | 'asapay'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // État pour le tri
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Fonction pour charger les transactions avec recherche et filtres
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // Préparer les filtres API (ne pas envoyer si "all")
      const filters: any = {};
      
      // Mode de paiement
      if (filterMode !== 'all') {
        const modeMap: Record<string, string> = {
          'espèce': 'cash',
          'virement': 'transfer',
          'chèque': 'check',
          'carte bancaire': 'card',
          'orange money': 'orange_money',
          'wave': 'wave'
        };
        filters.payment_method = modeMap[filterMode] || filterMode;
      }
      
      // Canal d'encaissement
      if (filterCanal !== 'all') {
        filters.payment_provider = filterCanal;
      }

      // Appeler l'API avec ou sans filtres
      const hasFilters = Object.keys(filters).length > 0;
      const response = searchTerm 
        ? await paymentService.search(searchTerm, hasFilters ? filters : undefined)
        : (hasFilters ? await paymentService.getAll(filters) : await paymentService.getAll());
      
      setTransactions(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (error) {
      toast?.error('Impossible de récupérer les paiements');
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Effectuer la recherche côté serveur avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 500); // Délai de 500ms après la dernière frappe

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Recharger quand les filtres changent (sans debounce)
  useEffect(() => {
    fetchTransactions();
  }, [filterMode, filterCanal]);

  // Transformer toutes les transactions en paiements
  const paiements = useMemo(() => {
    const toMode = (method: string) => (method === 'cash' ? 'espèce' : method);
    return transactions
      .map(t => ({
        id: t.id,
        reference: t.reference,
        participantNom: t.user?.full_name || 'N/A',
        participantEmail: t.user?.email || 'N/A',
        organisationNom: t.user?.organization?.name || 'N/A',
        statut: 'non-membre',
        montant: t.amount,
        modePaiement: toMode(t.payment_method),
        canalEncaissement: t.payment_provider || 'externe',
        dateInscription: t.initiated_at,
        datePaiement: t.completed_at || t.initiated_at,
        administrateurEncaissement: 'N/A',
        pays: t.user?.country?.name || 'N/A',
      }));
  }, [transactions]);

  // Filtrer les paiements (recherche, mode et canal déjà faits côté serveur, on applique le tri local)
  const filteredPaiements = useMemo(() => {
    let filtered = [...paiements];

    // Filtre par statut de paiement (local uniquement car pas géré par l'API)
    if (filterStatut !== 'all') {
      if (filterStatut === 'payé') {
        filtered = filtered.filter(p => p.modePaiement);
      } else {
        filtered = filtered.filter(p => !p.modePaiement);
      }
    }

    // Tri local
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
  }, [paiements, filterStatut, sortConfig]);
  
  // Fonction de tri
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Réinitialiser à la page 1 lors du tri
  };

  // Pagination
  const totalPages = Math.ceil(filteredPaiements.length / itemsPerPage);
  const paginatedPaiements = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPaiements.slice(startIndex, endIndex);
  }, [filteredPaiements, currentPage, itemsPerPage]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatut]);

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
    link.download = `paiements-finalises-${new Date().toISOString().split(' ✓')[0]}.csv`;
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
              Informations complètes pour {paiement.participantNom}
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
      {/* Barre de recherche et filtres */}
      <Card className="p-6 rounded-b-none border-b-0">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, prénom, référence, email ou organisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Boutons actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-orange-50 border-orange-300' : ''}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
                {activeFiltersCount > 0 && (
                  <Badge variant="destructive" className="ml-2 rounded-full px-1.5 min-w-[20px] h-5">
                    !
                  </Badge>
                )}
              </Button>
              <Button 
                onClick={exportToCSV} 
                variant="outline"
                disabled={paiements.length === 0}
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
                <Select value={filterMode} onValueChange={(value: any) => setFilterMode(value)}>
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
                <Select value={filterCanal} onValueChange={(value: any) => setFilterCanal(value)}>
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
              {paiements.length} paiement{paiements.length > 1 ? 's' : ''} trouvé{paiements.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('reference')} className="flex items-center gap-1 hover:text-gray-700">
                    Référence
                    {sortConfig?.key === 'reference' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('participantNom')} className="flex items-center gap-1 hover:text-gray-700">
                    Participant
                    {sortConfig?.key === 'participantNom' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('organisationNom')} className="flex items-center gap-1 hover:text-gray-700">
                    Organisation
                    {sortConfig?.key === 'organisationNom' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('statut')} className="flex items-center gap-1 hover:text-gray-700">
                    Statut
                    {sortConfig?.key === 'statut' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('modePaiement')} className="flex items-center gap-1 hover:text-gray-700">
                    Mode Paiement
                    {sortConfig?.key === 'modePaiement' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('montant')} className="flex items-center gap-1 hover:text-gray-700">
                    Montant
                    {sortConfig?.key === 'montant' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('dateInscription')} className="flex items-center gap-1 hover:text-gray-700">
                    Date Inscription
                    {sortConfig?.key === 'dateInscription' ? sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paiements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucun paiement trouvé</p>
                  </td>
                </tr>
              ) : (
                paginatedPaiements.map((paiement, index) => {
                  return (
                    <motion.tr
                      key={paiement.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
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
      </Card>

    </div>
  );
}
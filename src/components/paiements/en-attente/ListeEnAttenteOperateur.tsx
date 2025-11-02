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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../../ui/dialog";
import { CheckCircle2, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Eye, User, Mail, Phone, Globe, Building, Calendar, ChevronLeft, ChevronRight, Upload, File, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import paymentService from "@/services/paymentService";

type ModePaiement = 'cash' | 'check' | 'bank_transfer';

export function ListeEnAttenteOperateur() {
  type RegistrationItem = {
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      job_title: string;
      passport_number: string;
      registration_fee: string;
      company: {
        id: string;
        name: string;
      };
      country: {
        id: string;
        name: string;
      };
    };
    registration: {
      id: string;
      reference: string;
      status: string;
      amount: number;
      created_at: string;
      type: string;
    };
  };

  const [transactions, setTransactions] = useState<RegistrationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedModePaiement, setSelectedModePaiement] = useState<ModePaiement>('cash');
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
          'virement': 'bank_transfer',
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
        : (hasFilters ? await paymentService.getAllEnAttente(filters) : await paymentService.getAllEnAttente());
      
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
    return transactions
      .map(t => ({
        id: t.registration.id,
        reference: t.registration.reference,
        participantNom: t.user?.name || 'N/A',
        participantEmail: t.user?.email || 'N/A',
        participantPhone: t.user?.phone || 'N/A',
        participantJob: t.user?.job_title || 'N/A',
        organisationNom: t.user?.company?.name || 'N/A',
        statut: t.user?.registration_fee || 'N/A',
        montant: t.registration.amount,
        modePaiement: null, // Paiement non encore finalisé
        canalEncaissement: 'externe',
        dateInscription: t.registration.created_at,
        datePaiement: null,
        administrateurEncaissement: 'N/A',
        pays: t.user?.country?.name || 'N/A',
        registrationStatus: t.registration.status,
        registrationType: t.registration.type,
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

  const handleConfirmPayment = (participant: any) => {
    setSelectedParticipant(participant);
    setSelectedModePaiement(participant.modePaiement || 'cash');
    setShowConfirmDialog(true);
  };

  const handleValidatePayment = async () => {
    if (!selectedParticipant) {
      toast.error('Aucun participant sélectionné');
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('method', selectedModePaiement);
      if (uploadedFile) {
        formData.append('proof', uploadedFile, uploadedFile.name);
      }

      console.log('FormData avant envoi:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }
      
      const response = await paymentService.validatePayment(selectedParticipant.id, formData);
      
      console.log('Réponse API:', response);
      
      if (response.success === true || response.status === 'success' || response.message?.includes('success')) {
        toast.success('Paiement validé avec succès');
        
        // Recharger les transactions AVANT de fermer le dialog
        await fetchTransactions();
        
        // Fermer le dialog et nettoyer après le rechargement
        setShowConfirmDialog(false);
        setSelectedParticipant(null);
        setUploadedFile(null);
        setSelectedModePaiement('cash');
        setIsLoading(false);
      } else if (response.success === false) {
        toast.error(response.message || 'Erreur lors de la validation du paiement');
        setIsLoading(false);
        // Ne pas fermer le dialog en cas d'erreur pour que l'utilisateur puisse réessayer
      } else {
        toast.success('Paiement traité');
        
        // Recharger les transactions AVANT de fermer le dialog
        await fetchTransactions();
        
        setShowConfirmDialog(false);
        setSelectedParticipant(null);
        setUploadedFile(null);
        setSelectedModePaiement('cash');
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Erreur validation:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erreur lors de la validation du paiement';
      toast.error(errorMessage);
      setIsLoading(false);
      // Ne pas fermer le dialog en cas d'erreur pour que l'utilisateur puisse réessayer
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
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
      p.datePaiement ? new Date(p.datePaiement).toLocaleDateString('fr-FR') : '',
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
              {/* <Button
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
              </Button> */}
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
            <h2 className="text-gray-900">Liste des paiements en attente</h2>
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
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
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
                      <td className="px-6 py-4 text-gray-900">
                        {paiement.montant.toLocaleString()} FCFA
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(paiement.dateInscription).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <Button onClick={() => handleConfirmPayment(paiement)} size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Finaliser le paiement
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dialog de confirmation */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-orange-600" />
              Confirmation d'encaissement
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-2">
                <span className="block text-gray-700">
                  Confirmez-vous avoir encaissé ce paiement ?
                </span>
                
                {selectedParticipant && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Participant :</span>
                      <span className="text-gray-900">{selectedParticipant.participantNom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Référence :</span>
                      <span className="text-gray-900">{selectedParticipant.reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant :</span>
                      <span className="text-gray-900">
                        {selectedParticipant.montant.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Organisation :</span>
                      <span className="text-gray-900 text-right max-w-[200px]">{selectedParticipant.organisationNom}</span>
                    </div>
                  </div>
                )}

                {/* Sélection du mode de paiement */}
                <div className="space-y-3">
                  <Label className="text-sm text-gray-700 font-medium">Sélectionnez le mode de paiement :</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="cash"
                        name="modePaiement"
                        value="cash"
                        checked={selectedModePaiement === 'cash'}
                        onChange={(e) => setSelectedModePaiement(e.target.value as ModePaiement)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                        <span className="text-2xl">💵</span>
                        <span className="text-sm text-gray-700">Espèce</span>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="check"
                        name="modePaiement"
                        value="check"
                        checked={selectedModePaiement === 'check'}
                        onChange={(e) => setSelectedModePaiement(e.target.value as ModePaiement)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="check" className="flex items-center gap-2 cursor-pointer">
                        <span className="text-2xl">💳</span>
                        <span className="text-sm text-gray-700">Chèque</span>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="bank_transfer"
                        name="modePaiement"
                        value="bank_transfer"
                        checked={selectedModePaiement === 'bank_transfer'}
                        onChange={(e) => setSelectedModePaiement(e.target.value as ModePaiement)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer">
                        <span className="text-2xl">🏦</span>
                        <span className="text-sm text-gray-700">Virement Bancaire</span>
                      </label>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="preuvePaiement" className="text-sm text-gray-700 font-medium">Preuve de paiement (facultatif) :</Label>
                      <input
                        id="preuvePaiement"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setUploadedFile(e.target.files[0]);
                          } else {
                            setUploadedFile(null);
                          }
                        }}
                        className="block w-full text-sm text-gray-700 file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                      />
                      {uploadedFile && (
                        <div className="flex items-center gap-2 mt-1">
                          <File className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-600">{uploadedFile.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => setUploadedFile(null)}
                            className="p-0 h-6 w-6"
                            title="Supprimer le fichier"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <span className="block text-sm text-orange-600 bg-orange-50 p-3 rounded border border-orange-200">
                  ⚠️ Cette action marquera le paiement comme "Finalisé" et l'inscription sera validée. Le participant disparaîtra de cette liste et apparaîtra dans "Liste des paiements".
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleValidatePayment()}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Validation en cours...
                </>
              ) : (
                'Oui, confirmer l\'encaissement'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
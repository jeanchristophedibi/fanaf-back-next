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
import { CheckCircle2, AlertCircle, Upload, File, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useDynamicInscriptions } from "../../hooks/useDynamicInscriptions";
import { getOrganisationById, type ModePaiement } from "../../data/mockData";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../ui/alert-dialog";

export function ListeEnAttente() {
  const { participants } = useDynamicInscriptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | 'payé' | 'non-payé'>('all');
  const [filterMode, setFilterMode] = useState<'all' | ModePaiement>('all');
  const [filterCanal, setFilterCanal] = useState<'all' | 'externe' | 'asapay'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // États pour la gestion des paiements
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filterModePaiement, setFilterModePaiement] = useState('all');
  
  // État pour le tri
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Transformer les participants non-finalisés en paiements en attente
  const paiementsEnAttente = useMemo(() => {
    return participants
      .filter(p => p.statutInscription === 'non-finalisée')
      .filter(p => p.statut === 'membre' || p.statut === 'non-membre')
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
        };
      });
  }, [participants]);

  // Filtrer les paiements en attente
  const filteredPaiements = useMemo(() => {
    let filtered = [...paiementsEnAttente];

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
        filtered = filtered.filter(p => p.modePaiement);
      } else {
        filtered = filtered.filter(p => !p.modePaiement);
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
  }, [paiementsEnAttente, searchTerm, filterStatut, filterMode, filterCanal, sortConfig]);
  
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
  }, [filteredPaiements, currentPage]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatut, filterMode, filterCanal]);

  const activeFiltersCount =
    (filterStatut !== 'all' ? 1 : 0) +
    (filterMode !== 'all' ? 1 : 0) +
    (filterCanal !== 'all' ? 1 : 0);

  const hasActiveFilters = 
    filterStatut !== 'all' || 
    filterModePaiement !== 'all' || 
    searchTerm !== '';

  const resetFilters = () => {
    setFilterStatut('all');
    setFilterMode('all');
    setFilterCanal('all');
    setSearchTerm('');
    setFilterModePaiement('all');
  };
  
  // Fonctions pour gérer les paiements
  const handleConfirmPayment = (participant: any) => {
    setSelectedParticipant(participant);
    setShowConfirmDialog(true);
  };
  
  const handleValidatePayment = () => {
    // TODO: Implémenter la logique de validation
    console.log('Validation du paiement:', selectedParticipant);
    setShowConfirmDialog(false);
    setSelectedParticipant(null);
    setUploadedFile(null);
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
      new Date(p.datePaiement).toLocaleDateString('fr-FR'),
      p.administrateurEncaissement,
      p.pays,
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `paiements-en-attente-${new Date().toISOString().split('T')[0]}.csv`;
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

    <div className="space-y-3">
 {/* Barre de recherche et filtres */}
 <Card className="p-6">
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
                {hasActiveFilters && (
                  <Badge variant="destructive" className="ml-2 rounded-full px-1.5 min-w-[20px] h-5">
                    !
                  </Badge>
                )}
              </Button>
              <Button 
                onClick={exportToCSV} 
                variant="outline"
                disabled={paiementsEnAttente.length === 0}
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
                <Select value={filterModePaiement} onValueChange={(value: any) => setFilterModePaiement(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les modes</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Virement bancaire">Virement bancaire</SelectItem>
                    <SelectItem value="Chèque">Chèque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-600">Statut participant</label>
                <Select value={filterStatut} onValueChange={(value: any) => setFilterStatut(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="membre">Membre</SelectItem>
                    <SelectItem value="non-membre">Non-Membre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <div className="md:col-span-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilterModePaiement('all');
                      setFilterStatut('all');
                      setSearchTerm('');
                    }}
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
      </Card>

      {/* Tableau des paiements en attente */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">Paiements en attente d'encaissement</h2>
            <p className="text-sm text-gray-500">
              {paiementsEnAttente.length} paiement{paiementsEnAttente.length > 1 ? 's' : ''} trouvé{paiementsEnAttente.length > 1 ? 's' : ''}
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
              {paiementsEnAttente.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucun paiement en attente</p>
                    <p className="text-sm mt-1">Les paiements en Cash, Virement ou Chèque apparaîtront ici</p>
                  </td>
                </tr>
              ) : (
                paginatedPaiements.map((participant, index) => {
                  return (
                    <motion.tr
                      key={participant.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">{participant.reference}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{participant.participantNom}</p>
                          <p className="text-xs text-gray-500">{participant.participantEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{participant.organisationNom}</td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={participant.statut === 'membre' ? 'default' : 'secondary'}
                          className={participant.statut === 'membre' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {participant.statut === 'membre' ? 'Membre' : 'Non-Membre'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant="outline"
                          className={
                            participant.modePaiement === 'espèce' ? 'border-green-300 text-green-700 bg-green-50' :
                            participant.modePaiement === 'virement' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                            'border-purple-300 text-purple-700 bg-purple-50'
                          }
                        >
                          {participant.modePaiement}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {participant.montant.toLocaleString()} FCFA
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(participant.dateInscription).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => handleConfirmPayment(participant)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
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
                      <span className="text-gray-600">Mode de paiement :</span>
                      <Badge variant="outline" className="ml-2">
                        {selectedParticipant.modePaiement}
                      </Badge>
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

                {/* Section d'importation de preuve de paiement */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-blue-900">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Preuve de paiement (optionnel)</span>
                  </div>
                  
                  {!uploadedFile ? (
                    <div>
                      <label 
                        htmlFor="file-upload" 
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 rounded-md text-sm text-blue-700 hover:bg-blue-50 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Importer un fichier
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-blue-600 mt-2">
                        Formats acceptés : JPG, PNG, PDF (max 5 Mo)
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white border border-blue-200 rounded-md p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-900">{uploadedFile?.name}</p>
                          <p className="text-xs text-gray-500">
                            {uploadedFile?.size ? (uploadedFile.size / 1024).toFixed(0) : '0'} Ko
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={removeUploadedFile}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <span className="block text-sm text-orange-600 bg-orange-50 p-3 rounded border border-orange-200">
                  ⚠️ Cette action marquera le paiement comme "Finalisé" et l'inscription sera validée. Le participant disparaîtra de cette liste et apparaîtra dans "Liste des paiements".
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleValidatePayment}
              className="bg-green-600 hover:bg-green-700"
            >
              Oui, confirmer l'encaissement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Search, 
  Filter, 
  Download, 
  CreditCard, 
  Calendar,
  DollarSign,
  User,
  X,
  TrendingUp,
  Coins,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useDynamicInscriptions } from './hooks/useDynamicInscriptions';
import { getParticipantById, getOrganisationById, type ModePaiement } from './data/mockData';

export function ListePaiementsPage() {
  const { participants } = useDynamicInscriptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | 'payé' | 'non-payé'>('all');
  const [filterMode, setFilterMode] = useState<'all' | ModePaiement>('all');
  const [filterCanal, setFilterCanal] = useState<'all' | 'externe' | 'asapay'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Extraire les paiements effectués (participants avec statutInscription finalisée)
  const paiements = useMemo(() => {
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
        // VIP et speakers sont exonérés (0 FCFA)

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
          datePaiement: p.datePaiement || p.dateInscription, // Utilise dateInscription si datePaiement n'existe pas
          administrateurEncaissement: p.caissier || 'N/A',
          pays: p.pays,
        };
      });
  }, [participants]);

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
        filtered = filtered.filter(p => p.montant === 0 || p.modePaiement);
      } else {
        filtered = filtered.filter(p => p.montant > 0 && !p.modePaiement);
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

    return filtered;
  }, [paiements, searchTerm, filterStatut, filterMode, filterCanal]);

  // Pagination
  const totalPages = Math.ceil(filteredPaiements.length / itemsPerPage);
  const paginatedPaiements = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPaiements.slice(startIndex, endIndex);
  }, [filteredPaiements, currentPage]);

  // Réinitialiser la page quand les filtres changent
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatut, filterMode, filterCanal]);

  // Statistiques
  const stats = useMemo(() => {
    const totalPaiements = paiements.length;
    const totalMontant = paiements.reduce((sum, p) => sum + p.montant, 0);
    const paiementsExterne = paiements.filter(p => p.canalEncaissement === 'externe').length;
    const paiementsAsapay = paiements.filter(p => p.canalEncaissement === 'asapay').length;
    const montantExterne = paiements
      .filter(p => p.canalEncaissement === 'externe')
      .reduce((sum, p) => sum + p.montant, 0);
    const montantAsapay = paiements
      .filter(p => p.canalEncaissement === 'asapay')
      .reduce((sum, p) => sum + p.montant, 0);

    return {
      totalPaiements,
      totalMontant,
      paiementsExterne,
      paiementsAsapay,
      montantExterne,
      montantAsapay,
    };
  }, [paiements]);

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
    link.download = `paiements-fanaf-${new Date().toISOString().split('T')[0]}.csv`;
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
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Liste des paiements</h2>
        <p className="text-sm text-gray-600">
          Consultation de tous les paiements effectués pour FANAF 2026
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-700">Total paiements</p>
            <Coins className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl text-blue-900">{stats.totalPaiements}</p>
          <p className="text-xs text-blue-600 mt-1">
            {stats.totalMontant.toLocaleString()} FCFA
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-700">Canal Externe</p>
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl text-blue-900">{stats.paiementsExterne}</p>
          <p className="text-xs text-blue-600 mt-1">
            {stats.montantExterne.toLocaleString()} FCFA
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-orange-700">Canal ASAPAY</p>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl text-orange-900">{stats.paiementsAsapay}</p>
          <p className="text-xs text-orange-600 mt-1">
            {stats.montantAsapay.toLocaleString()} FCFA
          </p>
        </Card>
      </div>

      {/* Barre de recherche et filtres */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par référence, nom, email, organisation..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge className="bg-orange-600 text-white ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            <Button variant="outline" onClick={exportToCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-3 gap-4 pt-4 border-t"
            >
              <div>
                <Label className="text-xs mb-2 block">Statut</Label>
                <Select value={filterStatut} onValueChange={(v: any) => setFilterStatut(v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="payé">Payé</SelectItem>
                    <SelectItem value="non-payé">Non payé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-2 block">Mode de paiement</Label>
                <Select value={filterMode} onValueChange={(v: any) => setFilterMode(v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="chèque">Chèque</SelectItem>
                    <SelectItem value="espèce">Espèce</SelectItem>
                    <SelectItem value="carte bancaire">Carte bancaire</SelectItem>
                    <SelectItem value="orange money">Orange Money</SelectItem>
                    <SelectItem value="wave">Wave</SelectItem>
                    <SelectItem value="virement">Virement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-2 block">Canal d'encaissement</Label>
                <Select value={filterCanal} onValueChange={(v: any) => setFilterCanal(v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="externe">Externe</SelectItem>
                    <SelectItem value="asapay">ASAPAY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {activeFiltersCount > 0 && (
                <div className="col-span-3 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-2">
                    <X className="w-3 h-3" />
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </Card>

      {/* Liste des paiements */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredPaiements.length} paiement(s) trouvé(s)
          </p>
        </div>

        {filteredPaiements.length === 0 ? (
          <Card className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun paiement trouvé</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {paginatedPaiements.map((paiement, index) => (
              <motion.div
                key={paiement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-5 gap-4">
                      {/* Référence et participant */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <p className="text-sm text-gray-900">{paiement.participantNom}</p>
                        </div>
                        <p className="text-xs text-gray-500">Réf: {paiement.reference}</p>
                        <Badge className={`${getStatutBadge(paiement.statut)} mt-1 text-xs`}>
                          {paiement.statut}
                        </Badge>
                      </div>

                      {/* Organisation */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Organisation</p>
                        <p className="text-sm text-gray-900">{paiement.organisationNom}</p>
                        <p className="text-xs text-gray-500 mt-1">{paiement.pays}</p>
                      </div>

                      {/* Montant */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Montant</p>
                        <p className="text-lg text-gray-900">
                          {paiement.montant === 0 ? (
                            <span className="text-green-600">Exonéré</span>
                          ) : (
                            `${paiement.montant.toLocaleString()} FCFA`
                          )}
                        </p>
                      </div>

                      {/* Mode de paiement */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Mode de paiement</p>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{getModePaiementIcon(paiement.modePaiement)}</span>
                          <p className="text-sm text-gray-900 capitalize">
                            {paiement.modePaiement}
                          </p>
                        </div>
                        <Badge className={`${getCanalBadge(paiement.canalEncaissement)} mt-1 text-xs`}>
                          {paiement.canalEncaissement === 'externe' ? 'EXTERNE' : paiement.canalEncaissement.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Dates et Validation */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Encaissement</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                            <div className="flex flex-col">
                              <p className="text-xs text-gray-500">Date:</p>
                              <p className="text-sm text-green-700">
                                {new Date(paiement.datePaiement).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-orange-600" />
                            <div className="flex flex-col">
                              <p className="text-xs text-gray-500">Validé par:</p>
                              <p className="text-sm text-orange-700">
                                {paiement.administrateurEncaissement}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredPaiements.length > 0 && totalPages > 1 && (
          <Card className="p-4">
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
          </Card>
        )}
      </div>
    </div>
  );
}

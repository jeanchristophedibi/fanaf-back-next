import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Search, CheckCircle2, CreditCard, Clock, User, Building, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDynamicInscriptions } from './hooks/useDynamicInscriptions';
import { getOrganisationById, type Participant, type ModePaiement } from './data/mockData';
import { toast } from 'sonner';

export function CaissePaiementsPage() {
  const { participants } = useDynamicInscriptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isPaiementDialogOpen, setIsPaiementDialogOpen] = useState(false);
  const [selectedModePaiement, setSelectedModePaiement] = useState<ModePaiement>('espèce');
  // Charger les participants finalisés depuis localStorage
  const [finalisedParticipants, setFinalisedParticipants] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('finalisedParticipantsIds');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const itemsPerPage = 10;

  // Filtrer uniquement les inscriptions en attente (non finalisées) et qui ne sont pas exonérées
  // Exclure aussi les participants qui ont été finalisés localement
  const paiementsEnAttente = useMemo(() => {
    return participants.filter(p => 
      p.statutInscription === 'non-finalisée' && 
      p.statut !== 'vip' && 
      p.statut !== 'speaker' &&
      !finalisedParticipants.has(p.id)
    );
  }, [participants, finalisedParticipants]);

  // Filtrer par recherche
  const filteredPaiements = useMemo(() => {
    if (!searchTerm) return paiementsEnAttente;
    
    const searchLower = searchTerm.toLowerCase().trim();
    return paiementsEnAttente.filter(p => {
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
  }, [paiementsEnAttente, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredPaiements.length / itemsPerPage);
  const paginatedPaiements = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPaiements.slice(startIndex, endIndex);
  }, [filteredPaiements, currentPage]);

  // Réinitialiser la page quand la recherche change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Écouter les changements de localStorage (synchronisation entre onglets)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'finalisedParticipantsIds' && e.newValue) {
        const newFinalisedIds = new Set<string>(JSON.parse(e.newValue));
        setFinalisedParticipants(newFinalisedIds);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Écouter l'événement personnalisé de finalisation de paiement
  useEffect(() => {
    const handlePaymentFinalized = () => {
      // Recharger les participants finalisés depuis localStorage
      const stored = localStorage.getItem('finalisedParticipantsIds');
      if (stored) {
        setFinalisedParticipants(new Set(JSON.parse(stored)));
      }
    };

    window.addEventListener('paymentFinalized', handlePaymentFinalized);
    return () => window.removeEventListener('paymentFinalized', handlePaymentFinalized);
  }, []);

  // Calculer le montant selon le statut
  const getMontant = (participant: Participant) => {
    if (participant.statut === 'membre') return '350 000 FCFA';
    if (participant.statut === 'non-membre') return '400 000 FCFA';
    return '0 FCFA';
  };

  // Modes de paiement disponibles (tous sauf chèque et virement)
  const modesPaiementDisponibles: ModePaiement[] = ['espèce', 'carte bancaire', 'orange money', 'wave'];

  // Gérer l'ouverture du dialog de finalisation
  const handleFinaliserPaiement = (participant: Participant) => {
    setSelectedParticipant(participant);
    setSelectedModePaiement('espèce'); // Mode par défaut
    setIsPaiementDialogOpen(true);
  };

  // Valider le paiement
  const handleValiderPaiement = () => {
    if (!selectedParticipant) return;

    // Marquer le participant comme finalisé localement
    const newFinalisedSet = new Set(finalisedParticipants).add(selectedParticipant.id);
    setFinalisedParticipants(newFinalisedSet);
    
    // Sauvegarder dans localStorage pour partage entre les pages
    localStorage.setItem('finalisedParticipantsIds', JSON.stringify(Array.from(newFinalisedSet)));
    
    // Sauvegarder aussi les infos du paiement
    const finalisedPayments = JSON.parse(localStorage.getItem('finalisedPayments') || '{}');
    finalisedPayments[selectedParticipant.id] = {
      modePaiement: selectedModePaiement,
      datePaiement: new Date().toISOString(),
      caissier: 'Agent FANAF', // Nom du caissier - peut être personnalisé selon l'utilisateur connecté
    };
    localStorage.setItem('finalisedPayments', JSON.stringify(finalisedPayments));

    // Dispatcher un événement personnalisé pour notifier les autres composants
    window.dispatchEvent(new CustomEvent('paymentFinalized', { 
      detail: { participantId: selectedParticipant.id } 
    }));

    // Fermer le dialog
    setIsPaiementDialogOpen(false);

    // Afficher un message de succès
    toast.success(
      `Paiement finalisé pour ${selectedParticipant.prenom} ${selectedParticipant.nom}`,
      {
        description: `Mode de paiement : ${selectedModePaiement}`,
      }
    );

    // Réinitialiser
    setSelectedParticipant(null);
  };

  // Statistiques pour le caissier
  const stats = useMemo(() => {
    const total = paiementsEnAttente.length;
    const membresEnAttente = paiementsEnAttente.filter(p => p.statut === 'membre').length;
    const nonMembresEnAttente = paiementsEnAttente.filter(p => p.statut === 'non-membre').length;
    const montantAttenduMembres = membresEnAttente * 350000;
    const montantAttenduNonMembres = nonMembresEnAttente * 400000;
    const montantTotal = montantAttenduMembres + montantAttenduNonMembres;

    return {
      total,
      membresEnAttente,
      nonMembresEnAttente,
      montantTotal,
    };
  }, [paiementsEnAttente]);

  return (
    <div className="p-8 animate-page-enter">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Paiements en attente</h1>
        <p className="text-gray-600">
          Consultation des paiements en attente
        </p>
      </div>

      {/* Statistiques de la caisse */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 animate-fade-in">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 mb-1">Total en attente</p>
                <p className="text-3xl text-orange-900">{stats.total}</p>
                <p className="text-xs text-orange-600 mt-1">paiements</p>
              </div>
              <Clock className="w-10 h-10 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 mb-1">Membres</p>
                <p className="text-3xl text-purple-900">{stats.membresEnAttente}</p>
                <p className="text-xs text-purple-600 mt-1">en attente</p>
              </div>
              <User className="w-10 h-10 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 mb-1">Non-membres</p>
                <p className="text-3xl text-amber-900">{stats.nonMembresEnAttente}</p>
                <p className="text-xs text-amber-600 mt-1">en attente</p>
              </div>
              <Building className="w-10 h-10 text-amber-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">Montant total</p>
                <p className="text-xl text-green-900">{stats.montantTotal.toLocaleString('fr-FR')}</p>
                <p className="text-xs text-green-600 mt-1">FCFA</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher par nom, email, référence, organisation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredPaiements.length} paiement(s) en attente
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des paiements en attente */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead>Organisation</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date inscription</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPaiements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                        <p className="text-lg font-medium">Aucun paiement en attente</p>
                        <p className="text-sm">Tous les paiements ont été finalisés !</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPaiements.map((participant) => {
                    const organisation = getOrganisationById(participant.organisationId);
                    const montant = getMontant(participant);
                    const joursDAttente = Math.floor(
                      (Date.now() - new Date(participant.dateInscription).getTime()) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <TableRow key={participant.id} className="hover:bg-orange-50 transition-colors">
                        <TableCell className="font-mono text-sm text-gray-900">
                          {participant.reference}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-gray-900 font-medium">
                              {participant.prenom} {participant.nom}
                            </p>
                            <p className="text-xs text-gray-500">{participant.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {organisation?.nom || 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {participant.telephone}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            participant.statut === 'membre' 
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }>
                            {participant.statut}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-semibold text-green-700">
                              {montant}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-gray-600 text-sm">
                              {new Date(participant.dateInscription).toLocaleDateString('fr-FR')}
                            </p>
                            {joursDAttente > 0 && (
                              <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {joursDAttente} jour{joursDAttente > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Badge className="bg-orange-100 text-orange-700">
                              En attente de paiement
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => handleFinaliserPaiement(participant)}
                              className="bg-green-600 hover:bg-green-700 text-white gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Finaliser le paiement
                            </Button>
                          </div>
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
      {filteredPaiements.length > 0 && totalPages > 1 && (
        <Card className="mt-4">
          <CardContent className="p-4">
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
                        key={i}
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

      {/* Dialog de finalisation de paiement */}
      <Dialog open={isPaiementDialogOpen} onOpenChange={setIsPaiementDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Finaliser le paiement</DialogTitle>
            <DialogDescription>
              {selectedParticipant && (
                <>
                  Participant : {selectedParticipant.prenom} {selectedParticipant.nom}
                  <br />
                  Montant : {getMontant(selectedParticipant)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label className="text-sm mb-3 block">Sélectionnez le mode de paiement :</Label>
            <RadioGroup value={selectedModePaiement} onValueChange={(value) => setSelectedModePaiement(value as ModePaiement)}>
              <div className="space-y-3">
                {modesPaiementDisponibles.map((mode) => (
                  <div key={mode} className="flex items-center space-x-2">
                    <RadioGroupItem value={mode} id={mode} />
                    <Label htmlFor={mode} className="cursor-pointer flex items-center gap-2">
                      {mode === 'espèce' && <DollarSign className="w-4 h-4 text-green-600" />}
                      {mode === 'carte bancaire' && <CreditCard className="w-4 h-4 text-blue-600" />}
                      {mode === 'orange money' && <span className="w-4 h-4 rounded-full bg-orange-500" />}
                      {mode === 'wave' && <span className="w-4 h-4 rounded-full bg-blue-500" />}
                      <span className="capitalize">{mode}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaiementDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleValiderPaiement} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Valider le paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

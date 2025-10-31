import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { 
  Search, 
  CreditCard, 
  Calendar,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Filter,
  X,
  Banknote,
  Download,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useDynamicInscriptions } from './hooks/useDynamicInscriptions';
import { type Participant, type ModePaiement } from './data/types';
import { getOrganisationById, getParticipantById, getReferentSponsor, getParticipantsByOrganisation } from './data/helpers';


export function PaiementsEnAttentePage() {
  const { participants } = useDynamicInscriptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | 'membre' | 'non-membre'>('all');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Formulaire de paiement
  const [modePaiement, setModePaiement] = useState<ModePaiement | ''>('');
  const [datePaiement, setDatePaiement] = useState(new Date().toISOString().split('T')[0]);
  const [montantRecu, setMontantRecu] = useState('');

  // Filtrer les paiements en attente (uniquement membre et non-membre)
  const paiementsEnAttente = useMemo(() => {
    let filtered = participants.filter(p => 
      p.statutInscription === 'non-finalisée' && 
      (p.statut === 'membre' || p.statut === 'non-membre')
    );

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(p => {
        const org = getOrganisationById(p.organisationId);
        return (
          p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          org?.nom.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Filtre par statut
    if (filterStatut !== 'all') {
      filtered = filtered.filter(p => p.statut === filterStatut);
    }

    return filtered;
  }, [participants, searchTerm, filterStatut]);

  const handleOpenPaymentDialog = (participant: Participant) => {
    setSelectedParticipant(participant);
    // Pré-remplir le montant selon le statut
    const montant = participant.statut === 'membre' ? '350000' : '400000';
    setMontantRecu(montant);
    setModePaiement('');
    setDatePaiement(new Date().toISOString().split('T')[0]);
  };

  const handleProcessPayment = () => {
    if (!selectedParticipant || !modePaiement || !montantRecu) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsProcessingPayment(true);

    // Simulation de traitement
    setTimeout(() => {
      toast.success(
        `Paiement de ${parseInt(montantRecu).toLocaleString()} FCFA enregistré avec succès`,
        {
          description: `${selectedParticipant.prenom} ${selectedParticipant.nom} - ${modePaiement}`,
        }
      );
      setIsProcessingPayment(false);
      setSelectedParticipant(null);
      setModePaiement('');
      setMontantRecu('');
    }, 1500);
  };

  const exportToCSV = () => {
    const headers = ['Référence', 'Nom', 'Prénom', 'Email', 'Organisation', 'Statut', 'Tarif (FCFA)', 'Date Inscription'];
    const csvContent = [
      headers.join(','),
      ...paiementsEnAttente.map(p => {
        const org = getOrganisationById(p.organisationId);
        const tarif = p.statut === 'membre' ? 350000 : 400000;
        return [
          p.reference,
          p.nom,
          p.prenom,
          p.email,
          org?.nom || '',
          p.statut,
          tarif,
          p.dateInscription,
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `paiements_en_attente_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Export CSV téléchargé avec succès');
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
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-700">Paiements en attente</p>
                <p className="text-3xl text-orange-900">{paiementsEnAttente.length}</p>
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
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Membres</p>
                <p className="text-3xl text-blue-900">
                  {paiementsEnAttente.filter(p => p.statut === 'membre').length}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-700">Non-membres</p>
                <p className="text-3xl text-purple-900">
                  {paiementsEnAttente.filter(p => p.statut === 'non-membre').length}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Barre d'outils */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-600" />
            <span className="text-sm">Recherche et Filtres</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtres
            </Button>
            <Button 
              onClick={exportToCSV} 
              variant="outline" 
              size="sm"
              disabled={paiementsEnAttente.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Recherche */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom, prénom, email, référence, organisation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtres */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t pt-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs mb-2 block">Statut participant</Label>
                <Select value={filterStatut} onValueChange={(value: any) => setFilterStatut(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="membre">Membre</SelectItem>
                    <SelectItem value="non-membre">Non-membre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setFilterStatut('all');
                    setSearchTerm('');
                    toast.success('Filtres réinitialisés');
                  }}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Liste des paiements en attente */}
      <Card className="p-6">
        <div className="space-y-3">
          {paiementsEnAttente.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">Aucun paiement en attente</p>
              <p className="text-sm text-gray-400">Toutes les inscriptions ont été finalisées</p>
            </div>
          ) : (
            paiementsEnAttente.map((participant, index) => {
              const organisation = getOrganisationById(participant.organisationId);
              const tarif = participant.statut === 'membre' ? 350000 : 400000;

              return (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:bg-orange-50/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white">
                        {participant.prenom[0]}{participant.nom[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900">
                            {participant.prenom} {participant.nom}
                          </p>
                          <Badge variant={participant.statut === 'membre' ? 'default' : 'secondary'}>
                            {participant.statut}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {organisation?.nom || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(participant.dateInscription).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="flex items-center gap-1 text-orange-600">
                            <Banknote className="w-3 h-3" />
                            {tarif.toLocaleString()} FCFA
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleOpenPaymentDialog(participant)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Finaliser le paiement
                    </Button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </Card>

      {/* Dialog de finalisation de paiement */}
      <Dialog open={selectedParticipant !== null} onOpenChange={(open) => !open && setSelectedParticipant(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-600" />
              Finaliser le paiement
            </DialogTitle>
            <DialogDescription>
              {selectedParticipant && (
                <>
                  {selectedParticipant.prenom} {selectedParticipant.nom} - {selectedParticipant.reference}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedParticipant && (
            <div className="space-y-4">
              {/* Informations participant */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Organisation</p>
                    <p className="text-gray-900">{getOrganisationById(selectedParticipant.organisationId)?.nom}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Statut</p>
                    <Badge variant={selectedParticipant.statut === 'membre' ? 'default' : 'secondary'}>
                      {selectedParticipant.statut}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Formulaire de paiement */}
              <div className="space-y-4">
                <div>
                  <Label>Mode de paiement *</Label>
                  <Select value={modePaiement} onValueChange={(value: ModePaiement) => setModePaiement(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le mode de paiement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chèque">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Chèque
                        </div>
                      </SelectItem>
                      <SelectItem value="espèce">
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4" />
                          Espèce
                        </div>
                      </SelectItem>
                      <SelectItem value="virement">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Virement bancaire
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Paiements autorisés : Chèque, Espèce et Virement
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date de paiement *</Label>
                    <Input
                      type="date"
                      value={datePaiement}
                      onChange={(e) => setDatePaiement(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label>Montant reçu (FCFA) *</Label>
                    <Input
                      type="number"
                      value={montantRecu}
                      onChange={(e) => setMontantRecu(e.target.value)}
                      placeholder="Montant"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tarif: {selectedParticipant.statut === 'membre' ? '350 000' : '400 000'} FCFA
                    </p>
                  </div>
                </div>
              </div>

              {/* Informations importantes */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-900">
                    <p className="mb-1">Après finalisation du paiement :</p>
                    <ul className="list-disc list-inside space-y-1 text-green-700">
                      <li>Le badge sera généré automatiquement</li>
                      <li>La lettre d'invitation sera disponible</li>
                      <li>Le reçu de paiement sera créé</li>
                      <li>Les documents seront disponibles dans "Documents participants"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedParticipant(null)}
              disabled={isProcessingPayment}
            >
              Annuler
            </Button>
            <Button
              onClick={handleProcessPayment}
              disabled={isProcessingPayment || !modePaiement || !montantRecu}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Traitement...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmer le paiement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

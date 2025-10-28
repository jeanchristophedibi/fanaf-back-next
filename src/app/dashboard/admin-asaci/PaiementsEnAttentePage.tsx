'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { 
  Search, 
  Download,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Filter,
  X,
  Upload,
  File
} from 'lucide-react';
import { toast } from 'sonner';

interface PaiementEnAttente {
  id: string;
  reference: string;
  nom: string;
  prenom: string;
  email: string;
  organisation: string;
  statut: 'membre' | 'non-membre';
  modePaiementDeclare: 'Cash' | 'Virement bancaire' | 'Chèque';
  montant: number;
  dateInscription: string;
  statutPaiement: 'En attente' | 'Finalisé';
  dateEncaissement?: string;
  administrateurEncaissement?: string;
  preuvePaiement?: string;
}

// Données échantillon des 6 paiements en attente
const initialPaiementsData: PaiementEnAttente[] = [
  {
    id: 'PAY-001',
    reference: 'FANAF-2026-001',
    nom: 'Diallo',
    prenom: 'Amadou',
    email: 'amadou.diallo@assurance-benin.com',
    organisation: 'Assurance du Bénin',
    statut: 'membre',
    modePaiementDeclare: 'Chèque',
    montant: 350000,
    dateInscription: '2025-10-15',
    statutPaiement: 'En attente'
  },
  {
    id: 'PAY-002',
    reference: 'FANAF-2026-002',
    nom: 'Kouassi',
    prenom: 'Marie',
    email: 'marie.kouassi@ivoire-assur.ci',
    organisation: 'Ivoire Assurance',
    statut: 'membre',
    modePaiementDeclare: 'Virement bancaire',
    montant: 350000,
    dateInscription: '2025-10-18',
    statutPaiement: 'En attente'
  },
  {
    id: 'PAY-003',
    reference: 'FANAF-2026-003',
    nom: 'Ndiaye',
    prenom: 'Cheikh',
    email: 'cheikh.ndiaye@sunu-assur.sn',
    organisation: 'SUNU Assurances Sénégal',
    statut: 'non-membre',
    modePaiementDeclare: 'Cash',
    montant: 400000,
    dateInscription: '2025-10-20',
    statutPaiement: 'En attente'
  },
  {
    id: 'PAY-004',
    reference: 'FANAF-2026-004',
    nom: 'Traore',
    prenom: 'Fatoumata',
    email: 'fatoumata.traore@atlantique-assur.ml',
    organisation: 'Atlantique Assurance Mali',
    statut: 'membre',
    modePaiementDeclare: 'Cash',
    montant: 350000,
    dateInscription: '2025-10-22',
    statutPaiement: 'En attente'
  },
  {
    id: 'PAY-005',
    reference: 'FANAF-2026-005',
    nom: 'Mensah',
    prenom: 'Emmanuel',
    email: 'emmanuel.mensah@globeassur.tg',
    organisation: 'Globe Assurance Togo',
    statut: 'non-membre',
    modePaiementDeclare: 'Virement bancaire',
    montant: 400000,
    dateInscription: '2025-10-23',
    statutPaiement: 'En attente'
  },
  {
    id: 'PAY-006',
    reference: 'FANAF-2026-006',
    nom: 'Kone',
    prenom: 'Salimata',
    email: 'salimata.kone@saham-assur.bf',
    organisation: 'SAHAM Assurance Burkina',
    statut: 'membre',
    modePaiementDeclare: 'Chèque',
    montant: 350000,
    dateInscription: '2025-10-25',
    statutPaiement: 'En attente'
  }
];

export function AdminAsaciPaiementsEnAttentePage() {
  const [paiements, setPaiements] = useState<PaiementEnAttente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModePaiement, setFilterModePaiement] = useState<'all' | 'Cash' | 'Virement bancaire' | 'Chèque'>('all');
  const [filterStatut, setFilterStatut] = useState<'all' | 'membre' | 'non-membre'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<PaiementEnAttente | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Charger les paiements depuis localStorage ou utiliser les données initiales
  useEffect(() => {
    const stored = localStorage.getItem('asaci_paiements_attente');
    if (stored) {
      setPaiements(JSON.parse(stored));
    } else {
      // Initialiser les paiements en attente
      setPaiements(initialPaiementsData);
      localStorage.setItem('asaci_paiements_attente', JSON.stringify(initialPaiementsData));

      // S'assurer que les participants correspondants existent dans fanaf_participants
      const participantsStorage = localStorage.getItem('fanaf_participants');
      if (participantsStorage) {
        const participants = JSON.parse(participantsStorage);
        const participantsReferences = new Set(participants.map((p: any) => p.reference));
        
        // Créer les participants manquants pour les paiements en attente
        const newParticipants = initialPaiementsData
          .filter(p => !participantsReferences.has(p.reference))
          .map((p, index) => ({
            id: `temp-${index + 1}`,
            nom: p.nom,
            prenom: p.prenom,
            reference: p.reference,
            email: p.email,
            telephone: '+000 00 00 00 00',
            pays: 'N/A',
            fonction: 'Participant',
            organisationId: 'org1',
            statut: p.statut,
            statutInscription: 'non-finalisée',
            dateInscription: p.dateInscription,
          }));

        if (newParticipants.length > 0) {
          localStorage.setItem('fanaf_participants', JSON.stringify([...participants, ...newParticipants]));
          window.dispatchEvent(new Event('paymentFinalized')); // Rafraîchir les données
        }
      }
    }
  }, []);

  // Sauvegarder les paiements dans localStorage à chaque modification
  useEffect(() => {
    if (paiements.length > 0) {
      localStorage.setItem('asaci_paiements_attente', JSON.stringify(paiements));
    }
  }, [paiements]);

  // Filtrer les paiements en attente
  const paiementsEnAttente = useMemo(() => {
    let filtered = paiements.filter(p => p.statutPaiement === 'En attente');

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.organisation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par mode de paiement
    if (filterModePaiement !== 'all') {
      filtered = filtered.filter(p => p.modePaiementDeclare === filterModePaiement);
    }

    // Filtre par statut participant
    if (filterStatut !== 'all') {
      filtered = filtered.filter(p => p.statut === filterStatut);
    }

    return filtered;
  }, [paiements, searchTerm, filterModePaiement, filterStatut]);

  const handleConfirmPayment = (participant: PaiementEnAttente) => {
    setSelectedParticipant(participant);
    setUploadedFile(null); // Réinitialiser le fichier uploadé
    setShowConfirmDialog(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Fichier trop volumineux', {
          description: 'La taille maximale autorisée est de 5 Mo'
        });
        return;
      }

      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Type de fichier non autorisé', {
          description: 'Seuls les fichiers JPG, PNG et PDF sont acceptés'
        });
        return;
      }

      setUploadedFile(file);
      toast.success('Fichier ajouté', {
        description: `${file.name} (${(file.size / 1024).toFixed(0)} Ko)`
      });
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    toast.info('Fichier retiré');
  };

  const handleValidatePayment = () => {
    if (!selectedParticipant) return;

    const dateEncaissement = new Date().toISOString();
    const administrateur = 'Administrateur ASACI'; // Nom de l'admin connecté

    // Mettre à jour le statut du paiement à "Finalisé"
    const updatedPaiements = paiements.map(p => 
      p.id === selectedParticipant.id 
        ? { 
            ...p, 
            statutPaiement: 'Finalisé' as const,
            dateEncaissement,
            administrateurEncaissement: administrateur,
            preuvePaiement: uploadedFile?.name
          }
        : p
    );

    setPaiements(updatedPaiements);

    // Mettre à jour également les participants dans le localStorage principal
    const participantsStorage = localStorage.getItem('fanaf_participants');
    if (participantsStorage) {
      const participants = JSON.parse(participantsStorage);
      const updatedParticipants = participants.map((participant: any) => {
        if (participant.reference === selectedParticipant.reference) {
          return {
            ...participant,
            statutInscription: 'finalisée',
            datePaiement: dateEncaissement,
            caissier: administrateur,
            modePaiement: selectedParticipant.modePaiementDeclare === 'Cash' ? 'espèce' : 
                          selectedParticipant.modePaiementDeclare === 'Virement bancaire' ? 'virement' : 'chèque',
            canalEncaissement: 'externe'
          };
        }
        return participant;
      });
      localStorage.setItem('fanaf_participants', JSON.stringify(updatedParticipants));
      
      // Dispatcher l'événement pour notifier les autres composants
      window.dispatchEvent(new Event('paymentFinalized'));
    }

    const hasProof = uploadedFile !== null;
    const proofMessage = hasProof ? ` (Preuve jointe: ${uploadedFile.name})` : '';

    toast.success('Paiement finalisé avec succès', {
      description: `${selectedParticipant.prenom} ${selectedParticipant.nom} - ${selectedParticipant.modePaiementDeclare}${proofMessage}`,
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />
    });

    setShowConfirmDialog(false);
    setSelectedParticipant(null);
    setUploadedFile(null);
  };

  const exportToCSV = () => {
    const headers = ['Référence', 'Nom', 'Prénom', 'Email', 'Organisation', 'Statut', 'Mode Paiement', 'Montant (FCFA)', 'Date Inscription', 'Statut Paiement'];
    const csvContent = [
      headers.join(','),
      ...paiementsEnAttente.map(p => [
        p.reference,
        p.nom,
        p.prenom,
        p.email,
        p.organisation,
        p.statut,
        p.modePaiementDeclare,
        p.montant,
        p.dateInscription,
        p.statutPaiement,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `paiements_en_attente_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Export CSV téléchargé avec succès');
  };

  const statsParMode = useMemo(() => {
    const stats = {
      cash: 0,
      virement: 0,
      cheque: 0,
      total: paiementsEnAttente.length
    };

    paiementsEnAttente.forEach(p => {
      if (p.modePaiementDeclare === 'Cash') stats.cash++;
      if (p.modePaiementDeclare === 'Virement bancaire') stats.virement++;
      if (p.modePaiementDeclare === 'Chèque') stats.cheque++;
    });

    return stats;
  }, [paiementsEnAttente]);

  const hasActiveFilters = filterModePaiement !== 'all' || filterStatut !== 'all' || searchTerm !== '';

  const resetToInitialData = () => {
    setPaiements(initialPaiementsData);
    localStorage.setItem('asaci_paiements_attente', JSON.stringify(initialPaiementsData));
    toast.success('Données réinitialisées', {
      description: '6 paiements en attente restaurés'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Bannière d'information */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm text-indigo-900">Mode Démonstration</h3>
          <p className="text-sm text-indigo-700 mt-1">
            Cette page affiche 6 paiements échantillon pour illustrer le fonctionnement. Les paiements validés disparaissent automatiquement de la liste et apparaissent dans la rubrique "Liste des paiements".
          </p>
        </div>
        <Button
          onClick={resetToInitialData}
          variant="outline"
          size="sm"
          className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
        >
          Réinitialiser
        </Button>
      </div>

      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-sm text-orange-700">Total en attente</p>
                <p className="text-3xl text-orange-900">{statsParMode.total}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Banknote className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cash</p>
                <p className="text-3xl text-gray-900">{statsParMode.cash}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Banknote className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Virement</p>
                <p className="text-3xl text-gray-900">{statsParMode.virement}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Banknote className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Chèque</p>
                <p className="text-3xl text-gray-900">{statsParMode.cheque}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

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
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Référence</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Participant</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Organisation</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Mode Paiement</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Date Inscription</th>
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
                paiementsEnAttente.map((participant, index) => {
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
                          <p className="text-sm text-gray-900">{participant.prenom} {participant.nom}</p>
                          <p className="text-xs text-gray-500">{participant.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{participant.organisation}</td>
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
                            participant.modePaiementDeclare === 'Cash' ? 'border-green-300 text-green-700 bg-green-50' :
                            participant.modePaiementDeclare === 'Virement bancaire' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                            'border-purple-300 text-purple-700 bg-purple-50'
                          }
                        >
                          {participant.modePaiementDeclare}
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
                      <span className="text-gray-900">{selectedParticipant.prenom} {selectedParticipant.nom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Référence :</span>
                      <span className="text-gray-900">{selectedParticipant.reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mode de paiement :</span>
                      <Badge variant="outline" className="ml-2">
                        {selectedParticipant.modePaiementDeclare}
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
                      <span className="text-gray-900 text-right max-w-[200px]">{selectedParticipant.organisation}</span>
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
                          <p className="text-sm text-gray-900">{uploadedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(uploadedFile.size / 1024).toFixed(0)} Ko
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

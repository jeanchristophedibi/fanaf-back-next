import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Search, Users, CheckCircle2, Filter, X, AlertCircle, FileText } from 'lucide-react';
import { useDynamicInscriptions } from './hooks/useDynamicInscriptions';
import { useFanafApi } from '../hooks/useFanafApi';
import { getOrganisationById, type Participant, type ModePaiement } from './data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { GroupDocumentsGenerator } from './GroupDocumentsGenerator';

export function PaiementsGroupesPage() {
  const { participants: mockParticipants } = useDynamicInscriptions();
  const { api } = useFanafApi();
  const [apiParticipants, setApiParticipants] = useState<any[]>([]);
  const [apiLoading, setApiLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [finalisedParticipants, setFinalisedParticipants] = useState<Participant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [modePaiementGroupe, setModePaiementGroupe] = useState<ModePaiement>('espèce');
  const [nomCaissier, setNomCaissier] = useState('');

  // Filtres
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrganisation, setSelectedOrganisation] = useState<string>('all');
  const [selectedStatut, setSelectedStatut] = useState<string>('all');

  // Charger le nom du caissier depuis localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedName = localStorage.getItem('caissierName');
    if (storedName) {
      setNomCaissier(storedName);
    }
  }, []);

  // Charger depuis l'API (registrations), fallback vers mocks si vide
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setApiLoading(true);
        const regsRes = await api.getRegistrations({ per_page: 200, page: 1 });
        const regsAny: any = regsRes as any;
        const regsArray = Array.isArray(regsAny?.data)
          ? regsAny.data
          : Array.isArray(regsAny)
            ? regsAny
            : [];
        if (mounted) setApiParticipants(regsArray);
      } catch (_) {
        if (mounted) setApiParticipants([]);
      } finally {
        if (mounted) setApiLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [api]);

  const baseParticipants = apiParticipants.length > 0 ? apiParticipants : mockParticipants;

  // Filtrer les participants non finalisés (membres et non-membres uniquement)
  const participantsEnAttente = useMemo(() => {
    const getStatus = (p: any) => (p.statutInscription || p.registration_status || '').toLowerCase();
    const getCategory = (p: any) => (p.statut || p.category || '').toLowerCase();
    const getId = (p: any) => p.id || p._id || p.registration_id || p.reference;
    return (baseParticipants || []).filter(p =>
      (getStatus(p) === 'non-finalisée' || getStatus(p) === 'pending' || !getStatus(p)) &&
      (getCategory(p) === 'membre' || getCategory(p) === 'member' || getCategory(p) === 'non-membre' || getCategory(p) === 'not_member')
    ).map((p: any) => ({ ...p, id: getId(p), statut: getCategory(p) || p.statut }));
  }, [baseParticipants]);

  // Obtenir les listes pour les filtres
  const uniqueOrganisations = useMemo(() => {
    const orgs = new Set<string>();
    participantsEnAttente.forEach(p => {
      const org = getOrganisationById(p.organisationId);
      if (org) orgs.add(org.nom);
    });
    return Array.from(orgs).sort();
  }, [participantsEnAttente]);

  // Filtrer les participants selon les critères
  const filteredParticipants = useMemo(() => {
    let filtered = [...participantsEnAttente];

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
          p.nomGroupe?.toLowerCase().includes(searchLower) ||
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

    // Filtre par statut
    if (selectedStatut !== 'all') {
      filtered = filtered.filter(p => p.statut === selectedStatut);
    }

    return filtered;
  }, [participantsEnAttente, searchTerm, selectedOrganisation, selectedStatut]);

  // Grouper les participants par groupeId
  const participantsByGroup = useMemo<Map<string, Participant[]>>(() => {
    const groups = new Map<string, Participant[]>();
    filteredParticipants.forEach(p => {
      if (p.groupeId) {
        const existing = groups.get(p.groupeId) || [];
        groups.set(p.groupeId, [...existing, p]);
      } else {
        // Participants sans groupe
        groups.set(`single-${p.id}`, [p]);
      }
    });
    return groups;
  }, [filteredParticipants]);

  // Compter les filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedOrganisation !== 'all') count++;
    if (selectedStatut !== 'all') count++;
    return count;
  }, [selectedOrganisation, selectedStatut]);

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setSelectedOrganisation('all');
    setSelectedStatut('all');
    setSearchTerm('');
  };

  // Gérer la sélection d'un participant
  const handleSelectParticipant = (participantId: string, participant: Participant) => {
    const newSelection = new Set(selectedParticipants);

    // Si le participant appartient à un groupe, sélectionner/désélectionner tout le groupe
    if (participant.groupeId) {
      const groupMembers = participantsEnAttente.filter(p => p.groupeId === participant.groupeId);
      const allSelected = groupMembers.every(p => selectedParticipants.has(p.id));

      if (allSelected) {
        // Désélectionner tout le groupe
        groupMembers.forEach(p => newSelection.delete(p.id));
      } else {
        // Sélectionner tout le groupe
        groupMembers.forEach(p => newSelection.add(p.id));
      }
    } else {
      // Participant sans groupe - toggle individuel
      if (newSelection.has(participantId)) {
        newSelection.delete(participantId);
      } else {
        newSelection.add(participantId);
      }
    }

    setSelectedParticipants(newSelection);
  };

  // Sélectionner tous les participants d'un groupe
  const handleSelectGroup = (groupeId: string) => {
    const newSelection = new Set(selectedParticipants);
    const groupMembers = participantsEnAttente.filter(p => p.groupeId === groupeId);
    const allSelected = groupMembers.every(p => selectedParticipants.has(p.id));

    if (allSelected) {
      groupMembers.forEach(p => newSelection.delete(p.id));
    } else {
      groupMembers.forEach(p => newSelection.add(p.id));
    }

    setSelectedParticipants(newSelection);
  };

  // Calculer le montant total
  const calculateTotal = () => {
    let total = 0;
    selectedParticipants.forEach(id => {
      const participant = baseParticipants.find((p: any) => {
        const getId = (p: any) => p.id || p._id || p.registration_id || p.reference;
        return getId(p) === id;
      });
      if (participant) {
        const getCategory = (p: any) => (p.statut || p.category || '').toLowerCase();
        const category = getCategory(participant);
        if (category === 'membre' || category === 'member') {
          total += 350000;
        } else if (category === 'non-membre' || category === 'not_member') {
          total += 400000;
        }
      }
    });
    return total;
  };

  // Finaliser les paiements groupés
  const handleConfirmPaiementGroupe = () => {
    if (selectedParticipants.size === 0) {
      toast.error('Aucun participant sélectionné');
      return;
    }

    if (!nomCaissier) {
      toast.error('Nom du caissier non défini');
      return;
    }

    const datePaiement = new Date().toISOString();

    // Récupérer les paiements finalisés existants
    const storedPayments = localStorage.getItem('finalisedPayments');
    const finalisedPayments = storedPayments ? JSON.parse(storedPayments) : {};

    // Récupérer les IDs finalisés existants
    const storedIds = localStorage.getItem('finalisedParticipantsIds');
    const finalisedIds = storedIds ? JSON.parse(storedIds) : [];

    // Ajouter les nouveaux paiements
    selectedParticipants.forEach(id => {
      finalisedPayments[id] = {
        modePaiement: modePaiementGroupe,
        datePaiement,
        caissier: nomCaissier,
      };
      if (!finalisedIds.includes(id)) {
        finalisedIds.push(id);
      }
    });

    // Sauvegarder dans localStorage
    localStorage.setItem('finalisedPayments', JSON.stringify(finalisedPayments));
    localStorage.setItem('finalisedParticipantsIds', JSON.stringify(finalisedIds));

    // Déclencher l'événement de mise à jour
    window.dispatchEvent(new Event('storage'));

    // Récupérer les participants finalisés pour la génération des documents
    const finalisedPartsList = baseParticipants.filter((p: any) => {
      const getId = (p: any) => p.id || p._id || p.registration_id || p.reference;
      return selectedParticipants.has(getId(p));
    });
    setFinalisedParticipants(finalisedPartsList as any);

    toast.success(`${selectedParticipants.size} paiement(s) finalisé(s) avec succès`);
    setSelectedParticipants(new Set());
    setShowConfirmDialog(false);
    
    // Ouvrir automatiquement le dialog de génération des documents
    setTimeout(() => {
      setShowDocumentsDialog(true);
    }, 500);
  };

  const totalAmount = calculateTotal();

  // Vérifier si un participant est sélectionné
  const isParticipantSelected = (participantId: string) => {
    return selectedParticipants.has(participantId);
  };

  // Vérifier si tous les membres d'un groupe sont sélectionnés
  const isGroupFullySelected = (groupeId: string) => {
    const groupMembers = participantsEnAttente.filter(p => p.groupeId === groupeId);
    return groupMembers.every(p => selectedParticipants.has(p.id));
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-700">Participants en attente</p>
                <p className="text-2xl text-orange-900">{participantsEnAttente.length}</p>
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
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Sélectionnés</p>
                <p className="text-2xl text-blue-900">{selectedParticipants.size}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white">FCFA</span>
              </div>
              <div>
                <p className="text-sm text-green-700">Montant total</p>
                <p className="text-2xl text-green-900">
                  {totalAmount.toLocaleString('fr-FR')}
                </p>
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
                placeholder="Rechercher par nom, organisation, nom de groupe..."
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Boutons d'action */}
      {selectedParticipants.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 justify-between"
        >
          <Button
            variant="outline"
            onClick={() => {
              const selectedPartsList = baseParticipants.filter((p: any) => {
                const getId = (p: any) => p.id || p._id || p.registration_id || p.reference;
                return selectedParticipants.has(getId(p));
              });
              setFinalisedParticipants(selectedPartsList as any);
              setShowDocumentsDialog(true);
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            Prévisualiser les documents
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedParticipants(new Set())}
            >
              Annuler la sélection
            </Button>
            <Button
              onClick={() => setShowConfirmDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Finaliser {selectedParticipants.size} paiement(s) - {totalAmount.toLocaleString('fr-FR')} FCFA
            </Button>
          </div>
        </motion.div>
      )}

      {/* Tableau des participants par groupe */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Nom & Prénom</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Organisation</TableHead>
                  <TableHead>Groupe</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...participantsByGroup.entries()].map((entry) => {
                  const [groupId, groupMembers] = entry;
                  const isGroup = groupMembers.length > 1;
                  const firstMember = groupMembers[0];

                  return (
                    <React.Fragment key={groupId}>
                      {isGroup && (
                        <TableRow className="bg-blue-50 border-b-2 border-blue-200">
                          <TableCell>
                            <Checkbox
                              checked={isGroupFullySelected(firstMember.groupeId!)}
                              onCheckedChange={() => handleSelectGroup(firstMember.groupeId!)}
                            />
                          </TableCell>
                          <TableCell colSpan={6}>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              <span className="text-blue-900">
                                Groupe: {firstMember.nomGroupe || firstMember.groupeId} ({groupMembers.length} participants)
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {groupMembers.map((participant) => {
                        const org = getOrganisationById(participant.organisationId);
                        const montant = participant.statut === 'membre' ? 350000 : 400000;

                        return (
                          <TableRow
                            key={participant.id}
                            className={`hover:bg-gray-50 ${isGroup ? 'bg-blue-50/30' : ''} ${
                              isParticipantSelected(participant.id) ? 'bg-green-50' : ''
                            }`}
                          >
                            <TableCell>
                              <Checkbox
                                checked={isParticipantSelected(participant.id)}
                                onCheckedChange={() => handleSelectParticipant(participant.id, participant)}
                              />
                            </TableCell>
                            <TableCell>
                              {participant.nom} {participant.prenom}
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {participant.reference}
                              </code>
                            </TableCell>
                            <TableCell>{org?.nom}</TableCell>
                            <TableCell>
                              {participant.nomGroupe ? (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                  {participant.nomGroupe}
                                </Badge>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  participant.statut === 'membre'
                                    ? 'bg-green-50 text-green-700 border-green-300'
                                    : 'bg-blue-50 text-blue-700 border-blue-300'
                                }
                              >
                                {participant.statut === 'membre' ? 'Membre' : 'Non-membre'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-green-900">
                              {montant.toLocaleString('fr-FR')} FCFA
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>

            {filteredParticipants.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Aucun participant trouvé</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmation */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le paiement groupé</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de finaliser {selectedParticipants.size} paiement(s) pour un montant total de {totalAmount.toLocaleString('fr-FR')} FCFA.
            </DialogDescription>
          </DialogHeader>

          {/* Alerte de génération de documents */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-900">
                Après validation, vous pourrez générer automatiquement tous les documents 
                (badges, reçus, factures, lettres d'invitation) pour les participants.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Mode de paiement</label>
              <Select value={modePaiementGroupe} onValueChange={(value) => setModePaiementGroupe(value as ModePaiement)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="espèce">Espèce</SelectItem>
                  <SelectItem value="carte bancaire">Carte bancaire</SelectItem>
                  <SelectItem value="orange money">Orange Money</SelectItem>
                  <SelectItem value="wave">Wave</SelectItem>
                  <SelectItem value="virement">Virement</SelectItem>
                  <SelectItem value="chèque">Chèque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre de paiements:</span>
                <span>{selectedParticipants.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant total:</span>
                <span className="text-green-900">{totalAmount.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Caissier:</span>
                <span>{nomCaissier}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleConfirmPaiementGroupe} className="bg-green-600 hover:bg-green-700">
              Confirmer le paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de génération des documents */}
      <GroupDocumentsGenerator
        participants={finalisedParticipants}
        open={showDocumentsDialog}
        onOpenChange={setShowDocumentsDialog}
      />
    </div>
  );
}

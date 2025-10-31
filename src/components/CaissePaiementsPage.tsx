import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from './ui/card';
import { Clock, User, Building, DollarSign } from 'lucide-react';
import { useFanafApi } from '../hooks/useFanafApi';
import { type Participant, type ModePaiement } from './data/types';
import { getOrganisationById } from './data/helpers';

import { toast } from 'sonner';
import { CaisseSearchBar } from './paiements/caisse/CaisseSearchBar';
import { CaissePagination } from './paiements/caisse/CaissePagination';
import { FinalizePaiementDialog } from './paiements/caisse/FinalizePaiementDialog';
import { CaissePendingTable } from './paiements/caisse/CaissePendingTable';

export function CaissePaiementsPage() {
  const { api } = useFanafApi();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isPaiementDialogOpen, setIsPaiementDialogOpen] = useState(false);
  const [selectedModePaiement, setSelectedModePaiement] = useState<ModePaiement>('espèce');
  const [caissierName, setCaissierName] = useState<string>('');
  // Charger les participants finalisés depuis localStorage
  const [finalisedParticipants, setFinalisedParticipants] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const stored = localStorage.getItem('finalisedParticipantsIds');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const itemsPerPage = 10;

  // Charger depuis l'API (registrations) avec React Query
  const { data: apiParticipants = [], isLoading: apiLoading } = useQuery({
    queryKey: ['caisseRegistrations'],
    queryFn: async () => {
      try {
        const regsRes = await api.getRegistrations({ per_page: 200, page: 1 });
        const regsAny: any = regsRes as any;
        const regsArray = Array.isArray(regsAny?.data)
          ? regsAny.data
          : Array.isArray(regsAny)
            ? regsAny
            : [];
        return regsArray;
      } catch (_) {
        return [];
      }
    },
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 5 * 60 * 1000, // 5 minutes en cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const participantsSource = apiParticipants;

  // Query pour filtrer uniquement les inscriptions en attente (non finalisées) et qui ne sont pas exonérées
  const paiementsEnAttenteQuery = useQuery({
    queryKey: ['caissePaiements', 'paiementsEnAttente', participantsSource, finalisedParticipants],
    queryFn: () => {
      const getStatus = (p: any) => (p.statutInscription || p.registration_status || '').toLowerCase();
      const getCategory = (p: any) => (p.statut || p.category || '').toLowerCase();
      const getId = (p: any) => p.id || p._id || p.registration_id || p.reference;

      return (participantsSource || []).filter((p: any) => 
        (getStatus(p) === 'non-finalisée' || getStatus(p) === 'pending' || getStatus(p) === 'en_attente' || !getStatus(p)) &&
        getCategory(p) !== 'vip' &&
        getCategory(p) !== 'speaker' &&
        !finalisedParticipants.has(getId(p))
      ).map((p: any) => {
        // Uniformiser quelques champs utilisés à l'affichage
        return {
          ...p,
          id: getId(p),
          statut: getCategory(p) || p.statut,
          statutInscription: getStatus(p) || p.statutInscription,
        };
      });
    },
    enabled: true,
    staleTime: 0,
  });

  const paiementsEnAttente = paiementsEnAttenteQuery.data ?? [];

  // Query pour filtrer par recherche
  const filteredPaiementsQuery = useQuery({
    queryKey: ['caissePaiements', 'filteredPaiements', paiementsEnAttente, searchTerm],
    queryFn: () => {
      if (!searchTerm) return paiementsEnAttente;
      
      const searchLower = searchTerm.toLowerCase().trim();
      return paiementsEnAttente.filter((p: any) => {
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
    },
    enabled: true,
    staleTime: 0,
  });

  const filteredPaiements = filteredPaiementsQuery.data ?? [];

  // Pagination
  const totalPages = Math.ceil(filteredPaiements.length / itemsPerPage);

  // Query pour paginer
  const paginatedPaiementsQuery = useQuery({
    queryKey: ['caissePaiements', 'paginatedPaiements', filteredPaiements, currentPage, itemsPerPage],
    queryFn: () => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredPaiements.slice(startIndex, endIndex);
    },
    enabled: true,
    staleTime: 0,
  });

  const paginatedPaiements = paginatedPaiementsQuery.data ?? [];

  // Query pour réinitialiser la page quand la recherche change
  useQuery({
    queryKey: ['caissePaiements', 'resetPage', searchTerm],
    queryFn: () => {
      queryClient.setQueryData(['caissePaiements', 'currentPage'], 1);
      setCurrentPage(1);
      return true;
    },
    enabled: true,
    staleTime: 0,
  });

  // Query pour écouter les changements de localStorage (synchronisation entre onglets)
  useQuery({
    queryKey: ['caissePaiements', 'localStorage', finalisedParticipants, caissierName],
    queryFn: () => {
      if (typeof window === 'undefined') return false;
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'finalisedParticipantsIds' && e.newValue) {
          const newFinalisedIds = new Set<string>(JSON.parse(e.newValue));
          setFinalisedParticipants(newFinalisedIds);
        }
        if (e.key === 'caissierName' && e.newValue !== null) {
          setCaissierName(e.newValue);
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return true;
    },
    enabled: true,
    staleTime: 0,
  });

  // Query pour écouter l'événement personnalisé de finalisation de paiement
  useQuery({
    queryKey: ['caissePaiements', 'paymentFinalized', queryClient],
    queryFn: () => {
      if (typeof window === 'undefined') return false;
      const handlePaymentFinalized = () => {
        // Recharger les participants finalisés depuis localStorage
        const stored = localStorage.getItem('finalisedParticipantsIds');
        if (stored) {
          setFinalisedParticipants(new Set(JSON.parse(stored)));
        }
        // Invalider la query React Query pour forcer le rechargement
        queryClient.invalidateQueries({ queryKey: ['caisseRegistrations'] });
      };

      window.addEventListener('paymentFinalized', handlePaymentFinalized);
      return true;
    },
    enabled: true,
    staleTime: 0,
  });

  // Query pour charger le nom du caissier depuis localStorage
  useQuery({
    queryKey: ['caissePaiements', 'caissierName'],
    queryFn: () => {
      if (typeof window === 'undefined') return '';
      const storedName = localStorage.getItem('caissierName');
      if (storedName) {
        setCaissierName(storedName);
        return storedName;
      }
      return '';
    },
    enabled: true,
    staleTime: 0,
  });

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
      caissier: caissierName || 'Caissier',
    };
    localStorage.setItem('finalisedPayments', JSON.stringify(finalisedPayments));

    // Invalider la query React Query pour forcer le rechargement
    queryClient.invalidateQueries({ queryKey: ['caisseRegistrations'] });

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

  // Query pour les statistiques du caissier
  const statsQuery = useQuery({
    queryKey: ['caissePaiements', 'stats', paiementsEnAttente],
    queryFn: () => {
      const total = paiementsEnAttente.length;
      const membresEnAttente = paiementsEnAttente.filter((p: any) => p.statut === 'membre').length;
      const nonMembresEnAttente = paiementsEnAttente.filter((p: any) => p.statut === 'non-membre').length;
      const montantAttenduMembres = membresEnAttente * 350000;
      const montantAttenduNonMembres = nonMembresEnAttente * 400000;
      const montantTotal = montantAttenduMembres + montantAttenduNonMembres;

      return {
        total,
        membresEnAttente,
        nonMembresEnAttente,
        montantTotal,
      };
    },
    enabled: true,
    staleTime: 0,
  });

  const stats = statsQuery.data ?? { total: 0, membresEnAttente: 0, nonMembresEnAttente: 0, montantTotal: 0 };

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
      <CaisseSearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        resultsCount={filteredPaiements.length}
      />

      {/* Tableau des paiements en attente */}
      <CaissePendingTable
        items={paginatedPaiements as any}
        onFinalize={handleFinaliserPaiement}
        getMontant={getMontant}
      />

      {/* Pagination */}
      <CaissePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={filteredPaiements.length}
        setCurrentPage={setCurrentPage}
      />

      {/* Dialog de finalisation de paiement */}
      <FinalizePaiementDialog
        open={isPaiementDialogOpen}
        onOpenChange={setIsPaiementDialogOpen}
        participant={selectedParticipant as any}
        getMontant={getMontant as any}
        modesDisponibles={modesPaiementDisponibles}
        selectedMode={selectedModePaiement}
        setSelectedMode={setSelectedModePaiement}
        onConfirm={handleValiderPaiement}
      />
    </div>
  );
}

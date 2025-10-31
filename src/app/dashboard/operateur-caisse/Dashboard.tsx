'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Card } from '../../../components/ui/card';
import { WidgetCard } from '../../../components/ui/WidgetCard';
import { 
  CreditCard, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Banknote,
  Wallet,
  Building2,
  Smartphone,
  Users,
  FileText
} from 'lucide-react';
import { AnimatedStat } from '../../../components/AnimatedStat';
import { useFanafApi } from '../../../hooks/useFanafApi';
import { StatsPaiements } from '../../../components/paiements/liste/StatsPaiements';

export default function OperateurCaisseDashboard() {
  const { api } = useFanafApi();

  // Charger les données avec React Query
  const { data: registrationsData, isLoading: registrationsLoading } = useQuery({
    queryKey: ['caisseRegistrations'],
    queryFn: async () => {
      try {
        const regsRes = await api.getRegistrations({ per_page: 200, page: 1 });
        const regsAny: any = regsRes as any;
        // Nouvelle structure API: { status: 200, message: "...", data: [...] }
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
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: paymentsData = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['caissePayments'],
    queryFn: async () => {
      try {
        const payRes = await api.getPayments({ per_page: 200, page: 1 });
        const payAny: any = payRes as any;
        const payArray = Array.isArray(payAny?.data?.data)
          ? payAny.data.data
          : Array.isArray(payAny?.data)
            ? payAny.data
            : Array.isArray(payAny)
              ? payAny
              : [];
        return payArray;
      } catch (_) {
        return [];
      }
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const participants = registrationsData || [];
  const payments = paymentsData;
  const loading = registrationsLoading || paymentsLoading;

  // Query pour calculer les statistiques (API-first, fallback au minimum)
  const statsQuery = useQuery({
    queryKey: ['operateurCaisseDashboard', 'stats', participants, payments],
    queryFn: () => {
      if (!Array.isArray(participants)) {
        return { finalises: 0, enAttente: 0, payants: 0, exoneres: 0 };
      }
      // Essayer de dériver depuis les registrations si champs présents
      const hasInscriptionStatus = participants.some((p) => p.statutInscription || p.registration_status);
      const hasCategory = participants.some((p) => p.category || p.statut);

      const getCategory = (p: any) => (p.category || p.statut || '').toLowerCase();
      const getInscrStatus = (p: any) => (p.statutInscription || p.registration_status || '').toLowerCase();

      const finalises = hasInscriptionStatus
        ? participants.filter((p) => getInscrStatus(p) === 'finalisée' || getInscrStatus(p) === 'finalise' || getInscrStatus(p) === 'completed').length
        : payments.length; // à défaut, approx par nb paiements

      const enAttente = hasInscriptionStatus
        ? participants.filter((p) => getInscrStatus(p) !== 'finalisée' && getCategory(p) !== 'vip' && getCategory(p) !== 'speaker').length
        : Math.max(0, (participants.length || 0) - finalises);

      const payants = hasCategory
        ? participants.filter((p) => ['membre', 'member', 'non-membre', 'not_member'].includes(getCategory(p))).length
        : participants.length;

      const exoneres = hasCategory
        ? participants.filter((p) => ['vip', 'speaker'].includes(getCategory(p))).length
        : 0;

      return { finalises, enAttente, payants, exoneres };
    },
    enabled: true,
    staleTime: 0,
  });

  const stats = statsQuery.data ?? { finalises: 0, enAttente: 0, payants: 0, exoneres: 0 };

  // Query pour calculer le montant encaissé via API paiements
  const montantStatsQuery = useQuery({
    queryKey: ['operateurCaisseDashboard', 'montantStats', payments],
    queryFn: () => {
      if (!Array.isArray(payments) || payments.length === 0) {
        return {
          montantTotal: 0,
          paiementsIndividuels: 0,
          paiementsGroupes: 0,
          modesPaiement: { especes: 0, virement: 0, cheque: 0, mobileMoney: 0 },
        };
      }
      let total = 0;
      let indiv = 0;
      let group = 0;
      const modes = { especes: 0, virement: 0, cheque: 0, mobileMoney: 0 } as Record<string, number>;

      payments.forEach((p: any) => {
        const amount = Number(p.amount || 0);
        total += amount;
        // Heuristique: presence de multiple registration_ids => groupé
        const isGroup = Array.isArray(p.registration_ids) && p.registration_ids.length > 1;
        if (isGroup) group++; else indiv++;
        const method = String(p.payment_method || '').toLowerCase();
        const provider = String(p.payment_provider || '').toLowerCase();
        if (method.includes('cash') || method.includes('esp')) modes.especes++;
        else if (method.includes('wire') || method.includes('vir')) modes.virement++;
        else if (method.includes('cheq') || method.includes('chèque')) modes.cheque++;
        else if (method.includes('mobile') || provider.includes('orange') || provider.includes('wave')) modes.mobileMoney++;
      });

      return { montantTotal: total, paiementsIndividuels: indiv, paiementsGroupes: group, modesPaiement: modes };
    },
    enabled: true,
    staleTime: 0,
  });

  const { montantTotal, paiementsIndividuels, paiementsGroupes, modesPaiement } = montantStatsQuery.data ?? {
    montantTotal: 0,
    paiementsIndividuels: 0,
    paiementsGroupes: 0,
    modesPaiement: { especes: 0, virement: 0, cheque: 0, mobileMoney: 0 },
  };

  // Query pour calculer le montant restant (approx) – si tarifs non dispo via API, approcher avec nb en attente * 350k
  const montantEnAttenteQuery = useQuery({
    queryKey: ['operateurCaisseDashboard', 'montantEnAttente', stats.enAttente],
    queryFn: () => {
      // Si l'API paiements expose un total attendu, l'utiliser (non dispo ici)
      return stats.enAttente * 350000;
    },
    enabled: true,
    staleTime: 0,
  });

  const montantEnAttente = montantEnAttenteQuery.data ?? 0;

  return (
    <div className="p-8 bg-gradient-to-br from-orange-50 to-white min-h-screen">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl text-gray-900 mb-2">Tableau de bord des paiements</h1>
        <p className="text-gray-600">Vue d'ensemble des encaissements FANAF 2026</p>
      </div>

      {/* Statistiques principales (widget standard paiements) */}
      <div className="mb-8">
        <StatsPaiements />
      </div>

      {/* Autres widgets complémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <WidgetCard variant="green">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-70" />
            </div>
            <AnimatedStat value={stats.finalises} className="text-3xl mb-1" />
            <p className="text-green-100 text-sm">Paiements finalisés</p>
          </WidgetCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <WidgetCard variant="orange">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-70" />
            </div>
            <AnimatedStat value={stats.enAttente} className="text-3xl mb-1" />
            <p className="text-orange-100 text-sm">Paiements en attente</p>
          </WidgetCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <WidgetCard variant="blue">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <CreditCard className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-70" />
            </div>
            <div className="text-3xl mb-1">
              {(montantTotal / 1000000).toFixed(1)}M
            </div>
            <p className="text-blue-100 text-sm">FCFA encaissés</p>
          </WidgetCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <WidgetCard variant="purple">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Wallet className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-70" />
            </div>
            <div className="text-3xl mb-1">
              {(montantEnAttente / 1000000).toFixed(1)}M
            </div>
            <p className="text-purple-100 text-sm">FCFA en attente</p>
          </WidgetCard>
        </motion.div>
      </div>

      {/* Détails par mode de paiement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Répartition par mode de paiement
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Banknote className="w-5 h-5 text-green-600" />
                  <span className="text-gray-900">Espèces</span>
                </div>
                <span className="text-green-600 font-semibold">{modesPaiement.especes}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900">Virement</span>
                </div>
                <span className="text-blue-600 font-semibold">{modesPaiement.virement}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-900">Chèque</span>
                </div>
                <span className="text-purple-600 font-semibold">{modesPaiement.cheque}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-orange-600" />
                  <span className="text-gray-900">Mobile Money</span>
                </div>
                <span className="text-orange-600 font-semibold">{modesPaiement.mobileMoney}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              Types de paiement
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900">Paiements individuels</span>
                </div>
                <span className="text-blue-600 font-semibold">{paiementsIndividuels}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-900">Paiements groupés</span>
                </div>
                <span className="text-purple-600 font-semibold">{paiementsGroupes}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600" />
                  <span className="text-gray-900">Exonérés (VIP/Speakers)</span>
                </div>
                <span className="text-cyan-600 font-semibold">{stats.exoneres}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900">Total participants payants</span>
                </div>
                <span className="text-gray-900 font-semibold">{stats.payants}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Résumé financier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <h3 className="text-gray-900 mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-orange-600" />
            Résumé financier
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Montant encaissé</p>
              <p className="text-2xl text-green-600">
                {montantTotal.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Montant en attente</p>
              <p className="text-2xl text-orange-600">
                {montantEnAttente.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Total prévisionnel</p>
              <p className="text-2xl text-blue-600">
                {(montantTotal + montantEnAttente).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

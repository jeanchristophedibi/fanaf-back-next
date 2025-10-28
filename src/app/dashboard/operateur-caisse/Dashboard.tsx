'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../components/ui/card';
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
import { useDynamicInscriptions } from '../../../components/hooks/useDynamicInscriptions';
import { type Participant } from '../../../components/data/mockData';

export default function OperateurCaisseDashboard() {
  const { participants } = useDynamicInscriptions();

  // Fonctions utilitaires pour récupérer les informations de paiement
  const getPaymentInfo = (participant: Participant) => {
    if (typeof window === 'undefined') return null;
    const paymentKey = `payment_${participant.id}`;
    const stored = localStorage.getItem(paymentKey);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  };

  const getGroupPaymentInfo = (participant: Participant) => {
    if (typeof window === 'undefined') return null;
    const groupKey = `group_payment_${participant.organisationId}`;
    const stored = localStorage.getItem(groupKey);
    if (stored) {
      const groupData = JSON.parse(stored);
      if (groupData.participants?.includes(participant.id)) {
        return groupData;
      }
    }
    return null;
  };

  // Calcul des statistiques
  const stats = {
    // Paiements finalisés (individuels et groupés)
    finalises: participants.filter(p => p.statutInscription === 'finalisée').length,
    
    // Paiements en attente
    enAttente: participants.filter(p => p.statutInscription !== 'finalisée' && p.statut !== 'vip' && p.statut !== 'speaker').length,
    
    // Participants payants (non VIP/speakers)
    payants: participants.filter(p => p.statut === 'membre' || p.statut === 'non-membre').length,
    
    // VIP et speakers (exonérés)
    exoneres: participants.filter(p => p.statut === 'vip' || p.statut === 'speaker').length,
  };

  // Calcul du montant total encaissé
  const PRIX = {
    membre: 350000,
    nonMembre: 400000,
  };

  let montantTotal = 0;
  let paiementsIndividuels = 0;
  let paiementsGroupes = 0;
  
  const modesPaiement = {
    especes: 0,
    virement: 0,
    cheque: 0,
    mobileMoney: 0,
  };

  participants.forEach(participant => {
    if (participant.statutInscription === 'finalisée' && (participant.statut === 'membre' || participant.statut === 'non-membre')) {
      const prix = participant.statut === 'membre' ? PRIX.membre : PRIX.nonMembre;
      montantTotal += prix;

      // Vérifier si paiement individuel ou groupé
      const individualPayment = getPaymentInfo(participant);
      const groupPayment = getGroupPaymentInfo(participant);

      if (groupPayment) {
        paiementsGroupes++;
        const mode = groupPayment.modePaiement?.toLowerCase() || 'virement';
        if (mode.includes('espèce')) modesPaiement.especes++;
        else if (mode.includes('virement')) modesPaiement.virement++;
        else if (mode.includes('chèque')) modesPaiement.cheque++;
        else if (mode.includes('mobile') || mode.includes('money')) modesPaiement.mobileMoney++;
      } else if (individualPayment) {
        paiementsIndividuels++;
        const mode = individualPayment.modePaiement?.toLowerCase() || 'virement';
        if (mode.includes('espèce')) modesPaiement.especes++;
        else if (mode.includes('virement')) modesPaiement.virement++;
        else if (mode.includes('chèque')) modesPaiement.cheque++;
        else if (mode.includes('mobile') || mode.includes('money')) modesPaiement.mobileMoney++;
      }
    }
  });

  // Calcul du montant restant (en attente)
  let montantEnAttente = 0;
  participants.forEach(participant => {
    if (participant.statutInscription !== 'finalisée' && (participant.statut === 'membre' || participant.statut === 'non-membre')) {
      const prix = participant.statut === 'membre' ? PRIX.membre : PRIX.nonMembre;
      montantEnAttente += prix;
    }
  });

  return (
    <div className="p-8 bg-gradient-to-br from-orange-50 to-white min-h-screen">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl text-gray-900 mb-2">Tableau de bord des paiements</h1>
        <p className="text-gray-600">Vue d'ensemble des encaissements FANAF 2026</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-70" />
            </div>
            <AnimatedStat value={stats.finalises} className="text-3xl mb-1" />
            <p className="text-green-100 text-sm">Paiements finalisés</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-70" />
            </div>
            <AnimatedStat value={stats.enAttente} className="text-3xl mb-1" />
            <p className="text-orange-100 text-sm">Paiements en attente</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-shadow">
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
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-shadow">
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
          </Card>
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

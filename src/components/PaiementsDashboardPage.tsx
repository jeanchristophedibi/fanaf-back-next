import React, { useMemo } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Users, 
  CheckCircle2,
  Clock,
  Wallet,
  Smartphone,
  Banknote,
  Building2
} from 'lucide-react';
import { useDynamicInscriptions } from './hooks/useDynamicInscriptions';
import { type Participant, type ModePaiement } from './data/mockData';
import { motion } from 'motion/react';

// Tarifs
const TARIF_MEMBRE = 350000;
const TARIF_NON_MEMBRE = 400000;

export function PaiementsDashboardPage() {
  const { participants } = useDynamicInscriptions();

  // Statistiques globales
  const stats = useMemo(() => {
    const paiementsEnAttente = participants.filter(p => 
      p.statutInscription === 'non-finalisée' && 
      (p.statut === 'membre' || p.statut === 'non-membre')
    );

    const paiementsFinalises = participants.filter(p => 
      p.statutInscription === 'finalisée' && 
      (p.statut === 'membre' || p.statut === 'non-membre')
    );

    const exoneres = participants.filter(p => 
      p.statut === 'vip' || p.statut === 'speaker'
    );

    // Calcul des montants
    const montantEncaisse = paiementsFinalises.reduce((total, p) => {
      const tarif = p.statut === 'membre' ? TARIF_MEMBRE : TARIF_NON_MEMBRE;
      return total + tarif;
    }, 0);

    const montantEnAttente = paiementsEnAttente.reduce((total, p) => {
      const tarif = p.statut === 'membre' ? TARIF_MEMBRE : TARIF_NON_MEMBRE;
      return total + tarif;
    }, 0);

    const montantTotal = montantEncaisse + montantEnAttente;

    // Statistiques par mode de paiement
    const parModePaiement: { [key in ModePaiement]?: number } = {};
    paiementsFinalises.forEach(p => {
      if (p.modePaiement) {
        parModePaiement[p.modePaiement] = (parModePaiement[p.modePaiement] || 0) + 1;
      }
    });

    // Statistiques par canal
    const canalExterne = paiementsFinalises.filter(p => p.canalEncaissement === 'externe').length;
    const canalAsapay = paiementsFinalises.filter(p => p.canalEncaissement === 'asapay').length;

    return {
      totalPaiements: paiementsFinalises.length,
      paiementsEnAttente: paiementsEnAttente.length,
      exoneres: exoneres.length,
      montantEncaisse,
      montantEnAttente,
      montantTotal,
      parModePaiement,
      canalExterne,
      canalAsapay,
      tauxRecouvrement: montantTotal > 0 ? (montantEncaisse / montantTotal) * 100 : 0,
    };
  }, [participants]);

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant);
  };

  const modePaiementIcons: { [key in ModePaiement]: any } = {
    'espèce': Banknote,
    'carte bancaire': CreditCard,
    'orange money': Smartphone,
    'wave': Smartphone,
    'virement': Building2,
    'chèque': Wallet,
  };

  const modePaiementColors: { [key in ModePaiement]: string } = {
    'espèce': 'bg-green-50 border-green-200 text-green-700',
    'carte bancaire': 'bg-blue-50 border-blue-200 text-blue-700',
    'orange money': 'bg-orange-50 border-orange-200 text-orange-700',
    'wave': 'bg-pink-50 border-pink-200 text-pink-700',
    'virement': 'bg-purple-50 border-purple-200 text-purple-700',
    'chèque': 'bg-yellow-50 border-yellow-200 text-yellow-700',
  };

  return (
    <div className="p-8 space-y-6 animate-page-enter">
      {/* En-tête */}
      <div>
        <h2 className="text-3xl text-gray-900 mb-2">Tableau de bord des paiements</h2>
        <p className="text-sm text-gray-500">
          Suivi en temps réel des encaissements FANAF 2026
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-green-700">Montant encaissé</p>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl text-green-900 mb-1">{formatMontant(stats.montantEncaisse)}</p>
            <p className="text-xs text-green-600">{stats.totalPaiements} paiement(s)</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-orange-700">En attente</p>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl text-orange-900 mb-1">{formatMontant(stats.montantEnAttente)}</p>
            <p className="text-xs text-orange-600">{stats.paiementsEnAttente} paiement(s)</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-blue-700">Montant total</p>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl text-blue-900 mb-1">{formatMontant(stats.montantTotal)}</p>
            <p className="text-xs text-blue-600">Total attendu</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-purple-700">Taux de recouvrement</p>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl text-purple-900 mb-1">{stats.tauxRecouvrement.toFixed(1)}%</p>
            <p className="text-xs text-purple-600">Encaissé / Total</p>
          </Card>
        </motion.div>
      </div>

      {/* Répartition par canal d'encaissement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Répartition par canal d'encaissement</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-blue-700">Canal EXTERNE</p>
                  <p className="text-xs text-blue-600">Espèce, Virement, Chèque (Encaissement FANAF)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl text-blue-900">{stats.canalExterne}</p>
                <p className="text-xs text-blue-600">paiements</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-orange-700" />
                </div>
                <div>
                  <p className="text-sm text-orange-700">Canal ASAPAY</p>
                  <p className="text-xs text-orange-600">Carte, Orange Money, Wave</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl text-orange-900">{stats.canalAsapay}</p>
                <p className="text-xs text-orange-600">paiements</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Répartition par mode de paiement */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Répartition par mode de paiement</h3>
          <div className="space-y-3">
            {Object.entries(stats.parModePaiement).map(([mode, count]) => {
              const Icon = modePaiementIcons[mode as ModePaiement];
              const colorClass = modePaiementColors[mode as ModePaiement];
              const countValue = count as number;
              
              return (
                <div 
                  key={mode} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${colorClass}`}
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-5 h-5" />}
                    <span className="text-sm capitalize">{mode}</span>
                  </div>
                  <Badge className={colorClass}>
                    {countValue} paiement{countValue > 1 ? 's' : ''}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Autres statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-purple-700">Participants exonérés</p>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl text-purple-900">{stats.exoneres}</p>
          <p className="text-xs text-purple-600 mt-1">VIP et Speakers</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-green-700">Tarif membre</p>
            <CreditCard className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl text-green-900">{formatMontant(TARIF_MEMBRE)}</p>
          <p className="text-xs text-green-600 mt-1">Par inscription</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-amber-700">Tarif non-membre</p>
            <CreditCard className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl text-amber-900">{formatMontant(TARIF_NON_MEMBRE)}</p>
          <p className="text-xs text-amber-600 mt-1">Par inscription</p>
        </Card>
      </div>
    </div>
  );
}

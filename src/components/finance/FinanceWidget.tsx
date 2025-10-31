"use client";

import { useMemo } from "react";
import { Coins, TrendingUp, Users, Wallet, Building2, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { useDynamicInscriptions } from "../hooks/useDynamicInscriptions";
import { motion } from "motion/react";
import type { CanalEncaissement } from '../data/types';

interface FinanceWidgetProps {
  canal?: CanalEncaissement;
  showDetails?: boolean;
}

export function FinanceWidget({ canal, showDetails = false }: FinanceWidgetProps) {
  const { participants } = useDynamicInscriptions();

  // Prix des inscriptions
  const PRIX = {
    membre: 350000,
    nonMembre: 400000,
  };

  // Objectif de revenus
  const OBJECTIF_REVENUS = 50000000; // 50 millions FCFA

  // Calculer les statistiques financières
  const stats = useMemo(() => {
    const statsData = {
      totalMembres: 0,
      totalNonMembres: 0,
      totalVIP: 0,
      totalSpeakers: 0,
      revenuMembres: 0,
      revenuNonMembres: 0,
      revenuTotal: 0,
      aEncaisserMembres: 0,
      aEncaisserNonMembres: 0,
      aEncaisserTotal: 0,
      enAttenteMembres: 0,
      enAttenteNonMembres: 0,
    };

    participants.forEach((participant) => {
      // Filtrer par canal si spécifié
      if (canal && participant.canalEncaissement !== canal) {
        return;
      }

      // Comptabiliser selon le statut
      if (participant.statut === 'vip') {
        statsData.totalVIP++;
      } else if (participant.statut === 'speaker') {
        statsData.totalSpeakers++;
      } else if (participant.statut === 'membre') {
        if (participant.statutInscription === 'finalisée') {
          statsData.totalMembres++;
          statsData.revenuMembres += PRIX.membre;
        } else {
          statsData.enAttenteMembres++;
          statsData.aEncaisserMembres += PRIX.membre;
        }
      } else if (participant.statut === 'non-membre') {
        if (participant.statutInscription === 'finalisée') {
          statsData.totalNonMembres++;
          statsData.revenuNonMembres += PRIX.nonMembre;
        } else {
          statsData.enAttenteNonMembres++;
          statsData.aEncaisserNonMembres += PRIX.nonMembre;
        }
      }
    });

    statsData.revenuTotal = statsData.revenuMembres + statsData.revenuNonMembres;
    statsData.aEncaisserTotal = statsData.aEncaisserMembres + statsData.aEncaisserNonMembres;

    return statsData;
  }, [participants, canal]);

  // Formater les montants en FCFA
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' FCFA';
  };

  // Calculer les métriques
  const totalInscrits = stats.totalMembres + stats.totalNonMembres;
  const totalEnAttente = stats.enAttenteMembres + stats.enAttenteNonMembres;
  const totalGlobal = totalInscrits + totalEnAttente;
  const tauxConversion = totalGlobal > 0 ? (totalInscrits / totalGlobal) * 100 : 0;
  const progressionObjectif = (stats.revenuTotal / OBJECTIF_REVENUS) * 100;

  const canalName = canal === 'externe' 
    ? 'Externe' 
    : canal === 'asapay' 
    ? 'ASAPAY' 
    : 'FANAF';

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-gray-900">Encaissement {canalName}</CardTitle>
          {canal === 'externe' && (
            <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
              <Building2 className="w-3 h-3 mr-1" />
              Externe
            </Badge>
          )}
          {canal === 'asapay' && (
            <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
              <CreditCard className="w-3 h-3 mr-1" />
              ASAPAY
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Revenu total */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-green-700 mb-1">Revenu Total</p>
              <p className="text-2xl font-semibold text-green-900">
                {formatCurrency(stats.revenuTotal)}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Coins className="w-6 h-6 text-white" />
            </div>
          </div>
          {!canal && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-green-700">Objectif: {formatCurrency(OBJECTIF_REVENUS)}</span>
                <span className="text-green-700 font-medium">{progressionObjectif.toFixed(1)}%</span>
              </div>
              <Progress value={progressionObjectif} className="h-2 bg-green-200 [&>div]:bg-green-600" />
            </div>
          )}
        </motion.div>

        {/* Inscriptions payées */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-blue-700 mb-1">Inscriptions Payées</p>
              <p className="text-2xl font-semibold text-blue-900">
                {totalInscrits}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="bg-blue-100 rounded-lg p-2">
              <p className="text-xs text-blue-600">Membres</p>
              <p className="text-sm font-medium text-blue-900">{stats.totalMembres}</p>
            </div>
            <div className="bg-indigo-100 rounded-lg p-2">
              <p className="text-xs text-indigo-600">Non-membres</p>
              <p className="text-sm font-medium text-indigo-900">{stats.totalNonMembres}</p>
            </div>
          </div>
        </motion.div>

        {/* À encaisser - uniquement si général */}
        {!canal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-orange-700 mb-1">À Encaisser</p>
                <p className="text-2xl font-semibold text-orange-900">
                  {formatCurrency(stats.aEncaisserTotal)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-orange-700">{totalEnAttente} en attente</span>
                <span className="text-orange-700 font-medium">
                  {totalGlobal > 0 ? ((totalEnAttente / totalGlobal) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <Progress 
                value={totalGlobal > 0 ? (totalEnAttente / totalGlobal) * 100 : 0} 
                className="h-2 bg-orange-200 [&>div]:bg-orange-600" 
              />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="border-orange-300 text-orange-700 text-xs">
                {stats.enAttenteMembres}M + {stats.enAttenteNonMembres}NM
              </Badge>
            </div>
          </motion.div>
        )}

        {/* Détails supplémentaires si demandé */}
        {showDetails && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">VIP</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalVIP}</p>
              <Badge className="bg-purple-100 text-purple-700 text-xs mt-1">Exonéré</Badge>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Speakers</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalSpeakers}</p>
              <Badge className="bg-yellow-100 text-yellow-700 text-xs mt-1">Exonéré</Badge>
            </div>
          </div>
        )}

        {/* Taux de conversion */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
            <TrendingUp className="w-3 h-3 text-green-700" />
            <span className="text-xs font-medium text-green-800">
              {tauxConversion.toFixed(1)}% de conversion
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

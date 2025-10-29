"use client";

import React from 'react';
import { useState, useMemo } from 'react';
import { Coins, TrendingUp, Users, Download, Building2, Eye, Receipt, Wallet, CreditCard, Banknote, Smartphone, Target, TrendingDown, Activity, ArrowUpRight, ArrowDownRight, Percent, FileText } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Progress } from './ui/progress';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useDynamicInscriptions } from './hooks/useDynamicInscriptions';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import type { CanalEncaissement } from './data/mockData';

export function FinancePage() {
  const { participants: mockParticipants } = useDynamicInscriptions();
  const [showEnAttenteDialog, setShowEnAttenteDialog] = useState(false);
  const [selectedCanal, setSelectedCanal] = useState<'general' | CanalEncaissement>('general');

  // Prix des inscriptions
  const PRIX = {
    membre: 350000,
    nonMembre: 400000,
  };

  // Objectif de revenus (exemple)
  const OBJECTIF_REVENUS = 50000000; // 50 millions FCFA

  // Calculer les statistiques financières par canal
  const calculateStatsByCanal = (canal?: CanalEncaissement) => {
    const stats = {
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
      paiementsParMode: {
        'espèce': 0,
        'carte bancaire': 0,
        'orange money': 0,
        'wave': 0,
        'virement': 0,
        'chèque': 0,
      },
    };

    mockParticipants.forEach((participant) => {
      // Filtrer par canal si spécifié
      if (canal && participant.canalEncaissement !== canal) {
        return;
      }

      // Comptabiliser selon le statut
      if (participant.statut === 'vip') {
        stats.totalVIP++;
      } else if (participant.statut === 'speaker') {
        stats.totalSpeakers++;
      } else if (participant.statut === 'membre') {
        if (participant.statutInscription === 'finalisée') {
          stats.totalMembres++;
          stats.revenuMembres += PRIX.membre;
          if (participant.modePaiement) {
            stats.paiementsParMode[participant.modePaiement] += PRIX.membre;
          }
        } else {
          stats.enAttenteMembres++;
          stats.aEncaisserMembres += PRIX.membre;
        }
      } else if (participant.statut === 'non-membre') {
        if (participant.statutInscription === 'finalisée') {
          stats.totalNonMembres++;
          stats.revenuNonMembres += PRIX.nonMembre;
          if (participant.modePaiement) {
            stats.paiementsParMode[participant.modePaiement] += PRIX.nonMembre;
          }
        } else {
          stats.enAttenteNonMembres++;
          stats.aEncaisserNonMembres += PRIX.nonMembre;
        }
      }
    });

    stats.revenuTotal = stats.revenuMembres + stats.revenuNonMembres;
    stats.aEncaisserTotal = stats.aEncaisserMembres + stats.aEncaisserNonMembres;

    return stats;
  };

  // Statistiques par canal
  const statsGeneral = useMemo(() => calculateStatsByCanal(), [mockParticipants]);
  const statsExterne = useMemo(() => calculateStatsByCanal('externe'), [mockParticipants]);
  const statsAsapay = useMemo(() => calculateStatsByCanal('asapay'), [mockParticipants]);

  // Formater les montants en FCFA
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' FCFA';
  };

  const handleExport = (canalType: string) => {
    const stats = canalType === 'externe' ? statsExterne : 
                   canalType === 'asapay' ? statsAsapay : 
                   statsGeneral;
    
    const reportContent = `
RAPPORT FINANCIER - FANAF 2026
${canalType === 'externe' ? '(Canal Externe - Chèque, Espèce, Virement)' : 
  canalType === 'asapay' ? '(Encaissement ASAPAY - ASACI Technologies)' : 
  '(Encaissement FANAF Global)'}
================================
Date: ${new Date().toLocaleDateString('fr-FR')}

REVENUS TOTAUX
--------------
Revenu total encaissé: ${formatCurrency(stats.revenuTotal)}

DÉTAILS PAR CATÉGORIE
---------------------
Membres: ${stats.totalMembres} × ${formatCurrency(PRIX.membre)} = ${formatCurrency(stats.revenuMembres)}
Non-Membres: ${stats.totalNonMembres} × ${formatCurrency(PRIX.nonMembre)} = ${formatCurrency(stats.revenuNonMembres)}
VIP (Exonérés): ${stats.totalVIP}
Speakers (Exonérés): ${stats.totalSpeakers}

MONTANTS EN ATTENTE
-------------------
Membres en attente: ${stats.enAttenteMembres} × ${formatCurrency(PRIX.membre)} = ${formatCurrency(stats.aEncaisserMembres)}
Non-Membres en attente: ${stats.enAttenteNonMembres} × ${formatCurrency(PRIX.nonMembre)} = ${formatCurrency(stats.aEncaisserNonMembres)}
Total à encaisser: ${formatCurrency(stats.aEncaisserTotal)}

RÉPARTITION PAR MODE DE PAIEMENT
---------------------------------
Espèce: ${formatCurrency(stats.paiementsParMode['espèce'])}
Chèque (Encaissement FANAF): ${formatCurrency(stats.paiementsParMode['chèque'])}
Carte bancaire: ${formatCurrency(stats.paiementsParMode['carte bancaire'])}
Orange Money: ${formatCurrency(stats.paiementsParMode['orange money'])}
Wave: ${formatCurrency(stats.paiementsParMode['wave'])}
Virement: ${formatCurrency(stats.paiementsParMode['virement'])}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-${canalType}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success(`Rapport exporté avec succès`, {
      description: 'Le fichier a été téléchargé dans vos téléchargements'
    });
  };

  // Calculer des métriques avancées
  const calculateAdvancedMetrics = (stats: ReturnType<typeof calculateStatsByCanal>) => {
    const totalInscrits = stats.totalMembres + stats.totalNonMembres;
    const totalEnAttente = stats.enAttenteMembres + stats.enAttenteNonMembres;
    const totalGlobal = totalInscrits + totalEnAttente;
    
    const tauxConversion = totalGlobal > 0 ? (totalInscrits / totalGlobal) * 100 : 0;
    const progressionObjectif = (stats.revenuTotal / OBJECTIF_REVENUS) * 100;
    
    return {
      tauxConversion,
      progressionObjectif,
      totalInscrits,
      totalEnAttente,
      totalGlobal
    };
  };

  // Composant pour afficher les statistiques d'une trésorerie
  const TresorerieSection = ({ 
    stats, 
    canalName, 
    canalType 
  }: { 
    stats: ReturnType<typeof calculateStatsByCanal>, 
    canalName: string,
    canalType: 'general' | 'externe' | 'asapay'
  }) => {
    const metrics = calculateAdvancedMetrics(stats);
    
    const barChartData = [
      {
        name: 'Membres',
        inscriptions: stats.totalMembres,
        revenus: stats.revenuMembres,
      },
      {
        name: 'Non-Membres',
        inscriptions: stats.totalNonMembres,
        revenus: stats.revenuNonMembres,
      },
      {
        name: 'VIP',
        inscriptions: stats.totalVIP,
        revenus: 0,
      },
    ];

    const pieChartData = [
      { name: 'Membres', value: stats.revenuMembres, count: stats.totalMembres },
      { name: 'Non-Membres', value: stats.revenuNonMembres, count: stats.totalNonMembres },
    ];

    // Données pour le graphique de comparaison des modes de paiement
    const modesPaiementData = Object.entries(stats.paiementsParMode)
      .filter(([mode, montant]) => {
        if (canalType === 'externe') {
          return mode === 'chèque' || mode === 'espèce' || mode === 'virement';
        }
        if (canalType === 'asapay') {
          return mode !== 'chèque' && mode !== 'espèce' && mode !== 'virement';
        }
        return montant > 0;
      })
      .map(([mode, montant]) => ({
        mode: mode.charAt(0).toUpperCase() + mode.slice(1),
        montant,
        pourcentage: stats.revenuTotal > 0 ? (montant / stats.revenuTotal) * 100 : 0,
      }));

    const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#fef3c7'];

    return (
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl text-gray-900">{canalName}</h3>
              {canalType === 'externe' && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                  <Building2 className="w-3 h-3 mr-1" />
                  Chèque, Espèce & Virement
                </Badge>
              )}
              {canalType === 'asapay' && (
                <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                  <CreditCard className="w-3 h-3 mr-1" />
                  Paiements électroniques
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {canalType === 'externe' && 'Encaissements par chèque, espèce et virement - Canal externe'}
              {canalType === 'asapay' && 'Encaissements par carte, Orange Money et Wave via ASACI Technologies'}
              {canalType === 'general' && 'Compilation de tous les encaissements (Externe + ASAPAY)'}
            </p>
          </div>
          <Button
            onClick={() => handleExport(canalType)}
            className="bg-orange-600 hover:bg-orange-700 shadow-lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>

        {/* Cartes de statistiques principales avec design premium */}
        <div className={`grid grid-cols-1 gap-4 ${canalType === 'general' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 overflow-hidden relative hover:shadow-xl transition-shadow duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -mr-16 -mt-16 opacity-30"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-green-700">Revenu Total Encaissé</p>
                    <p className="text-3xl text-green-900 mt-2">
                      {formatCurrency(stats.revenuTotal)}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Coins className="w-7 h-7 text-white" />
                  </div>
                </div>
                {canalType === 'general' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-green-700">Objectif: {formatCurrency(OBJECTIF_REVENUS)}</span>
                      <span className="text-green-700">{metrics.progressionObjectif.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.progressionObjectif} className="h-2 bg-green-200 [&>div]:bg-green-600" />
                  </div>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-200 rounded-full">
                    <TrendingUp className="w-3 h-3 text-green-700" />
                    <span className="text-xs text-green-800">{metrics.tauxConversion.toFixed(1)}%</span>
                  </div>
                  <span className="text-xs text-green-600">Taux de conversion</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 overflow-hidden relative hover:shadow-xl transition-shadow duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-30"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-blue-700">Inscriptions Payées</p>
                    <p className="text-3xl text-blue-900 mt-2">
                      {metrics.totalInscrits}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <p className="text-xs text-blue-600">Membres</p>
                    <p className="text-blue-900">{stats.totalMembres}</p>
                  </div>
                  <div className="bg-indigo-100 rounded-lg p-2">
                    <p className="text-xs text-indigo-600">Non-membres</p>
                    <p className="text-indigo-900">{stats.totalNonMembres}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Carte "À Encaisser" - Uniquement pour la trésorerie générale */}
          {canalType === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 overflow-hidden relative hover:shadow-xl transition-shadow duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full -mr-16 -mt-16 opacity-30"></div>
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-orange-700">À Encaisser</p>
                      <p className="text-3xl text-orange-900 mt-2">
                        {formatCurrency(stats.aEncaisserTotal)}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Wallet className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-orange-700">{metrics.totalEnAttente} en attente</span>
                      <span className="text-orange-700">{((metrics.totalEnAttente / metrics.totalGlobal) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={(metrics.totalEnAttente / metrics.totalGlobal) * 100} className="h-2 bg-orange-200 [&>div]:bg-orange-600" />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline" className="border-orange-300 text-orange-700 text-xs">
                      {stats.enAttenteMembres}M + {stats.enAttenteNonMembres}NM
                    </Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Comparaison FANAF vs ASAPAY - Uniquement pour général */}
        {canalType === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-blue-900">Canal EXTERNE</h4>
                    <p className="text-xs text-blue-600">Espèce & Virement</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Revenus</span>
                    <span className="text-blue-900">{formatCurrency(statsExterne.revenuTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Inscriptions</span>
                    <span className="text-blue-900">{statsExterne.totalMembres + statsExterne.totalNonMembres}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Part du total</span>
                    <Badge className="bg-blue-200 text-blue-800">
                      {((statsExterne.revenuTotal / statsGeneral.revenuTotal) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-fuchsia-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-purple-900">Canal ASAPAY</h4>
                    <p className="text-xs text-purple-600">Paiements électroniques</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">Revenus</span>
                    <span className="text-purple-900">{formatCurrency(statsAsapay.revenuTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">Inscriptions</span>
                    <span className="text-purple-900">{statsAsapay.totalMembres + statsAsapay.totalNonMembres}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">Part du total</span>
                    <Badge className="bg-purple-200 text-purple-800">
                      {((statsAsapay.revenuTotal / statsGeneral.revenuTotal) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Détails par catégorie */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 border-orange-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Membres</p>
                <p className="text-2xl text-gray-900 mt-1">
                  {formatCurrency(stats.revenuMembres)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {canalType === 'general' 
                  ? `${stats.totalMembres} payés`
                  : `${stats.totalMembres} inscrits`
                }
              </span>
              {canalType === 'general' && stats.enAttenteMembres > 0 && (
                <Badge variant="outline" className="text-xs border-orange-200 text-orange-600">
                  +{stats.enAttenteMembres} att.
                </Badge>
              )}
            </div>
            {stats.revenuTotal > 0 && (
              <div className="mt-3">
                <Progress 
                  value={(stats.revenuMembres / stats.revenuTotal) * 100} 
                  className="h-1 bg-orange-100 [&>div]:bg-orange-500" 
                />
                <p className="text-xs text-orange-600 mt-1">
                  {((stats.revenuMembres / stats.revenuTotal) * 100).toFixed(1)}% du total
                </p>
              </div>
            )}
          </Card>

          <Card className="p-6 border-blue-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Non-Membres</p>
                <p className="text-2xl text-gray-900 mt-1">
                  {formatCurrency(stats.revenuNonMembres)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {canalType === 'general' 
                  ? `${stats.totalNonMembres} payés`
                  : `${stats.totalNonMembres} inscrits`
                }
              </span>
              {canalType === 'general' && stats.enAttenteNonMembres > 0 && (
                <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
                  +{stats.enAttenteNonMembres} att.
                </Badge>
              )}
            </div>
            {stats.revenuTotal > 0 && (
              <div className="mt-3">
                <Progress 
                  value={(stats.revenuNonMembres / stats.revenuTotal) * 100} 
                  className="h-1 bg-blue-100 [&>div]:bg-blue-500" 
                />
                <p className="text-xs text-blue-600 mt-1">
                  {((stats.revenuNonMembres / stats.revenuTotal) * 100).toFixed(1)}% du total
                </p>
              </div>
            )}
          </Card>

          <Card className="p-6 border-purple-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">VIP</p>
                <p className="text-2xl text-gray-900 mt-1">
                  {stats.totalVIP}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge className="bg-purple-100 text-purple-700 text-xs">
                Exonérés
              </Badge>
            </div>
          </Card>

          <Card className="p-6 border-yellow-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Speakers</p>
                <p className="text-2xl text-gray-900 mt-1">
                  {stats.totalSpeakers}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                Exonérés
              </Badge>
            </div>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Graphique en barres amélioré */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900">Revenus par Catégorie</h4>
                <p className="text-xs text-gray-500">Comparaison inscriptions vs revenus</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <defs>
                  <linearGradient id="colorInscriptions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#fb923c" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === 'revenus') {
                      return formatCurrency(value);
                    }
                    return value;
                  }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend style={{ fontSize: '12px' }} />
                <Bar dataKey="inscriptions" fill="url(#colorInscriptions)" name="Inscriptions" radius={[8, 8, 0, 0]} />
                <Bar dataKey="revenus" fill="url(#colorRevenus)" name="Revenus (FCFA)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Graphique circulaire amélioré */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <Coins className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900">Répartition des Revenus</h4>
                <p className="text-xs text-gray-500">Distribution par statut</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={(entry) => {
                    const percent = ((entry.value / stats.revenuTotal) * 100).toFixed(1);
                    return `${entry.name}: ${percent}%`;
                  }}
                  outerRadius={90}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={3}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(value)} 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Modes de paiement avec visualisation améliorée */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900">Modes de paiement</h4>
                <p className="text-xs text-gray-500">Répartition détaillée des encaissements</p>
              </div>
            </div>
            {canalType === 'externe' && (
              <Badge className="bg-blue-100 text-blue-700">
                Chèque, Espèce & Virement
              </Badge>
            )}
            {canalType === 'asapay' && (
              <Badge className="bg-purple-100 text-purple-700">
                Modes électroniques
              </Badge>
            )}
          </div>
          
          <div className="space-y-4">
            {modesPaiementData.map((item, index) => {
              const modeIcon = {
                'Espèce': <Banknote className="w-5 h-5 text-green-600" />,
                'Virement': <Building2 className="w-5 h-5 text-blue-600" />,
                'Chèque': <FileText className="w-5 h-5 text-indigo-600" />,
                'Carte bancaire': <CreditCard className="w-5 h-5 text-purple-600" />,
                'Orange money': <Smartphone className="w-5 h-5 text-orange-600" />,
                'Wave': <Smartphone className="w-5 h-5 text-blue-500" />,
              }[item.mode];

              const isCheque = item.mode === 'Chèque';

              return (
                <motion.div
                  key={item.mode}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {modeIcon}
                      <div>
                        <span className="text-gray-900">{item.mode}</span>
                        {isCheque && (
                          <Badge className="ml-2 bg-indigo-100 text-indigo-700 text-xs">
                            Encaissement FANAF
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900">{formatCurrency(item.montant)}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {item.pourcentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={item.pourcentage} className="h-2 bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-orange-600" />
                </motion.div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-8 space-y-6 animate-page-enter">
      {/* En-tête général avec statistiques rapides */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-gray-900">Encaissement</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestion complète des encaissements FANAF 2026
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-700 px-4 py-2">
            <Coins className="w-4 h-4 mr-2" />
            {formatCurrency(statsGeneral.revenuTotal)} encaissés
          </Badge>
        </div>
      </div>

      {/* Tabs pour les différents encaissements */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-3xl bg-gray-100 p-1 rounded-xl">
          <TabsTrigger 
            value="general" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-lg transition-all"
          >
            <Coins className="w-4 h-4 mr-2" />
            Encaissement FANAF
          </TabsTrigger>
          <TabsTrigger 
            value="externe"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg transition-all"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Encaissement Externe
          </TabsTrigger>
          <TabsTrigger 
            value="asapay"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Encaissement ASAPAY
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <TresorerieSection 
            stats={statsGeneral} 
            canalName="Encaissement FANAF" 
            canalType="general"
          />
        </TabsContent>

        <TabsContent value="externe" className="space-y-4">
          <TresorerieSection 
            stats={statsExterne} 
            canalName="Encaissement Externe" 
            canalType="externe"
          />
        </TabsContent>

        <TabsContent value="asapay" className="space-y-4">
          <TresorerieSection 
            stats={statsAsapay} 
            canalName="Encaissement ASAPAY" 
            canalType="asapay"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

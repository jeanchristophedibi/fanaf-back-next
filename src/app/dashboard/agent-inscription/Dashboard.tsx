'use client';

import React from 'react';
import { Card } from '../../../components/ui/card';
import { Users, Clock, CheckCircle, TrendingUp, FileText } from 'lucide-react';
import { useDynamicInscriptions } from '../../../components/hooks/useDynamicInscriptions';
import { AnimatedStat } from '../../../components/AnimatedStat';

const AgentInscriptionDashboard = () => {
  const { participants } = useDynamicInscriptions();
  
  // Statistiques
  const inscriptionsEnCours = participants.filter(p => p.statutInscription === 'non-finalisée');
  const inscriptionsFinalisees = participants.filter(p => p.statutInscription === 'finalisée');
  
  const membresEnCours = inscriptionsEnCours.filter(p => p.statut === 'membre').length;
  const nonMembresEnCours = inscriptionsEnCours.filter(p => p.statut === 'non-membre').length;
  const vipEnCours = inscriptionsEnCours.filter(p => p.statut === 'vip').length;

  // Inscriptions groupées
  const inscriptionsGroupees = participants.filter(p => p.groupeId);
  const nombreGroupes = new Set(inscriptionsGroupees.map(p => p.groupeId)).size;

  // Inscriptions récentes (dernières 24h)
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const inscriptionsRecentes = participants.filter(p => 
    new Date(p.dateInscription) > oneDayAgo
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble des inscriptions</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-800">En attente de paiement</p>
              <AnimatedStat value={inscriptionsEnCours.length} className="text-3xl text-amber-900 mt-2" />
            </div>
            <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-800">Inscriptions finalisées</p>
              <AnimatedStat value={inscriptionsFinalisees.length} className="text-3xl text-green-900 mt-2" />
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800">Inscriptions groupées</p>
              <AnimatedStat value={nombreGroupes} className="text-3xl text-blue-900 mt-2" />
              <p className="text-xs text-blue-700 mt-1">{inscriptionsGroupees.length} participants</p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-800">Dernières 24h</p>
              <AnimatedStat value={inscriptionsRecentes} className="text-3xl text-purple-900 mt-2" />
            </div>
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Répartition par type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Membres</h3>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">En attente</span>
              <span className="text-lg text-gray-900">{membresEnCours}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: inscriptionsEnCours.length > 0 
                    ? `${(membresEnCours / inscriptionsEnCours.length) * 100}%` 
                    : '0%' 
                }}
              />
            </div>
            <p className="text-xs text-gray-600">350 000 FCFA / inscription</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Non-membres</h3>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">En attente</span>
              <span className="text-lg text-gray-900">{nonMembresEnCours}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: inscriptionsEnCours.length > 0 
                    ? `${(nonMembresEnCours / inscriptionsEnCours.length) * 100}%` 
                    : '0%' 
                }}
              />
            </div>
            <p className="text-xs text-gray-600">400 000 FCFA / inscription</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">VIP</h3>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">En attente</span>
              <span className="text-lg text-gray-900">{vipEnCours}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: inscriptionsEnCours.length > 0 
                    ? `${(vipEnCours / inscriptionsEnCours.length) * 100}%` 
                    : '0%' 
                }}
              />
            </div>
            <p className="text-xs text-gray-600">Exonéré</p>
          </div>
        </Card>
      </div>

      {/* Informations complémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg text-gray-900 mb-4">Informations importantes</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
              <FileText className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-900">Facture proforma</p>
                <p className="text-xs text-gray-600">
                  Générée automatiquement après chaque inscription
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-900">Statut en attente</p>
                <p className="text-xs text-gray-600">
                  Les inscriptions restent en attente jusqu'au paiement
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-900">Vérification unicité</p>
                <p className="text-xs text-gray-600">
                  Email et numéro d'identité vérifiés à chaque inscription
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg text-gray-900 mb-4">Tarification</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">Membre FANAF</p>
                  <p className="text-xs text-gray-600">Organisations membres</p>
                </div>
              </div>
              <p className="text-lg text-blue-600">350 000 FCFA</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">Non-membre</p>
                  <p className="text-xs text-gray-600">Autres organisations</p>
                </div>
              </div>
              <p className="text-lg text-orange-600">400 000 FCFA</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">VIP / Speaker</p>
                  <p className="text-xs text-gray-600">Invités spéciaux</p>
                </div>
              </div>
              <p className="text-lg text-purple-600">Exonéré</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AgentInscriptionDashboard;

"use client";

import { ListeInscriptions } from '../../../../../components/inscriptions/ListeInscriptions';
import { WidgetStatsInscriptions } from '../../../../../components/inscriptions/WidgetStatsInscriptions';
import { useDynamicInscriptions } from '../../../../../components/hooks/useDynamicInscriptions';

export default function ListeInscriptionsFanafPage() {
  const { participants } = useDynamicInscriptions();
  const stats = {
    total: participants.length,
    membres: participants.filter(p => p.statut === 'membre').length,
    nonMembres: participants.filter(p => p.statut === 'non-membre').length,
    vip: participants.filter(p => p.statut === 'vip').length,
    speakers: participants.filter(p => p.statut === 'speaker').length,
    finalises: participants.filter(p => p.statutInscription === 'finalisée').length,
    enAttente: participants.filter(p => p.statutInscription === 'non-finalisée').length,
  };
  
  return (
    <div className="space-y-6 px-6 mt-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Liste des inscriptions</h2>
        <p className="text-sm text-gray-600">
          Liste des inscriptions pour FANAF 2026 - 50ieme edition
        </p>
      </div>
      <WidgetStatsInscriptions stats={stats} participants={participants} />
      <ListeInscriptions readOnly userProfile="fanaf" />
    </div>
  );
}
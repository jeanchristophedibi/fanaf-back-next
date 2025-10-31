'use client';

import React from 'react';
import { useDynamicInscriptions } from '../../../../components/hooks/useDynamicInscriptions';
import { StatsInscriptions } from '../../../../components/inscriptions/StatsInscriptions';
import { WidgetStatsInscriptions } from '../../../../components/inscriptions/WidgetStatsInscriptions';
import { ListeInscriptions } from '../../../../components/inscriptions/ListeInscriptions';

export default function AdminAsaciInscriptionsPage() {
  const { participants } = useDynamicInscriptions();
  
  const stats = {
    total: participants.length,
    finalises: participants.filter(p => p.statutInscription === 'finalisée').length,
    enAttente: participants.filter(p => p.statutInscription !== 'finalisée').length,
    membres: participants.filter(p => p.statut === 'membre').length,
    nonMembres: participants.filter(p => p.statut === 'non-membre').length,
    vip: participants.filter(p => p.statut === 'vip').length,
    speakers: participants.filter(p => p.statut === 'speaker').length,
  };

  return (
    <div className="animate-page-enter px-6">
      {/* Header */}
      <div className="mb-6 mt-6">
        <h2 className="text-2xl text-gray-900 mb-2">Liste des inscriptions</h2>
        <p className="text-sm text-gray-600">
          Vue d'ensemble complète de toutes les inscriptions pour FANAF 2026
        </p>
      </div>


      {/* Statistiques détaillées */}
      <div className="mb-6">
        <WidgetStatsInscriptions stats={stats} participants={participants} />
      </div>


      {/* Statistiques principales */}
      <div className="mb-6">
        <StatsInscriptions stats={{
          total: stats.total,
          membres: stats.membres,
          nonMembres: stats.nonMembres,
          vip: stats.vip,
          speakers: stats.speakers,
        }} />
      </div>

      {/* Liste complète des inscriptions */}
      <ListeInscriptions />
    </div>
  );
}

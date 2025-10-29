"use client";

import { ListeInscriptions } from '../../../../../components/inscriptions/ListeInscriptions';
import { WidgetVIP } from '../../../../../components/inscriptions/WidgetVIP';

export default function InscriptionsVIPAgencePage() {
  return (
    <div className="space-y-6 px-6 mt-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Inscriptions - VIP</h2>
        <p className="text-sm text-gray-600">
          Gestion des inscriptions VIP pour FANAF 2026
        </p>
      </div>
      <WidgetVIP />
      <ListeInscriptions userProfile="agence" defaultStatuts={['vip']} restrictStatutOptions={['vip']} />
    </div>
  );
}


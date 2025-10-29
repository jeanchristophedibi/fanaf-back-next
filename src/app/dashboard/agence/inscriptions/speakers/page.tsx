"use client";

import { ListeInscriptions } from '../../../../../components/inscriptions/ListeInscriptions';
import { WidgetSpeakers } from '../../../../../components/inscriptions/WidgetSpeakers';

export default function InscriptionsSpeakersAgencePage() {
  return (
    <div className="space-y-6 px-6 mt-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Inscriptions - Speakers</h2>
        <p className="text-sm text-gray-600">
          Gestion des inscriptions des speakers pour FANAF 2026
        </p>
      </div>
      <WidgetSpeakers />
      <ListeInscriptions userProfile="agence" defaultStatuts={['speaker']} restrictStatutOptions={['speaker']} />
    </div>
  );
}


"use client";

import { ListeInscriptions } from '../../../../../components/inscriptions/ListeInscriptions';
import { WidgetSpeakers } from '../../../../../components/inscriptions/WidgetSpeakers';

export default function InscriptionsSpeakersFanafPage() {
  return (
    <div className="space-y-6 px-6 mt-6">
      <WidgetSpeakers />
      <ListeInscriptions 
        readOnly 
        userProfile="fanaf" 
        defaultStatuts={['speaker']} 
        restrictStatutOptions={['speaker']} 
      />
    </div>
  );
}


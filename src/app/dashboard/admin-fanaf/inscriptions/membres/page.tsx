"use client";

import { ListeInscriptions } from '../../../../../components/inscriptions/ListeInscriptions';
import { WidgetMembres } from '../../../../../components/inscriptions/WidgetMembres';

export default function InscriptionsMembresFanafPage() {
  return (
    <div className="space-y-6 px-6 mt-6">
      <WidgetMembres />
      <ListeInscriptions 
        readOnly 
        userProfile="fanaf" 
        defaultStatuts={['membre']} 
        restrictStatutOptions={['membre']} 
      />
    </div>
  );
}
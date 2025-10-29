"use client";

import { ListeInscriptions } from '../../../../../components/inscriptions/ListeInscriptions';
import { WidgetNonMembres } from '../../../../../components/inscriptions/WidgetNonMembres';

export default function InscriptionsNonMembresFanafPage() {
  return (
    <div className="space-y-6 px-6 mt-6">
      <WidgetNonMembres />
      <ListeInscriptions 
        readOnly 
        userProfile="fanaf" 
        defaultStatuts={['non-membre']} 
        restrictStatutOptions={['non-membre']} 
      />
    </div>
  );
}

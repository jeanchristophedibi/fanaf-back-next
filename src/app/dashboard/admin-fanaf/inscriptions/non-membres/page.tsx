"use client";

import { ListeInscriptions } from '../../../../../components/inscriptions/ListeInscriptions';
import { WidgetNonMembres } from '../../../../../components/inscriptions/WidgetNonMembres';

export default function InscriptionsNonMembresFanafPage() {
  return (
    <div className="space-y-6 px-6 mt-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Inscriptions - Non-Membres</h2>
        <p className="text-sm text-gray-600">
          Gestion des inscriptions des non-membres pour FANAF 2026
        </p>
      </div>
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

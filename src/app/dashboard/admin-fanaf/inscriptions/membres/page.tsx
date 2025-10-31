"use client";

import { ListeInscriptions } from '../../../../../components/inscriptions/ListeInscriptions';
import { WidgetMembres } from '../../../../../components/inscriptions/WidgetMembres';

export default function InscriptionsMembresFanafPage() {
  return (
    <div className="space-y-6 px-6 mt-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Inscriptions - Membres</h2>
        <p className="text-sm text-gray-600">
          Gestion des inscriptions des membres pour FANAF 2026
        </p>
      </div>
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
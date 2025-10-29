"use client";

import { ListeInscriptions } from '../../../../../components/inscriptions/ListeInscriptions';

export default function InscriptionsMembresFanafPage() {
  return (
    <div className="space-y-6 px-6 mt-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Inscriptions membres</h2>
        <p className="text-sm text-gray-600">
          Liste des inscriptions membres pour FANAF 2026 - 50ieme edition
        </p>
      </div>
      <ListeInscriptions 
        readOnly 
        userProfile="fanaf" 
        defaultStatuts={['membre']} 
        restrictStatutOptions={['membre']} 
      />
    </div>
  );
}
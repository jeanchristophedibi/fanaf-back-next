"use client";

import { ListeInscriptions } from '../../../../../components/inscriptions/ListeInscriptions';

export default function ListeInscriptionsAgencePage() {
  return (
    <div className="space-y-6 px-6 mt-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Liste des inscriptions</h2>
        <p className="text-sm text-gray-600">
          Liste des inscriptions pour FANAF 2026 - 50ème édition
        </p>
      </div>
      {/* ListeInscriptions calcule maintenant ses propres stats et peut les afficher avec showStats={true} */}
      <ListeInscriptions userProfile="agence" showStats={true} />
    </div>
  );
}


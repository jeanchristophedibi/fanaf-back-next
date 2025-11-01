'use client';

import { WidgetEnAttenteOperateur } from '../../../../../components/paiements/en-attente/WidgetEnAttenteOperateur';
import { ListeEnAttenteOperateur } from '../../../../../components/paiements/en-attente/ListeEnAttenteOperateur';

export default function OperateurCaissePaiementsAttentePage() {
  return (
    <div className="space-y-6 px-6 mt-6">
      <div>
      {/* En-tête */}
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Paiements en attente</h2>
        <p className="text-sm text-gray-600">
          Liste des paiements en attente de finalisation pour FANAF 2026 - 50ieme edition
        </p>
      </div>
    </div>
    <WidgetEnAttenteOperateur />
    <ListeEnAttenteOperateur />  
    </div>
  );
}


"use client";

import { WidgetEnAttente } from '../../../../../components/paiements/en-attente/WidgetEnAttente';
import { ListeEnAttente } from '../../../../../components/paiements/en-attente/ListeEnAttente';

export default function PaiementsEnAttentePage() {
  return (
    <div className="space-y-6 px-6 mt-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Paiements en attente</h2>
        <p className="text-sm text-gray-600">
          Liste des paiements en attente de finalisation pour FANAF 2026
        </p>
      </div>

      {/* Statistiques */}
      <WidgetEnAttente />

      {/* Liste des paiements */}
      <ListeEnAttente />
    </div>
  );
}

"use client";

import { StatsPaiementsOperateur } from '../../../../../components/paiements/liste/StatsPaiementsOperateur';
import { ListePaiementsOperateur } from '../../../../../components/paiements/liste/ListeOperateur';

export default function ListePaiementsPage() {
  return (
    <div className="space-y-6 p-4 mt-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Liste des paiements</h2>
        <p className="text-sm text-gray-600">
          Consultation de tous les paiements effectués pour FANAF 2026
        </p>
      </div>

      {/* Statistiques */}
      <StatsPaiementsOperateur />

      {/* Liste des paiements */}
      <ListePaiementsOperateur />
    </div>
  );
}

"use client";

import { ListePaiements } from '../../../../../components/paiements/liste/Liste';

export default function ListePaiementsFanafPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl text-gray-900 mb-2">Liste des paiements</h2>
        <p className="text-sm text-gray-600">
          Consultation de tous les paiements effectués pour FANAF 2026
        </p>
      </div>
      <ListePaiements />
    </div>
  );
}


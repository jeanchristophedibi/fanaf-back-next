"use client";

import { InscriptionsPage } from '../../../../../components/InscriptionsPage';

export default function InscriptionsNonMembresFanafPage() {
  return (
    <div className="space-y-6 px-6 mt-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Inscriptions non-membres</h2>
        <p className="text-sm text-gray-600">
          Liste des inscriptions non-membres pour FANAF 2026 - 50ieme edition
        </p>
      </div>
      <InscriptionsPage subSection="non-membre" readOnly />
    </div>
  );
}

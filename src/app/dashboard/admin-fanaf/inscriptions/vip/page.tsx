"use client";

import { InscriptionsPage } from '../../../../../components/InscriptionsPage';

export default function InscriptionsVipFanafPage() {
  return (
    <div className="space-y-6 px-6 mt-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Inscriptions VIP</h2>
        <p className="text-sm text-gray-600">
          Liste des inscriptions VIP pour FANAF 2026 - 50ieme edition
        </p>
      </div>
      <InscriptionsPage subSection="vip" readOnly />
    </div>
  );
}


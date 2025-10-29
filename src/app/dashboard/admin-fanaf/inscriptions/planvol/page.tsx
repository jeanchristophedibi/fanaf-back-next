"use client";

import { ListePlanVol } from '../../../../../components/planvols/ListePlanVol';
import { WidgetPlanVol } from '../../../../../components/planvols/WidgetPlanVol';

export default function InscriptionsPlanVolFanafPage() {
  const planVolStats = {
    total: 140,
    arrivees: 60,
    departs: 80,
  };
  return (
    <div className="space-y-6 px-6 mt-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Plan de vol</h2>
        <p className="text-sm text-gray-600">
          Gestion des plans de vol pour FANAF 2026 - 50ieme edition
        </p>
      </div>
      <WidgetPlanVol planVolStats={planVolStats} />
      <ListePlanVol />
    </div>
  );
}


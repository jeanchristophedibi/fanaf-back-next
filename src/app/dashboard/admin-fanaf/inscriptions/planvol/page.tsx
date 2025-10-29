"use client";

import { ListePlanVol } from '../../../../../components/planvols/ListePlanVol';
import { WidgetPlanVol } from '../../../../../components/planvols/WidgetPlanVol';

export default function InscriptionsPlanVolFanafPage() {
  return (
    <div className="space-y-6 px-6 mt-6">
      <WidgetPlanVol />
      <ListePlanVol />
    </div>
  );
}


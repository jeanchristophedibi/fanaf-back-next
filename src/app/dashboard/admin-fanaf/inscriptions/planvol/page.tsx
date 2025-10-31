"use client";

import { ListePlanVol } from '../../../../../components/planvols/ListePlanVol';
import { WidgetPlanVol } from '../../../../../components/planvols/WidgetPlanVol';
import { PageLoader } from '../../../../../components/ui/PageLoader';
import { usePageLoading } from '../../../../../components/hooks/usePageLoading';

export default function InscriptionsPlanVolFanafPage() {
  const { isLoading } = usePageLoading({ includeOrganisations: true });

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <div className="space-y-6 px-6 mt-6">
      <div>
          <h2 className="text-2xl text-gray-900 mb-2">Inscriptions - Plans de vol</h2>
          <p className="text-sm text-gray-600">
            Gestion des plans de vol pour FANAF 2026
          </p>
        </div>
        <WidgetPlanVol />
        <ListePlanVol />
      </div>
    </>
  );
}


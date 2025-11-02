'use client';

import { WidgetEnAttente } from '../../../../../components/paiements/en-attente/WidgetEnAttente';
import { ListeEnAttente } from '../../../../../components/paiements/en-attente/ListeEnAttente';
import { PageLoader } from '../../../../../components/ui/PageLoader';
import { usePageLoading } from '../../../../../components/hooks/usePageLoading';

export default function AdminAsaciPaiementsAttentePage() {
  const { isLoading } = usePageLoading();

  return (
    <>
      <PageLoader isLoading={isLoading} />
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
      <WidgetEnAttente />
      <ListeEnAttente />  
      </div>
    </>
  );
}


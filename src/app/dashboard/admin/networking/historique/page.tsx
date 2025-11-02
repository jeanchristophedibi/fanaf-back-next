"use client";

import { HistoriqueDemandesPage } from '../../../../../components/HistoriqueDemandesPage';
import { PageLoader } from '../../../../../components/ui/PageLoader';
import { usePageLoading } from '../../../../../components/hooks/usePageLoading';

export default function NetworkingHistoriquePage() {
  const { isLoading } = usePageLoading({ includeRendezVous: true });

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <div className="space-y-6 px-6 mt-6">
        <div>
          <h2 className="text-2xl text-gray-900 mb-2">Historique des demandes</h2>
          <p className="text-sm text-gray-600">
            Consultation de l'historique des demandes de networking pour FANAF 2026
          </p>
        </div>
        <HistoriqueDemandesPage />
      </div>
    </>
  );
}


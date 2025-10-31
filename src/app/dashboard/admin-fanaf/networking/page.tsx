"use client";

import { NetworkingPage } from '../../../../components/NetworkingPage';
import { PageLoader } from '../../../../components/ui/PageLoader';
import { usePageLoading } from '../../../../components/hooks/usePageLoading';

export default function NetworkingListePage() {
  const { isLoading } = usePageLoading({ includeRendezVous: true });

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <div className="space-y-6 px-6 mt-6">
        <div>
          <h2 className="text-2xl text-gray-900 mb-2">Networking</h2>
          <p className="text-sm text-gray-600">
            Gestion des rendez-vous et demandes de networking pour FANAF 2026
          </p>
        </div>
        <NetworkingPage filter="all" readOnly />
      </div>
    </>
  );
}


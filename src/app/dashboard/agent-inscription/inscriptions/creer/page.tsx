'use client';

import React from 'react';
import { NouvelleInscriptionPage } from '../../../../../components/NouvelleInscriptionPage';
import { PageLoader } from '../../../../../components/ui/PageLoader';
import { usePageLoading } from '../../../../../components/hooks/usePageLoading';

export default function AgentInscriptionsCreerPage() {
  const { isLoading } = usePageLoading({ includeOrganisations: true });

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl text-gray-900 mb-2">Nouvelle inscription</h2>
          <p className="text-sm text-gray-600">
            Créer une nouvelle inscription pour FANAF 2026
          </p>
        </div>
        <NouvelleInscriptionPage />
      </div>
    </>
  );
}



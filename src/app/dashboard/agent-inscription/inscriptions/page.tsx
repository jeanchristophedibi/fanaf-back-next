'use client';

import React from 'react';
import { AgentInscriptionsTabs } from '../../../../components/inscriptions/agent/AgentInscriptionsTabs';
import { PageLoader } from '../../../../components/ui/PageLoader';
import { usePageLoading } from '../../../../components/hooks/usePageLoading';

export default function AgentInscriptionsListPage() {
  const { isLoading } = usePageLoading({ includeOrganisations: true });

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl text-gray-900 mb-2">Inscriptions</h2>
          <p className="text-sm text-gray-600">
            Consultation et gestion des inscriptions pour FANAF 2026
          </p>
        </div>
        <AgentInscriptionsTabs />
      </div>
    </>
  );
}



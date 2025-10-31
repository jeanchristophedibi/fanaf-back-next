'use client';

import React from 'react';
import AgentInscriptionDashboard from './Dashboard';
import { PageLoader } from '../../../components/ui/PageLoader';
import { usePageLoading } from '../../../components/hooks/usePageLoading';

export default function AgentInscriptionPage() {
  const { isLoading } = usePageLoading();

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <div className="p-6">
        <AgentInscriptionDashboard />
      </div>
    </>
  );
}


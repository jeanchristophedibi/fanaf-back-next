'use client';

import React from 'react';
import { DashboardHome } from '../../../components/dashboard/DashboardHome';
import { PageLoader } from '../../../components/ui/PageLoader';
import { usePageLoading } from '../../../components/hooks/usePageLoading';

export default function AgenceHomePage() {
  const { isLoading } = usePageLoading({ includeOrganisations: true, includeRendezVous: true });

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <DashboardHome userProfile="agence" />
    </>
  );
}

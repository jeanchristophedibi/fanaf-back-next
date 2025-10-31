"use client";

import { ComiteOrganisationPage } from '../../../../components/ComiteOrganisationPage';
import { PageLoader } from '../../../../components/ui/PageLoader';
import { usePageLoading } from '../../../../components/hooks/usePageLoading';

export default function ComiteOrganisationAgencePage() {
  const { isLoading } = usePageLoading();

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <div className="space-y-6 px-6 mt-6">
        <div>
          <h2 className="text-2xl text-gray-900 mb-2">Comité d'Organisation</h2>
          <p className="text-sm text-gray-600">
            Gestion des membres du comité d'organisation pour FANAF 2026
          </p>
        </div>
        <ComiteOrganisationPage />
      </div>
    </>
  );
}


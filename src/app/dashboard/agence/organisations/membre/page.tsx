"use client";

import { OrganisationsPage } from '../../../../../components/organisations/OrganisationsPage';
import { PageLoader } from '../../../../../components/ui/PageLoader';
import { usePageLoading } from '../../../../../components/hooks/usePageLoading';

export default function OrganisationsMembreAgencePage() {
  const { isLoading } = usePageLoading({ includeOrganisations: true });

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <div className="space-y-6 px-6 mt-6">
        <div>
          <h2 className="text-2xl text-gray-900 mb-2">Organisations - Membres</h2>
          <p className="text-sm text-gray-600">
            Gestion des organisations membres pour FANAF 2026
          </p>
        </div>
        <OrganisationsPage filter="membre" />
      </div>
    </>
  );
}


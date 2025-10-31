"use client";

import { SponsorsPage } from '../../../../../components/sponsors/SponsorsPage';
import { PageLoader } from '../../../../../components/ui/PageLoader';
import { usePageLoading } from '../../../../../components/hooks/usePageLoading';

export default function OrganisationsSponsorPage() {
  const { isLoading } = usePageLoading({ includeOrganisations: true });

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <div className="space-y-6 px-6 mt-6">
        <div>
          <h2 className="text-2xl text-gray-900 mb-2">Sponsors</h2>
          <p className="text-sm text-gray-600">
            Gestion des sponsors et partenaires pour FANAF 2026
          </p>
        </div>
        <SponsorsPage readOnly />
      </div>
    </>
  );
}


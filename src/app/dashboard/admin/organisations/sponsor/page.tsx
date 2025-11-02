'use client';

import { OrganisationsPage } from '../../../../../components/organisations/OrganisationsPage';

export default function AdminOrganisationsSponsorPage() {
  return <OrganisationsPage filter="sponsor" readOnly={false} />;
}


'use client';

import { OrganisationsPage } from '../../../../components/organisations/OrganisationsPage';

export default function AdminSponsorsPage() {
  return <OrganisationsPage filter="sponsor" readOnly={false} />;
}


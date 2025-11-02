'use client';

import { OrganisationsPage } from '../../../../components/organisations/OrganisationsPage';

export default function AdminOrganisationsPage() {
  return <OrganisationsPage filter="all" readOnly={false} />;
}


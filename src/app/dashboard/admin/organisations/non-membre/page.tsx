'use client';

import { OrganisationsPage } from '../../../../../components/organisations/OrganisationsPage';

export default function AdminOrganisationsNonMembrePage() {
  return <OrganisationsPage filter="non-membre" readOnly={false} />;
}



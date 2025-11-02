'use client';

import { OrganisationsPage } from '../../../../../components/organisations/OrganisationsPage';

export default function AdminOrganisationsMembrePage() {
  return <OrganisationsPage filter="membre" readOnly={false} />;
}



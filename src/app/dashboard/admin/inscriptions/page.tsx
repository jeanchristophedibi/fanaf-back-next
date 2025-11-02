'use client';

import { ListeInscriptionsPage } from '../../../../components/ListeInscriptionsPage';

export default function AdminInscriptionsPage() {
  return <ListeInscriptionsPage readOnly={false} userProfile="agence" />;
}


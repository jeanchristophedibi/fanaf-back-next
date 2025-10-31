'use client';

import OperateurCaisseMain from './Main';
import { PageLoader } from '../../../components/ui/PageLoader';
import { usePageLoading } from '../../../components/hooks/usePageLoading';

export default function OperateurCaissePage() {
  const { isLoading } = usePageLoading();

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <OperateurCaisseMain />
    </>
  );
}


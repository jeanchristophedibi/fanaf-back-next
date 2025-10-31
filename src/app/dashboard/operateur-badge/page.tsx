'use client';

import OperateurBadgeMain from './Main';
import { PageLoader } from '../../components/ui/PageLoader';
import { usePageLoading } from '../../components/hooks/usePageLoading';

export default function OperateurBadgePage() {
  const { isLoading } = usePageLoading();

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <OperateurBadgeMain />
    </>
  );
}


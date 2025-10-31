'use client';

import { DashboardHome } from '../../../components/dashboard/DashboardHome';
import { PageLoader } from '../../../components/ui/PageLoader';
import { usePageLoading } from '../../../components/hooks/usePageLoading';

export default function AdminAsaciHomePage() {
  const { isLoading } = usePageLoading();

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <DashboardHome />
    </>
  );
}

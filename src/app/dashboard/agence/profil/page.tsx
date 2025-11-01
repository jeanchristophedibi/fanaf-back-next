"use client";

import { ProfilePage } from '../../../../components/profile/ProfilePage';
import { PageLoader } from '../../../../components/ui/PageLoader';
import { usePageLoading } from '../../../../components/hooks/usePageLoading';

export default function ProfilAgencePage() {
  const { isLoading } = usePageLoading();

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <ProfilePage />
    </>
  );
}


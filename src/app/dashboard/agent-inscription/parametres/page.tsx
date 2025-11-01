"use client";

import { SettingsPage } from '../../../../components/settings/SettingsPage';
import { PageLoader } from '../../../../components/ui/PageLoader';
import { usePageLoading } from '../../../../components/hooks/usePageLoading';

export default function ParametresAgentInscriptionPage() {
  const { isLoading } = usePageLoading();

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <SettingsPage />
    </>
  );
}


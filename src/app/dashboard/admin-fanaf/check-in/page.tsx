"use client";

import { CheckInScanner } from '../../../../components/CheckInScanner';
import { PageLoader } from '../../../../components/ui/PageLoader';
import { usePageLoading } from '../../../../components/hooks/usePageLoading';

export default function CheckInPage() {
  const { isLoading } = usePageLoading();

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <div className="space-y-6 px-6 mt-6">
        <div>
          <h2 className="text-2xl text-gray-900 mb-2">Check-in</h2>
          <p className="text-sm text-gray-600">
            Scanner et gestion des enregistrements des participants pour FANAF 2026
          </p>
        </div>
        <CheckInScanner readOnly />
      </div>
    </>
  );
}
"use client";

import { FinancePage } from '../../../../components/finance/FinancePage';
import { PageLoader } from '../../../../components/ui/PageLoader';
import { usePageLoading } from '../../../../components/hooks/usePageLoading';

export default function FinanceFanafPage() {
  const { isLoading } = usePageLoading();

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl text-gray-900 mb-2">Finance</h2>
          <p className="text-sm text-gray-600">
            Vue d'ensemble financière et gestion des paiements pour FANAF 2026
          </p>
        </div>
        <FinancePage />
      </div>
    </>
  );
}


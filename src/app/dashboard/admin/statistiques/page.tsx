'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Skeleton } from '../../../../components/ui/skeleton';

// Import dynamique pour éviter les erreurs de chunk
const DashboardAnalytics = dynamic(
  () => import('../../../../components/DashboardAnalytics').then(mod => ({ default: mod.DashboardAnalytics })),
  {
    loading: () => (
      <div className="p-6 space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
    ssr: false
  }
);

export default function AdminStatistiquesPage() {
  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Statistiques Globales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Vue d'ensemble des statistiques et analyses de la plateforme FANAF 2026
          </p>
        </CardContent>
      </Card>
      <Suspense fallback={
        <div className="p-6 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }>
        <DashboardAnalytics />
      </Suspense>
    </div>
  );
}


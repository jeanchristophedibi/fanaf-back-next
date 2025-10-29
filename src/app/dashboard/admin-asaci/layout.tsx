'use client';

import React from 'react';
import { UnifiedLayout } from '../../../components/dashboard/UnifiedLayout';
import { usePathname, useRouter } from 'next/navigation';

export type NavItem =
  | 'home'
  | 'inscriptions'
  | 'paiements-attente'
  | 'paiements';

export default function AdminAsaciLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Déterminer l'élément actif basé sur l'URL
  const getActiveNav = (): NavItem => {
    if (pathname?.includes('/inscriptions')) return 'inscriptions';
    if (pathname?.includes('/paiements/attente')) return 'paiements-attente';
    if (pathname?.includes('/paiements/liste')) return 'paiements';
    return 'home';
  };

  const activeNav = getActiveNav();

  const handleNavChange = (nav: string) => {
    switch (nav) {
      case 'home':
        router.push('/dashboard/admin-asaci');
        break;
      case 'inscriptions':
        router.push('/dashboard/admin-asaci/inscriptions');
        break;
      case 'paiements-attente':
        router.push('/dashboard/admin-asaci/paiements/attente');
        break;
      case 'paiements':
        router.push('/dashboard/admin-asaci/paiements/liste');
        break;
    }
  };

  return (
    <UnifiedLayout
      activeNav={activeNav}
      onNavChange={handleNavChange}
      userProfile="admin-asaci"
      onSwitchProfile={() => {}}
    >
      {children}
    </UnifiedLayout>
  );
}


'use client';

import React from 'react';
import { UnifiedLayout } from '../../../components/dashboard/UnifiedLayout';
import { usePathname, useRouter } from 'next/navigation';

export type NavItem =
  | 'home'
  | 'check-in'
  | 'inscriptions-liste'
  | 'inscriptions-membre'
  | 'inscriptions-non-membre'
  | 'inscriptions-vip'
  | 'inscriptions-speaker'
  | 'inscriptions-planvol'
  | 'organisations-liste'
  | 'organisations-membre'
  | 'organisations-non-membre'
  | 'organisations-sponsor'
  | 'networking-liste'
  | 'networking-participant'
  | 'networking-sponsor'
  | 'networking-historique'
  | 'finance'
  | 'finance-paiements';

export default function AdminFanafLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Déterminer l'élément actif basé sur l'URL
  const getActiveNav = (): string => {
    if (pathname?.includes('/check-in')) return 'check-in';
    if (pathname?.includes('/inscriptions')) return 'inscriptions-liste';
    if (pathname?.includes('/organisations')) return 'organisations-liste';
    if (pathname?.includes('/networking')) return 'networking-liste';
    if (pathname?.includes('/finance')) return 'finance';
    return 'home';
  };

  const activeNav = getActiveNav();

  const handleNavChange = (nav: string) => {
    switch (nav) {
      case 'home':
        router.push('/dashboard/admin-fanaf');
        break;
      case 'check-in':
        router.push('/dashboard/admin-fanaf/check-in');
        break;
      case 'inscriptions-liste':
        router.push('/dashboard/admin-fanaf/inscriptions');
        break;
      // Add other routes as needed
      default:
        router.push('/dashboard/admin-fanaf');
    }
  };

  return (
    <UnifiedLayout
      activeNav={activeNav}
      onNavChange={handleNavChange}
      userProfile="admin-fanaf"
      onSwitchProfile={() => {}}
    >
      {children}
    </UnifiedLayout>
  );
}


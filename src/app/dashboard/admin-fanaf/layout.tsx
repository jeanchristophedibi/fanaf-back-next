'use client';

import React from 'react';
import { UnifiedLayout } from '../../../components/dashboard/UnifiedLayout';
import { AuthGuard } from '../../../components/auth/AuthGuard';
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
    
    // Inscriptions
    if (pathname?.includes('/inscriptions/planvol')) return 'inscriptions-planvol';
    if (pathname?.includes('/inscriptions/speakers')) return 'inscriptions-speaker';
    if (pathname?.includes('/inscriptions/vip')) return 'inscriptions-vip';
    if (pathname?.includes('/inscriptions/non-membres')) return 'inscriptions-non-membre';
    if (pathname?.includes('/inscriptions/membres')) return 'inscriptions-membre';
    if (pathname?.includes('/inscriptions/liste')) return 'inscriptions-liste';
    if (pathname?.includes('/inscriptions')) return 'inscriptions-liste';
    
    // Organisations
    if (pathname?.includes('/organisations/sponsor')) return 'organisations-sponsor';
    if (pathname?.includes('/organisations/non-membre')) return 'organisations-non-membre';
    if (pathname?.includes('/organisations/membre')) return 'organisations-membre';
    if (pathname?.includes('/organisations')) return 'organisations-liste';
    
    // Networking
    if (pathname?.includes('/networking/historique')) return 'networking-historique';
    if (pathname?.includes('/networking/sponsor')) return 'networking-sponsor';
    if (pathname?.includes('/networking/participant')) return 'networking-participant';
    if (pathname?.includes('/networking')) return 'networking-liste';
    
    // Finance
    if (pathname?.includes('/finance/paiements')) return 'finance-paiements';
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
      // Inscriptions
      case 'inscriptions-liste':
        router.push('/dashboard/admin-fanaf/inscriptions/liste');
        break;
      case 'inscriptions-membre':
        router.push('/dashboard/admin-fanaf/inscriptions/membres');
        break;
      case 'inscriptions-non-membre':
        router.push('/dashboard/admin-fanaf/inscriptions/non-membres');
        break;
      case 'inscriptions-vip':
        router.push('/dashboard/admin-fanaf/inscriptions/vip');
        break;
      case 'inscriptions-speaker':
        router.push('/dashboard/admin-fanaf/inscriptions/speakers');
        break;
      case 'inscriptions-planvol':
        router.push('/dashboard/admin-fanaf/inscriptions/planvol');
        break;
      // Organisations
      case 'organisations-liste':
        router.push('/dashboard/admin-fanaf/organisations');
        break;
      case 'organisations-membre':
        router.push('/dashboard/admin-fanaf/organisations/membre');
        break;
      case 'organisations-non-membre':
        router.push('/dashboard/admin-fanaf/organisations/non-membre');
        break;
      case 'organisations-sponsor':
        router.push('/dashboard/admin-fanaf/organisations/sponsor');
        break;
      // Networking
      case 'networking-liste':
        router.push('/dashboard/admin-fanaf/networking');
        break;
      case 'networking-participant':
        router.push('/dashboard/admin-fanaf/networking/participant');
        break;
      case 'networking-sponsor':
        router.push('/dashboard/admin-fanaf/networking/sponsor');
        break;
      case 'networking-historique':
        router.push('/dashboard/admin-fanaf/networking/historique');
        break;
      // Finance
      case 'finance':
        router.push('/dashboard/admin-fanaf/finance');
        break;
      case 'finance-paiements':
        router.push('/dashboard/admin-fanaf/finance/paiements');
        break;
      default:
        router.push('/dashboard/admin-fanaf');
    }
  };

  return (
    <AuthGuard>
      <UnifiedLayout
        activeNav={activeNav}
        onNavChange={handleNavChange}
        userProfile="admin-fanaf"
        onSwitchProfile={() => {}}
      >
        {children}
      </UnifiedLayout>
    </AuthGuard>
  );
}


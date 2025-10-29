'use client';

import React from 'react';
import { UnifiedLayout } from '../../../components/dashboard/UnifiedLayout';
import { usePathname, useRouter } from 'next/navigation';

export type NavItem =
  | 'home'
  | 'check-in'
  | 'comite-organisation'
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
  | 'networking-historique';

export default function AgenceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Déterminer l'élément actif basé sur l'URL
  const getActiveNav = (): NavItem => {
    if (pathname?.includes('/check-in')) return 'check-in';
    if (pathname?.includes('/comite-organisation')) return 'comite-organisation';
    
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
    
    return 'home';
  };

  const activeNav = getActiveNav();

  const handleNavChange = (nav: string) => {
    switch (nav) {
      case 'home':
        router.push('/dashboard/agence');
        break;
      case 'check-in':
        router.push('/dashboard/agence/check-in');
        break;
      case 'comite-organisation':
        router.push('/dashboard/agence/comite-organisation');
        break;
      // Inscriptions
      case 'inscriptions-liste':
        router.push('/dashboard/agence/inscriptions/liste');
        break;
      case 'inscriptions-membre':
        router.push('/dashboard/agence/inscriptions/membres');
        break;
      case 'inscriptions-non-membre':
        router.push('/dashboard/agence/inscriptions/non-membres');
        break;
      case 'inscriptions-vip':
        router.push('/dashboard/agence/inscriptions/vip');
        break;
      case 'inscriptions-speaker':
        router.push('/dashboard/agence/inscriptions/speakers');
        break;
      case 'inscriptions-planvol':
        router.push('/dashboard/agence/inscriptions/planvol');
        break;
      // Organisations
      case 'organisations-liste':
        router.push('/dashboard/agence/organisations');
        break;
      case 'organisations-membre':
        router.push('/dashboard/agence/organisations/membre');
        break;
      case 'organisations-non-membre':
        router.push('/dashboard/agence/organisations/non-membre');
        break;
      case 'organisations-sponsor':
        router.push('/dashboard/agence/organisations/sponsor');
        break;
      // Networking
      case 'networking-liste':
        router.push('/dashboard/agence/networking');
        break;
      case 'networking-participant':
        router.push('/dashboard/agence/networking/participant');
        break;
      case 'networking-sponsor':
        router.push('/dashboard/agence/networking/sponsor');
        break;
      case 'networking-historique':
        router.push('/dashboard/agence/networking/historique');
        break;
      default:
        router.push('/dashboard/agence');
    }
  };

  return (
    <UnifiedLayout
      activeNav={activeNav}
      onNavChange={handleNavChange}
      userProfile="agence"
      onSwitchProfile={() => {}}
    >
      {children}
    </UnifiedLayout>
  );
}


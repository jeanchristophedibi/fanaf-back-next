'use client';

import React from 'react';
import { UnifiedLayout } from '../../../components/dashboard/UnifiedLayout';
import { usePathname, useRouter } from 'next/navigation';

export type NavItem =
  | 'home'
  | 'compagnies'
  | 'inscriptions'
  | 'paiements-attente'
  | 'paiements';

export default function AdminAsaciLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Déterminer l'élément actif basé sur l'URL
  const getActiveNav = (): NavItem => {
    // Vérifier les chemins les plus spécifiques en premier
    if (pathname?.includes('/compagnies')) {
      return 'compagnies';
    }
    if (pathname?.includes('/inscriptions')) {
      return 'inscriptions';
    }
    if (pathname?.includes('/paiements/attente') || pathname?.includes('/paiements/en-attente')) {
      return 'paiements-attente';
    }
    if (pathname?.includes('/paiements/liste')) {
      return 'paiements';
    }
    // Par défaut, retourner home
    return 'home';
  };

  const activeNav = getActiveNav();

  const handleNavChange = (nav: string) => {
    switch (nav) {
      case 'home':
        router.push('/dashboard/admin-asaci');
        break;
      case 'compagnies':
        router.push('/dashboard/admin-asaci/compagnies');
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


'use client';

import React from 'react';
import { UnifiedLayout } from '../../../components/dashboard/UnifiedLayout';
import { AuthGuard } from '../../../components/auth/AuthGuard';
import { usePathname, useRouter } from 'next/navigation';

export type NavItem = 'home' | 'caisse-inscriptions' | 'inscriptions-creer' | 'paiements-attente' | 'paiements';

export default function AgentInscriptionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveNav = (): NavItem => {
    if (pathname?.includes('/inscriptions/creer')) return 'inscriptions-creer';
    if (pathname?.includes('/inscriptions')) return 'caisse-inscriptions';
    if (pathname?.includes('/paiements/attente') || pathname?.includes('/paiements/en-attente')) return 'paiements-attente';
    if (pathname?.includes('/paiements/liste')) return 'paiements';
    if (pathname?.includes('/paiements')) return 'paiements-attente'; // Fallback si aucune route spécifique
    return 'home';
  };

  const activeNav = getActiveNav();

  const handleNavChange = (nav: string) => {
    switch (nav) {
      case 'home':
        router.push('/dashboard/agent-inscription');
        break;
      case 'caisse-inscriptions':
        router.push('/dashboard/agent-inscription/inscriptions');
        break;
      case 'inscriptions-creer':
        router.push('/dashboard/agent-inscription/inscriptions/creer');
        break;
      case 'paiements-attente':
        router.push('/dashboard/agent-inscription/paiements/en-attente');
        break;
      case 'paiements':
        router.push('/dashboard/agent-inscription/paiements/liste');
        break;
      default:
        router.push('/dashboard/agent-inscription');
    }
  };

  return (
    <AuthGuard>
      <UnifiedLayout
        activeNav={activeNav}
        onNavChange={handleNavChange}
        userProfile="agent-inscription"
        onSwitchProfile={() => {}}
      >
        {children}
      </UnifiedLayout>
    </AuthGuard>
  );
}



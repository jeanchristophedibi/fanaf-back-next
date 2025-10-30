'use client';

import React from 'react';
import { UnifiedLayout } from '../../../components/dashboard/UnifiedLayout';
import { AuthGuard } from '../../../components/auth/AuthGuard';
import { usePathname, useRouter } from 'next/navigation';

export type NavItem = 'home' | 'caisse-inscriptions' | 'inscriptions-creer';

export default function AgentInscriptionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveNav = (): NavItem => {
    if (pathname?.includes('/inscriptions/creer')) return 'inscriptions-creer';
    if (pathname?.includes('/inscriptions')) return 'caisse-inscriptions';
    return 'home';
  };

  const activeNav = getActiveNav();

  const handleNavChange = (nav: string) => {
    switch (nav) {
      case 'home':
        router.push('/dashboard/agent-inscription');
        break;
      case 'caisse-inscriptions':
        router.push('/dashboard/agent-inscription/inscriptions/en-cours');
        break;
      case 'inscriptions-creer':
        router.push('/dashboard/agent-inscription/inscriptions/creer');
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



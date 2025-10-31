'use client';

import React, { useEffect, useState } from 'react';
import { UnifiedLayout } from '../../../components/dashboard/UnifiedLayout';

type NavItem = 'dashboard' | 'paiements-attente' | 'paiements';

export default function OperateurCaisseLayout({ children }: { children: React.ReactNode }) {
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('operateur_caisse_active_nav');
      if (stored) setActiveNav(stored as NavItem);
    } catch (_) {}
  }, []);

  const handleNavChange = (nav: string) => {
    const mapped = (nav as NavItem) || 'dashboard';
    setActiveNav(mapped);
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('operateur_caisse_active_nav', mapped);
      // informer les enfants
      window.dispatchEvent(new Event('storage'));
    } catch (_) {}
  };

  return (
    <UnifiedLayout
      activeNav={activeNav}
      onNavChange={handleNavChange}
      userProfile="operateur-caisse"
    >
      {children}
    </UnifiedLayout>
  );
}



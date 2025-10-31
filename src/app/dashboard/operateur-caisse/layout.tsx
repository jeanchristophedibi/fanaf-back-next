'use client';

import React, { useState } from 'react';
import { UnifiedLayout } from '../../../components/dashboard/UnifiedLayout';

type NavItem = 'dashboard' | 'paiements-attente' | 'paiements';

export default function OperateurCaisseLayout({ children }: { children: React.ReactNode }) {
  // Charger activeNav depuis localStorage une seule fois au montage
  const [activeNav, setActiveNav] = useState<NavItem>(() => {
    if (typeof window === 'undefined') return 'dashboard';
    try {
      const stored = localStorage.getItem('operateur_caisse_active_nav');
      return stored ? (stored as NavItem) : 'dashboard';
    } catch (_) {
      return 'dashboard';
    }
  });

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



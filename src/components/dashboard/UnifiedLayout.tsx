'use client';

import React from 'react';
import { UnifiedSidebar } from './UnifiedSidebar';
import { TopBar } from '../../app/dashboard/admin-asaci/TopBar';

interface UnifiedLayoutProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  userProfile: 'agence' | 'admin-fanaf' | 'admin-asaci' | 'agent-inscription' | 'operateur-caisse' | 'operateur-badge';
  onSwitchProfile?: () => void;
  children: React.ReactNode;
}

export function UnifiedLayout({ activeNav, onNavChange, userProfile, onSwitchProfile, children }: UnifiedLayoutProps) {
  console.log('[UnifiedLayout] Rendering with userProfile:', userProfile, 'activeNav:', activeNav);
  return (
    <div className="flex h-screen bg-gray-50">
      <UnifiedSidebar
        activeNav={activeNav}
        onNavChange={onNavChange}
        userProfile={userProfile}
        onSwitchProfile={onSwitchProfile}
      />
      
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


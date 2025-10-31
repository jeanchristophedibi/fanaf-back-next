'use client';

import React, { useMemo } from 'react';
import { UnifiedSidebar } from './UnifiedSidebar';
import { TopBar } from '../../app/dashboard/admin-asaci/TopBar';

interface UnifiedLayoutProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  userProfile: 'agence' | 'admin-fanaf' | 'admin-asaci' | 'agent-inscription' | 'operateur-caisse' | 'operateur-badge';
  onSwitchProfile?: () => void;
  showSidebar?: boolean;
  children: React.ReactNode;
}

// Mémoriser la sidebar pour éviter les re-rendus inutiles
const MemoizedSidebar = React.memo(UnifiedSidebar);
// Mémoriser le topbar pour éviter les re-rendus inutiles
const MemoizedTopBar = React.memo(TopBar);

export function UnifiedLayout({ activeNav, onNavChange, userProfile, onSwitchProfile, showSidebar = true, children }: UnifiedLayoutProps) {
  console.log('[UnifiedLayout] Rendering with userProfile:', userProfile, 'activeNav:', activeNav);
  
  // Mémoriser le background pour éviter les recalculs
  const layoutBg = useMemo(() => {
    const bgByProfile: Record<UnifiedLayoutProps['userProfile'], string> = {
      'admin-asaci': 'bg-gradient-to-br from-blue-50 to-white',
      'admin-fanaf': 'bg-gradient-to-br from-orange-50 to-white',
      'agence': 'bg-gradient-to-br from-teal-50 to-white',
      'agent-inscription': 'bg-gradient-to-br from-amber-50 to-white',
      'operateur-caisse': 'bg-white',
      'operateur-badge': 'bg-gradient-to-br from-cyan-50 to-white',
    };
    return bgByProfile[userProfile] || 'bg-gray-50';
  }, [userProfile]);

  // Mémoriser les props de la sidebar pour éviter les re-rendus si elles n'ont pas changé
  const sidebarProps = useMemo(() => ({
    activeNav,
    onNavChange,
    userProfile,
    onSwitchProfile,
  }), [activeNav, onNavChange, userProfile, onSwitchProfile]);

  return (
    <div className={`flex h-screen ${layoutBg} overflow-hidden`}>
      {showSidebar && (
        <MemoizedSidebar {...sidebarProps} />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MemoizedTopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}


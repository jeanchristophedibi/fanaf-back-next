'use client';

import React, { useState } from 'react';
import { OperateurBadgeSidebar } from './Sidebar';
import OperateurBadgeDashboard from './Dashboard';
import { DocumentsParticipantsPage } from '../../../components/DocumentsParticipantsPage';

export type OperateurBadgeTab = 'dashboard' | 'documents';

interface OperateurBadgeMainProps {
  onSwitchProfile?: () => void;
}

export default function OperateurBadgeMain({ onSwitchProfile }: OperateurBadgeMainProps = {}) {
  const [activeTab, setActiveTab] = useState<OperateurBadgeTab>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <OperateurBadgeDashboard />;
      
      case 'documents':
        return <DocumentsParticipantsPage />;

      default:
        return <OperateurBadgeDashboard />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Tableau de bord';
      case 'documents':
        return 'Documents et Badges';
      default:
        return 'Tableau de bord';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <OperateurBadgeSidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => setActiveTab(tab as OperateurBadgeTab)}
        onSwitchProfile={onSwitchProfile}
      />
      <main className="flex-1 overflow-auto">
        {/* Barre supérieure */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">{getPageTitle()}</h1>
              <p className="text-sm text-gray-500">FANAF 2026 - Opérateur Badge</p>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

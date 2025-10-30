import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardHome } from '../../../components/dashboard/DashboardHome';
import { ListePaiementsPage } from '../../../components/ListePaiementsPage';

export type NavItem =
  | 'home'
  | 'paiements-attente'
  | 'paiements';

interface OperateurCaisseDashboardProps {
  onSwitchProfile?: () => void;
}

export function OperateurCaisseDashboard({ onSwitchProfile }: OperateurCaisseDashboardProps = {}) {
  const [activeNav, setActiveNav] = useState<NavItem>('home');

  const renderContent = () => {
    switch (activeNav) {
      case 'home':
        return <DashboardHome />;

      case 'paiements':
        return <ListePaiementsPage />;

      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeNav={activeNav}
        onNavChange={(nav) => setActiveNav(nav as NavItem)}
        onSwitchProfile={onSwitchProfile}
      />
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}

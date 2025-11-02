import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardHome } from '../../../components/dashboard/DashboardHome';
import { ListeInscriptionsPage } from '../../../components/ListeInscriptionsPage';
import { ListePaiementsPage } from '../../../components/ListePaiementsPage';
import { AdminAsaciPaiementsEnAttentePage } from './PaiementsEnAttentePage';

export type NavItem =
  | 'home'
  | 'inscriptions'
  | 'paiements-attente'
  | 'paiements';

interface AdminAsaciDashboardProps {
  onSwitchProfile?: () => void;
}

export function AdminAsaciDashboard({ onSwitchProfile }: AdminAsaciDashboardProps = {}) {
  const [activeNav, setActiveNav] = useState<NavItem>('home');

  const renderContent = () => {
    switch (activeNav) {
      case 'home':
        return <DashboardHome />;

      case 'inscriptions':
        return <ListeInscriptionsPage readOnly userProfile="asaci" />;

      case 'paiements-attente':
        return <AdminAsaciPaiementsEnAttentePage />;
      
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
        onNavChange={setActiveNav}
        onSwitchProfile={onSwitchProfile}
      />
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}

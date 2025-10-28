'use client';

import React, { useState } from 'react';
import { OperateurCaisseSidebar } from './Sidebar';
import OperateurCaisseDashboard from './Dashboard';
import { CaissePaiementsPage } from '../../../components/CaissePaiementsPage';
import { TousPaiementsPage } from '../../../components/TousPaiementsPage';
import { PaiementsGroupesPage } from '../../../components/PaiementsGroupesPage';

export type OperateurTab = 'dashboard' | 'paiements' | 'tous-paiements' | 'paiements-groupes';

interface OperateurCaisseMainProps {
  onSwitchProfile?: () => void;
}

export default function OperateurCaisseMain({ onSwitchProfile }: OperateurCaisseMainProps = {}) {
  const [activeTab, setActiveTab] = useState<OperateurTab>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <OperateurCaisseDashboard />;
      
      case 'paiements':
        return <CaissePaiementsPage />;
      
      case 'tous-paiements':
        return <TousPaiementsPage />;
      
      case 'paiements-groupes':
        return <PaiementsGroupesPage />;

      default:
        return <OperateurCaisseDashboard />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Tableau de bord';
      case 'paiements':
        return 'Paiements - En attente';
      case 'tous-paiements':
        return 'Paiements - Tous les paiements';
      case 'paiements-groupes':
        return 'Paiements - Paiement groupé';
      default:
        return 'Tableau de bord';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <OperateurCaisseSidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => setActiveTab(tab as OperateurTab)}
        onSwitchProfile={onSwitchProfile}
      />
      <main className="flex-1 overflow-auto">
        {/* Barre supérieure */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">{getPageTitle()}</h1>
              <p className="text-sm text-gray-500">FANAF 2026 - Opérateur caisse</p>
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

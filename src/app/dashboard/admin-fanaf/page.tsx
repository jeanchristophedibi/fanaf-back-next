'use client';

import React, { useState } from 'react';
import { AdminFanafSidebar } from './Sidebar';
import { DashboardHome } from '../../../components/dashboard/DashboardHome';
import { InscriptionsPage } from '../../../components/InscriptionsPage';
import { ListeInscriptionsPage } from '../../../components/ListeInscriptionsPage';
import { OrganisationsPage } from '../../../components/OrganisationsPage';
import { NetworkingPage } from '../../../components/NetworkingPage';
import { CheckInScanner } from '../../../components/CheckInScanner';
import { FinancePage } from '../../../components/FinancePage';
import { ListePaiementsPage } from '../../../components/ListePaiementsPage';
import { HistoriqueDemandesPage } from '../../../components/HistoriqueDemandesPage';
import type { NavItem } from './types';

interface AdminFanafDashboardProps {
  onSwitchProfile?: () => void;
}

export default function AdminFanafDashboard({ onSwitchProfile }: AdminFanafDashboardProps = {}) {
  const [activeNav, setActiveNav] = useState<NavItem>('home');

  const renderContent = () => {
    switch (activeNav) {
      case 'home':
        return <DashboardHome />;
      
      case 'finance':
        return <FinancePage />;
      
      case 'finance-paiements':
        return <ListePaiementsPage />;
      
      case 'check-in':
        return <CheckInScanner readOnly />;

      case 'inscriptions-liste':
        return <ListeInscriptionsPage readOnly userProfile="fanaf" />;
      
      case 'inscriptions-membre':
        return <InscriptionsPage subSection="membre" readOnly />;
      
      case 'inscriptions-non-membre':
        return <InscriptionsPage subSection="non-membre" readOnly />;
      
      case 'inscriptions-vip':
        return <InscriptionsPage subSection="vip" readOnly />;
      
      case 'inscriptions-speaker':
        return <InscriptionsPage subSection="speaker" readOnly />;
      
      case 'inscriptions-planvol':
        return <InscriptionsPage subSection="planvol" readOnly />;


      case 'organisations-liste':
        return <OrganisationsPage filter="all" readOnly />;
      
      case 'organisations-membre':
        return <OrganisationsPage filter="membre" readOnly />;
      
      case 'organisations-non-membre':
        return <OrganisationsPage filter="non-membre" readOnly />;
      
      case 'organisations-sponsor':
        return <OrganisationsPage filter="sponsor" readOnly />;

      case 'networking-liste':
        return <NetworkingPage filter="all" readOnly />;
      
      case 'networking-participant':
        return <NetworkingPage filter="participant" readOnly />;
      
      case 'networking-sponsor':
        return <NetworkingPage filter="sponsor" readOnly />;
      
      case 'networking-historique':

      return <HistoriqueDemandesPage />;

      default:
        return <DashboardHome />;
    }
  };

  const getPageTitle = () => {
    switch (activeNav) {
      case 'home': return 'Tableau de bord';
      case 'finance': return 'Encaissement';
      case 'finance-paiements': return 'Liste des paiements';
      case 'check-in': return 'Check-in Participants';
      case 'inscriptions-liste': return 'Liste des inscriptions';
      case 'inscriptions-membre': return 'Inscriptions - Membres';
      case 'inscriptions-non-membre': return 'Inscriptions - Non-membres';
      case 'inscriptions-vip': return 'Inscriptions - VIP';
      case 'inscriptions-speaker': return 'Inscriptions - Speakers';
      case 'inscriptions-planvol': return 'Plans de vol';
      case 'organisations-liste': return 'Organisations';
      case 'organisations-membre': return 'Organisations membres';
      case 'organisations-non-membre': return 'Organisations non-membres';
      case 'organisations-sponsor': return 'Sponsors';
      case 'networking-liste': return 'Networking';
      case 'networking-participant': return 'Rendez-vous participants';
      case 'networking-sponsor': return 'Rendez-vous sponsors';
      case 'networking-historique': return 'Historique des demandes';
      default: return 'Tableau de bord';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminFanafSidebar 
        activeNav={activeNav} 
        onNavChange={setActiveNav}
        onSwitchProfile={onSwitchProfile}
      />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-gray-500">FANAF 2026 - Administrateur FANAF</p>
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

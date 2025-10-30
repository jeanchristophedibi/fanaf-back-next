'use client';

import React, { useState } from 'react';
import { DashboardHome } from '../../../components/dashboard/DashboardHome';
import { InscriptionsPage } from '../../../components/InscriptionsPage';
import { ListeInscriptionsPage } from '../../../components/ListeInscriptionsPage';
import { OrganisationsPage } from '../../../components/organisations/OrganisationsPage';
import { NetworkingPage } from '../../../components/NetworkingPage';
import { CheckInScanner } from '../../../components/CheckInScanner';
import { FinancePage } from '../../../components/finance/FinancePage';
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
      case 'networking-historique': return 'Récap des demandes';
      default: return 'Tableau de bord';
    }
  };

  // Note: Ce composant n'est plus utilisé directement.
  // Le dashboard admin-fanaf utilise maintenant UnifiedLayout via layout.tsx
  // Ce fichier est conservé pour compatibilité avec AppRouter si nécessaire
  return (
    <div className="p-6">
      {renderContent()}
    </div>
  );
}

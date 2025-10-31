'use client';

import React from 'react';
import { DashboardHome } from '../../../components/dashboard/DashboardHome';
import { PageLoader } from '../../../components/ui/PageLoader';
import { usePageLoading } from '../../../components/hooks/usePageLoading';
import { InscriptionsPage } from '../../../components/InscriptionsPage';
import { ListeInscriptionsPage } from '../../../components/ListeInscriptionsPage';
import { OrganisationsPage } from '../../../components/organisations/OrganisationsPage';
import { NetworkingPage } from '../../../components/NetworkingPage';
import { FinancePage } from '../../../components/finance/FinancePage';
import { ListePaiementsPage } from '../../../components/ListePaiementsPage';
import { HistoriqueDemandesPage } from '../../../components/HistoriqueDemandesPage';
import { usePathname } from 'next/navigation';
import type { NavItem } from './types';

export default function AdminFanafDashboard() {
  const pathname = usePathname();
  const { isLoading } = usePageLoading({ includeOrganisations: true, includeRendezVous: true });

  // Déterminer le contenu basé sur l'URL
  const getContent = () => {
    if (pathname?.includes('/finance')) {
      if (pathname?.includes('/paiements')) {
        return <ListePaiementsPage />;
      }
      return <FinancePage />;
    }
    
    if (pathname?.includes('/inscriptions')) {
      if (pathname?.includes('/membre')) {
        return <InscriptionsPage subSection="membre" readOnly />;
      }
      if (pathname?.includes('/non-membre')) {
        return <InscriptionsPage subSection="non-membre" readOnly />;
      }
      if (pathname?.includes('/vip')) {
        return <InscriptionsPage subSection="vip" readOnly />;
      }
      if (pathname?.includes('/speaker')) {
        return <InscriptionsPage subSection="speaker" readOnly />;
      }
      if (pathname?.includes('/planvol')) {
        return <InscriptionsPage subSection="planvol" readOnly />;
      }
      return <ListeInscriptionsPage readOnly userProfile="fanaf" />;
    }
    
    if (pathname?.includes('/organisations')) {
      if (pathname?.includes('/membre')) {
        return <OrganisationsPage subSection="membre" readOnly />;
      }
      if (pathname?.includes('/non-membre')) {
        return <OrganisationsPage subSection="non-membre" readOnly />;
      }
      if (pathname?.includes('/sponsor')) {
        return <OrganisationsPage subSection="sponsor" readOnly />;
      }
      return <OrganisationsPage readOnly />;
    }
    
    if (pathname?.includes('/networking')) {
      if (pathname?.includes('/participant')) {
        return <NetworkingPage subSection="participant" readOnly />;
      }
      if (pathname?.includes('/sponsor')) {
        return <NetworkingPage subSection="sponsor" readOnly />;
      }
      if (pathname?.includes('/historique')) {
        return <HistoriqueDemandesPage />;
      }
      return <NetworkingPage readOnly />;
    }
    
    // Par défaut, afficher le dashboard home
    return <DashboardHome userProfile="fanaf" />;
  };

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <div className="p-6">
        {getContent()}
      </div>
    </>
  );
}

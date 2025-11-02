'use client';

import React from 'react';
import { DashboardHome } from '../../../components/dashboard/DashboardHome';
import { CompaniesPage } from '../../../components/organisations/CompaniesPage';
import { InscriptionsPage } from '../../../components/InscriptionsPage';
import { ListeInscriptionsPage } from '../../../components/ListeInscriptionsPage';
import { OrganisationsPage } from '../../../components/organisations/OrganisationsPage';
import { NetworkingPage } from '../../../components/NetworkingPage';
import { FinancePage } from '../../../components/finance/FinancePage';
import { ListePaiementsPage } from '../../../components/ListePaiementsPage';
import { ComiteOrganisationPage } from '../../../components/ComiteOrganisationPage';
import { usePathname } from 'next/navigation';
import type { NavItem } from './layout';

export default function AdminDashboard() {
  const pathname = usePathname();

  // Déterminer le contenu basé sur l'URL
  const getContent = () => {
    // Page d'accueil
    if (!pathname || pathname === '/dashboard/admin' || pathname.endsWith('/admin')) {
      return <DashboardHome userProfile="agence" />;
    }

    // Gestion des utilisateurs / Comité d'organisation
    if (pathname.includes('/users') || pathname.includes('/comite')) {
      return <ComiteOrganisationPage />;
    }

    // Compagnies
    if (pathname.includes('/companies') || pathname.includes('/compagnies')) {
      return <CompaniesPage />;
    }

    // Inscriptions
    if (pathname.includes('/inscriptions')) {
      if (pathname.includes('/liste')) {
        return <ListeInscriptionsPage readOnly={false} userProfile="agence" />;
      }
      if (pathname.includes('/membre')) {
        return <InscriptionsPage subSection="membre" readOnly={false} />;
      }
      if (pathname.includes('/non-membre')) {
        return <InscriptionsPage subSection="non-membre" readOnly={false} />;
      }
      if (pathname.includes('/vip')) {
        return <InscriptionsPage subSection="vip" readOnly={false} />;
      }
      if (pathname.includes('/speaker')) {
        return <InscriptionsPage subSection="speaker" readOnly={false} />;
      }
      if (pathname.includes('/planvol')) {
        return <InscriptionsPage subSection="planvol" readOnly={false} />;
      }
      return <ListeInscriptionsPage readOnly={false} userProfile="agence" />;
    }

    // Paiements
    if (pathname.includes('/paiements')) {
      if (pathname.includes('/liste')) {
        return <ListePaiementsPage />;
      }
      return <ListePaiementsPage />;
    }

    // Trésorerie / Finance
    if (pathname.includes('/tresorerie') || pathname.includes('/finance')) {
      return <FinancePage />;
    }

    // Organisations
    if (pathname.includes('/organisations')) {
      if (pathname.includes('/membre')) {
        return <OrganisationsPage filter="membre" readOnly={false} />;
      }
      if (pathname.includes('/non-membre')) {
        return <OrganisationsPage filter="non-membre" readOnly={false} />;
      }
      if (pathname.includes('/sponsor')) {
        return <OrganisationsPage filter="sponsor" readOnly={false} />;
      }
      return <OrganisationsPage filter="all" readOnly={false} />;
    }

    // Networking
    if (pathname.includes('/networking')) {
      if (pathname.includes('/participant')) {
        return <NetworkingPage filter="participant" readOnly={false} />;
      }
      if (pathname.includes('/sponsor')) {
        return <NetworkingPage filter="sponsor" readOnly={false} />;
      }
      return <NetworkingPage filter="all" readOnly={false} />;
    }

    // Badges / Documents
    if (pathname.includes('/badges') || pathname.includes('/documents')) {
      // TODO: Créer une page de gestion des badges
      return <div className="p-6">Gestion des badges - À venir</div>;
    }

    // Sponsors
    if (pathname.includes('/sponsors')) {
      return <OrganisationsPage filter="sponsor" readOnly={false} />;
    }

    // Statistiques
    if (pathname.includes('/statistiques') || pathname.includes('/analytics')) {
      // TODO: Créer une page de statistiques globales
      return <div className="p-6">Statistiques globales - À venir</div>;
    }

    // Paramètres
    if (pathname.includes('/parametres') || pathname.includes('/settings')) {
      // TODO: Créer une page de paramètres système
      return <div className="p-6">Paramètres système - À venir</div>;
    }

    // Par défaut, retourner la page d'accueil
    return <DashboardHome userProfile="agence" />;
  };

  return getContent();
}


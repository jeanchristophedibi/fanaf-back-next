'use client';

import React from 'react';
import { UnifiedLayout } from '../../../components/dashboard/UnifiedLayout';
import { usePathname, useRouter } from 'next/navigation';

export type NavItem =
  | 'home'
  | 'users'
  | 'companies'
  | 'inscriptions'
  | 'paiements'
  | 'tresorerie'
  | 'badges'
  | 'sponsors'
  | 'networking'
  | 'statistiques'
  | 'parametres';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Déterminer l'élément actif basé sur l'URL
  const getActiveNav = (): NavItem | string => {
    // Organisations doit être détecté avant les autres pour éviter les conflits
    if (pathname?.includes('/organisations')) {
      if (pathname?.includes('/organisations/membre')) return 'organisations-membre';
      if (pathname?.includes('/organisations/non-membre')) return 'organisations-non-membre';
      if (pathname?.includes('/organisations/sponsor')) return 'organisations-sponsor';
      return 'organisations-liste';
    }
    if (pathname?.includes('/users') || pathname?.includes('/comite')) {
      return 'users';
    }
    if (pathname?.includes('/companies') || pathname?.includes('/compagnies')) {
      return 'companies';
    }
    if (pathname?.includes('/inscriptions')) {
      if (pathname?.includes('/inscriptions/membre')) return 'inscriptions-membre';
      if (pathname?.includes('/inscriptions/non-membre')) return 'inscriptions-non-membre';
      if (pathname?.includes('/inscriptions/vip')) return 'inscriptions-vip';
      if (pathname?.includes('/inscriptions/speaker')) return 'inscriptions-speaker';
      if (pathname?.includes('/inscriptions/planvol')) return 'inscriptions-planvol';
      if (pathname?.includes('/inscriptions/liste')) return 'inscriptions-liste';
      return 'inscriptions';
    }
    if (pathname?.includes('/paiements')) {
      return 'paiements';
    }
    if (pathname?.includes('/tresorerie') || pathname?.includes('/finance')) {
      return 'tresorerie';
    }
    if (pathname?.includes('/badges') || pathname?.includes('/documents')) {
      return 'badges';
    }
    if (pathname?.includes('/sponsors')) {
      return 'sponsors';
    }
    if (pathname?.includes('/networking')) {
      if (pathname?.includes('/networking/participant')) return 'networking-participant';
      if (pathname?.includes('/networking/sponsor')) return 'networking-sponsor';
      if (pathname?.includes('/networking/historique')) return 'networking-historique';
      if (pathname === '/dashboard/admin/networking' || pathname === '/dashboard/admin/networking/') {
        return 'networking-liste';
      }
      return 'networking';
    }
    if (pathname?.includes('/statistiques') || pathname?.includes('/analytics')) {
      return 'statistiques';
    }
    if (pathname?.includes('/parametres') || pathname?.includes('/settings')) {
      return 'parametres';
    }
    return 'home';
  };

  const activeNav = getActiveNav();

  const handleNavChange = (nav: string) => {
    switch (nav) {
      case 'home':
        router.push('/dashboard/admin');
        break;
      case 'users':
      case 'comite-organisation':
        router.push('/dashboard/admin/users');
        break;
      case 'companies':
      case 'compagnies':
        router.push('/dashboard/admin/companies');
        break;
      case 'inscriptions':
        router.push('/dashboard/admin/inscriptions');
        break;
      case 'inscriptions-liste':
        router.push('/dashboard/admin/inscriptions/liste');
        break;
      case 'inscriptions-membre':
        router.push('/dashboard/admin/inscriptions/membre');
        break;
      case 'inscriptions-non-membre':
        router.push('/dashboard/admin/inscriptions/non-membre');
        break;
      case 'inscriptions-vip':
        router.push('/dashboard/admin/inscriptions/vip');
        break;
      case 'inscriptions-speaker':
        router.push('/dashboard/admin/inscriptions/speaker');
        break;
      case 'inscriptions-planvol':
        router.push('/dashboard/admin/inscriptions/planvol');
        break;
      case 'organisations-liste':
        router.push('/dashboard/admin/organisations');
        break;
      case 'organisations-membre':
        router.push('/dashboard/admin/organisations/membre');
        break;
      case 'organisations-non-membre':
        router.push('/dashboard/admin/organisations/non-membre');
        break;
      case 'organisations-sponsor':
        router.push('/dashboard/admin/organisations/sponsor');
        break;
      case 'networking-liste':
        router.push('/dashboard/admin/networking');
        break;
      case 'networking-participant':
        router.push('/dashboard/admin/networking/participant');
        break;
      case 'networking-sponsor':
        router.push('/dashboard/admin/networking/sponsor');
        break;
      case 'networking-historique':
        router.push('/dashboard/admin/networking/historique');
        break;
      case 'paiements':
      case 'finance-paiements':
        router.push('/dashboard/admin/paiements');
        break;
      case 'finance':
      case 'tresorerie':
        router.push('/dashboard/admin/tresorerie');
        break;
      case 'badges':
      case 'documents':
        router.push('/dashboard/admin/badges');
        break;
      case 'sponsors':
        router.push('/dashboard/admin/sponsors');
        break;
      case 'statistiques':
      case 'analytics':
        router.push('/dashboard/admin/statistiques');
        break;
      case 'parametres':
      case 'settings':
        router.push('/dashboard/admin/parametres');
        break;
      default:
        router.push('/dashboard/admin');
        break;
    }
  };

  return (
    <UnifiedLayout
      activeNav={activeNav}
      onNavChange={handleNavChange}
      userProfile="admin"
      onSwitchProfile={() => {}}
    >
      {children}
    </UnifiedLayout>
  );
}


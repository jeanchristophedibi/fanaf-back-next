'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { InscriptionsPage } from '../../../components/InscriptionsPage';
import { DashboardHome } from '../../../components/accueil/DashboardHome';
import { OrganisationsPage } from '../../../components/OrganisationsPage';
import { NetworkingPage } from '../../../components/NetworkingPage';
import { ListeInscriptionsPage } from '../../../components/ListeInscriptionsPage';
import { ComiteOrganisationPage } from '../../../components/ComiteOrganisationPage';
import { CheckInScanner } from '../../../components/CheckInScanner';
import { HistoriqueDemandesPage } from '../../../components/HistoriqueDemandesPage';

interface DashboardProps {
  onLogout?: () => void;
  userProfile?: 'agence' | 'fanaf';
}

export type NavItem = 
  | 'home' 
  | 'inscriptions-liste'
  | 'inscriptions-membre'
  | 'inscriptions-non-membre'
  | 'inscriptions-vip'
  | 'inscriptions-speaker'
  | 'inscriptions-planvol'
  | 'organisations-liste'
  | 'organisations-membre'
  | 'organisations-non-membre'
  | 'organisations-sponsor'
  | 'networking-liste'
  | 'networking-participant'
  | 'networking-sponsor'
  | 'networking-historique'
  | 'comite-organisation'
  | 'check-in';

export type InscriptionSubSection = 'membre' | 'non-membre' | 'vip' | 'speaker' | 'planvol';
export type OrganisationSubSection = 'membre' | 'non-membre' | 'sponsor' | 'liste';
export type NetworkingSubSection = 'participant' | 'sponsor' | 'liste' | 'historique';

export default function Dashboard({ onLogout, userProfile = 'agence' }: DashboardProps) {
  const [activeNav, setActiveNav] = useState<NavItem>('home');

  const getInscriptionSubSection = (): InscriptionSubSection | null => {
    if (activeNav === 'inscriptions-membre') return 'membre';
    if (activeNav === 'inscriptions-non-membre') return 'non-membre';
    if (activeNav === 'inscriptions-vip') return 'vip';
    if (activeNav === 'inscriptions-speaker') return 'speaker';
    if (activeNav === 'inscriptions-planvol') return 'planvol';
    return null;
  };

  const getOrganisationSubSection = (): OrganisationSubSection | null => {
    if (activeNav === 'organisations-liste') return 'liste';
    if (activeNav === 'organisations-membre') return 'membre';
    if (activeNav === 'organisations-non-membre') return 'non-membre';
    if (activeNav === 'organisations-sponsor') return 'sponsor';
    return null;
  };

  const getNetworkingSubSection = (): NetworkingSubSection | null => {
    if (activeNav === 'networking-liste') return 'liste';
    if (activeNav === 'networking-participant') return 'participant';
    if (activeNav === 'networking-sponsor') return 'sponsor';
    if (activeNav === 'networking-historique') return 'historique';
    return null;
  };

  const inscriptionSubSection = getInscriptionSubSection();
  const organisationSubSection = getOrganisationSubSection();
  const networkingSubSection = getNetworkingSubSection();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        activeNav={activeNav} 
        onNavChange={setActiveNav}
        onLogout={onLogout}
        onSwitchProfile={onLogout}
      />
      <main className="flex-1 overflow-auto">
        {/* Barre supérieure */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">
                {activeNav === 'home' && 'Tableau de bord'}
                {activeNav.startsWith('inscriptions') && 'Inscriptions'}
                {activeNav.startsWith('reservations') && 'Réservations de Stand'}
                {activeNav.startsWith('organisations') && 'Organisations'}
                {activeNav.startsWith('networking') && 'Networking'}
                {activeNav === 'comite-organisation' && 'Comité d\'organisation'}
                {activeNav === 'check-in' && 'Check-in Participants'}
              </h1>
              <p className="text-sm text-gray-500">FANAF 2026 - Agence de communication</p>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div>
          {activeNav === 'home' && <DashboardHome />}
          {activeNav === 'inscriptions-liste' && <ListeInscriptionsPage userProfile="agence" />}
          {inscriptionSubSection && <InscriptionsPage filter={inscriptionSubSection} />}
          {activeNav === 'organisations-liste' && <OrganisationsPage filter="all" />}
          {organisationSubSection && organisationSubSection !== 'liste' && <OrganisationsPage filter={organisationSubSection} />}
          {activeNav === 'networking-historique' && <HistoriqueDemandesPage />}
          {networkingSubSection && networkingSubSection !== 'historique' && networkingSubSection !== 'liste' && <NetworkingPage filter={networkingSubSection} />}
          {activeNav === 'networking-liste' && <NetworkingPage filter="all" />}
          {activeNav === 'comite-organisation' && <ComiteOrganisationPage />}
          {activeNav === 'check-in' && <CheckInScanner />}
        </div>
      </main>
    </div>
  );
}

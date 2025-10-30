'use client';

import React, { useState } from 'react';
import { AgentInscriptionSidebar } from './Sidebar';
import AgentInscriptionDashboard from './Dashboard';
import { NouvelleInscriptionPage } from '../../../components/NouvelleInscriptionPage';
import { InscriptionsEnCoursPage } from '../../../components/InscriptionsEnCoursPage';

interface AgentInscriptionMainProps {
  onSwitchProfile?: () => void;
}

const AgentInscriptionMain = ({ onSwitchProfile }: AgentInscriptionMainProps = {}) => {
  const [currentPage, setCurrentPage] = useState('accueil');

  const renderPage = () => {
    switch (currentPage) {
      case 'accueil':
        return <AgentInscriptionDashboard />;
      case 'nouvelle':
        return <NouvelleInscriptionPage />;
      default:
        return <AgentInscriptionDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AgentInscriptionSidebar 
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onSwitchProfile={onSwitchProfile}
      />
      <div className="flex-1 overflow-y-auto">
        {renderPage()}
      </div>
    </div>
  );
};

export default AgentInscriptionMain;

'use client';

import React from 'react';
import { AgentInscriptionSidebar } from '../../Sidebar';
import { NouvelleInscriptionPage } from '../../../../../components/NouvelleInscriptionPage';

export default function AgentInscriptionsCreerPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <AgentInscriptionSidebar />
      <div className="flex-1 overflow-y-auto p-6">
        <NouvelleInscriptionPage />
      </div>
    </div>
  );
}



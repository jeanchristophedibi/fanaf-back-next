
'use client';

import React from 'react';
import { AgentInscriptionSidebar } from '../../Sidebar';
import { ListeInscriptions } from '../../../../../components/inscriptions/ListeInscriptions';

export default function AgentInscriptionsEnCoursPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <AgentInscriptionSidebar />
      <div className="flex-1 overflow-y-auto p-6">
        <ListeInscriptions onlyNonFinalisees showStats={false} />
      </div>
    </div>
  );
}



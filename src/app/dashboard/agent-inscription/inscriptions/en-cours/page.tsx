
'use client';

import React from 'react';
import { ListeInscriptions } from '../../../../../components/inscriptions/ListeInscriptions';

export default function AgentInscriptionsEnCoursPage() {
  return (
    <div className="p-6">
      <ListeInscriptions onlyNonFinalisees showStats={false} />
    </div>
  );
}



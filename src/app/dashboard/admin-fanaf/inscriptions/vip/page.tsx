"use client";

import { ListeInscriptions } from '../../../../../components/inscriptions/ListeInscriptions';
import { WidgetVIP } from '../../../../../components/inscriptions/WidgetVIP';

export default function InscriptionsVipFanafPage() {
  return (
    <div className="space-y-6 px-6 mt-6">
      <WidgetVIP />
      <ListeInscriptions 
        readOnly 
        userProfile="fanaf" 
        defaultStatuts={['vip']} 
        restrictStatutOptions={['vip']} 
      />
    </div>
  );
}


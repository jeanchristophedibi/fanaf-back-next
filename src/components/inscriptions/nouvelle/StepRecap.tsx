'use client';

import React from 'react';
import { Card } from '../../ui/card';

interface StepRecapProps {
  typeParticipant: string | '';
  typeInscription: 'individuel' | 'groupe' | '';
  participantsCount: number;
  montantTotal: number;
}

export const StepRecap: React.FC<StepRecapProps> = ({ typeParticipant, typeInscription, participantsCount, montantTotal }) => {
  return (
    <Card className="p-10 rounded-xl bg-white border space-y-4">
      <h3 className="text-xl font-semibold text-gray-900">Récapitulatif</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
        <div>
          <p><span className="text-gray-500">Type de participant:</span> {typeParticipant || '—'}</p>
          <p><span className="text-gray-500">Type d'inscription:</span> {typeInscription || '—'}</p>
        </div>
        <div>
          <p><span className="text-gray-500">Nombre de participants:</span> {participantsCount}</p>
          <p><span className="text-gray-500">Montant total:</span> {Intl.NumberFormat('fr-FR').format(montantTotal)} FCFA</p>
        </div>
      </div>
    </Card>
  );
};



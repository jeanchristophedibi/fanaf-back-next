'use client';

import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Download } from 'lucide-react';
import { ProformaInvoiceGenerator } from '../../ProformaInvoiceGenerator';

interface ProformaCardProps {
  participants: any[];
  organisation: any;
  numeroFacture: string;
  onDownload: () => void;
}

export const ProformaCard: React.FC<ProformaCardProps> = ({ participants, organisation, numeroFacture, onDownload }) => {
  return (
    <Card className="p-8 border-0 rounded-xl bg-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl text-gray-900 mb-2">Facture Proforma</h3>
          <p className="text-gray-600">
            N° {numeroFacture}
            {participants.length > 1 && <span className="ml-2 text-sm text-blue-600">({participants.length} participants)</span>}
          </p>
        </div>
        <Button onClick={onDownload} className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700">
          <Download className="w-4 h-4 mr-2" />
          Télécharger la facture
        </Button>
      </div>
      <div id="facture-proforma-individuel">
        <ProformaInvoiceGenerator participant={participants[0]} organisation={organisation} numeroFacture={numeroFacture} />
      </div>
    </Card>
  );
};



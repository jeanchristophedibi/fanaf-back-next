import React from 'react';
import { FileText, Download, Printer } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from 'sonner';
import { type Participant, getOrganisationById } from './data/types';
import { getOrganisationById, getParticipantById, getReferentSponsor, getParticipantsByOrganisation } from './data/helpers';


interface InvoiceGeneratorProps {
  participant: Participant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceGenerator({ participant, open, onOpenChange }: InvoiceGeneratorProps) {
  const organisation = getOrganisationById(participant.organisationId);
  
  const PRIX = {
    membre: 350000,
    nonMembre: 400000,
  };

  const montant = participant.statut === 'membre' ? PRIX.membre : PRIX.nonMembre;
  const tva = montant * 0.18; // TVA 18%
  const montantTotal = montant + tva;
  const numeroFacture = `FACT-FANAF-2026-${participant.id.padStart(4, '0')}`;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' FCFA';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
    toast.success('Impression de la facture lancée');
  };

  const handleDownload = () => {
    toast.success(`Facture ${numeroFacture} téléchargée`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600" />
            Facture - FANAF 2026
          </DialogTitle>
          <DialogDescription>
            Facture de participation pour {participant.prenom} {participant.nom}
          </DialogDescription>
        </DialogHeader>

        {/* Contenu de la facture */}
        <div className="bg-white p-8 space-y-6 border rounded-lg print:shadow-none" id="invoice-content">
          {/* En-tête */}
          <div className="flex justify-between items-start border-b pb-6">
            <div>
              <h1 className="text-3xl text-orange-600 mb-2">FANAF 2026</h1>
              <p className="text-gray-600">Fédération des Sociétés d'Assurances</p>
              <p className="text-gray-600">de Droit National Africaines</p>
              <p className="text-gray-600 mt-2">9-11 Février 2026 • Abidjan, Côte d'Ivoire</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl mb-2">FACTURE</h2>
              <p className="text-gray-600">N° {numeroFacture}</p>
              <p className="text-gray-600">Date: {formatDate(participant.dateInscription)}</p>
            </div>
          </div>

          {/* Informations client */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm text-gray-500 mb-2">FACTURER À:</h3>
              <div className="text-gray-900">
                <p className="font-semibold">{organisation?.nom}</p>
                <p className="mt-1">{participant.prenom} {participant.nom}</p>
                <p>{participant.email}</p>
                <p>{participant.telephone}</p>
                <p>{participant.pays}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm text-gray-500 mb-2">RÉFÉRENCE:</h3>
              <div className="text-gray-900">
                <p>Référence participant: <span className="font-mono">{participant.reference}</span></p>
                <p>Statut: <span className="capitalize">{participant.statut}</span></p>
                {participant.fonction && <p>Fonction: {participant.fonction}</p>}
              </div>
            </div>
          </div>

          {/* Détails de la facture */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-sm text-gray-700">Description</th>
                  <th className="text-right p-4 text-sm text-gray-700">Quantité</th>
                  <th className="text-right p-4 text-sm text-gray-700">Prix unitaire</th>
                  <th className="text-right p-4 text-sm text-gray-700">Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-4">
                    <p className="font-medium">Participation FANAF 2026</p>
                    <p className="text-sm text-gray-600">
                      Inscription {participant.statut === 'membre' ? 'Membre' : 'Non-membre'}
                    </p>
                  </td>
                  <td className="p-4 text-right">1</td>
                  <td className="p-4 text-right">{formatCurrency(montant)}</td>
                  <td className="p-4 text-right font-medium">{formatCurrency(montant)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totaux */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Sous-total HT:</span>
                <span>{formatCurrency(montant)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">TVA (18%):</span>
                <span>{formatCurrency(tva)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-300 text-lg">
                <span className="text-gray-900">Total TTC:</span>
                <span className="text-orange-600">{formatCurrency(montantTotal)}</span>
              </div>
            </div>
          </div>

          {/* Mode de paiement */}
          {participant.modePaiement && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm text-gray-700 mb-2">MODE DE PAIEMENT</h3>
              <p className="capitalize">{participant.modePaiement}</p>
              {participant.datePaiement && (
                <p className="text-sm text-gray-600 mt-1">
                  Payé le {formatDate(participant.datePaiement)}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="text-sm text-gray-600 border-t pt-4">
            <p className="mb-2">Merci pour votre participation au FANAF 2026.</p>
            <p>Cette facture est valable comme justificatif de paiement.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
          <Button onClick={handleDownload} className="bg-orange-600 hover:bg-orange-700">
            <Download className="w-4 h-4 mr-2" />
            Télécharger PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

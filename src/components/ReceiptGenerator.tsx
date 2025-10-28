import { FileText, Download, Printer } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import React from 'react';
import { toast } from 'sonner';

interface Participant {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  organisation: string;
  statut: string;
  statutInscription: string;
  modePaiement?: string;
  dateInscription: string;
}

interface ReceiptGeneratorProps {
  participant: Participant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiptGenerator({ participant, open, onOpenChange }: ReceiptGeneratorProps) {
  const PRIX = {
    membre: 350000,
    nonMembre: 400000,
  };

  const montant = participant.statut === 'membre' ? PRIX.membre : PRIX.nonMembre;
  const numeroRecu = `FANAF2026-${participant.id.substring(0, 8).toUpperCase()}`;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
    toast.success('Impression lancée');
  };

  const handleDownload = () => {
    const receiptContent = document.getElementById('receipt-content');
    if (receiptContent) {
      // Créer un élément temporaire pour l'impression
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Reçu - ' + numeroRecu + '</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          body { font-family: Arial, sans-serif; padding: 40px; }
          .receipt-container { max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #f97316; padding-bottom: 20px; }
          .title { font-size: 32px; color: #f97316; font-weight: bold; margin: 10px 0; }
          .subtitle { font-size: 14px; color: #666; }
          .receipt-info { margin: 30px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; color: #333; }
          .value { color: #666; }
          .amount-section { background: #f5f5f5; padding: 20px; margin: 30px 0; border-radius: 8px; }
          .amount { font-size: 28px; font-weight: bold; color: #f97316; text-align: center; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #eee; text-align: center; color: #999; font-size: 12px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
          .badge-membre { background: #fed7aa; color: #c2410c; }
          .badge-nonmembre { background: #bfdbfe; color: #1e40af; }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(receiptContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
        toast.success('Téléchargement du reçu');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600" />
            Reçu de Paiement
          </DialogTitle>
          <DialogDescription>
            Reçu officiel de paiement pour l'inscription FANAF 2026
          </DialogDescription>
        </DialogHeader>

        <div id="receipt-content" className="space-y-6 py-4">
          {/* En-tête */}
          <div className="text-center border-b-2 border-orange-500 pb-6">
            <div className="text-orange-600 mb-2">FANAF 2026</div>
            <h2 className="text-gray-900 mb-2">Fédération des Sociétés d'Assurances de Droit National Africaines</h2>
            <p className="text-sm text-gray-500">42ème Assemblée Générale - Dakar, Sénégal</p>
            <p className="text-sm text-gray-500">9-11 Février 2026</p>
          </div>

          {/* Numéro de reçu et date */}
          <div className="flex justify-between items-start bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-500 mb-1">Numéro de Reçu</p>
              <p className="text-gray-900">{numeroRecu}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Date d'émission</p>
              <p className="text-gray-900">{formatDate(participant.dateInscription)}</p>
            </div>
          </div>

          {/* Informations du participant */}
          <div>
            <h3 className="text-gray-900 mb-4">Informations du Participant</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Nom complet</span>
                <span className="text-gray-900">{participant.prenom} {participant.nom}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Email</span>
                <span className="text-gray-900">{participant.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Téléphone</span>
                <span className="text-gray-900">{participant.telephone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Organisation</span>
                <span className="text-gray-900">{participant.organisation}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Catégorie</span>
                <span>
                  <Badge className={participant.statut === 'membre' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}>
                    {participant.statut === 'membre' ? 'Membre FANAF' : 'Non-Membre'}
                  </Badge>
                </span>
              </div>
            </div>
          </div>

          {/* Détails du paiement */}
          <div>
            <h3 className="text-gray-900 mb-4">Détails du Paiement</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Mode de paiement</span>
                <span className="text-gray-900 flex items-center gap-2">
                  {participant.modePaiement ? 
                    participant.modePaiement.charAt(0).toUpperCase() + participant.modePaiement.slice(1) : 
                    'Non spécifié'}
                  {participant.modePaiement === 'chèque' && (
                    <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                      Encaissement FANAF
                    </Badge>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Tarif appliqué</span>
                <span className="text-gray-900">{formatCurrency(montant)}</span>
              </div>
            </div>
          </div>

          {/* Montant total */}
          <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-900">Montant Total Payé</span>
              <span className="text-3xl text-orange-600">{formatCurrency(montant)}</span>
            </div>
          </div>

          {/* Statut */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
            <p className="text-green-700">
              ✓ Paiement confirmé et inscription validée
            </p>
          </div>

          {/* Note */}
          <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
            <p>Ce reçu atteste du paiement de l'inscription à la 42ème Assemblée Générale de la FANAF.</p>
            <p className="mt-2">Pour toute question, contactez : contact@fanaf2026.org</p>
            <p className="mt-4 text-gray-400">Document généré le {new Date().toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={handlePrint}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

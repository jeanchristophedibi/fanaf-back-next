'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Download, X, Loader2 } from 'lucide-react';
import { ProformaInvoiceGenerator } from '../ProformaInvoiceGenerator';
import { Participant, Organisation } from '../data/types';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface ProformaGeneratorProps {
  participant: Participant;
  organisation: Organisation;
  numeroFacture?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode; // Optionnel : bouton pour ouvrir le dialogue
}

/**
 * Composant réutilisable pour générer et télécharger des factures proforma
 * Peut être utilisé depuis n'importe quelle page de listing
 */
export function ProformaGenerator({
  participant,
  organisation,
  numeroFacture,
  open,
  onOpenChange,
  trigger,
}: ProformaGeneratorProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  // Générer le numéro de facture si non fourni
  const factureNumber = numeroFacture || 
    `PRO-${new Date().getFullYear()}-${participant.reference?.split('-').pop() || String(Date.now()).slice(-6)}`;

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      // Attendre que le DOM se mette à jour
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const elementId = `proforma-${participant.id}`;
      const element = document.getElementById(elementId);
      
      if (!element) {
        toast.error('Erreur: élément de facture non trouvé');
        setIsDownloading(false);
        return;
      }

      // Générer le canvas avec html2canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            clonedElement.style.backgroundColor = '#ffffff';
          }
        }
      });

      // Convertir le canvas en blob et télécharger
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `facture-proforma-${participant.reference || participant.id}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success('Facture téléchargée avec succès');
        } else {
          toast.error('Erreur lors de la génération de la facture');
        }
        setIsDownloading(false);
      }, 'image/png');
    } catch (error) {
      console.error('Erreur lors du téléchargement de la facture:', error);
      toast.error('Erreur lors du téléchargement de la facture');
      setIsDownloading(false);
    }
  };

  return (
    <>
      {trigger && (
        <div onClick={() => onOpenChange(true)}>
          {trigger}
        </div>
      )}
      
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Facture Proforma
              {participant.reference && (
                <span className="ml-2 text-base font-normal text-gray-500">
                  - {participant.reference}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {organisation ? (
              <ProformaInvoiceGenerator
                participant={participant}
                organisation={organisation}
                numeroFacture={factureNumber}
              />
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <p className="font-medium mb-1">Organisation introuvable</p>
                <p>L'organisation associée à cette inscription est introuvable.</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDownloading}
            >
              <X className="w-4 h-4 mr-2" />
              Fermer
            </Button>
            {organisation && (
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Téléchargement...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger la facture
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


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
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const elementId = `proforma-${participant.id}`;
      console.log('[ProformaGenerator] Recherche de l\'élément avec ID:', elementId);
      
      const element = document.getElementById(elementId);
      
      if (!element) {
        console.error('[ProformaGenerator] Élément non trouvé:', elementId);
        console.log('[ProformaGenerator] Éléments disponibles avec préfixe proforma-:', 
          Array.from(document.querySelectorAll('[id^="proforma-"]')).map(el => el.id)
        );
        toast.error('Erreur: élément de facture non trouvé. Vérifiez la console pour plus de détails.');
        setIsDownloading(false);
        return;
      }

      console.log('[ProformaGenerator] Élément trouvé, génération du canvas...');
      toast.info('Génération de l\'image en cours...');

      // Générer le canvas avec html2canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true, // Activer pour le débogage
        allowTaint: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            clonedElement.style.backgroundColor = '#ffffff';
          }
        }
      }).catch((error) => {
        console.error('[ProformaGenerator] Erreur html2canvas:', error);
        throw error;
      });

      console.log('[ProformaGenerator] Canvas généré, dimensions:', canvas.width, 'x', canvas.height);

      // Convertir le canvas en blob et télécharger avec timeout
      const blobPromise = new Promise<Blob | null>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout lors de la conversion en blob'));
        }, 10000); // Timeout de 10 secondes

        canvas.toBlob((blob) => {
          clearTimeout(timeout);
          resolve(blob);
        }, 'image/png', 1.0); // Qualité maximale
      });

      const blob = await blobPromise;

      if (!blob) {
        toast.error('Erreur: impossible de convertir l\'image');
        setIsDownloading(false);
        return;
      }

      console.log('[ProformaGenerator] Blob créé, taille:', blob.size, 'bytes');

      // Créer le lien de téléchargement
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-proforma-${participant.reference || participant.id}.png`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      console.log('[ProformaGenerator] Déclenchement du téléchargement...');
      
      link.click();
      
      // Nettoyer après un court délai
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('[ProformaGenerator] Téléchargement terminé');
      }, 100);

      toast.success('Facture téléchargée avec succès');
      setIsDownloading(false);
    } catch (error) {
      console.error('[ProformaGenerator] Erreur lors du téléchargement:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(`Erreur lors du téléchargement: ${errorMessage}`);
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


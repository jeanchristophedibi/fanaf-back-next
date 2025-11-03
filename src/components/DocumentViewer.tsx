'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Download, ExternalLink, ZoomIn, ZoomOut, X, FileText, Printer, RotateCw } from 'lucide-react';
import { motion } from 'motion/react';

interface DocumentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentUrl: string;
  documentTitle: string;
  participantName: string;
  documentType: 'badge' | 'recu' | 'lettre' | 'facture';
}

export function DocumentViewer({ 
  open, 
  onOpenChange, 
  documentUrl, 
  documentTitle,
  participantName,
  documentType 
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  
  // Ajouter un style global pour l'overlay quand le viewer est ouvert
  React.useEffect(() => {
    if (open) {
      const style = document.createElement('style');
      style.id = 'document-viewer-overlay-style';
      style.textContent = `
        body [data-slot="dialog-overlay"] {
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        const existingStyle = document.getElementById('document-viewer-overlay-style');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [open]);
  
  // Détection du type de fichier plus robuste
  const isPdf = documentUrl?.toLowerCase().includes('.pdf') || 
                documentUrl?.toLowerCase().includes('pdf') ||
                documentType === 'recu' || 
                documentType === 'facture' ||
                documentType === 'lettre';
  const isImage = documentUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || documentType === 'badge';

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = `${documentTitle}_${participantName}`;
    link.click();
  };

  const handleOpenNewTab = () => {
    window.open(documentUrl, '_blank');
  };

  const handlePrint = () => {
    const printWindow = window.open(documentUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const getDocumentIcon = () => {
    switch (documentType) {
      case 'badge':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'recu':
        return <FileText className="w-5 h-5 text-orange-600" />;
      case 'lettre':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'facture':
        return <FileText className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  // Log pour debug
  React.useEffect(() => {
    if (open) {
      console.log('DocumentViewer ouvert:', {
        documentUrl,
        documentTitle,
        documentType,
        isPdf,
        isImage
      });
    }
  }, [open, documentUrl, documentTitle, documentType, isPdf, isImage]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto w-screen h-screen">
        {/* Zone d'affichage du document */}
        <div className="flex-1 overflow-hidden bg-gray-900 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-full flex items-center justify-center"
          >
            {/* Afficher tous les documents dans un iframe (PDF par défaut) */}
            <div className="w-full h-full bg-white shadow-2xl overflow-hidden">
              {documentUrl ? (
                <iframe
                  src={documentUrl}
                  className="w-full h-full"
                  title={documentTitle}
                  style={{
                    border: 'none',
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'center top',
                    transition: 'transform 0.3s ease-in-out'
                  }}
                  onError={(e) => {
                    console.error('Erreur chargement document:', e);
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full p-12 text-center">
                  <div>
                    <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4 text-lg">Document non disponible</p>
                    <p className="text-gray-400 text-sm">L'URL du document est manquante</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Footer avec actions */}
        <div className="bg-gray-200 border-t border-gray-300 px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="gap-2 bg-white hover:bg-gray-50 h-10 px-6 text-base font-medium"
            >
              Fermer
            </Button>
            
            <Button
              onClick={handleOpenNewTab}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg h-10 px-6 text-base font-medium"
            >
              <ExternalLink className="w-5 h-5" />
              Ouvrir dans un nouvel onglet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


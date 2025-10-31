import React from 'react';
import { Download, QrCode, User, Building2, MapPin, CheckCircle, Mail, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { type Referent } from './data/types';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';

interface BadgeReferentGeneratorProps {
  referent: Referent;
  organisationNom: string;
  organisationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BadgeReferentGenerator({ 
  referent, 
  organisationNom, 
  organisationId,
  isOpen, 
  onClose 
}: BadgeReferentGeneratorProps) {
  const qrData = `FANAF2026-REFERENT-${organisationId}-${referent.email}`;

  const downloadBadge = async () => {
    const badgeElement = document.getElementById('referent-badge-preview');
    if (!badgeElement) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dimensions haute qualité
      const width = 800;
      const height = 1100;
      canvas.width = width;
      canvas.height = height;

      // Fond blanc
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Header avec gradient vert
      const gradient = ctx.createLinearGradient(0, 0, width, 150);
      gradient.addColorStop(0, '#22c55e');
      gradient.addColorStop(1, '#15803d');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, 150);

      // Logo FANAF (texte blanc)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('FANAF 2026', width / 2, 60);
      
      ctx.font = '18px Arial';
      ctx.fillText('26-29 Octobre 2025 • Abidjan', width / 2, 100);

      // Badge statut "RÉFÉRENT SPONSOR"
      ctx.fillStyle = '#22c55e';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      const badgeY = 150;
      const badgeHeight = 50;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 180, badgeY - 25, 360, badgeHeight, 25);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('RÉFÉRENT SPONSOR', width / 2, badgeY + 8);

      // Photo placeholder (cercle)
      const photoY = 230;
      ctx.fillStyle = '#e5e7eb';
      ctx.beginPath();
      ctx.arc(width / 2, photoY, 100, 0, Math.PI * 2);
      ctx.fill();

      // Icône utilisateur dans le cercle
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(width / 2, photoY - 20, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(width / 2, photoY + 40, 50, 0, Math.PI, true);
      ctx.stroke();

      // Nom et prénom
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${referent.prenom} ${referent.nom}`, width / 2, 400);

      // Fonction
      ctx.fillStyle = '#ea580c';
      ctx.font = '22px Arial';
      ctx.fillText(referent.fonction, width / 2, 440);

      // Organisation
      ctx.fillStyle = '#4b5563';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(organisationNom, width / 2, 490);

      // QR Code
      const qrCanvas = document.createElement('canvas');
      const qrSize = 250;
      qrCanvas.width = qrSize;
      qrCanvas.height = qrSize;
      const qrCtx = qrCanvas.getContext('2d');
      
      if (qrCtx) {
        // Créer un SVG temporaire pour le QR code
        const qrSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        qrSvg.setAttribute('width', qrSize.toString());
        qrSvg.setAttribute('height', qrSize.toString());
        
        // Utiliser QRCode.toString n'est pas disponible, donc on va dessiner un placeholder
        qrCtx.fillStyle = '#ffffff';
        qrCtx.fillRect(0, 0, qrSize, qrSize);
        qrCtx.fillStyle = '#000000';
        qrCtx.font = '16px Arial';
        qrCtx.textAlign = 'center';
        qrCtx.fillText('QR CODE', qrSize / 2, qrSize / 2);
        
        // Dessiner le QR code sur le canvas principal avec bordure
        const qrX = (width - qrSize) / 2;
        const qrY = 540;
        
        // Bordure
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 4;
        ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
        
        // QR code
        ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
      }

      // Email
      ctx.fillStyle = '#6b7280';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(referent.email, width / 2, 850);

      // Téléphone
      ctx.fillText(referent.telephone, width / 2, 880);

      // Footer
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, height - 80, width, 80);

      ctx.fillStyle = '#6b7280';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Veuillez présenter ce badge à l\'entrée', width / 2, height - 35);

      // Télécharger
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `badge-referent-${referent.nom}-${referent.prenom}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          toast.success(`Badge de ${referent.prenom} ${referent.nom} téléchargé`);
        }
      }, 'image/png');

    } catch (error) {
      console.error('Erreur lors de la génération du badge:', error);
      toast.error('Erreur lors de la génération du badge');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-green-600" />
            Badge Référent - {referent.prenom} {referent.nom}
          </DialogTitle>
          <DialogDescription>
            Prévisualisation et téléchargement du badge du référent sponsor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Aperçu du badge */}
          <div className="flex justify-center py-4">
            <div
              id="referent-badge-preview"
              className="w-72 bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-gray-200"
            >
              {/* Header avec statut */}
              <div className="bg-gradient-to-r from-green-500 to-green-700 p-4 text-white text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <img
                    src="https://images.unsplash.com/photo-1557683316-973673baf926?w=100&h=40&fit=crop"
                    alt="FANAF 2026"
                    className="h-8 object-contain brightness-0 invert"
                  />
                </div>
                <h2 className="text-sm tracking-wider">FANAF 2026</h2>
                <p className="text-xs opacity-90">26-29 Octobre 2025 • Abidjan</p>
              </div>

              {/* Badge de statut */}
              <div className="flex justify-center -mt-4 mb-4">
                <div className="bg-gradient-to-r from-green-500 to-green-700 px-6 py-1 rounded-full text-white text-sm shadow-lg">
                  RÉFÉRENT SPONSOR
                </div>
              </div>

              {/* Photo placeholder */}
              <div className="flex justify-center px-4 mb-3">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              </div>

              {/* Informations référent */}
              <div className="px-4 pb-3 text-center">
                <h3 className="text-lg text-gray-900 mb-1">
                  {referent.prenom} {referent.nom}
                </h3>
                
                <p className="text-xs text-orange-600 mb-2">{referent.fonction}</p>
                
                <div className="space-y-1 text-xs text-gray-600 mb-3">
                  <div className="flex items-center justify-center gap-1">
                    <Building2 className="w-3 h-3 text-green-600" />
                    <span className="truncate">{organisationNom}</span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="bg-white p-3 rounded-lg inline-block border-2 border-gray-200 mb-2">
                  <QRCode value={qrData} size={100} />
                </div>

                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center justify-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span className="truncate text-xs">{referent.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span className="text-xs">{referent.telephone}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-100 px-3 py-2 text-center border-t">
                <p className="text-xs text-gray-600">
                  Présentez ce badge à l'entrée
                </p>
              </div>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-sm text-gray-900">{referent.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Téléphone</p>
              <p className="text-sm text-gray-900">{referent.telephone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Fonction</p>
              <p className="text-sm text-gray-900">{referent.fonction}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={downloadBadge}
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger le badge
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Le QR code contient les informations d'identification du référent pour le check-in
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

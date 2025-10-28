import React, { useState } from 'react';
import { Download, QrCode, User, Building2, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { type Participant, getOrganisationById } from './data/mockData';
import QRCode from 'react-qr-code';

interface BadgeGeneratorProps {
  participant: Participant;
  isOpen: boolean;
  onClose: () => void;
}

// Fonction pour déterminer le libellé du statut de paiement
const getStatutPaiementLabel = (participant: Participant) => {
  if (participant.statut === 'vip' || participant.statut === 'speaker') {
    return 'exonéré';
  }
  return participant.statutInscription;
};

export function BadgeGenerator({ participant, isOpen, onClose }: BadgeGeneratorProps) {
  const organisation = getOrganisationById(participant.organisationId);
  const qrData = `FANAF2026-${participant.id}-${participant.reference}`;

  const generatePDF = () => {
    // En production, utiliser jsPDF ou html2canvas
    console.log('Génération du badge PDF pour:', participant.nom);
    alert(`Badge PDF généré pour ${participant.prenom} ${participant.nom}`);
  };

  const getStatutBadgeColor = (statut: string) => {
    switch (statut) {
      case 'vip':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'speaker':
        return 'bg-gradient-to-r from-purple-500 to-purple-700';
      case 'membre':
        return 'bg-gradient-to-r from-orange-500 to-orange-700';
      case 'referent':
        return 'bg-gradient-to-r from-green-500 to-green-700';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-700';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'vip':
        return 'VIP';
      case 'speaker':
        return 'SPEAKER';
      case 'membre':
        return 'MEMBRE';
      case 'non-membre':
        return 'PARTICIPANT';
      case 'referent':
        return 'RÉFÉRENT SPONSOR';
      default:
        return statut.toUpperCase();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-orange-600" />
            Badge Participant - {participant.prenom} {participant.nom}
          </DialogTitle>
          <DialogDescription>
            Prévisualisation et téléchargement du badge du participant
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Aperçu du badge */}
          <div className="flex justify-center">
            <div
              id="badge-preview"
              className="w-80 bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-gray-200"
            >
              {/* Header avec statut */}
              <div className={`${getStatutBadgeColor(participant.statut)} p-4 text-white text-center`}>
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
                <div className={`${getStatutBadgeColor(participant.statut)} px-6 py-1 rounded-full text-white text-sm shadow-lg`}>
                  {getStatutLabel(participant.statut)}
                </div>
              </div>

              {/* Photo placeholder */}
              <div className="flex justify-center px-4 mb-4">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              </div>

              {/* Informations participant */}
              <div className="px-6 pb-4 text-center">
                <h3 className="text-xl text-gray-900 mb-1">
                  {participant.prenom} {participant.nom}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {organisation && (
                    <div className="flex items-center justify-center gap-2">
                      <Building2 className="w-4 h-4 text-orange-600" />
                      <span>{organisation.nom}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <span>{participant.pays}</span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="bg-white p-4 rounded-lg inline-block border-2 border-gray-200 mb-3">
                  <QRCode value={qrData} size={128} />
                </div>

                <p className="text-xs text-gray-500 mb-2">
                  Ref: {participant.reference}
                </p>

                {participant.badgeGenere && (
                  <div className="flex items-center justify-center gap-1 text-xs text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>Badge généré</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-100 px-4 py-2 text-center border-t">
                <p className="text-xs text-gray-600">
                  Veuillez présenter ce badge à l'entrée
                </p>
              </div>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-sm text-gray-900">{participant.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Téléphone</p>
              <p className="text-sm text-gray-900">{participant.telephone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date d'inscription</p>
              <p className="text-sm text-gray-900">
                {new Date(participant.dateInscription).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Statut inscription</p>
              <Badge
                className={
                  getStatutPaiementLabel(participant) === 'finalisée'
                    ? 'bg-green-100 text-green-700'
                    : getStatutPaiementLabel(participant) === 'exonéré'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-orange-100 text-orange-700'
                }
              >
                {getStatutPaiementLabel(participant)}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              onClick={generatePDF}
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger le badge (PDF)
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Le QR code contient les informations d'identification du participant pour le check-in
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

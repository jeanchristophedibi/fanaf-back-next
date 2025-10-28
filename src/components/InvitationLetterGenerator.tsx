import React from 'react';
import { Mail, Download, Printer } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from 'sonner';
import { type Participant, getOrganisationById } from './data/mockData';

interface InvitationLetterGeneratorProps {
  participant: Participant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvitationLetterGenerator({ participant, open, onOpenChange }: InvitationLetterGeneratorProps) {
  const organisation = getOrganisationById(participant.organisationId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
    toast.success('Impression de la lettre lancée');
  };

  const handleDownload = () => {
    toast.success(`Lettre d'invitation téléchargée pour ${participant.prenom} ${participant.nom}`);
  };

  const getTitreCivilite = () => {
    // Détermination basique du titre de civilité
    const prenomLower = participant.prenom.toLowerCase();
    if (prenomLower.endsWith('a') || prenomLower.includes('fatou') || prenomLower.includes('aissata')) {
      return 'Madame';
    }
    return 'Monsieur';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-orange-600" />
            Lettre d'Invitation - FANAF 2026
          </DialogTitle>
          <DialogDescription>
            Lettre d'invitation pour {participant.prenom} {participant.nom}
          </DialogDescription>
        </DialogHeader>

        {/* Contenu de la lettre */}
        <div className="bg-white p-12 space-y-6 border rounded-lg print:shadow-none" id="letter-content">
          {/* En-tête avec logo */}
          <div className="text-center border-b-2 border-orange-600 pb-6">
            <h1 className="text-4xl text-orange-600 mb-2">FANAF 2026</h1>
            <p className="text-lg text-gray-700">Fédération des Sociétés d'Assurances de Droit National Africaines</p>
            <p className="text-gray-600 mt-2">43ème Assemblée Générale</p>
            <p className="text-gray-600">9-11 Février 2026 • Abidjan, Côte d'Ivoire</p>
          </div>

          {/* Date et référence */}
          <div className="text-right text-gray-600">
            <p>Abidjan, le {formatDate(new Date().toISOString())}</p>
            <p className="mt-1">Réf: {participant.reference}</p>
          </div>

          {/* Destinataire */}
          <div className="mt-8">
            <p className="text-gray-900">{getTitreCivilite()} {participant.prenom} {participant.nom}</p>
            {participant.fonction && <p className="text-gray-700">{participant.fonction}</p>}
            <p className="text-gray-700">{organisation?.nom}</p>
            <p className="text-gray-600">{participant.pays}</p>
          </div>

          {/* Objet */}
          <div className="mt-8">
            <p className="font-semibold text-gray-900">
              Objet: <span className="underline">Invitation à la 43ème Assemblée Générale de la FANAF</span>
            </p>
          </div>

          {/* Corps de la lettre */}
          <div className="mt-8 space-y-4 text-gray-800 leading-relaxed">
            <p>{getTitreCivilite()},</p>

            <p className="text-justify">
              C'est avec un grand plaisir que nous vous invitons à participer à la 43ème Assemblée Générale 
              de la Fédération des Sociétés d'Assurances de Droit National Africaines (FANAF), qui se tiendra 
              du <span className="font-semibold">9 au 11 février 2026</span> à Abidjan, Côte d'Ivoire.
            </p>

            <p className="text-justify">
              Cette assemblée annuelle constitue un moment privilégié de rencontres et d'échanges entre les 
              acteurs majeurs du secteur de l'assurance en Afrique. Elle sera l'occasion d'aborder les grands 
              enjeux de notre secteur et de partager les meilleures pratiques en matière d'assurance et de 
              réassurance.
            </p>

            <p className="text-justify">
              Le programme comprendra :
            </p>

            <ul className="list-disc list-inside space-y-2 ml-4 text-justify">
              <li>Des sessions plénières sur les tendances du marché africain de l'assurance</li>
              <li>Des ateliers thématiques sur l'innovation et la transformation digitale</li>
              <li>Des opportunités de networking avec plus de 500 professionnels du secteur</li>
              <li>Une exposition avec les acteurs majeurs de l'industrie</li>
              <li>Des événements culturels célébrant la richesse du patrimoine africain</li>
            </ul>

            <p className="text-justify">
              Votre inscription avec la référence <span className="font-mono bg-gray-100 px-2 py-1 rounded">{participant.reference}</span> a 
              été confirmée. Vous recevrez prochainement votre badge participant ainsi que le programme détaillé de l'événement.
            </p>

            <p className="text-justify">
              Pour toute information complémentaire, n'hésitez pas à contacter notre secrétariat à l'adresse 
              contact@fanaf2026.org ou par téléphone au +225 27 20 XX XX XX.
            </p>

            <p className="text-justify">
              Nous vous prions d'agréer, {getTitreCivilite()}, l'expression de nos salutations distinguées.
            </p>
          </div>

          {/* Signature */}
          <div className="mt-12 space-y-4">
            <p className="text-gray-900">Le Comité d'Organisation</p>
            <p className="text-gray-700">FANAF 2026</p>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t text-center text-sm text-gray-600">
            <p>Secrétariat FANAF • BP 1025 Abidjan 01 • Côte d'Ivoire</p>
            <p>Tél: +225 27 20 XX XX XX • Email: contact@fanaf2026.org • www.fanaf2026.org</p>
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

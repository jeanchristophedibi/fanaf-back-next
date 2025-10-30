'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, ChevronLeft, ChevronRight, Download, User, Users, Building2, 
  FileText, X, Plus, Award, Briefcase, Sparkles, Shield, Check
} from 'lucide-react';
import { Participant, Organisation, StatutParticipant, mockOrganisations } from './data/mockData';
import { ProformaInvoiceGenerator } from './ProformaInvoiceGenerator';
import { SuccessBanner } from './inscriptions/nouvelle/SuccessBanner';
import { StepsProgress } from './inscriptions/nouvelle/StepsProgress';
import { ProformaCard } from './inscriptions/nouvelle/ProformaCard';
import { FooterNav } from './inscriptions/nouvelle/FooterNav';
import { StepType } from './inscriptions/nouvelle/StepType';
import { StepInformations } from './inscriptions/nouvelle/StepInformations';
import { StepInscription } from './inscriptions/nouvelle/StepInscription';
import { StepOrganisation } from './inscriptions/nouvelle/StepOrganisation';
import { StepRecap } from './inscriptions/nouvelle/StepRecap';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import html2canvas from 'html2canvas';

interface ParticipantFormData {
  nom: string;
  prenom: string;
  email: string;
}

interface ParticipantPrincipalFormData {
  nom: string;
  prenom: string;
  email: string;
  pays: string;
  telephone: string;
  typeIdentite: 'passeport' | 'cni';
  numeroIdentite: string;
}

interface OrganisationFormData {
  nom: string;
  email: string;
  contact: string;
  adresse: string;
  domaineActivite: string;
  codeOrganisation?: string;
}

// Liste des pays
const PAYS_LIST = [
  'Algérie', 'Angola', 'Bénin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroun', 
  'Cap-Vert', 'Centrafrique', 'Comores', 'Congo', 'Côte d\'Ivoire', 'Djibouti', 
  'Égypte', 'Érythrée', 'Eswatini', 'Éthiopie', 'Gabon', 'Gambie', 'Ghana', 
  'Guinée', 'Guinée-Bissau', 'Guinée équatoriale', 'Kenya', 'Lesotho', 'Libéria', 
  'Libye', 'Madagascar', 'Malawi', 'Mali', 'Maroc', 'Maurice', 'Mauritanie', 
  'Mozambique', 'Namibie', 'Niger', 'Nigeria', 'Ouganda', 'RD Congo', 'Rwanda', 
  'Sao Tomé-et-Principe', 'Sénégal', 'Seychelles', 'Sierra Leone', 'Somalie', 
  'Soudan', 'Soudan du Sud', 'Tanzanie', 'Tchad', 'Togo', 'Tunisie', 'Zambie', 'Zimbabwe'
];

export const NouvelleInscriptionPage = () => {
  const [etapeActuelle, setEtapeActuelle] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [typeParticipant, setTypeParticipant] = useState<StatutParticipant | ''>('');
  const [participantPrincipal, setParticipantPrincipal] = useState<ParticipantPrincipalFormData>({
    nom: '',
    prenom: '',
    email: '',
    pays: '',
    telephone: '',
    typeIdentite: 'passeport',
    numeroIdentite: ''
  });

  const [typeInscription, setTypeInscription] = useState<'individuel' | 'groupe' | ''>('');
  const [participantsGroupe, setParticipantsGroupe] = useState<ParticipantFormData[]>([]);

  const [organisationData, setOrganisationData] = useState<OrganisationFormData>({
    nom: '',
    email: '',
    contact: '',
    adresse: '',
    domaineActivite: '',
    codeOrganisation: ''
  });

  const [organisationSelectionnee, setOrganisationSelectionnee] = useState<string>('');
  const organisationsMembres = mockOrganisations.filter(org => org.statut === 'membre');
  
  const handleOrganisationSelect = (orgId: string) => {
    setOrganisationSelectionnee(orgId);
    const orgTrouvee = organisationsMembres.find(org => org.id === orgId);
    if (orgTrouvee) {
      const orgAny = orgTrouvee as any;
      setOrganisationData({
        nom: orgTrouvee.nom,
        email: orgTrouvee.email,
        contact: orgTrouvee.contact,
        adresse: orgAny.adresse || '',
        domaineActivite: orgAny.domaineActivite || '',
        codeOrganisation: ''
      });
    }
  };

  const [inscriptionFinalisee, setInscriptionFinalisee] = useState<{
    participants: Participant[];
    organisation: Organisation;
    numeroFacture: string;
    montantTotal: number;
  } | null>(null);

  const [paysRecherche, setPaysRecherche] = useState('');
  
  // État pour le dialog de choix de facture
  const [showFactureDialog, setShowFactureDialog] = useState(false);
  const [typeFactureSelectionnee, setTypeFactureSelectionnee] = useState<'groupe' | 'individuel' | null>(null);

  const etapes = [
    { numero: 1, titre: 'Type', icon: Award },
    { numero: 2, titre: 'Informations', icon: User },
    { numero: 3, titre: 'Inscription', icon: Users },
    { numero: 4, titre: 'Organisation', icon: Building2 },
    { numero: 5, titre: 'Récapitulatif', icon: FileText }
  ];

  const PRIX = {
    membre: 350000,
    nonMembre: 400000,
    vip: 0,
    speaker: 0
  };

  const ajouterParticipantGroupe = () => {
    setParticipantsGroupe([...participantsGroupe, { nom: '', prenom: '', email: '' }]);
  };

  const supprimerParticipantGroupe = (index: number) => {
    setParticipantsGroupe(participantsGroupe.filter((_, i) => i !== index));
  };

  const updateParticipantGroupe = (index: number, field: keyof ParticipantFormData, value: string) => {
    const updated = [...participantsGroupe];
    updated[index] = { ...updated[index], [field]: value };
    setParticipantsGroupe(updated);
  };

  const paysFiltres = PAYS_LIST.filter(pays => 
    pays.toLowerCase().includes(paysRecherche.toLowerCase())
  );

  const validerEtape1 = () => {
    if (!typeParticipant) {
      toast.error('Veuillez sélectionner un type de participant');
      return;
    }
    toast.success('Type de participant sélectionné');
    setEtapeActuelle(2);
  };

  const validerEtape2 = () => {
    if (!participantPrincipal.nom) {
      toast.error('Veuillez saisir le nom du participant');
      return;
    }
    
    if (!participantPrincipal.prenom) {
      toast.error('Veuillez saisir le prénom du participant');
      return;
    }
    
    if (!participantPrincipal.email) {
      toast.error('Veuillez saisir l\'adresse e-mail du participant');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(participantPrincipal.email)) {
      toast.error('L\'adresse e-mail saisie n\'est pas valide');
      return;
    }
    
    if (!participantPrincipal.telephone) {
      toast.error('Veuillez saisir le numéro de téléphone du participant');
      return;
    }
    
    if (!participantPrincipal.pays) {
      toast.error('Veuillez sélectionner le pays d\'origine du participant');
      return;
    }
    
    if (!participantPrincipal.numeroIdentite) {
      toast.error(`Veuillez saisir le numéro de ${participantPrincipal.typeIdentite === 'passeport' ? 'passeport' : 'CNI'}`);
      return;
    }

    toast.success('Informations personnelles validées');
    setEtapeActuelle(3);
  };

  const validerEtape3 = () => {
    if (!typeInscription) {
      toast.error('Veuillez sélectionner un type d\'inscription');
      return;
    }

    if (typeInscription === 'groupe') {
      if (participantsGroupe.length === 0) {
        toast.error('Vous devez ajouter au moins un autre participant');
        return;
      }

      for (let i = 0; i < participantsGroupe.length; i++) {
        const p = participantsGroupe[i];
        const numero = i + 2;

        if (!p.nom) {
          toast.error(`Veuillez saisir le nom du participant #${numero}`);
        return;
      }

        if (!p.prenom) {
          toast.error(`Veuillez saisir le prénom du participant #${numero}`);
          return;
        }
        
        if (!p.email) {
          toast.error(`Veuillez saisir l'email du participant #${numero}`);
        return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(p.email)) {
          toast.error(`L'email du participant #${numero} n'est pas valide`);
          return;
        }
      }
    }

    toast.success('Type d\'inscription validé');
    setEtapeActuelle(4);
  };

  const validerEtape4 = () => {
    if (typeParticipant === 'membre') {
      if (!organisationSelectionnee) {
        toast.error('Veuillez sélectionner une organisation membre');
        return;
      }
      
      if (!organisationData.codeOrganisation) {
        toast.error('Veuillez saisir le code de l\'organisation');
        return;
      }
      
      const orgTrouvee = organisationsMembres.find(org => org.id === organisationSelectionnee);
      if (orgTrouvee && (orgTrouvee as any).codeOrganisation !== organisationData.codeOrganisation) {
        toast.error('Le code de l\'organisation est incorrect');
        return;
      }
    } else {
      if (!organisationData.nom) {
        toast.error('Veuillez saisir le nom de l\'organisation');
        return;
      }
      
      if (!organisationData.email) {
        toast.error('Veuillez saisir l\'email de l\'organisation');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(organisationData.email)) {
        toast.error('L\'email de l\'organisation n\'est pas valide');
      return;
      }
      
      if (!organisationData.contact) {
        toast.error('Veuillez saisir le contact de l\'organisation');
        return;
      }
      
      if (!organisationData.adresse) {
        toast.error('Veuillez saisir l\'adresse de l\'organisation');
        return;
      }
      
      if (!organisationData.domaineActivite) {
        toast.error('Veuillez sélectionner le domaine d\'activité');
        return;
      }
    }

    toast.success('Informations de l\'organisation validées');
    setEtapeActuelle(5);
  };

  const calculerMontantTotal = () => {
    let prixUnitaire = 0;
    if (typeParticipant === 'membre') prixUnitaire = PRIX.membre;
    else if (typeParticipant === 'non-membre') prixUnitaire = PRIX.nonMembre;
    else if (typeParticipant === 'vip' || typeParticipant === 'speaker') prixUnitaire = PRIX.vip;

    if (typeInscription === 'individuel') {
      return prixUnitaire;
    } else {
      return prixUnitaire * (1 + participantsGroupe.length);
    }
  };

  // Actions globales pied de page (navigation étapes)
  const handlePrev = () => {
    if (etapeActuelle === 2) setEtapeActuelle(1);
    else if (etapeActuelle === 3) setEtapeActuelle(2);
    else if (etapeActuelle === 4) setEtapeActuelle(3);
    else if (etapeActuelle === 5) setEtapeActuelle(4);
  };

  const handleNext = () => {
    if (etapeActuelle === 1) return validerEtape1();
    if (etapeActuelle === 2) return validerEtape2();
    if (etapeActuelle === 3) return validerEtape3();
    if (etapeActuelle === 4) return validerEtape4();
    if (etapeActuelle === 5) return finaliserInscription();
  };

  // Raison de désactivation du bouton Suivant par étape
  const getDisabledReason = (): string | undefined => {
    if (loading) return undefined; // le chargement gère déjà l'état disabled
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (etapeActuelle === 1) {
      if (!typeParticipant) return 'Sélectionnez un type de participant';
    }

    if (etapeActuelle === 2) {
      if (!participantPrincipal.prenom) return 'Prénom requis';
      if (!participantPrincipal.nom) return 'Nom requis';
      if (!participantPrincipal.email) return 'Email requis';
      if (!emailRegex.test(participantPrincipal.email)) return "Email invalide";
      if (!participantPrincipal.telephone) return 'Téléphone requis';
      if (!participantPrincipal.pays) return 'Pays requis';
      if (!participantPrincipal.numeroIdentite) return 'Numéro de pièce requis';
    }

    if (etapeActuelle === 3) {
      if (!typeInscription) return "Sélectionnez un type d'inscription";
      if (typeInscription === 'groupe') {
        if (participantsGroupe.length === 0) return 'Ajoutez au moins un autre participant';
        for (let i = 0; i < participantsGroupe.length; i++) {
          const p = participantsGroupe[i];
          if (!p.prenom) return `Prénom du participant #${i + 2} requis`;
          if (!p.nom) return `Nom du participant #${i + 2} requis`;
          if (!p.email) return `Email du participant #${i + 2} requis`;
          if (!emailRegex.test(p.email)) return `Email du participant #${i + 2} invalide`;
        }
      }
    }

    if (etapeActuelle === 4) {
      if (typeParticipant === 'membre') {
        if (!organisationSelectionnee) return 'Sélectionnez une organisation membre';
        if (!organisationData.codeOrganisation) return "Code de l'organisation requis";
        const orgTrouvee = organisationsMembres.find(org => org.id === organisationSelectionnee);
        if (orgTrouvee && (orgTrouvee as any).codeOrganisation && (orgTrouvee as any).codeOrganisation !== organisationData.codeOrganisation) {
          return "Code de l'organisation incorrect";
        }
      } else {
        if (!organisationData.nom) return "Nom de l'organisation requis";
        if (!organisationData.email) return "Email de l'organisation requis";
        if (!emailRegex.test(organisationData.email)) return "Email de l'organisation invalide";
        if (!organisationData.contact) return "Contact de l'organisation requis";
        if (!organisationData.adresse) return "Adresse de l'organisation requise";
        if (!organisationData.domaineActivite) return "Domaine d'activité requis";
      }
    }

    return undefined;
  };

  const finaliserInscription = async () => {
    setLoading(true);

    try {
      const organisationId = `org-${Date.now()}`;
      const organisation: Organisation = {
        id: organisationId,
        nom: organisationData.nom,
        contact: organisationData.contact,
        email: organisationData.email,
        pays: participantPrincipal.pays,
        dateCreation: new Date().toISOString(),
      statut: typeParticipant === 'membre' ? 'membre' : 'non-membre'
      };

      const participants: Participant[] = [];
      const groupeId = typeInscription === 'groupe' ? `grp-${Date.now()}` : undefined;

      const participantPrincipalId = `part-${Date.now()}`;
      const referencePrincipal = `REF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
      
      const principalParticipant: Participant = {
        id: participantPrincipalId,
        reference: referencePrincipal,
        nom: participantPrincipal.nom,
        prenom: participantPrincipal.prenom,
        email: participantPrincipal.email,
        telephone: participantPrincipal.telephone,
        pays: participantPrincipal.pays,
        organisationId,
        statut: typeParticipant as StatutParticipant,
        statutInscription: typeParticipant === 'vip' || typeParticipant === 'speaker' ? 'finalisée' : 'non-finalisée',
        dateInscription: new Date().toISOString(),
        groupeId,
        nomGroupe: typeInscription === 'groupe' ? `Groupe ${organisationData.nom}` : undefined
      };
      
      participants.push(principalParticipant);

      if (typeInscription === 'groupe') {
        participantsGroupe.forEach((p, index) => {
          const participantId = `part-${Date.now()}-${index + 1}`;
          const reference = `REF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
          
          const participant: Participant = {
            id: participantId,
            reference,
            nom: p.nom,
            prenom: p.prenom,
            email: p.email,
            telephone: organisationData.contact,
            pays: participantPrincipal.pays,
            organisationId,
            statut: typeParticipant as StatutParticipant,
            statutInscription: typeParticipant === 'vip' || typeParticipant === 'speaker' ? 'finalisée' : 'non-finalisée',
            dateInscription: new Date().toISOString(),
            groupeId,
            nomGroupe: `Groupe ${organisationData.nom}`
          };
          
          participants.push(participant);
        });
      }

      const existingParticipants = JSON.parse(localStorage.getItem('dynamicParticipants') || '[]');
      const existingOrganisations = JSON.parse(localStorage.getItem('mockOrganisations') || '[]');
      
      existingParticipants.push(...participants);
      existingOrganisations.push(organisation);

      localStorage.setItem('dynamicParticipants', JSON.stringify(existingParticipants));
      localStorage.setItem('mockOrganisations', JSON.stringify(existingOrganisations));
      
      window.dispatchEvent(new Event('storage'));

      const numeroFacture = `PRO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;

      setInscriptionFinalisee({
        participants,
        organisation,
        numeroFacture,
        montantTotal: calculerMontantTotal()
      });

      toast.success('Inscription créée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      toast.error('Erreur lors de la finalisation de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le dialog de choix de facture
  const ouvrirChoixFacture = () => {
    if (!inscriptionFinalisee) return;

    // Télécharger directement la facture individuelle (simplification)
    telechargerFacture('individuel');
  };

  // Télécharger la facture selon le type choisi
  const telechargerFacture = async (type: 'groupe' | 'individuel') => {
    if (!inscriptionFinalisee) return;

    setShowFactureDialog(false);
    setTypeFactureSelectionnee(type);

    toast.info('Génération de la facture en cours...');

    // Attendre que le DOM se mette à jour
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const elementId = 'facture-proforma-individuel';
    const element = document.getElementById(elementId);
    
    if (!element) {
      toast.error('Erreur: élément de facture non trouvé');
      return;
    }

    try {
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

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const suffix = type === 'groupe' ? 'groupee' : 'individuelle';
          link.download = `facture-proforma-${suffix}-${inscriptionFinalisee.numeroFacture}.png`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success('Facture téléchargée avec succès');
          setTypeFactureSelectionnee(null);
        }
      });
    } catch (error) {
      console.error('Erreur génération facture:', error);
      toast.error('Erreur lors de la génération de la facture');
      setTypeFactureSelectionnee(null);
    }
  };

  const nouvelleInscription = () => {
    setEtapeActuelle(1);
    setTypeParticipant('');
    setParticipantPrincipal({
      nom: '',
      prenom: '',
      email: '',
      pays: '',
      telephone: '',
      typeIdentite: 'passeport',
      numeroIdentite: ''
    });
    setTypeInscription('');
    setParticipantsGroupe([]);
    setOrganisationData({
      nom: '',
      email: '',
      contact: '',
      adresse: '',
      domaineActivite: '',
      codeOrganisation: ''
    });
    setOrganisationSelectionnee('');
    setInscriptionFinalisee(null);
  };
  

  // Page de confirmation
  if (inscriptionFinalisee) {
    return (
      <div className="p-6 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-5xl mx-auto space-y-6"
        >
          <SuccessBanner participantPrenom={participantPrincipal.prenom} participantsCount={inscriptionFinalisee.participants.length} />

          {/* Facture */}
          <ProformaCard participants={inscriptionFinalisee.participants} organisation={inscriptionFinalisee.organisation} numeroFacture={inscriptionFinalisee.numeroFacture} onDownload={ouvrirChoixFacture} />

          {/* Dialog de choix de type de facture */}
          <AlertDialog open={showFactureDialog} onOpenChange={setShowFactureDialog}>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl">Choisir le type de facture</AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                  Cette inscription comporte {inscriptionFinalisee.participants.length} participants. 
                  Souhaitez-vous générer une facture groupée ou individuelle ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="space-y-3 my-6">
                <button
                  onClick={() => telechargerFacture('groupe')}
                  className="w-full p-6 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
                      <h4 className="text-lg mb-1 text-gray-900">Facture Groupée</h4>
                      <p className="text-sm text-gray-600">
                        Montant total de tous les participants ({inscriptionFinalisee.montantTotal.toLocaleString('fr-FR')} FCFA)
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => telechargerFacture('individuel')}
                  className="w-full p-6 border-2 border-orange-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <User className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg mb-1 text-gray-900">Facture Individuelle</h4>
                      <p className="text-sm text-gray-600">
                        Uniquement pour le participant principal ({inscriptionFinalisee.participants[0].prenom} {inscriptionFinalisee.participants[0].nom})
              </p>
            </div>
          </div>
                </button>
          </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Actions */}
        <div className="flex gap-4">
            <Button 
              onClick={nouvelleInscription} 
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
            >
              <Plus className="w-4 h-4 mr-2" />
            Nouvelle inscription
          </Button>
        </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header avec titre */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl mb-3 text-gray-900">
            Nouvelle Inscription FANAF 2026
          </h1>
          <p className="text-gray-600 text-lg">
            46ème Assemblée Générale • 9-11 Février 2026 • Abidjan
          </p>
        </motion.div>

        {/* Barre de progression moderne */}
        <StepsProgress etapes={etapes} etapeActuelle={etapeActuelle} />

        {/* Formulaire animé */}
        <AnimatePresence mode="wait">
      <motion.div
        key={etapeActuelle}
            initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
      >
            <Card className="p-10 border-0 rounded-xl bg-white/90 backdrop-blur-sm">
          {etapeActuelle === 1 && (
                <StepType typeParticipant={typeParticipant as any} setTypeParticipant={(v: any) => setTypeParticipant(v)} />
              )}
          {etapeActuelle === 2 && (
                <StepInformations
                  participantPrincipal={participantPrincipal}
                  onChange={(patch: Partial<ParticipantPrincipalFormData>) => setParticipantPrincipal({ ...participantPrincipal, ...patch })}
                />
              )}
          {etapeActuelle === 3 && (
                <StepInscription
                  typeInscription={typeInscription as any}
                  setTypeInscription={(v: any) => setTypeInscription(v)}
                  participantsGroupe={participantsGroupe}
                  setParticipantsGroupe={setParticipantsGroupe}
                />
              )}
              {etapeActuelle === 4 && (
                <StepOrganisation
                  organisationData={organisationData}
                  onChange={(patch: Partial<OrganisationFormData>) => setOrganisationData({ ...organisationData, ...patch })}
                  isMembre={typeParticipant === 'membre'}
                  organisationsOptions={organisationsMembres.map(o => ({ id: o.id, nom: o.nom }))}
                  selectedOrganisationId={organisationSelectionnee}
                  onSelectOrganisation={handleOrganisationSelect}
                />
                    )}
              {etapeActuelle === 5 && (
                <StepRecap
                  typeParticipant={typeParticipant as any}
                  typeInscription={typeInscription as any}
                  participantsCount={typeInscription === 'groupe' ? 1 + participantsGroupe.length : 1}
                  montantTotal={calculerMontantTotal()}
                  participantPrincipal={participantPrincipal}
                  organisationData={organisationData}
                  participantsGroupe={participantsGroupe}
                  onGoToEtape={(n) => setEtapeActuelle(n)}
                />
          )}
        </Card>
      </motion.div>
        </AnimatePresence>
        {/* Footer fixe navigation étapes */}
        <FooterNav
          etapeActuelle={etapeActuelle}
          loading={loading}
          onPrev={handlePrev}
          onNext={handleNext}
          disabled={!!getDisabledReason()}
          disabledReason={getDisabledReason()}
        />
      </div>
    </div>
  );
};

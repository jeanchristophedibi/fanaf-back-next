'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { type Participant, type Organisation, type StatutParticipant } from './data/types';
import { useOrganisationsQuery } from '../hooks/useOrganisationsQuery';
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
import Router from 'next/router';
import { usePathname, useRouter } from 'next/navigation';
import { fanafApi } from '../services/fanafApi';

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
  const appRouter = useRouter();
  const pathname = usePathname();
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
  const { organisations: allOrganisations = [] } = useOrganisationsQuery();
  const organisationsMembres = allOrganisations.filter(org => org.statut === 'membre');
  
  // État pour les erreurs de validation
  const [telephoneError, setTelephoneError] = useState<string | null>(null);
  const [isCodeValidated, setIsCodeValidated] = useState(false);
  
  // Fonction de validation en temps réel du téléphone
  const validateTelephone = (phone: string): string | null => {
    if (!phone || phone.trim() === '') {
      return null; // Pas d'erreur si vide (on ne valide que si l'utilisateur a commencé à taper)
    }
    
    try {
      // Utiliser la même logique que cleanPhoneNumber mais sans lancer d'erreur
      const phoneTrimmed = phone.trim();
      let cleaned = phoneTrimmed.replace(/[\s\-\(\)\.]/g, '').trim();
      
      if (!cleaned.startsWith('+')) {
        cleaned = `+${cleaned}`;
      }
      
      const digitsOnly = cleaned.replace(/\D/g, '');
      const lettersOnly = phoneTrimmed.replace(/[^a-zA-ZÀ-ÿ]/g, '').length;
      
      // Vérifier si c'est du texte de placeholder
      if (digitsOnly.length < 4 || (lettersOnly > 5 && digitsOnly.length < 8)) {
        const phoneLower = phoneTrimmed.toLowerCase();
        const placeholderWords = ['exemple', 'example', 'test', 'lorem', 'ipsum', 'dolor', 'eveniet', 'earum', 'placeholder', 'fugiat', 'dolore'];
        const exactPlaceholderPatterns = /^(xx|xxx|aaaa|bbbb|exemple|example|test|lorem|ipsum|placeholder)[\s\-]*$/i;
        
        if (exactPlaceholderPatterns.test(phoneTrimmed) || 
            placeholderWords.some(word => phoneLower.includes(word)) ||
            (lettersOnly > digitsOnly.length && digitsOnly.length < 8)) {
          return 'Le champ téléphone contient du texte invalide. Veuillez saisir un numéro de téléphone valide (ex: +225 01 23 45 67 89)';
        }
      }
      
      // Vérifier le nombre minimum de chiffres seulement si l'utilisateur a tapé quelque chose
      if (digitsOnly.length > 0 && digitsOnly.length < 8) {
        return `Le numéro de téléphone doit contenir au moins 8 chiffres (ex: +225 01 23 45 67 89)`;
      }
      
      // Vérifier la longueur maximale
      if (digitsOnly.length > 15) {
        return 'Le numéro de téléphone est trop long. Il doit contenir au maximum 15 chiffres (format international E.164)';
      }
      
      // Vérifier les caractères non numériques
      const nonDigits = cleaned.replace(/\d/g, '').replace('+', '').length;
      if (nonDigits > 5) {
        return 'Le numéro semble contenir du texte invalide. Veuillez saisir uniquement des chiffres avec le code pays (ex: +225 01 23 45 67 89)';
      }
      
      // Vérifier le format du code pays
      const countryCodeMatch = cleaned.match(/^\+\d{1,3}/);
      if (!countryCodeMatch && digitsOnly.length > 0) {
        return 'Le numéro de téléphone n\'a pas un format de code pays valide (ex: +225 pour la Côte d\'Ivoire)';
      }
      
      // Vérifier le numéro local
      if (countryCodeMatch && digitsOnly.length > 0) {
        const localNumberLength = digitsOnly.length - countryCodeMatch[0].replace('+', '').length;
        if (localNumberLength > 0 && localNumberLength < 4) {
          return 'Le numéro local est trop court. Il doit contenir au moins 4 chiffres après le code pays.';
        }
      }
      
      return null; // Pas d'erreur
    } catch (error) {
      return 'Erreur lors de la validation du numéro de téléphone';
    }
  };
  
  // Query pour récupérer les types d'inscription (registration fees)
  const { data: registrationTypesResponse, isLoading: isLoadingRegistrationTypes } = useQuery({
    queryKey: ['registrationTypes'],
    queryFn: async () => {
      return await fanafApi.getRegistrationTypes();
    },
    staleTime: 5 * 60 * 1000, // Cache pendant 5 minutes
    gcTime: 10 * 60 * 1000, // Garder en cache pendant 10 minutes
  });
  
  const registrationTypes = registrationTypesResponse?.data || [];
  
  // Query pour récupérer les pays
  const { data: countriesResponse } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      return await fanafApi.getCountries();
    },
    staleTime: 10 * 60 * 1000, // Cache pendant 10 minutes (rarement mis à jour)
    gcTime: 30 * 60 * 1000, // Garder en cache pendant 30 minutes
  });
  
  const countries = countriesResponse?.data || [];
  
  // Fonction helper pour obtenir le registration_fee_id selon le type de participant
  const getRegistrationFeeId = (participantType: StatutParticipant | ''): string | null => {
    if (!participantType || registrationTypes.length === 0) return null;
    
    // Mapper le type de participant vers le slug
    let slugToFind = '';
    if (participantType === 'membre') {
      slugToFind = 'membre-fanaf';
    } else if (participantType === 'non-membre') {
      slugToFind = 'non-membre';
    } else {
      // Pour VIP ou speaker, utiliser non-membre par défaut (ou selon votre logique)
      slugToFind = 'non-membre';
    }
    
    const registrationType = registrationTypes.find(rt => rt.slug === slugToFind);
    return registrationType?.id || null;
  };
  
  // Fonction helper pour obtenir le country_id depuis le nom du pays
  const getCountryId = (countryName: string): string | null => {
    if (!countryName || countries.length === 0) return null;
    
    // Chercher par nom exact (insensible à la casse)
    const country = countries.find(c => 
      c.name.toLowerCase().trim() === countryName.toLowerCase().trim()
    );
    
    return country?.id || null;
  };
  
  const handleOrganisationSelect = (orgId: string) => {
    setOrganisationSelectionnee(orgId);
    setIsCodeValidated(false); // Réinitialiser la validation du code quand on change d'organisation
    const orgTrouvee = organisationsMembres.find(org => org.id === orgId);
    if (orgTrouvee) {
      const orgAny = orgTrouvee as any;
      setOrganisationData({
        nom: orgTrouvee.nom,
        email: orgTrouvee.email || '',
        contact: orgTrouvee.contact || '',
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

  // Calculer si le formulaire est en cours (pour confirmation de sortie)
  const isFormDirty = useMemo(() => {
    if (inscriptionFinalisee) return false;
    if (etapeActuelle > 1) return true;
    const hasParticipant = Object.values(participantPrincipal).some((v) => String(v || '').length > 0 && v !== 'passeport');
    const hasOrg = Object.values(organisationData).some((v) => String(v || '').length > 0);
    const hasType = !!typeParticipant || !!typeInscription || participantsGroupe.length > 0;
    return hasParticipant || hasOrg || hasType;
  }, [inscriptionFinalisee, etapeActuelle, participantPrincipal, organisationData, typeParticipant, typeInscription, participantsGroupe]);

  // Ref pour permettre la navigation après confirmation
  const navigationConfirmedRef = useRef(false);

  // Event listener pour gérer la confirmation lors de la fermeture/rafraîchissement/quit
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (!isFormDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    
    if (isFormDirty) {
      window.addEventListener('beforeunload', beforeUnload);
    }
    
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [isFormDirty]);

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
    setIsCodeValidated(false); // Réinitialiser la validation du code quand on arrive à l'étape 4
    setEtapeActuelle(4);
  };

  const validerEtape4 = () => {
    console.log('validerEtape4 appelé, typeParticipant:', typeParticipant);
    console.log('organisationSelectionnee:', organisationSelectionnee);
    console.log('organisationData:', organisationData);
    console.log('isCodeValidated:', isCodeValidated);
    
    if (typeParticipant === 'membre') {
      if (!organisationSelectionnee) {
        console.log('Erreur: aucune organisation sélectionnée');
        toast.error('Veuillez sélectionner une organisation membre');
        return;
      }
      
      if (!organisationData.codeOrganisation || organisationData.codeOrganisation.trim() === '') {
        console.log('Erreur: code organisation manquant');
        toast.error('Veuillez saisir le code de l\'organisation');
        return;
      }
      
      // Vérifier que le code fait bien 5 caractères
      if (organisationData.codeOrganisation.length !== 5) {
        console.log('Erreur: code organisation doit faire 5 caractères');
        toast.error('Le code d\'organisation doit contenir exactement 5 caractères');
        return;
      }
      
      // Vérifier que le code a été validé par l'API
      if (!isCodeValidated) {
        console.log('Erreur: code organisation non validé');
        toast.error('Veuillez attendre la validation du code d\'association');
        return;
      }
      
      console.log('Validation membre réussie, passage à l\'étape 5');
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
    // Utiliser les montants de l'API si disponibles, sinon fallback sur les prix hardcodés
    const registrationTypes = registrationTypesResponse?.data || [];
    
    let prixUnitaire = 0;
    
    // Chercher le montant correspondant au type de participant depuis l'API
    if (typeParticipant === 'membre') {
      const membreType = registrationTypes.find((rt: any) => rt.slug === 'membre-fanaf');
      prixUnitaire = membreType ? parseFloat(membreType.amount) : PRIX.membre;
    } else if (typeParticipant === 'non-membre') {
      const nonMembreType = registrationTypes.find((rt: any) => rt.slug === 'non-membre');
      prixUnitaire = nonMembreType ? parseFloat(nonMembreType.amount) : PRIX.nonMembre;
    } else if (typeParticipant === 'vip' || typeParticipant === 'speaker') {
      prixUnitaire = PRIX.vip; // Pas de type VIP dans l'API pour l'instant
    }

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

  const handleNext = async () => {
    console.log('handleNext appelé, etapeActuelle:', etapeActuelle);
    if (etapeActuelle === 1) return validerEtape1();
    if (etapeActuelle === 2) return validerEtape2();
    if (etapeActuelle === 3) return validerEtape3();
    if (etapeActuelle === 4) return validerEtape4();
    if (etapeActuelle === 5) {
      console.log('Appel de finaliserInscription depuis handleNext');
      try {
        await finaliserInscription();
      } catch (error) {
        console.error('Erreur dans handleNext lors de finalisation:', error);
      }
    }
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
    console.log('=== Début de finalisation ===');
    console.log('typeInscription:', typeInscription);
    console.log('typeParticipant:', typeParticipant);
    
    // Vérifier que l'utilisateur est authentifié avant de finaliser
    if (!fanafApi.isAuthenticated()) {
      toast.error('Votre session a expiré. Veuillez vous reconnecter.');
      window.location.href = '/login';
      return;
    }
    
    setLoading(true);

    try {
      // Pour les inscriptions individuelles, utiliser l'API
      if (typeInscription === 'individuel') {
        console.log('Traitement inscription individuelle...');
        console.log('participantPrincipal.pays:', participantPrincipal.pays);
        console.log('countries disponibles:', countries.length);
        
        // Récupérer le country_id depuis le nom du pays
        const countryId = getCountryId(participantPrincipal.pays);
        console.log('countryId trouvé:', countryId);
        if (!countryId) {
          console.error('Erreur: countryId est null');
          toast.error(`Impossible de trouver le pays "${participantPrincipal.pays}". Veuillez vérifier le nom du pays.`);
          setLoading(false);
          return;
        }
        
        console.log('registrationTypes disponibles:', registrationTypes.length);
        console.log('typeParticipant:', typeParticipant);
        
        // Récupérer le registration_fee_id selon le type de participant
        const registrationFeeId = getRegistrationFeeId(typeParticipant);
        console.log('registrationFeeId trouvé:', registrationFeeId);
        if (!registrationFeeId) {
          console.error('Erreur: registrationFeeId est null');
          toast.error('Impossible de déterminer le type d\'inscription. Veuillez réessayer.');
          setLoading(false);
          return;
        }
        
        // Fonction pour nettoyer et valider le numéro de téléphone
        const cleanPhoneNumber = (phone: string): string => {
          if (!phone || phone.trim() === '') {
            throw new Error('Le numéro de téléphone est requis');
          }
          
          const phoneTrimmed = phone.trim();
          
          // Supprimer les espaces, tirets, parenthèses et autres caractères non numériques sauf +
          let cleaned = phoneTrimmed.replace(/[\s\-\(\)\.]/g, '').trim();
          
          // S'assurer qu'il commence par + (code pays)
          if (!cleaned.startsWith('+')) {
            cleaned = `+${cleaned}`;
          }
          
          // Compter les chiffres et les lettres
          const digitsOnly = cleaned.replace(/\D/g, '');
          const lettersOnly = phoneTrimmed.replace(/[^a-zA-ZÀ-ÿ]/g, '').length;
          
          // Vérifier d'abord si c'est du texte de placeholder (beaucoup de lettres, peu ou pas de chiffres)
          if (digitsOnly.length < 4 || (lettersOnly > 5 && digitsOnly.length < 8)) {
            const phoneLower = phoneTrimmed.toLowerCase();
            const placeholderWords = ['exemple', 'example', 'test', 'lorem', 'ipsum', 'dolor', 'eveniet', 'earum', 'placeholder', 'fugiat', 'dolore'];
            const exactPlaceholderPatterns = /^(xx|xxx|aaaa|bbbb|exemple|example|test|lorem|ipsum|placeholder)[\s\-]*$/i;
            
            // Vérifier les patterns exacts de placeholder (ex: "XX XX XX", "exemple", etc.)
            // Ou si c'est principalement du texte (plus de lettres que de chiffres)
            if (exactPlaceholderPatterns.test(phoneTrimmed) || 
                placeholderWords.some(word => phoneLower.includes(word)) ||
                (lettersOnly > digitsOnly.length && digitsOnly.length < 8)) {
              throw new Error(`Le champ téléphone contient du texte invalide. Veuillez saisir un numéro de téléphone valide (ex: +225 01 23 45 67 89)`);
            }
          }
          
          // Vérifier que le numéro contient au moins 8 chiffres (code pays + numéro)
          if (digitsOnly.length < 8) {
            throw new Error(`Le numéro de téléphone "${phoneTrimmed}" n'est pas valide. Il doit contenir au moins 8 chiffres (ex: +225 01 23 45 67 89)`);
          }
          
          // Vérifier que le numéro n'est pas trop long (max 15 chiffres pour format international E.164)
          if (digitsOnly.length > 15) {
            throw new Error(`Le numéro de téléphone "${phoneTrimmed}" est trop long. Il doit contenir au maximum 15 chiffres (format international E.164)`);
          }
          
          // Vérifier qu'il n'y a pas trop de caractères non numériques (signe d'un texte)
          const nonDigits = cleaned.replace(/\d/g, '').replace('+', '').length;
          if (nonDigits > 5) {
            throw new Error(`Le numéro de téléphone "${phoneTrimmed}" semble contenir du texte invalide. Veuillez saisir uniquement des chiffres avec le code pays (ex: +225 01 23 45 67 89)`);
          }
          
          // Vérifier le format du code pays (1 à 3 chiffres après le +)
          // Les codes pays commencent généralement par 1 à 3 chiffres
          const countryCodeMatch = cleaned.match(/^\+\d{1,3}/);
          if (!countryCodeMatch) {
            throw new Error(`Le numéro de téléphone "${phoneTrimmed}" n'a pas un format de code pays valide (ex: +225 pour la Côte d'Ivoire)`);
          }
          
          // Vérifier que le numéro local a au moins 4 chiffres (après le code pays)
          const localNumberLength = digitsOnly.length - countryCodeMatch[0].replace('+', '').length;
          if (localNumberLength < 4) {
            throw new Error(`Le numéro de téléphone "${phoneTrimmed}" est trop court. Le numéro local doit contenir au moins 4 chiffres après le code pays.`);
          }
          
          return cleaned;
        };
        
        // Déterminer la civilité (par défaut 'mr', peut être amélioré avec un champ dans le formulaire)
        // TODO: Ajouter un champ civility dans le formulaire
        const civility = 'mr'; // mr = Monsieur, mrs = Madame, mlle = Mademoiselle
        
        // Valider et nettoyer le numéro de téléphone du participant principal
        console.log('Validation du numéro de téléphone...');
        console.log('Téléphone brut:', participantPrincipal.telephone);
        let participantPhone: string;
        try {
          participantPhone = cleanPhoneNumber(participantPrincipal.telephone);
          console.log('Numéro de téléphone validé:', participantPhone);
          setTelephoneError(null); // Réinitialiser l'erreur si la validation réussit
          
          // Vérifier que le téléphone nettoyé n'est pas vide
          if (!participantPhone || participantPhone.trim() === '') {
            throw new Error('Le numéro de téléphone ne peut pas être vide après nettoyage.');
          }
        } catch (error) {
          console.error('Erreur validation téléphone:', error);
          const errorMessage = error instanceof Error ? error.message : 'Le numéro de téléphone du participant principal n\'est pas valide.';
          setTelephoneError(errorMessage);
          toast.error(errorMessage);
          setLoading(false);
          return;
        }
        
        // Préparer les données pour l'API
        const registrationData: any = {
          civility,
          first_name: participantPrincipal.prenom,
          last_name: participantPrincipal.nom,
          email: participantPrincipal.email,
          country_id: countryId,
          phone: participantPhone,
          registration_fee_id: registrationFeeId,
          registration_type: 'individual',
          is_association: false,
        };
        
        // Ajouter passport_number seulement si présent
        if (participantPrincipal.numeroIdentite) {
          registrationData.passport_number = participantPrincipal.numeroIdentite;
        }
        // TODO: Ajouter un champ job_title dans le formulaire

        // Ajouter les informations de l'entreprise si disponibles
        if (organisationData.nom) {
          // Utiliser le même pays pour l'entreprise par défaut, ou permettre un pays différent si nécessaire
          const companyCountryId = countryId; // Pour l'instant, utiliser le même pays que le participant
          
          // Valider et nettoyer le numéro de téléphone de l'entreprise si présent
          let companyPhone: string | undefined;
          if (organisationData.contact) {
            try {
              companyPhone = cleanPhoneNumber(organisationData.contact);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Le numéro de téléphone de l\'entreprise n\'est pas valide.');
              setLoading(false);
              return;
            }
          }
          
          // Vérifier que company_sector est présent si company_name est présent
          if (!organisationData.domaineActivite || organisationData.domaineActivite.trim() === '') {
            toast.error('Le domaine d\'activité est obligatoire lorsque le nom de l\'entreprise est renseigné.');
            setLoading(false);
            return;
          }
          
          registrationData.company_name = organisationData.nom;
          registrationData.company_country_id = companyCountryId;
          registrationData.company_sector = organisationData.domaineActivite.trim();
          registrationData.company_email = organisationData.email;
          registrationData.company_phone = companyPhone;
          registrationData.company_address = organisationData.adresse;
          // Ne pas ajouter company_website et company_description si undefined
          // TODO: Ajouter un champ website dans le formulaire si nécessaire
          // TODO: Ajouter un champ description dans le formulaire si nécessaire
        }
        
        // Nettoyer les données : supprimer les valeurs undefined du payload
        console.log('Nettoyage des données...');
        const cleanRegistrationData = Object.fromEntries(
          Object.entries(registrationData).filter(([_, value]) => value !== undefined)
        ) as {
          civility: string;
          first_name: string;
          last_name: string;
          email: string;
          country_id: string;
          phone: string;
          registration_fee_id: string;
          registration_type: 'individual' | 'group';
          passport_number?: string;
          job_title?: string;
          is_association?: boolean;
          company_name?: string;
          company_country_id?: string;
          company_sector?: string;
          company_description?: string;
          company_website?: string;
          company_phone?: string;
          company_email?: string;
          company_address?: string;
        };
        console.log('Données nettoyées:', cleanRegistrationData);
        console.log('Téléphone final:', cleanRegistrationData.phone);
        console.log('Company sector:', cleanRegistrationData.company_sector);
        console.log('Company name:', cleanRegistrationData.company_name);

        try {
          // Debug: log des données envoyées
          console.log('Données envoyées à l\'API simple:', JSON.stringify(cleanRegistrationData, null, 2));
          console.log('Appel API createRegistration...');
          
          // Appel à l'API pour créer l'inscription
          const response = await fanafApi.createRegistration(cleanRegistrationData);
          console.log('Réponse API reçue:', response);
          
          console.log('Réponse API simple:', response);
          console.log('Montant dans la réponse API:', {
            amount: response?.data?.amount,
            total_amount: response?.data?.total_amount,
            montant_total: response?.data?.montant_total,
            registration_fee: response?.data?.registration_fee,
            fee_amount: response?.data?.fee_amount,
            fullResponse: response
          });
          
          toast.success('Inscription créée avec succès via l\'API !');
          
          // Créer un objet Participant pour l'affichage local (compatibilité avec le reste de l'app)
          const organisationId = `org-${Date.now()}`;
          const organisation: Organisation = {
            id: organisationId,
            nom: organisationData.nom || '',
            contact: organisationData.contact || '',
            email: organisationData.email || '',
            pays: participantPrincipal.pays,
            dateCreation: new Date().toISOString(),
            statut: typeParticipant === 'membre' ? 'membre' : 'non-membre'
          };

          const participantPrincipalId = response?.data?.id || `part-${Date.now()}`;
          const referencePrincipal = response?.data?.reference || response?.data?.registration_number || `REF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
          
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
            statutInscription: 'non-finalisée', // L'API gère le statut
            dateInscription: new Date().toISOString(),
          };

          const numeroFacture = response?.data?.invoice_number || `PRO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
          
          // Utiliser le montant retourné par l'API au lieu du calcul local
          // L'API peut retourner le montant dans différents champs : amount, total_amount, montant_total, etc.
          const montantAPI = response?.data?.amount 
            || response?.data?.total_amount 
            || response?.data?.montant_total 
            || response?.data?.registration_fee?.amount
            || response?.data?.fee_amount
            || calculerMontantTotal(); // Fallback sur le calcul local si non trouvé

          setInscriptionFinalisee({
            participants: [principalParticipant],
            organisation,
            numeroFacture,
            montantTotal: typeof montantAPI === 'string' ? parseFloat(montantAPI) : montantAPI
          });

          return; // Sortir après succès de l'inscription individuelle
        } catch (apiError: any) {
          console.error('Erreur API lors de la création de l\'inscription:', apiError);
          console.error('Structure de l\'erreur:', {
            message: apiError?.message,
            response: apiError?.response,
            status: apiError?.status,
            data: apiError?.data,
          });
          
          // Extraire un message d'erreur plus détaillé
          let errorMessage = 'Erreur lors de la création de l\'inscription via l\'API';
          
          // Essayer d'extraire le message depuis différentes structures d'erreur
          // Vérifier d'abord si l'erreur contient une réponse HTTP avec des données
          let errorData: any = null;
          
          if (apiError?.response?.data) {
            errorData = apiError.response.data;
          } 
          // Parfois l'erreur peut être directement parsée
          else if (apiError?.response) {
            errorData = apiError.response;
          }
          else if (typeof apiError === 'object' && apiError !== null) {
            // Chercher directement dans l'objet d'erreur
            if ('data' in apiError) {
              errorData = apiError.data;
            } else if ('errors' in apiError) {
              errorData = apiError;
            }
          }
          
          console.log('errorData extrait:', errorData);
          
          if (errorData) {
            // Structure JSON API avec errors array
            if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
              // Extraire les messages d'erreur de validation
              const validationErrors: string[] = [];
              
              errorData.errors.forEach((err: any) => {
                // Si detail est un objet avec des champs de validation (comme phone, company_sector, etc.)
                if (err.detail && typeof err.detail === 'object') {
                  // Parcourir les clés du détail pour extraire les messages de validation
                  Object.entries(err.detail).forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                      messages.forEach((msg: any) => {
                        validationErrors.push(`${field}: ${msg}`);
                      });
                    } else if (typeof messages === 'string') {
                      validationErrors.push(`${field}: ${messages}`);
                    } else if (typeof messages === 'object' && messages !== null) {
                      // Si messages est un objet (comme {is_valid: false})
                      Object.entries(messages).forEach(([key, value]) => {
                        validationErrors.push(`${field}: ${key} = ${value}`);
                      });
                    }
                  });
                } else {
                  // Sinon utiliser les autres champs
                  const msg = err.detail || err.title || err.message || String(err);
                  if (msg) validationErrors.push(msg);
                }
              });
              
              errorMessage = validationErrors.length > 0 
                ? validationErrors.join('. ')
                : 'Erreur de validation des données';
            } 
            // Structure standard avec message
            else if (errorData.message) {
              errorMessage = typeof errorData.message === 'string' ? errorData.message : String(errorData.message);
            }
            // Structure avec error
            else if (errorData.error) {
              errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error.message || String(errorData.error);
            }
          }
          
          // En dernier recours, utiliser le message de l'erreur
          // Parfois le message peut être une chaîne JSON qu'il faut parser
          if (!errorMessage || errorMessage === 'Erreur lors de la création de l\'inscription via l\'API') {
            if (apiError?.message) {
              try {
                const parsed = JSON.parse(apiError.message);
                if (parsed.message) {
                  errorMessage = parsed.message;
                } else if (parsed.error) {
                  errorMessage = parsed.error;
                }
              } catch {
                errorMessage = apiError.message;
              }
            }
          }
          
          // Améliorer le message pour les erreurs de clé étrangère
          if (errorMessage && (errorMessage.includes('Foreign key violation') || errorMessage.includes('foreign key constraint'))) {
            if (errorMessage.includes('created_by')) {
              errorMessage = 'Erreur d\'authentification: Votre session semble invalide. Veuillez vous déconnecter et vous reconnecter, puis réessayer.';
            } else {
              errorMessage = 'Erreur de données: Une référence invalide a été détectée. Veuillez vérifier les informations saisies et réessayer.';
            }
          }
          
          console.error('Message d\'erreur final:', errorMessage);
          toast.error(errorMessage || 'Une erreur est survenue lors de la finalisation de l\'inscription.', {
            duration: 6000, // Afficher plus longtemps pour les erreurs importantes
          });
          
          setLoading(false);
          return;
        }
      }

      // Pour les inscriptions de groupe, utiliser l'API bulk
      if (typeInscription === 'groupe') {
        console.log('Traitement inscription groupée...');
        // Récupérer le country_id depuis le nom du pays
        const countryId = getCountryId(participantPrincipal.pays);
        if (!countryId) {
          toast.error(`Impossible de trouver le pays "${participantPrincipal.pays}". Veuillez vérifier le nom du pays.`);
          setLoading(false);
          return;
        }
        
        // Récupérer le registration_fee_id selon le type de participant
        const registrationFeeId = getRegistrationFeeId(typeParticipant);
        if (!registrationFeeId) {
          toast.error('Impossible de déterminer le type d\'inscription. Veuillez réessayer.');
          setLoading(false);
          return;
        }
        
        // Déterminer la civilité (par défaut 'mr', peut être amélioré avec un champ dans le formulaire)
        // TODO: Ajouter un champ civility dans le formulaire
        const mapCivility = (civility: string): string => {
          const lower = civility.toLowerCase();
          if (lower === 'm' || lower === 'mr' || lower === 'monsieur') return 'mr';
          if (lower === 'mme' || lower === 'mrs' || lower === 'madame') return 'mrs';
          if (lower === 'mlle' || lower === 'mademoiselle') return 'mlle';
          return 'mr'; // Par défaut
        };
        
        const defaultCivility = 'mr'; // Par défaut pour le participant principal
        const defaultCivilityGroupe = 'mrs'; // Par défaut pour les autres participants
        
        // Préparer le tableau des utilisateurs
        const users: Array<{
          civility: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          country_id: string;
          passport_number?: string;
          job_title?: string;
          is_lead: boolean;
        }> = [];
        
        // Fonction pour nettoyer et valider le numéro de téléphone
        const cleanPhoneNumber = (phone: string): string => {
          if (!phone || phone.trim() === '') {
            throw new Error('Le numéro de téléphone est requis');
          }
          
          const phoneTrimmed = phone.trim();
          
          // Supprimer les espaces, tirets, parenthèses et autres caractères non numériques sauf +
          let cleaned = phoneTrimmed.replace(/[\s\-\(\)\.]/g, '').trim();
          
          // S'assurer qu'il commence par + (code pays)
          if (!cleaned.startsWith('+')) {
            cleaned = `+${cleaned}`;
          }
          
          // Compter les chiffres et les lettres
          const digitsOnly = cleaned.replace(/\D/g, '');
          const lettersOnly = phoneTrimmed.replace(/[^a-zA-ZÀ-ÿ]/g, '').length;
          
          // Vérifier d'abord si c'est du texte de placeholder (beaucoup de lettres, peu ou pas de chiffres)
          if (digitsOnly.length < 4 || (lettersOnly > 5 && digitsOnly.length < 8)) {
            const phoneLower = phoneTrimmed.toLowerCase();
            const placeholderWords = ['exemple', 'example', 'test', 'lorem', 'ipsum', 'dolor', 'eveniet', 'earum', 'placeholder', 'fugiat', 'dolore'];
            const exactPlaceholderPatterns = /^(xx|xxx|aaaa|bbbb|exemple|example|test|lorem|ipsum|placeholder)[\s\-]*$/i;
            
            // Vérifier les patterns exacts de placeholder (ex: "XX XX XX", "exemple", etc.)
            // Ou si c'est principalement du texte (plus de lettres que de chiffres)
            if (exactPlaceholderPatterns.test(phoneTrimmed) || 
                placeholderWords.some(word => phoneLower.includes(word)) ||
                (lettersOnly > digitsOnly.length && digitsOnly.length < 8)) {
              throw new Error(`Le champ téléphone contient du texte invalide. Veuillez saisir un numéro de téléphone valide (ex: +225 01 23 45 67 89)`);
            }
          }
          
          // Vérifier que le numéro contient au moins 8 chiffres (code pays + numéro)
          if (digitsOnly.length < 8) {
            throw new Error(`Le numéro de téléphone "${phoneTrimmed}" n'est pas valide. Il doit contenir au moins 8 chiffres (ex: +225 01 23 45 67 89)`);
          }
          
          // Vérifier qu'il n'y a pas trop de caractères non numériques (signe d'un texte)
          const nonDigits = cleaned.replace(/\d/g, '').replace('+', '').length;
          if (nonDigits > 5) {
            throw new Error(`Le numéro de téléphone "${phoneTrimmed}" semble contenir du texte invalide. Veuillez saisir uniquement des chiffres avec le code pays (ex: +225 01 23 45 67 89)`);
          }
          
          return cleaned;
        };
        
        // Ajouter le participant principal (is_lead: true)
        let principalPhone: string;
        try {
          principalPhone = cleanPhoneNumber(participantPrincipal.telephone);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Le numéro de téléphone du participant principal n\'est pas valide.');
          setLoading(false);
          return;
        }
        
        const principalUser: any = {
          civility: mapCivility(defaultCivility),
          first_name: participantPrincipal.prenom,
          last_name: participantPrincipal.nom,
          email: participantPrincipal.email,
          phone: principalPhone,
          country_id: countryId,
          is_lead: true,
        };
        
        // Ajouter passport_number seulement si présent
        if (participantPrincipal.numeroIdentite) {
          principalUser.passport_number = participantPrincipal.numeroIdentite;
        }
        // TODO: Ajouter un champ job_title dans le formulaire
        
        users.push(principalUser);
        
        // Ajouter les participants du groupe (is_lead: false)
        participantsGroupe.forEach((p, index) => {
          // Utiliser le contact de l'organisation ou celui du participant principal
          const phoneToUse = organisationData.contact || participantPrincipal.telephone;
          
          let groupPhone: string;
          try {
            groupPhone = cleanPhoneNumber(phoneToUse);
          } catch (error) {
            toast.error(`Le numéro de téléphone du participant ${index + 2} n'est pas valide: ${error instanceof Error ? error.message : 'Format invalide'}`);
            setLoading(false);
            return;
          }
          
          // Générer un numéro de passeport unique pour chaque participant du groupe
          // Utiliser le numéro du participant principal comme base et ajouter un suffixe unique
          let passportNumber: string;
          if (participantPrincipal.numeroIdentite) {
            // Ajouter un suffixe unique basé sur l'index du participant (ex: ABC123 -> ABC123-001)
            const baseNumber = participantPrincipal.numeroIdentite;
            const suffix = String(index + 1).padStart(3, '0'); // 001, 002, 003, etc.
            passportNumber = `${baseNumber}-${suffix}`;
          } else {
            // Si le participant principal n'a pas de numéro, générer un numéro temporaire
            // TODO: Ajouter un champ passport_number spécifique pour chaque participant du groupe dans le formulaire
            passportNumber = `TEMP-${Date.now()}-${index}`;
          }
          
          const groupUser: any = {
            civility: mapCivility(defaultCivilityGroupe),
            first_name: p.prenom,
            last_name: p.nom,
            email: p.email,
            phone: groupPhone,
            country_id: countryId, // Utiliser le même pays que le participant principal (pourrait être étendu plus tard)
            is_lead: false,
            passport_number: passportNumber,
          };
          
          // TODO: Ajouter un champ job_title pour chaque participant du groupe
          
          users.push(groupUser);
        });
        
        // Préparer les données pour l'API bulk
        const bulkRegistrationData: any = {
          registration_fee_id: registrationFeeId,
          registration_type: 'group',
          is_association: false, // TODO: Déterminer si c'est une association selon le type de participant
          users,
        };
        
        // Ajouter les informations de l'entreprise si disponibles
        if (organisationData.nom) {
          // Utiliser le même pays pour l'entreprise par défaut
          bulkRegistrationData.company_name = organisationData.nom;
          bulkRegistrationData.company_country_id = countryId;
          bulkRegistrationData.company_sector = organisationData.domaineActivite;
          bulkRegistrationData.company_email = organisationData.email;
          bulkRegistrationData.company_phone = organisationData.contact;
          bulkRegistrationData.company_address = organisationData.adresse;
          // Ne pas ajouter company_website et company_description si undefined
          // TODO: Ajouter un champ website dans le formulaire si nécessaire
          // TODO: Ajouter un champ description dans le formulaire si nécessaire
        }
        
        // Nettoyer les données : supprimer les valeurs undefined du payload
        const cleanBulkData = Object.fromEntries(
          Object.entries(bulkRegistrationData).filter(([_, value]) => value !== undefined)
        ) as {
          registration_fee_id: string;
          registration_type: 'group';
          is_association?: boolean;
          company_name?: string;
          company_country_id?: string;
          company_sector?: string;
          company_description?: string;
          company_website?: string;
          company_phone?: string;
          company_email?: string;
          company_address?: string;
          users: Array<{
            civility: string;
            first_name: string;
            last_name: string;
            email: string;
            phone: string;
            country_id: string;
            passport_number?: string;
            job_title?: string;
            is_lead: boolean;
          }>;
        };
        
        // Nettoyer aussi les users : supprimer les champs undefined
        if (cleanBulkData.users) {
          cleanBulkData.users = cleanBulkData.users.map((user: any) => 
            Object.fromEntries(
              Object.entries(user).filter(([_, value]) => value !== undefined)
            ) as {
              civility: string;
              first_name: string;
              last_name: string;
              email: string;
              phone: string;
              country_id: string;
              passport_number?: string;
              job_title?: string;
              is_lead: boolean;
            }
          );
        }
        
        try {
          // Debug: log des données envoyées
          console.log('Données envoyées à l\'API bulk:', JSON.stringify(cleanBulkData, null, 2));
          
          // Appel à l'API pour créer l'inscription groupée
          const response = await fanafApi.createBulkRegistration(cleanBulkData);
          
          console.log('Réponse API bulk:', response);
          console.log('Montant dans la réponse API:', {
            amount: response?.data?.amount,
            total_amount: response?.data?.total_amount,
            montant_total: response?.data?.montant_total,
            registration_fee: response?.data?.registration_fee,
            fee_amount: response?.data?.fee_amount,
            fullResponse: response
          });
          
          toast.success('Inscription groupée créée avec succès via l\'API !');
          
          // Créer des objets Participant pour l'affichage local (compatibilité avec le reste de l'app)
          const organisationId = `org-${Date.now()}`;
          const organisation: Organisation = {
            id: organisationId,
            nom: organisationData.nom || '',
            contact: organisationData.contact || '',
            email: organisationData.email || '',
            pays: participantPrincipal.pays,
            dateCreation: new Date().toISOString(),
            statut: typeParticipant === 'membre' ? 'membre' : 'non-membre'
          };
          
          const participants: Participant[] = [];
          const groupeId = `grp-${Date.now()}`;
          
          // Créer le participant principal depuis la réponse de l'API
          const principalFromApi = response?.data?.users?.find((u: any) => u.is_lead) || users[0];
          const participantPrincipalId = principalFromApi?.id || `part-${Date.now()}`;
          const referencePrincipal = principalFromApi?.reference || principalFromApi?.registration_number || `REF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
          
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
            statutInscription: 'non-finalisée', // L'API gère le statut
            dateInscription: new Date().toISOString(),
            groupeId,
            nomGroupe: `Groupe ${organisationData.nom}`
          };
          
          participants.push(principalParticipant);
          
          // Créer les autres participants depuis la réponse de l'API
          const otherUsersFromApi = response?.data?.users?.filter((u: any) => !u.is_lead) || users.slice(1);
          participantsGroupe.forEach((p, index) => {
            const userFromApi = otherUsersFromApi[index] || users[index + 1];
            const participantId = userFromApi?.id || `part-${Date.now()}-${index + 1}`;
            const reference = userFromApi?.reference || userFromApi?.registration_number || `REF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
            
            const participant: Participant = {
              id: participantId,
              reference,
              nom: p.nom,
              prenom: p.prenom,
              email: p.email,
              telephone: organisationData.contact || participantPrincipal.telephone,
              pays: participantPrincipal.pays,
              organisationId,
              statut: typeParticipant as StatutParticipant,
              statutInscription: 'non-finalisée', // L'API gère le statut
              dateInscription: new Date().toISOString(),
              groupeId,
              nomGroupe: `Groupe ${organisationData.nom}`
            };
            
            participants.push(participant);
          });
          
          const numeroFacture = response?.data?.invoice_number || `PRO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
          
          // Utiliser le montant retourné par l'API au lieu du calcul local
          // L'API peut retourner le montant dans différents champs : amount, total_amount, montant_total, etc.
          const montantAPI = response?.data?.amount 
            || response?.data?.total_amount 
            || response?.data?.montant_total 
            || response?.data?.registration_fee?.amount
            || response?.data?.fee_amount
            || calculerMontantTotal(); // Fallback sur le calcul local si non trouvé

          setInscriptionFinalisee({
            participants,
            organisation,
            numeroFacture,
            montantTotal: typeof montantAPI === 'string' ? parseFloat(montantAPI) : montantAPI
          });

          return; // Sortir après succès de l'inscription groupée
        } catch (apiError: any) {
          console.error('Erreur API lors de la création de l\'inscription groupée:', apiError);
          const errorMessage = apiError?.message || 'Erreur lors de la création de l\'inscription groupée via l\'API';
          toast.error(errorMessage);
          throw apiError; // Re-lancer pour être capturé par le catch externe
        }
      }

      // Fallback: Si ce n'est ni individuel ni groupe (ne devrait pas arriver)
      console.error('Type d\'inscription non reconnu:', typeInscription);
      toast.error('Type d\'inscription non reconnu');
      setLoading(false);
    } catch (error) {
      console.error('=== Erreur lors de la finalisation ===', error);
      
      // Afficher un message d'erreur plus détaillé
      let errorMessage = 'Erreur lors de la finalisation de l\'inscription';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Message d\'erreur:', error.message);
        console.error('Stack:', error.stack);
        
        // Si c'est une erreur d'authentification, afficher un message spécifique
        if (errorMessage.includes('Identifiants invalides') || errorMessage.includes('401') || errorMessage.includes('403')) {
          errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
          // La redirection sera gérée par fanafApi.ts
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      toast.error(errorMessage);
    } finally {
      console.log('=== Fin de finalisation (finally) ===');
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
                  onChange={(patch: Partial<ParticipantPrincipalFormData>) => {
                    setParticipantPrincipal({ ...participantPrincipal, ...patch });
                  }}
                  telephoneError={telephoneError}
                  onTelephoneChange={(value) => {
                    const error = validateTelephone(value);
                    setTelephoneError(error);
                  }}
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
                  onCodeValidated={setIsCodeValidated}
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

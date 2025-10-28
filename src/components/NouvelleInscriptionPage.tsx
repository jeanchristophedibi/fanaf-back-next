import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { CheckCircle, ChevronLeft, ChevronRight, Download, User, Users, Building2, FileText, X, Plus } from 'lucide-react';
import { Participant, Organisation } from './data/mockData';
import { ProformaInvoiceGenerator } from './ProformaInvoiceGenerator';
import html2canvas from 'html2canvas';

interface ParticipantFormData {
  nom: string;
  prenom: string;
  email: string;
}

interface OrganisationFormData {
  nom: string;
  contact: string;
  email: string;
  secteurActivite: string;
}

export const NouvelleInscriptionPage = () => {
  const [etapeActuelle, setEtapeActuelle] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Étape 1 : Type d'inscription
  const [typeInscription, setTypeInscription] = useState<'individuel' | 'groupe' | ''>('');
  const [participantsGroupe, setParticipantsGroupe] = useState<ParticipantFormData[]>([]);

  // Étape 2 : Informations organisation
  const [organisationData, setOrganisationData] = useState<OrganisationFormData>({
    nom: '',
    contact: '',
    email: '',
    secteurActivite: ''
  });

  // Inscription finalisée
  const [inscriptionFinalisee, setInscriptionFinalisee] = useState<{
    participants: Participant[];
    organisation: Organisation;
    numeroFacture: string;
    montantTotal: number;
  } | null>(null);

  const etapes = [
    { numero: 1, titre: 'Type d\'inscription', icon: Users },
    { numero: 2, titre: 'Organisation', icon: Building2 },
    { numero: 3, titre: 'Récapitulatif', icon: FileText }
  ];

  const PRIX_NON_MEMBRE = 400000;

  // Ajouter un participant au groupe
  const ajouterParticipantGroupe = () => {
    const newParticipant: ParticipantFormData = {
      nom: '',
      prenom: '',
      email: ''
    };
    setParticipantsGroupe([...participantsGroupe, newParticipant]);
  };

  // Supprimer un participant du groupe
  const supprimerParticipantGroupe = (index: number) => {
    setParticipantsGroupe(participantsGroupe.filter((_, i) => i !== index));
  };

  // Mettre à jour un participant du groupe
  const updateParticipantGroupe = (index: number, field: keyof ParticipantFormData, value: string) => {
    const updated = [...participantsGroupe];
    updated[index] = { ...updated[index], [field]: value };
    setParticipantsGroupe(updated);
  };

  // Valider étape 1
  const validerEtape1 = () => {
    if (!typeInscription) {
      toast.error('Veuillez sélectionner un type d\'inscription');
      return;
    }

    if (typeInscription === 'groupe') {
      if (participantsGroupe.length === 0) {
        toast.error('Veuillez ajouter au moins un participant pour l\'inscription groupée');
        return;
      }

      // Vérifier que tous les participants sont remplis
      const incomplete = participantsGroupe.some(p => 
        !p.nom || !p.prenom || !p.email
      );

      if (incomplete) {
        toast.error('Veuillez remplir toutes les informations des participants');
        return;
      }

      // Vérifier les emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmail = participantsGroupe.some(p => !emailRegex.test(p.email));
      
      if (invalidEmail) {
        toast.error('Certaines adresses email ne sont pas valides');
        return;
      }
    }

    toast.success('Type d\'inscription validé');
    setEtapeActuelle(2);
  };

  // Valider étape 2
  const validerEtape2 = () => {
    if (!organisationData.nom || !organisationData.contact || !organisationData.email || !organisationData.secteurActivite) {
      toast.error('Veuillez remplir toutes les informations de l\'organisation');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(organisationData.email)) {
      toast.error('Adresse email de l\'organisation invalide');
      return;
    }

    toast.success('Informations de l\'organisation validées');
    setEtapeActuelle(3);
  };

  // Calculer le montant total
  const calculerMontantTotal = () => {
    if (typeInscription === 'individuel') {
      return PRIX_NON_MEMBRE;
    } else {
      return participantsGroupe.length * PRIX_NON_MEMBRE;
    }
  };

  // Finaliser l'inscription
  const finaliserInscription = async () => {
    setLoading(true);

    try {
      // Créer l'organisation
      const organisationId = `org-${Date.now()}`;
      const organisation: Organisation = {
        id: organisationId,
        nom: organisationData.nom,
        contact: organisationData.contact,
        email: organisationData.email,
        pays: 'Non spécifié', // À compléter si besoin
        dateCreation: new Date().toISOString(),
        statut: 'non-membre',
        secteurActivite: organisationData.secteurActivite
      };

      const participants: Participant[] = [];
      const groupeId = typeInscription === 'groupe' ? `grp-${Date.now()}` : undefined;

      if (typeInscription === 'groupe') {
        // Créer tous les participants du groupe
        participantsGroupe.forEach((p, index) => {
          const participantId = `part-${Date.now()}-${index}`;
          const reference = `REF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
          
          const participant: Participant = {
            id: participantId,
            reference,
            nom: p.nom,
            prenom: p.prenom,
            email: p.email,
            telephone: organisationData.contact, // Utiliser le contact de l'organisation par défaut
            pays: 'Non spécifié',
            organisationId,
            statut: 'non-membre',
            statutInscription: 'non-finalisée',
            dateInscription: new Date().toISOString(),
            groupeId,
            nomGroupe: `Groupe ${organisationData.nom}`
          };
          
          participants.push(participant);
        });
      } else {
        // Inscription individuelle - Utiliser les infos de l'organisation comme participant principal
        const participantId = `part-${Date.now()}`;
        const reference = `REF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
        
        const participant: Participant = {
          id: participantId,
          reference,
          nom: organisationData.nom.split(' ')[0] || organisationData.nom, // Simplification
          prenom: organisationData.nom.split(' ')[1] || '',
          email: organisationData.email,
          telephone: organisationData.contact,
          pays: 'Non spécifié',
          organisationId,
          statut: 'non-membre',
          statutInscription: 'non-finalisée',
          dateInscription: new Date().toISOString()
        };
        
        participants.push(participant);
      }

      // Sauvegarder dans localStorage
      const existingParticipants = JSON.parse(localStorage.getItem('dynamicParticipants') || '[]');
      const existingOrganisations = JSON.parse(localStorage.getItem('mockOrganisations') || '[]');
      
      existingParticipants.push(...participants);
      existingOrganisations.push(organisation);

      localStorage.setItem('dynamicParticipants', JSON.stringify(existingParticipants));
      localStorage.setItem('mockOrganisations', JSON.stringify(existingOrganisations));
      
      // Déclencher événement de mise à jour
      window.dispatchEvent(new Event('storage'));

      // Générer numéro de facture proforma
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

  // Télécharger la facture
  const telechargerFacture = async () => {
    if (!inscriptionFinalisee) return;

    const element = document.getElementById('facture-proforma-preview');
    if (!element) return;

    toast.info('Génération de la facture en cours...');

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `facture-proforma-${inscriptionFinalisee.numeroFacture}.png`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success('Facture téléchargée avec succès');
        }
      });
    } catch (error) {
      console.error('Erreur génération facture:', error);
      toast.error('Erreur lors de la génération de la facture');
    }
  };

  // Nouvelle inscription
  const nouvelleInscription = () => {
    setEtapeActuelle(1);
    setTypeInscription('');
    setParticipantsGroupe([]);
    setOrganisationData({
      nom: '',
      contact: '',
      email: '',
      secteurActivite: ''
    });
    setInscriptionFinalisee(null);
  };

  // Page de confirmation
  if (inscriptionFinalisee) {
    return (
      <div className="p-6 space-y-6">
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl text-gray-900">Inscription créée avec succès !</h2>
              <p className="text-gray-600">
                Numéro de facture: <span className="text-gray-900">{inscriptionFinalisee.numeroFacture}</span>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Statut: <span className="text-amber-600">En attente de paiement</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg text-gray-900">Facture Proforma</h3>
            <Button onClick={telechargerFacture} className="bg-amber-600 hover:bg-amber-700">
              <Download className="w-4 h-4 mr-2" />
              Télécharger la facture
            </Button>
          </div>

          <div id="facture-proforma-preview" className="border rounded-lg overflow-hidden">
            <ProformaInvoiceGenerator 
              participant={inscriptionFinalisee.participants[0]}
              organisation={inscriptionFinalisee.organisation}
              numeroFacture={inscriptionFinalisee.numeroFacture}
            />
          </div>
        </Card>

        <div className="flex gap-4">
          <Button onClick={nouvelleInscription} className="bg-amber-600 hover:bg-amber-700">
            Nouvelle inscription
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Indicateur d'étapes */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          {etapes.map((etape, index) => {
            const Icon = etape.icon;
            const isActive = etapeActuelle === etape.numero;
            const isCompleted = etapeActuelle > etape.numero;

            return (
              <div key={etape.numero} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2
                    ${isCompleted ? 'bg-green-600' : isActive ? 'bg-amber-600' : 'bg-gray-200'}
                    transition-colors duration-300
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    )}
                  </div>
                  <p className={`text-sm text-center ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                    {etape.titre}
                  </p>
                </div>
                
                {index < etapes.length - 1 && (
                  <div className={`h-1 flex-1 mx-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Formulaire */}
      <motion.div
        key={etapeActuelle}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <Card className="p-6">
          {/* Étape 1 : Type d'inscription */}
          {etapeActuelle === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl text-gray-900 mb-2">Type d'inscription</h2>
                <p className="text-gray-600">Choisissez le type d'inscription (Individuelle ou Groupée)</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => setTypeInscription('individuel')}
                  className={`p-8 border-2 rounded-lg transition-all ${
                    typeInscription === 'individuel'
                      ? 'border-amber-600 bg-amber-50 shadow-lg'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      typeInscription === 'individuel' ? 'bg-amber-600' : 'bg-gray-200'
                    }`}>
                      <User className={`w-10 h-10 ${typeInscription === 'individuel' ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <h3 className="text-lg text-gray-900 mb-2">Inscription Individuelle</h3>
                    <p className="text-sm text-gray-600">Pour un seul participant</p>
                    <p className="text-amber-600 mt-4">400 000 FCFA</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTypeInscription('groupe')}
                  className={`p-8 border-2 rounded-lg transition-all ${
                    typeInscription === 'groupe'
                      ? 'border-amber-600 bg-amber-50 shadow-lg'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      typeInscription === 'groupe' ? 'bg-amber-600' : 'bg-gray-200'
                    }`}>
                      <Users className={`w-10 h-10 ${typeInscription === 'groupe' ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <h3 className="text-lg text-gray-900 mb-2">Inscription Groupée</h3>
                    <p className="text-sm text-gray-600">Pour plusieurs participants</p>
                    <p className="text-amber-600 mt-4">400 000 FCFA / participant</p>
                  </div>
                </button>
              </div>

              {/* Formulaire pour inscription groupée */}
              {typeInscription === 'groupe' && (
                <div className="space-y-4 mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg text-gray-900">Liste des participants</h3>
                      <p className="text-sm text-gray-600">Ajoutez les informations de chaque participant</p>
                    </div>
                    <Button 
                      type="button"
                      onClick={ajouterParticipantGroupe}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un participant
                    </Button>
                  </div>

                  {participantsGroupe.length === 0 && (
                    <Card className="p-8 bg-gray-50 border-2 border-dashed">
                      <div className="text-center text-gray-600">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>Aucun participant ajouté</p>
                        <p className="text-sm mt-1">Cliquez sur "Ajouter un participant" pour commencer</p>
                      </div>
                    </Card>
                  )}

                  {participantsGroupe.map((participant, index) => (
                    <Card key={index} className="p-4 bg-gray-50 border-2 border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-gray-900">Participant {index + 1}</h4>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => supprimerParticipantGroupe(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Nom *</Label>
                          <Input 
                            value={participant.nom}
                            onChange={(e) => updateParticipantGroupe(index, 'nom', e.target.value)}
                            placeholder="Nom de famille"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Prénom *</Label>
                          <Input 
                            value={participant.prenom}
                            onChange={(e) => updateParticipantGroupe(index, 'prenom', e.target.value)}
                            placeholder="Prénom"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Adresse e-mail *</Label>
                          <Input 
                            type="email"
                            value={participant.email}
                            onChange={(e) => updateParticipantGroupe(index, 'email', e.target.value)}
                            placeholder="email@exemple.com"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button 
                  type="button"
                  onClick={validerEtape1} 
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Suivant <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Étape 2 : Informations sur l'organisation */}
          {etapeActuelle === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl text-gray-900 mb-2">Informations sur l'organisation</h2>
                <p className="text-gray-600">Renseignez les informations de l'organisation du participant</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nom de l'organisation *</Label>
                  <Input 
                    value={organisationData.nom}
                    onChange={(e) => setOrganisationData({...organisationData, nom: e.target.value})}
                    placeholder="Nom de l'entreprise ou organisation"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contact / Téléphone *</Label>
                  <Input 
                    value={organisationData.contact}
                    onChange={(e) => setOrganisationData({...organisationData, contact: e.target.value})}
                    placeholder="+225 XX XX XX XX XX"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Adresse e-mail de l'organisation *</Label>
                  <Input 
                    type="email"
                    value={organisationData.email}
                    onChange={(e) => setOrganisationData({...organisationData, email: e.target.value})}
                    placeholder="contact@organisation.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Secteur d'activité *</Label>
                  <Select 
                    value={organisationData.secteurActivite}
                    onValueChange={(value) => setOrganisationData({...organisationData, secteurActivite: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assurance">Assurance</SelectItem>
                      <SelectItem value="reassurance">Réassurance</SelectItem>
                      <SelectItem value="banque">Banque</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="technologie">Technologie</SelectItem>
                      <SelectItem value="conseil">Conseil</SelectItem>
                      <SelectItem value="administration">Administration publique</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between gap-4 pt-6 border-t">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setEtapeActuelle(1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Précédent
                </Button>
                <Button 
                  type="button"
                  onClick={validerEtape2} 
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Suivant <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Étape 3 : Récapitulatif et paiement */}
          {etapeActuelle === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl text-gray-900 mb-2">Récapitulatif de l'inscription</h2>
                <p className="text-gray-600">Vérifiez les informations avant de finaliser</p>
              </div>

              {/* Informations organisation */}
              <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3 mb-4">
                  <Building2 className="w-6 h-6 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg text-gray-900 mb-3">Organisation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Nom:</span>{' '}
                        <span className="text-gray-900">{organisationData.nom}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Contact:</span>{' '}
                        <span className="text-gray-900">{organisationData.contact}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>{' '}
                        <span className="text-gray-900">{organisationData.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Secteur:</span>{' '}
                        <span className="text-gray-900">{organisationData.secteurActivite}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Liste des participants */}
              <Card className="p-6 bg-purple-50 border-purple-200">
                <div className="flex items-start gap-3 mb-4">
                  <Users className="w-6 h-6 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg text-gray-900 mb-3">
                      {typeInscription === 'individuel' ? 'Participant' : `Participants (${participantsGroupe.length})`}
                    </h3>
                    
                    {typeInscription === 'individuel' ? (
                      <div className="text-sm text-gray-600">
                        <p>Inscription individuelle pour l'organisation {organisationData.nom}</p>
                        <p className="mt-1">Contact: {organisationData.email}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {participantsGroupe.map((participant, index) => (
                          <div key={index} className="p-3 bg-white rounded-lg border border-purple-200">
                            <div className="flex items-center gap-2">
                              <span className="text-purple-600">#{index + 1}</span>
                              <span className="text-gray-900">{participant.prenom} {participant.nom}</span>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-600 text-sm">{participant.email}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Récapitulatif du paiement */}
              <Card className="p-6 bg-amber-50 border-amber-200">
                <div className="flex items-start gap-3">
                  <FileText className="w-6 h-6 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg text-gray-900 mb-4">Récapitulatif du paiement</h3>
                    
                    <div className="space-y-3">
                      {typeInscription === 'groupe' && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Détail par participant:</p>
                          {participantsGroupe.map((participant, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                              <span className="text-sm text-gray-900">
                                {participant.prenom} {participant.nom}
                              </span>
                              <span className="text-sm text-gray-900">
                                {PRIX_NON_MEMBRE.toLocaleString('fr-FR')} FCFA
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-3 border-t border-amber-300">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900">
                            {typeInscription === 'individuel' ? 'Montant à payer:' : 'Montant total:'}
                          </span>
                          <span className="text-2xl text-amber-600">
                            {calculerMontantTotal().toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>
                        {typeInscription === 'groupe' && (
                          <p className="text-xs text-gray-600 mt-1">
                            {participantsGroupe.length} participant{participantsGroupe.length > 1 ? 's' : ''} × {PRIX_NON_MEMBRE.toLocaleString('fr-FR')} FCFA
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-amber-300">
                        <p className="text-sm text-gray-600 mb-2">Statut:</p>
                        <div className="flex items-center gap-2 p-2 bg-white rounded">
                          <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                          <span className="text-sm text-gray-900">En attente de paiement</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          Une facture proforma sera générée après la validation de l'inscription
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex justify-between gap-4 pt-6 border-t">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setEtapeActuelle(2)}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Précédent
                </Button>
                <Button 
                  type="button"
                  onClick={finaliserInscription}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Finalisation...' : 'Finaliser l\'inscription'}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

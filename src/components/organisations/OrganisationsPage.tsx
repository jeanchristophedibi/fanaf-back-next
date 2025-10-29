"use client";

import { WidgetOrganisations } from "./WidgetOrganisations";
import { ListeOrganisations } from "./ListeOrganisations";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import type { OrganisationSubSection } from "../../app/dashboard/agence/types";

interface OrganisationsPageProps {
  subSection?: OrganisationSubSection;
  filter?: 'all' | 'membre' | 'non-membre' | 'sponsor';
  readOnly?: boolean;
}

export function OrganisationsPage({ subSection, filter, readOnly = false }: OrganisationsPageProps) {
  const [isCreateSponsorOpen, setIsCreateSponsorOpen] = useState(false);
  
  // État du formulaire de création de sponsor
  const [formData, setFormData] = useState({
    nomOrganisation: '',
    contactOrganisation: '',
    emailOrganisation: '',
    paysOrganisation: '',
    nomReferent: '',
    prenomReferent: '',
    emailReferent: '',
    telephoneReferent: '',
    fonctionReferent: '',
  });

  const getTitle = () => {
    const section = subSection || filter;
    switch (section) {
      case 'liste':
      case 'all':
        return 'Liste des organisations';
      case 'membre':
        return 'Associations membre';
      case 'non-membre':
        return 'Entreprise';
      case 'sponsor':
        return 'Sponsors';
      default:
        return 'Liste des organisations';
    }
  };

  const handleCreateSponsor = () => {
    console.log('Création du sponsor:', formData);
    // Ici vous ajouteriez la logique pour créer le sponsor dans la base de données
    setIsCreateSponsorOpen(false);
    // Réinitialiser le formulaire
    setFormData({
      nomOrganisation: '',
      contactOrganisation: '',
      emailOrganisation: '',
      paysOrganisation: '',
      nomReferent: '',
      prenomReferent: '',
      emailReferent: '',
      telephoneReferent: '',
      fonctionReferent: '',
    });
  };

  const isFormValid = () => {
    return (
      formData.nomOrganisation &&
      formData.contactOrganisation &&
      formData.emailOrganisation &&
      formData.paysOrganisation &&
      formData.nomReferent &&
      formData.prenomReferent &&
      formData.emailReferent &&
      formData.telephoneReferent &&
      formData.fonctionReferent
    );
  };

  const showWidget = (subSection === 'liste' || filter === 'all' || (!subSection && !filter));

  return (
    <div className="p-8 animate-page-enter">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">{getTitle()}</h1>
          <p className="text-gray-600">
            Gestion des organisations FANAF 2026
          </p>
        </div>
        
        {/* Boutons pour la sous-section sponsor */}
        {(subSection === 'sponsor' || filter === 'sponsor') && !readOnly && (
          <Dialog open={isCreateSponsorOpen} onOpenChange={setIsCreateSponsorOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Créer un sponsor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouveau sponsor</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau sponsor et son référent qui recevra les demandes de rendez-vous
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Informations de l'organisation */}
                <div>
                  <h3 className="text-gray-900 mb-4">Informations de l'organisation</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomOrganisation">Nom de l'organisation *</Label>
                      <Input
                        id="nomOrganisation"
                        placeholder="Ex: Tech Insurance Corp"
                        value={formData.nomOrganisation}
                        onChange={(e) => setFormData({ ...formData, nomOrganisation: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="paysOrganisation">Pays *</Label>
                      <Input
                        id="paysOrganisation"
                        placeholder="Ex: Côte d'Ivoire"
                        value={formData.paysOrganisation}
                        onChange={(e) => setFormData({ ...formData, paysOrganisation: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emailOrganisation">Email *</Label>
                      <Input
                        id="emailOrganisation"
                        type="email"
                        placeholder="contact@organisation.com"
                        value={formData.emailOrganisation}
                        onChange={(e) => setFormData({ ...formData, emailOrganisation: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactOrganisation">Contact *</Label>
                      <Input
                        id="contactOrganisation"
                        placeholder="+225 XX XX XX XX XX"
                        value={formData.contactOrganisation}
                        onChange={(e) => setFormData({ ...formData, contactOrganisation: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Informations du référent */}
                <div className="border-t pt-6">
                  <h3 className="text-gray-900 mb-4">Référent (contact pour les rendez-vous sponsor)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prenomReferent">Prénom du référent *</Label>
                      <Input
                        id="prenomReferent"
                        placeholder="Ex: Marie"
                        value={formData.prenomReferent}
                        onChange={(e) => setFormData({ ...formData, prenomReferent: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nomReferent">Nom du référent *</Label>
                      <Input
                        id="nomReferent"
                        placeholder="Ex: Dupont"
                        value={formData.nomReferent}
                        onChange={(e) => setFormData({ ...formData, nomReferent: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emailReferent">Email du référent *</Label>
                      <Input
                        id="emailReferent"
                        type="email"
                        placeholder="marie.dupont@organisation.com"
                        value={formData.emailReferent}
                        onChange={(e) => setFormData({ ...formData, emailReferent: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="telephoneReferent">Téléphone du référent *</Label>
                      <Input
                        id="telephoneReferent"
                        placeholder="+225 XX XX XX XX XX"
                        value={formData.telephoneReferent}
                        onChange={(e) => setFormData({ ...formData, telephoneReferent: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fonctionReferent">Fonction du référent *</Label>
                      <Input
                        id="fonctionReferent"
                        placeholder="Ex: Directeur Commercial"
                        value={formData.fonctionReferent}
                        onChange={(e) => setFormData({ ...formData, fonctionReferent: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button variant="outline" onClick={() => setIsCreateSponsorOpen(false)}>
                    Annuler
                  </Button>
                  <Button 
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={handleCreateSponsor}
                    disabled={!isFormValid()}
                  >
                    Créer le sponsor
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Widget de statistiques - uniquement pour la vue liste */}
      {showWidget && <WidgetOrganisations />}

      {/* Liste des organisations */}
      <ListeOrganisations subSection={subSection} filter={filter} readOnly={readOnly} />
    </div>
  );
}


"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { UserPlus, User } from "lucide-react";
import { Separator } from "../ui/separator";

interface CreateSponsorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSponsor: (sponsorData: { 
    nom: string; 
    email: string; 
    type: string;
    referent?: {
      nom: string;
      prenom: string;
      email: string;
      telephone: string;
      fonction: string;
    };
  }) => void;
}

interface SponsorFormData {
  nomSponsor: string;
  emailSponsor: string;
  typeSponsor: string;
}

interface ReferentFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  fonction: string;
}

export function CreateSponsorDialog({ open, onOpenChange, onCreateSponsor }: CreateSponsorDialogProps) {
  const [formData, setFormData] = useState<SponsorFormData>({
    nomSponsor: '',
    emailSponsor: '',
    typeSponsor: ''
  });

  const [referentData, setReferentData] = useState<ReferentFormData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    fonction: ''
  });

  const [hasReferent, setHasReferent] = useState(false);

  const isFormValid = () => {
    const sponsorValid = formData.nomSponsor.trim() !== '' &&
           formData.emailSponsor.trim() !== '' &&
           formData.typeSponsor.trim() !== '';
    
    if (!hasReferent) return sponsorValid;
    
    return sponsorValid &&
           referentData.nom.trim() !== '' &&
           referentData.prenom.trim() !== '' &&
           referentData.email.trim() !== '' &&
           referentData.telephone.trim() !== '' &&
           referentData.fonction.trim() !== '';
  };

  const handleCreateSponsor = () => {
    if (isFormValid()) {
      onCreateSponsor({
        nom: formData.nomSponsor,
        email: formData.emailSponsor,
        type: formData.typeSponsor,
        referent: hasReferent && 
          referentData.nom.trim() !== '' &&
          referentData.prenom.trim() !== '' &&
          referentData.email.trim() !== '' &&
          referentData.telephone.trim() !== '' &&
          referentData.fonction.trim() !== ''
          ? {
              nom: referentData.nom,
              prenom: referentData.prenom,
              email: referentData.email,
              telephone: referentData.telephone,
              fonction: referentData.fonction
            }
          : undefined
      });
      // Reset form
      setFormData({
        nomSponsor: '',
        emailSponsor: '',
        typeSponsor: ''
      });
      setReferentData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        fonction: ''
      });
      setHasReferent(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white">
          <UserPlus className="w-4 h-4 mr-2" />
          Créer un sponsor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer un nouveau sponsor</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau sponsor à la liste
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informations du sponsor */}
          <div>
            <h3 className="text-gray-900 mb-4">Informations du sponsor</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomSponsor">Nom du sponsor *</Label>
                <Input
                  id="nomSponsor"
                  placeholder="Ex: Tech Insurance Corp"
                  value={formData.nomSponsor}
                  onChange={(e) => setFormData({ ...formData, nomSponsor: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailSponsor">Email *</Label>
                <Input
                  id="emailSponsor"
                  type="email"
                  placeholder="contact@sponsor.com"
                  value={formData.emailSponsor}
                  onChange={(e) => setFormData({ ...formData, emailSponsor: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="typeSponsor">Type de sponsor *</Label>
                <Input
                  id="typeSponsor"
                  placeholder="Ex: ARGENT, GOLD, PLATINE"
                  value={formData.typeSponsor}
                  onChange={(e) => setFormData({ ...formData, typeSponsor: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Section référent */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Checkbox
                id="hasReferent"
                checked={hasReferent}
                onCheckedChange={(checked) => setHasReferent(checked === true)}
              />
              <Label htmlFor="hasReferent" className="text-gray-900 font-medium cursor-pointer">
                Ajouter un référent (contact pour les rendez-vous)
              </Label>
            </div>

            {hasReferent && (
              <div className="mt-4 space-y-4 pl-7 border-l-2 border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-orange-600" />
                  <h4 className="text-gray-900 font-medium">Informations du référent</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="referentNom">Nom *</Label>
                    <Input
                      id="referentNom"
                      placeholder="Ex: Dupont"
                      value={referentData.nom}
                      onChange={(e) => setReferentData({ ...referentData, nom: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="referentPrenom">Prénom *</Label>
                    <Input
                      id="referentPrenom"
                      placeholder="Ex: Jean"
                      value={referentData.prenom}
                      onChange={(e) => setReferentData({ ...referentData, prenom: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="referentEmail">Email *</Label>
                    <Input
                      id="referentEmail"
                      type="email"
                      placeholder="jean.dupont@sponsor.com"
                      value={referentData.email}
                      onChange={(e) => setReferentData({ ...referentData, email: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="referentTelephone">Téléphone *</Label>
                    <Input
                      id="referentTelephone"
                      type="tel"
                      placeholder="+225 XX XX XX XX XX"
                      value={referentData.telephone}
                      onChange={(e) => setReferentData({ ...referentData, telephone: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="referentFonction">Fonction *</Label>
                    <Input
                      id="referentFonction"
                      placeholder="Ex: Directeur Commercial"
                      value={referentData.fonction}
                      onChange={(e) => setReferentData({ ...referentData, fonction: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
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
  );
}


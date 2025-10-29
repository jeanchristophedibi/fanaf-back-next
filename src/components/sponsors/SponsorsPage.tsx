"use client";

import { ListeSponsors } from "./ListeSponsors";
import { WidgetSponsors } from "./WidgetSponsors";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { UserPlus } from "lucide-react";
import { useState } from "react";

interface SponsorsPageProps {
  readOnly?: boolean;
}

export function SponsorsPage({ readOnly = false }: SponsorsPageProps) {
  const [isCreateSponsorOpen, setIsCreateSponsorOpen] = useState(false);
  
  // État du formulaire de création de sponsor
  const [formData, setFormData] = useState({
    nomSponsor: '',
    emailSponsor: '',
    typeSponsor: '',
  });

  const handleCreateSponsor = () => {
    console.log('Création du sponsor:', formData);
    // Ici vous ajouteriez la logique pour créer le sponsor dans l'API
    setIsCreateSponsorOpen(false);
    // Réinitialiser le formulaire
    setFormData({
      nomSponsor: '',
      emailSponsor: '',
      typeSponsor: '',
    });
  };

  const isFormValid = () => {
    return (
      formData.nomSponsor &&
      formData.emailSponsor &&
      formData.typeSponsor
    );
  };

  return (
    <div className="p-8 animate-page-enter">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Sponsors</h1>
          <p className="text-gray-600">
            Gestion des sponsors FANAF 2026
          </p>
        </div>
        
        {/* Bouton pour créer un sponsor */}
        {!readOnly && (
          <Dialog open={isCreateSponsorOpen} onOpenChange={setIsCreateSponsorOpen}>
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

      {/* Widget de statistiques */}
      <WidgetSponsors />

      {/* Liste des sponsors */}
      <ListeSponsors readOnly={readOnly} />
    </div>
  );
}


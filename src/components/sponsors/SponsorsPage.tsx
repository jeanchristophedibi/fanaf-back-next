"use client";

import { ListeSponsors } from "./ListeSponsors";
import { WidgetSponsors } from "./WidgetSponsors";
import { CreateSponsorDialog } from "./CreateSponsorDialog";
import { useState } from "react";

interface SponsorsPageProps {
  readOnly?: boolean;
}

export function SponsorsPage({ readOnly = false }: SponsorsPageProps) {
  const [isCreateSponsorOpen, setIsCreateSponsorOpen] = useState(false);

  const handleCreateSponsor = (sponsorData: { 
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
  }) => {
    console.log('Création du sponsor:', sponsorData);
    // Ici vous ajouteriez la logique pour créer le sponsor dans l'API
    setIsCreateSponsorOpen(false);
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
          <CreateSponsorDialog
            open={isCreateSponsorOpen}
            onOpenChange={setIsCreateSponsorOpen}
            onCreateSponsor={handleCreateSponsor}
          />
        )}
      </div>

      {/* Widget de statistiques */}
      <WidgetSponsors />

      {/* Liste des sponsors */}
      <ListeSponsors readOnly={readOnly} />
    </div>
  );
}


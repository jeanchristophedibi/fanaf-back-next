'use client';

import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

interface StepRecapProps {
  typeParticipant: string | '';
  typeInscription: 'individuel' | 'groupe' | '';
  participantsCount: number;
  montantTotal: number;
  participantPrincipal?: {
    nom: string;
    prenom: string;
    email: string;
    pays: string;
    telephone: string;
  };
  organisationData?: {
    nom: string;
    email: string;
    contact: string;
    adresse: string;
    domaineActivite: string;
    codeOrganisation?: string;
  };
  participantsGroupe?: Array<{ nom: string; prenom: string; email: string }>;
  onGoToEtape?: (numero: number) => void; // 1=Type, 2=Infos, 3=Inscription, 4=Organisation
}

export const StepRecap: React.FC<StepRecapProps> = ({ 
  typeParticipant, 
  typeInscription, 
  participantsCount, 
  montantTotal,
  participantPrincipal,
  organisationData,
  participantsGroupe,
  onGoToEtape
}) => {
  const formatCurrency = (n: number) => `${Intl.NumberFormat('fr-FR').format(n)} FCFA`;

  // Déterminer les éléments manquants (validation légère pour affichage)
  const missing: string[] = [];
  if (!typeParticipant) missing.push('Type de participant non défini');
  if (!typeInscription) missing.push("Type d'inscription non défini");
  if (!participantPrincipal?.prenom) missing.push('Prénom du participant principal manquant');
  if (!participantPrincipal?.nom) missing.push('Nom du participant principal manquant');
  if (!participantPrincipal?.email) missing.push('Email du participant principal manquant');
  if (!participantPrincipal?.telephone) missing.push('Téléphone du participant principal manquant');
  if (!participantPrincipal?.pays) missing.push('Pays du participant principal manquant');

  if (typeParticipant === 'membre') {
    if (!organisationData?.nom && !organisationData?.codeOrganisation) missing.push("Organisation membre non sélectionnée");
    if (!organisationData?.codeOrganisation) missing.push("Code de l'organisation manquant");
  } else {
    if (!organisationData?.nom) missing.push("Nom de l'organisation manquant");
    if (!organisationData?.email) missing.push("Email de l'organisation manquant");
    if (!organisationData?.contact) missing.push("Contact de l'organisation manquant");
    if (!organisationData?.adresse) missing.push("Adresse de l'organisation manquante");
    if (!organisationData?.domaineActivite) missing.push("Domaine d'activité manquant");
  }

  if (typeInscription === 'groupe') {
    const count = participantsGroupe?.length || 0;
    if (count === 0) missing.push('Aucun participant supplémentaire ajouté');
  }

  const isComplete = missing.length === 0;

  const RecapSection: React.FC<{ title: string; onEdit?: () => void; children: React.ReactNode }> = ({ title, onEdit, children }) => (
    <div className="p-5 rounded-xl border border-blue-100 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-semibold text-blue-800">{title}</h4>
        {onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>Modifier</Button>
        )}
      </div>
      <div className="text-gray-700 text-sm">
        {children}
      </div>
    </div>
  );

  const Kpi: React.FC<{ label: string; value: React.ReactNode; accent?: boolean }> = ({ label, value, accent }) => (
    <div className={`p-4 rounded-xl border ${accent ? 'bg-gradient-to-r from-blue-50 via-white to-orange-50 border-blue-200' : 'bg-white border-gray-200'}`}>
      <div className="text-xs uppercase tracking-wide text-blue-700/80">{label}</div>
      <div className={`mt-1 text-lg ${accent ? 'text-blue-800 font-semibold' : 'text-gray-900'}`}>{value}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-gray-900">Récapitulatif</h3>
          <span className="h-1 w-14 rounded-full bg-gradient-to-r from-blue-500 to-orange-500" />
        </div>
        <span className={`px-3 py-1 text-xs rounded-full border ${isComplete ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
          {isComplete ? 'Complet' : 'Incomplet'}
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Kpi label="Type de participant" value={typeParticipant || '—'} />
        <Kpi label="Type d'inscription" value={typeInscription || '—'} />
        <Kpi label="Participants" value={participantsCount} />
        <Kpi label="Montant total" value={formatCurrency(montantTotal)} accent />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <RecapSection title="Organisation" onEdit={onGoToEtape ? () => onGoToEtape(4) : undefined}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center justify-between"><span className="text-gray-500">Nom</span><span>{organisationData?.nom || '—'}</span></div>
            <div className="flex items-center justify-between"><span className="text-gray-500">Email</span><span>{organisationData?.email || '—'}</span></div>
            <div className="flex items-center justify-between"><span className="text-gray-500">Contact</span><span>{organisationData?.contact || '—'}</span></div>
            {typeParticipant === 'membre' && (
              <div className="flex items-center justify-between"><span className="text-gray-500">Code membre</span><span>{organisationData?.codeOrganisation || '—'}</span></div>
            )}
          </div>
        </RecapSection>

        <RecapSection title="Participant principal" onEdit={onGoToEtape ? () => onGoToEtape(2) : undefined}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center justify-between"><span className="text-gray-500">Nom</span><span>{participantPrincipal ? `${participantPrincipal.prenom} ${participantPrincipal.nom}` : '—'}</span></div>
            <div className="flex items-center justify-between"><span className="text-gray-500">Email</span><span>{participantPrincipal?.email || '—'}</span></div>
            <div className="flex items-center justify-between"><span className="text-gray-500">Téléphone</span><span>{participantPrincipal?.telephone || '—'}</span></div>
            <div className="flex items-center justify-between"><span className="text-gray-500">Pays</span><span>{participantPrincipal?.pays || '—'}</span></div>
          </div>
        </RecapSection>

        <RecapSection title="Inscription" onEdit={onGoToEtape ? () => onGoToEtape(3) : undefined}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center justify-between"><span className="text-gray-500">Type</span><span>{typeInscription || '—'}</span></div>
            {typeInscription === 'groupe' && (
              <div className="flex items-center justify-between"><span className="text-gray-500">Participants additionnels</span><span>{participantsGroupe?.length || 0}</span></div>
            )}
          </div>
        </RecapSection>

        <RecapSection title="Paiement">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center justify-between md:col-span-2"><span className="text-gray-500">Total</span><span className="font-semibold text-gray-900">{formatCurrency(montantTotal)}</span></div>
          </div>
          <div className="text-xs text-gray-500 mt-2">Le montant dépend du statut et du nombre de participants.</div>
        </RecapSection>
      </div>

      {!isComplete && (
        <div className="p-4 rounded-xl border border-orange-200 bg-orange-50">
          <div className="text-orange-800 font-medium mb-1">Informations manquantes</div>
          <ul className="text-orange-800 text-sm list-disc pl-5 space-y-1">
            {missing.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};



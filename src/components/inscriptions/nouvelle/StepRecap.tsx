'use client';

import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { motion } from 'motion/react';
import { Building2, User, Users, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

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
  onGoToEtape?: (numero: number) => void;
}

export const StepRecap: React.FC<StepRecapProps> = ({
  typeParticipant,
  typeInscription,
  participantsCount,
  montantTotal,
  participantPrincipal,
  organisationData,
  participantsGroupe,
  onGoToEtape,
}) => {
  const formatCurrency = (n: number) =>
    `${Intl.NumberFormat('fr-FR').format(n)} FCFA`;

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

  const SectionCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    onEdit?: () => void;
    children: React.ReactNode;
  }> = ({ title, icon, onEdit, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 rounded-[24px] md:rounded-[28px] overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 mb-4"
     >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700">
            {icon}
          </span>
          <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        </div>
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            className="text-sm hover:bg-orange-50"
            onClick={onEdit}
          >
            Modifier
          </Button>
        )}
      </div>
      <div className="text-gray-700 text-sm">{children}</div>
    </motion.div>
  );

  const Kpi: React.FC<{ label: string; value: React.ReactNode; highlight?: boolean }> = ({
    label,
    value,
    highlight,
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-[20px] md:rounded-[24px] overflow-hidden border text-center ${
        highlight
          ? 'bg-gradient-to-r from-orange-50 via-white to-amber-50 border-orange-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </div>
      <div
        className={`text-lg ${
          highlight ? 'text-orange-700 font-bold' : 'text-gray-900 font-medium'
        }`}
      >
        {value}
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Récapitulatif</h2>
          <p className="text-gray-600 text-sm">
            Vérifiez les informations avant la validation finale.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {typeParticipant && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                {typeParticipant}
              </span>
            )}
            {typeInscription && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 capitalize">
                {typeInscription}
              </span>
            )}
          </div>
        </div>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full border ${
            isComplete
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-orange-50 text-orange-700 border-orange-200'
          }`}
        >
          {isComplete ? 'Complet' : 'Incomplet'}
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 mt-4">
        <Kpi label="Type de participant" value={<span className="capitalize">{typeParticipant || '—'}</span>} />
        <Kpi label="Type d'inscription" value={<span className="capitalize">{typeInscription || '—'}</span>} />
        <Kpi label="Participants" value={<span className="text-2xl xl:text-3xl font-semibold">{participantsCount}</span>} />
        <Kpi label="Montant total" value={<span className="text-2xl xl:text-3xl">{formatCurrency(montantTotal)}</span>} highlight />
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1  gap-7">
        <SectionCard
          title="Organisation"
          icon={<Building2 className="w-5 h-5" />}
          onEdit={onGoToEtape ? () => onGoToEtape(4) : undefined}
        >
          <div className="grid grid-cols-1 gap-4 gap-x-8 text-sm">
            <div className="flex items-start justify-between gap-4"><span className="text-gray-500">Nom</span><span className="font-medium text-gray-900 truncate max-w-[65%]" title={organisationData?.nom}>{organisationData?.nom || '—'}</span></div>
            <div className="flex items-start justify-between gap-4"><span className="text-gray-500">Email</span><span className="font-medium text-gray-900 truncate max-w-[65%]" title={organisationData?.email}>{organisationData?.email || '—'}</span></div>
            <div className="flex items-start justify-between gap-4"><span className="text-gray-500">Contact</span><span className="font-medium text-gray-900 truncate max-w-[65%]" title={organisationData?.contact}>{organisationData?.contact || '—'}</span></div>
            {typeParticipant === 'membre' && (
              <div className="flex items-start justify-between gap-4"><span className="text-gray-500">Code</span><span className="font-medium text-gray-900 truncate max-w-[65%]" title={organisationData?.codeOrganisation}>{organisationData?.codeOrganisation || '—'}</span></div>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Participant principal"
          icon={<User className="w-5 h-5" />}
          onEdit={onGoToEtape ? () => onGoToEtape(2) : undefined}
        >
          <div className="grid grid-cols-1 gap-4 gap-x-8 text-sm">
            <div className="flex items-start justify-between gap-4"><span className="text-gray-500">Nom</span><span className="font-medium text-gray-900 truncate max-w-[65%]" title={participantPrincipal ? `${participantPrincipal.prenom} ${participantPrincipal.nom}` : undefined}>{participantPrincipal ? `${participantPrincipal.prenom} ${participantPrincipal.nom}` : '—'}</span></div>
            <div className="flex items-start justify-between gap-4"><span className="text-gray-500">Email</span><span className="font-medium text-gray-900 truncate max-w-[65%]" title={participantPrincipal?.email}>{participantPrincipal?.email || '—'}</span></div>
            <div className="flex items-start justify-between gap-4"><span className="text-gray-500">Téléphone</span><span className="font-medium text-gray-900 truncate max-w-[65%]" title={participantPrincipal?.telephone}>{participantPrincipal?.telephone || '—'}</span></div>
            <div className="flex items-start justify-between gap-4"><span className="text-gray-500">Pays</span><span className="font-medium text-gray-900 truncate max-w-[65%]" title={participantPrincipal?.pays}>{participantPrincipal?.pays || '—'}</span></div>
          </div>
        </SectionCard>

        <SectionCard
          title="Type d'inscription"
          icon={<Users className="w-5 h-5" />}
          onEdit={onGoToEtape ? () => onGoToEtape(3) : undefined}
        >
          <div className="text-sm space-y-3">
            <div className="flex items-start justify-between gap-4"><span className="text-gray-500">Type</span><span className="font-medium text-gray-900 capitalize">{typeInscription || '—'}</span></div>
            {typeInscription === 'groupe' && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-gray-500">Participants additionnels</span>
                <span className="font-medium text-gray-900">{participantsGroupe?.length || 0}</span>
              </div>
            )}
            {typeInscription === 'groupe' && participantsGroupe && participantsGroupe.length > 0 && (
              <div className="pt-2">
                <div className="text-xs text-gray-500 mb-2">Aperçu des emails</div>
                <div className="flex flex-wrap gap-2">
                  {participantsGroupe.slice(0, 3).map((p, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                      {p.email || `${p.prenom} ${p.nom}`}
                    </span>
                  ))}
                  {participantsGroupe.length > 3 && (
                    <span className="px-2.5 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200 text-xs">+{participantsGroupe.length - 3}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Paiement" icon={<CreditCard className="w-5 h-5" />}>
          <div className="text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Montant total :</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(montantTotal)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Le montant dépend du statut et du nombre de participants.
            </p>
        </div>
        </SectionCard>
      </div>

      {/* Alert */}
      {!isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200"
        >
          <div className="flex items-center gap-2 mb-2 text-orange-700 font-semibold">
            <AlertCircle className="w-5 h-5" />
            Informations manquantes
          </div>
          <ul className="list-disc pl-5 text-sm text-orange-700 space-y-1">
            {missing.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-5 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Toutes les informations ont été validées avec succès.
        </motion.div>
      )}
    </motion.div>
  );
};

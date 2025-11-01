'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../ui/card';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { motion } from 'motion/react';
import { Building2, Mail, Phone, MapPin, Briefcase, Hash, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../ui/command';
import { ScrollArea } from '../../ui/scroll-area';
import { fanafApi } from '../../../services/fanafApi';
import { toast } from 'sonner';

interface OrganisationState {
  nom: string;
  email: string;
  contact: string;
  adresse?: string;
  domaineActivite?: string;
  codeOrganisation?: string;
}

interface StepOrganisationProps {
  organisationData: OrganisationState;
  onChange: (patch: Partial<OrganisationState>) => void;
  errors?: Partial<Record<keyof OrganisationState, string>>;
  isMembre?: boolean;
  organisationsOptions?: Array<{ id: string; nom: string }>;
  selectedOrganisationId?: string;
  onSelectOrganisation?: (id: string) => void;
  onCodeValidated?: (isValid: boolean) => void;
}

export const StepOrganisation: React.FC<StepOrganisationProps> = ({ 
  organisationData, 
  onChange, 
  errors, 
  isMembre, 
  organisationsOptions, 
  selectedOrganisationId, 
  onSelectOrganisation,
  onCodeValidated 
}) => {
  const [orgOpen, setOrgOpen] = useState(false);
  const [codeValidationState, setCodeValidationState] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');

  // Validation du code quand il atteint 5 caractères
  const codeLength = organisationData.codeOrganisation?.length || 0;
  const shouldValidate = Boolean(isMembre && codeLength === 5 && selectedOrganisationId);

  const { data: validationResult, isLoading: isValidating } = useQuery({
    queryKey: ['validateAssociationCode', organisationData.codeOrganisation, selectedOrganisationId],
    queryFn: async () => {
      if (!organisationData.codeOrganisation || !selectedOrganisationId) {
        return null;
      }
      return await fanafApi.validateAssociationCode(organisationData.codeOrganisation, selectedOrganisationId);
    },
    enabled: shouldValidate,
    retry: false,
    staleTime: 0,
  });

  // Mettre à jour l'état de validation
  useEffect(() => {
    if (isValidating) {
      setCodeValidationState('validating');
      onCodeValidated?.(false);
    } else if (validationResult && 'is_valid' in validationResult) {
      if (validationResult.is_valid) {
        setCodeValidationState('valid');
        onCodeValidated?.(true);
        toast.success('Code d\'association valide');
      } else {
        setCodeValidationState('invalid');
        onCodeValidated?.(false);
        // Afficher le message d'erreur spécifique si disponible
        const errorMessage = validationResult.errorMessage || 'Le code d\'association est incorrect';
        toast.error(errorMessage);
      }
    } else if (codeLength < 5) {
      setCodeValidationState('idle');
      onCodeValidated?.(false);
    }
  }, [validationResult, isValidating, codeLength, onCodeValidated]);

  // Réinitialiser l'état si le code change
  useEffect(() => {
    if (codeLength !== 5) {
      setCodeValidationState('idle');
      onCodeValidated?.(false);
    }
  }, [codeLength, onCodeValidated]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-10 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border border-gray-100 space-y-12">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Informations organisation
          </h2>
          <p className="text-gray-600 text-lg">
            Renseignez les détails de l'organisation affiliée au participant.
          </p>
        </div>

        {/* Formulaire */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 md:gap-x-16">
          {/* Organisation membre: Select au lieu de saisie */}
          {isMembre ? (
            <>
              <div className="space-y-3 mb-6 md:col-span-2">
                <Label className="text-gray-700 font-medium">Sélectionner une organisation membre *</Label>
                <div className="flex items-stretch w-full">
                  <Button type="button" variant="outline" className="h-12 px-4 rounded-r-none rounded-l-xl border-2 border-r-0 border-orange-600 bg-orange-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </Button>
                  <Popover open={orgOpen} onOpenChange={setOrgOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="h-12 text-left flex-1 bg-white border-2 border-gray-200 border-l-0 -ml-px rounded-none rounded-r-xl px-3 text-base hover:border-gray-300 focus:outline-none focus:border-orange-500"
                      >
                        {selectedOrganisationId
                          ? (organisationsOptions || []).find(o => o.id === selectedOrganisationId)?.nom
                          : 'Choisissez une organisation'}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[--radix-popover-trigger-width] min-h-[50vh] max-h-[80vh] overflow-hidden" align="start" side="bottom" sideOffset={8}>
                      <Command>
                        <CommandInput placeholder="Rechercher une organisation..." className="h-12 text-base" />
                        <CommandEmpty>Aucune organisation trouvée.</CommandEmpty>
                        <ScrollArea className="h-[50vh]">
                          <CommandList>
                            <CommandGroup>
                              {(organisationsOptions || []).map((org) => (
                                <CommandItem
                                  key={org.id}
                                  value={org.nom}
                                  className="py-3 text-base"
                                  onSelect={() => {
                                    onSelectOrganisation && onSelectOrganisation(org.id);
                                    setOrgOpen(false);
                                  }}
                                >
                                  {org.nom}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </ScrollArea>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Code organisation requis pour membre */}
              <div className="space-y-3 mb-6 md:col-span-2">
                <Label className="text-gray-700 font-medium">Code organisation * (5 caractères)</Label>
                <div className="flex items-stretch w-full">
                  <Button type="button" variant="outline" className="h-12 px-4 rounded-r-none rounded-l-xl border-2 border-r-0 border-orange-600 bg-orange-600 flex items-center justify-center">
                    <Hash className="w-5 h-5 text-white" />
                  </Button>
                  <div className="relative flex-1 w-full">
                    <Input
                      value={organisationData.codeOrganisation || ''}
                      onChange={(e) => {
                        const raw = e.target.value;
                        // Limiter à 5 caractères
                        const sanitized = raw.replace(/\s+/g, '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5);
                        onChange({ codeOrganisation: sanitized });
                      }}
                      placeholder="Code membre fourni par l'association (5 caractères)"
                      maxLength={5}
                      className={`h-12 text-base bg-white border-2 border-l-0 -ml-px rounded-none rounded-r-xl shadow-sm focus:ring-orange-500/30 pr-12 w-full ${
                        codeValidationState === 'valid'
                          ? 'border-green-500 focus:border-green-500'
                          : codeValidationState === 'invalid'
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:border-orange-500'
                      }`}
                      inputMode="text"
                      pattern="[A-Za-z0-9]*"
                    />
                    {/* Icône de validation à droite de l'input */}
                    <div className="absolute right-4 top-0 bottom-0 flex items-center justify-center z-10 pointer-events-none">
                      {codeValidationState === 'validating' && (
                        <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                      )}
                      {codeValidationState === 'valid' && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      {codeValidationState === 'invalid' && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
                {codeLength > 0 && codeLength < 5 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {5 - codeLength} caractère{5 - codeLength > 1 ? 's' : ''} restant{5 - codeLength > 1 ? 's' : ''}
                  </p>
                )}
                {codeValidationState === 'valid' && (
                  <p className="text-sm text-green-600 mt-1">✓ Code d'association valide</p>
                )}
                {codeValidationState === 'invalid' && validationResult && 'errorMessage' in validationResult && validationResult.errorMessage && (
                  <p className="text-sm text-red-600 mt-1">✗ {validationResult.errorMessage}</p>
                )}
                {codeValidationState === 'invalid' && (!validationResult || !validationResult.errorMessage) && (
                  <p className="text-sm text-red-600 mt-1">✗ Le code d'association est incorrect</p>
                )}
                {errors?.codeOrganisation && (
                  <p className="text-sm text-red-600 mt-1">{errors.codeOrganisation}</p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Nom de l'organisation */}
              <div className="space-y-3 mb-6">
                <Label className="text-gray-700 font-medium">Nom de l'organisation *</Label>
                <div className="flex items-stretch w-full">
                  <Button type="button" variant="outline" className="h-12 px-4 rounded-r-none rounded-l-xl border-2 border-r-0 border-orange-600 bg-orange-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </Button>
                  <Input
                    value={organisationData.nom}
                    onChange={(e) => onChange({ nom: e.target.value })}
                    placeholder="Nom de l'organisation"
                    className="h-12 text-base bg-white border-2 border-gray-200 border-l-0 -ml-px rounded-none rounded-r-xl shadow-sm focus:border-orange-500 focus:ring-orange-500/30"
                  />
                </div>
                {errors?.nom && (
                  <p className="text-sm text-red-600 mt-1">{errors.nom}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-3 mb-6">
                <Label className="text-gray-700 font-medium">Adresse e-mail *</Label>
                <div className="flex items-stretch w-full">
                  <Button type="button" variant="outline" className="h-12 px-4 rounded-r-none rounded-l-xl border-2 border-r-0 border-orange-600 bg-orange-600 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </Button>
                  <Input
                    type="email"
                    value={organisationData.email}
                    onChange={(e) => onChange({ email: e.target.value })}
                    placeholder="email@organisation.com"
                    className="h-12 text-base bg-white border-2 border-gray-200 border-l-0 -ml-px rounded-none rounded-r-xl shadow-sm focus:border-orange-500 focus:ring-orange-500/30"
                  />
                </div>
                {errors?.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Contact */}
              <div className="space-y-3 mb-6">
                <Label className="text-gray-700 font-medium">Contact *</Label>
                <div className="flex items-stretch w-full">
                  <Button type="button" variant="outline" className="h-12 px-4 rounded-r-none rounded-l-xl border-2 border-r-0 border-orange-600 bg-orange-600 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </Button>
                  <Input
                    value={organisationData.contact}
                    onChange={(e) => onChange({ contact: e.target.value })}
                    placeholder="Contact principal"
                    className="h-12 text-base bg-white border-2 border-gray-200 border-l-0 -ml-px rounded-none rounded-r-xl shadow-sm focus:border-orange-500 focus:ring-orange-500/30"
                  />
                </div>
                {errors?.contact && (
                  <p className="text-sm text-red-600 mt-1">{errors.contact}</p>
                )}
              </div>

              {/* Adresse */}
              <div className="space-y-3 mb-6">
                <Label className="text-gray-700 font-medium">Adresse</Label>
                <div className="flex items-stretch w-full">
                  <Button type="button" variant="outline" className="h-12 px-4 rounded-r-none rounded-l-xl border-2 border-r-0 border-orange-600 bg-orange-600 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </Button>
                  <Input
                    value={organisationData.adresse || ''}
                    onChange={(e) => onChange({ adresse: e.target.value })}
                    placeholder="Adresse complète"
                    className="h-12 text-base bg-white border-2 border-gray-200 border-l-0 -ml-px rounded-none rounded-r-xl shadow-sm focus:border-orange-500 focus:ring-orange-500/30"
                  />
                </div>
                {errors?.adresse && (
                  <p className="text-sm text-red-600 mt-1">{errors.adresse}</p>
                )}
              </div>

              {/* Domaine d'activité */}
              <div className="space-y-3 mb-6">
                <Label className="text-gray-700 font-medium">Domaine d'activité</Label>
                <div className="flex items-stretch w-full">
                  <Button type="button" variant="outline" className="h-12 px-4 rounded-r-none rounded-l-xl border-2 border-r-0 border-orange-600 bg-orange-600 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-white" />
                  </Button>
                  <Input
                    value={organisationData.domaineActivite || ''}
                    onChange={(e) => onChange({ domaineActivite: e.target.value })}
                    placeholder="Secteur d'activité"
                    className="h-12 text-base bg-white border-2 border-gray-200 border-l-0 -ml-px rounded-none rounded-r-xl shadow-sm focus:border-orange-500 focus:ring-orange-500/30"
                  />
                </div>
                {errors?.domaineActivite && (
                  <p className="text-sm text-red-600 mt-1">{errors.domaineActivite}</p>
                )}
              </div>

              {/* Code Organisation */}
              <div className="space-y-3 mb-6">
                <Label className="text-gray-700 font-medium">Code organisation</Label>
                <div className="flex items-stretch w-full max-w-md">
                  <Button type="button" variant="outline" className="h-12 px-4 rounded-r-none rounded-l-xl border-2 border-r-0 border-orange-600 bg-orange-600 flex items-center justify-center">
                    <Hash className="w-5 h-5 text-white" />
                  </Button>
                  <Input
                    value={organisationData.codeOrganisation || ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const sanitized = raw.replace(/\s+/g, '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                      onChange({ codeOrganisation: sanitized });
                    }}
                    placeholder="Code interne (optionnel)"
                    className="h-12 text-base bg-white border-2 border-gray-200 border-l-0 -ml-px rounded-none rounded-r-xl shadow-sm focus:border-orange-500 focus:ring-orange-500/30"
                    inputMode="text"
                    pattern="[A-Za-z0-9]*"
                  />
                </div>
                {errors?.codeOrganisation && (
                  <p className="text-sm text-red-600 mt-1">{errors.codeOrganisation}</p>
                )}
              </div>
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
};



'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../ui/card';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../ui/command';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, IdCard, Check, ChevronsUpDown } from 'lucide-react';
import { fanafApi } from '../../../services/fanafApi';
import { Skeleton } from '../../ui/skeleton';
import { cn } from '../../ui/utils';

interface ParticipantPrincipalState {
  nom: string;
  prenom: string;
  email: string;
  pays: string;
  telephone: string;
  typeIdentite: 'passeport' | 'cni';
  numeroIdentite: string; 
}

interface StepInformationsProps {
  participantPrincipal: ParticipantPrincipalState;
  onChange: (patch: Partial<ParticipantPrincipalState>) => void;
  telephoneError?: string | null;
  onTelephoneChange?: (value: string) => void;
}

export const StepInformations: React.FC<StepInformationsProps> = ({
  participantPrincipal,
  onChange,
  telephoneError,
  onTelephoneChange,
}) => {
  // Récupérer les pays depuis l'API
  const { data: countriesResponse, isLoading: isLoadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      return await fanafApi.getCountries();
    },
    staleTime: 10 * 60 * 1000, // Cache pendant 10 minutes
    gcTime: 30 * 60 * 1000, // Garder en cache pendant 30 minutes
  });

  const countries = countriesResponse?.data || [];
  
  const [open, setOpen] = useState(false);

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
            Informations personnelles
          </h2>
          <p className="text-gray-600 text-lg">
            Veuillez renseigner les détails du participant principal.
          </p>
        </div>

        {/* Formulaire */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 md:gap-x-16">
          {/* Prénom */}
          <div className="space-y-3 mb-6">
            <Label className="text-gray-700 font-medium">Prénom *</Label>
            <div className="flex items-stretch w-full max-w-md">
              <Button type="button" variant="outline" className="h-12 px-4 rounded-r-none rounded-l-xl border-2 border-r-0 border-orange-600 bg-orange-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </Button>
              <Input
                value={participantPrincipal.prenom}
                onChange={(e) => onChange({ prenom: e.target.value })}
                placeholder="Prénom"
                className="h-12 text-base bg-white border-2 border-gray-200 border-l-0 -ml-px rounded-none rounded-r-xl shadow-sm focus:border-orange-500 focus:ring-orange-500/30"
              />
            </div>
          </div>

          {/* Nom */}
          <div className="space-y-3 mb-6">
            <Label className="text-gray-700 font-medium">Nom *</Label>
            <div className="flex items-stretch w-full max-w-md">
              <Button type="button" variant="outline" className="h-12 px-4 rounded-r-none rounded-l-xl border-2 border-r-0 border-orange-600 bg-orange-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </Button>
              <Input
                value={participantPrincipal.nom}
                onChange={(e) => onChange({ nom: e.target.value })}
                placeholder="Nom de famille"
                className="h-12 text-base bg-white border-2 border-gray-200 border-l-0 -ml-px rounded-none rounded-r-xl shadow-sm focus:border-orange-500 focus:ring-orange-500/30"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-3 mb-6">
            <Label className="text-gray-700 font-medium">Adresse e-mail *</Label>
            <div className="flex items-stretch w-full max-w-md">
              <Button type="button" variant="outline" className="h-12 px-4 rounded-r-none rounded-l-xl border-2 border-r-0 border-orange-600 bg-orange-600 flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </Button>
              <Input
                type="email"
                value={participantPrincipal.email}
                onChange={(e) => onChange({ email: e.target.value })}
                placeholder="email@exemple.com"
                className="h-12 text-base bg-white border-2 border-gray-200 border-l-0 -ml-px rounded-none rounded-r-xl shadow-sm focus:border-orange-500 focus:ring-orange-500/30"
              />
            </div>
          </div>

          {/* Téléphone */}
          <div className="space-y-3 mb-6">
            <Label className="text-gray-700 font-medium">Téléphone *</Label>
            <div className="flex items-stretch w-full max-w-md">
              <Button type="button" variant="outline" className={`h-12 px-4 rounded-r-none rounded-l-xl border-2 border-r-0 flex items-center justify-center ${
                telephoneError ? 'border-red-600 bg-red-600' : 'border-orange-600 bg-orange-600'
              }`}>
                <Phone className={`w-5 h-5 ${telephoneError ? 'text-white' : 'text-white'}`} />
              </Button>
              <Input
                value={participantPrincipal.telephone}
                onChange={(e) => {
                  const value = e.target.value;
                  onChange({ telephone: value });
                  if (onTelephoneChange) {
                    onTelephoneChange(value);
                  }
                }}
                placeholder="+225 XX XX XX XX XX"
                className={`h-12 text-base bg-white border-2 border-l-0 -ml-px rounded-none rounded-r-xl shadow-sm focus:ring-orange-500/30 ${
                  telephoneError 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-200 focus:border-orange-500'
                }`}
              />
            </div>
            {telephoneError && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {telephoneError}
              </p>
            )}
          </div>

          {/* Pays */}
          <div className="space-y-3 mb-6">
            <Label className="text-gray-700 font-medium">Pays *</Label>
            <div className="flex items-stretch w-full max-w-md">
              <Button type="button" variant="outline" className="h-12 px-4 rounded-r-none rounded-l-xl border-2 border-r-0 border-orange-600 bg-orange-600 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </Button>
              {isLoadingCountries ? (
                <Skeleton className="h-12 flex-1 rounded-none rounded-r-xl" />
              ) : (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="h-12 text-base bg-white border-2 border-gray-200 border-l-0 -ml-px rounded-none rounded-r-xl justify-between hover:bg-gray-50 focus:ring-orange-500/30 focus:border-orange-500"
                    >
                      <span className="truncate">
                        {participantPrincipal.pays
                          ? countries.find((country) => country.name === participantPrincipal.pays)?.name || participantPrincipal.pays
                          : "Sélectionnez un pays"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Rechercher un pays..." />
                      <CommandList className="max-h-[200px] overflow-y-auto">
                        <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
                        <CommandGroup>
                          {countries.map((country) => (
                            <CommandItem
                              key={country.id}
                              value={country.name}
                              onSelect={() => {
                                onChange({ pays: country.name });
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  participantPrincipal.pays === country.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex items-center gap-2">
                                {country.flag_url && (
                                  <img 
                                    src={country.flag_url} 
                                    alt={country.name}
                                    className="w-5 h-3 object-cover"
                                  />
                                )}
                                <span>{country.name}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          {/* Type de pièce */}
          <div className="space-y-3 mb-6">
            <Label className="text-gray-700 font-medium">
              Type de pièce d’identité *
            </Label>
            <div className="flex items-stretch w-full max-w-xl">
              <Button type="button" variant="outline" className="h-12 px-4 rounded-r-none rounded-l-xl border-2 border-r-0 border-orange-600 bg-orange-600 flex items-center justify-center">
                <IdCard className="w-5 h-5 text-white" />
              </Button>
              <Select
                value={participantPrincipal.typeIdentite}
                onValueChange={(value: 'passeport' | 'cni') => onChange({ typeIdentite: value })}
              >
                <SelectTrigger className="h-12 text-base bg-white border-2 border-gray-200 border-l-0 -ml-px rounded-none rounded-r-xl focus:ring-orange-500/30 focus:border-orange-500">
                  <SelectValue placeholder="Passeport / CNI" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passeport">Passeport</SelectItem>
                  <SelectItem value="cni">Carte Nationale d'Identité</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Numéro de pièce */}
          <div className="space-y-3 md:col-span-2">
            <Label className="text-gray-700 font-medium">
              Numéro de {participantPrincipal.typeIdentite === 'cni' ? 'CNI' : 'Passeport'} *
            </Label>
            <div className="flex items-stretch">
              <Button type="button" variant="outline" className="h-12 px-4 rounded-r-none rounded-l-xl border-2 border-r-0 border-orange-600 bg-orange-600 flex items-center justify-center">
                <IdCard className="w-5 h-5 text-white" />
              </Button>
              <Input
                value={participantPrincipal.numeroIdentite}
                onChange={(e) => {
                  const raw = e.target.value;
                  const sanitized = raw.replace(/\s+/g, '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                  onChange({ numeroIdentite: sanitized });
                }}
                placeholder="Numéro de la pièce"
                className="h-12 text-base bg-white border-2 border-gray-200 border-l-0 -ml-px rounded-none rounded-r-xl shadow-sm focus:border-orange-500 focus:ring-orange-500/30"
                inputMode="text"
                pattern="[A-Za-z0-9]*"
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

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
import { Separator } from '../../ui/separator';
import { ScrollArea } from '../../ui/scroll-area';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, IdCard, Check, ChevronsUpDown, AlertCircle } from 'lucide-react';
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
  const [searchValue, setSearchValue] = useState('');
  
  // Filtrer les pays en fonction de la recherche (minimum 3 caractères)
  const filteredCountries = searchValue.length >= 3
    ? countries.filter(country => 
        country.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white via-white to-orange-50/30 backdrop-blur-sm shadow-2xl border border-gray-200/50 overflow-hidden relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-100/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center space-y-3"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg mb-2">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Informations personnelles
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
              Veuillez renseigner les détails du participant principal
            </p>
          </motion.div>

          <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

          {/* Formulaire avec sections groupées */}
          <div className="space-y-10">
            {/* Section: Identité */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
                <h3 className="text-xl font-semibold text-gray-800">Identité</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prénom */}
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <Label className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm uppercase tracking-wide shadow-sm">
                    Prénom <span className="ml-1 text-orange-100">*</span>
                  </Label>
                  <Input
                    value={participantPrincipal.prenom}
                    onChange={(e) => onChange({ prenom: e.target.value })}
                    placeholder="Prénom"
                    className="h-14 px-4 text-base bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl shadow-sm transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/20 hover:border-orange-300"
                  />
                </motion.div>

                {/* Nom */}
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <Label className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm uppercase tracking-wide shadow-sm">
                    Nom <span className="ml-1 text-orange-100">*</span>
                  </Label>
                  <Input
                    value={participantPrincipal.nom}
                    onChange={(e) => onChange({ nom: e.target.value })}
                    placeholder="Nom de famille"
                    className="h-14 px-4 text-base bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl shadow-sm transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/20 hover:border-orange-300"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Section: Contact */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                <h3 className="text-xl font-semibold text-gray-800">Contact</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Email */}
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <Label className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm uppercase tracking-wide shadow-sm">
                    Adresse e-mail <span className="ml-1 text-orange-100">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={participantPrincipal.email}
                    onChange={(e) => onChange({ email: e.target.value })}
                    placeholder="email@exemple.com"
                    className="h-14 px-4 text-base bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl shadow-sm transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/20 hover:border-orange-300"
                  />
                </motion.div>

                {/* Téléphone */}
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <Label className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm uppercase tracking-wide shadow-sm">
                    Téléphone <span className="ml-1 text-orange-100">*</span>
                  </Label>
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
                    className={`h-14 px-4 text-base bg-white/80 backdrop-blur-sm border-2 rounded-xl shadow-sm transition-all duration-300 focus:ring-4 ${
                      telephoneError 
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 hover:border-red-400' 
                        : 'border-gray-200 focus:border-orange-400 focus:ring-orange-500/20 hover:border-orange-300'
                    }`}
                  />
                  {telephoneError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700">{telephoneError}</p>
                    </motion.div>
                  )}
                </motion.div>

                {/* Pays */}
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2 md:col-span-2"
                >
                  <Label className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm uppercase tracking-wide shadow-sm">
                    Pays <span className="ml-1 text-orange-100">*</span>
                  </Label>

                  {isLoadingCountries ? (
                    <Skeleton className="h-14 rounded-xl" />
                  ) : (
                    <Popover 
                      open={open} 
                      onOpenChange={(isOpen) => {
                        setOpen(isOpen);
                        if (!isOpen) {
                          setSearchValue(''); // Réinitialiser la recherche quand on ferme
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="h-14 px-4 text-base bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl justify-between hover:bg-white/90 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-400 transition-all duration-300 w-full"
                        >
                          <span className="truncate text-left flex-1">
                            {participantPrincipal.pays
                              ? countries.find((country) => country.name === participantPrincipal.pays)?.name || participantPrincipal.pays
                              : "Sélectionnez un pays"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent 
                        className="w-[400px] p-0 shadow-xl border-2 bg-white rounded-xl overflow-hidden max-h-[280px] flex flex-col"
                        align="start"
                      >
                        <Command className="bg-white flex flex-col h-full max-h-full" shouldFilter={false}>
                          <div 
                            data-slot="command-input-wrapper"
                            className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10 flex-shrink-0"
                          >
                            <CommandInput 
                              placeholder="Tapez au moins 3 caractères pour rechercher..." 
                              className="h-10 text-base text-gray-900 placeholder:text-gray-400"
                              value={searchValue}
                              onValueChange={setSearchValue}
                            />
                          </div>

                          <ScrollArea className="flex-1 min-h-0 max-h-[200px] overflow-y-auto">
                            <CommandList>
                              {searchValue.length < 3 ? (
                                <div className="py-8 text-center text-gray-500 px-4">
                                  <p className="text-sm font-medium mb-1">Recherche en cours...</p>
                                  <p className="text-xs text-gray-400">
                                    Veuillez saisir au moins 3 caractères pour afficher les résultats
                                  </p>
                                </div>
                              ) : filteredCountries.length === 0 ? (
                                <CommandEmpty className="py-8 text-center text-gray-500">
                                  Aucun pays trouvé.
                                </CommandEmpty>
                              ) : (
                                <CommandGroup>
                                  {filteredCountries.map((country) => (
                                    <CommandItem
                                      key={country.id}
                                      value={country.name}
                                      onSelect={() => {
                                        onChange({ pays: country.name });
                                        setOpen(false);
                                        setSearchValue(''); // Réinitialiser la recherche après sélection
                                      }}
                                      className="cursor-pointer hover:bg-gray-100 transition-colors py-3 px-2"
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4 text-green-600",
                                          participantPrincipal.pays === country.name
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      <div className="flex items-center gap-3">
                                        {country.flag_url && (
                                          <img
                                            src={country.flag_url}
                                            alt={country.name}
                                            className="w-6 h-4 object-cover rounded border border-gray-200"
                                          />
                                        )}
                                        <span className="font-medium">{country.name}</span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              )}
                            </CommandList>
                          </ScrollArea>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                </motion.div>
              </div>
            </motion.div>

            {/* Section: Documents d'identité */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                <h3 className="text-xl font-semibold text-gray-800">Documents d'identité</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Type de pièce */}
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <Label className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm uppercase tracking-wide shadow-sm">
                    Type de pièce d'identité <span className="ml-1 text-orange-100">*</span>
                  </Label>
                  <Select
                    value={participantPrincipal.typeIdentite}
                    onValueChange={(value: 'passeport' | 'cni') => onChange({ typeIdentite: value })}
                  >
                    <SelectTrigger className="h-14 px-4 text-base bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-400 transition-all duration-300 hover:border-orange-300">
                      <SelectValue placeholder="Passeport / CNI" />
                    </SelectTrigger>
                      <SelectContent className="shadow-xl border-2">
                        <SelectItem value="passeport" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <IdCard className="w-4 h-4" />
                            <span>Passeport</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="cni" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <IdCard className="w-4 h-4" />
                            <span>Carte Nationale d'Identité</span>
                          </div>
                        </SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Numéro de pièce */}
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <Label className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm uppercase tracking-wide shadow-sm">
                    Numéro de {participantPrincipal.typeIdentite === 'cni' ? 'CNI' : 'Passeport'} <span className="ml-1 text-orange-100">*</span>
                  </Label>
                  <Input
                    value={participantPrincipal.numeroIdentite}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const sanitized = raw.replace(/\s+/g, '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                      onChange({ numeroIdentite: sanitized });
                    }}
                    placeholder="Numéro de la pièce"
                    className="h-14 px-4 text-base bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl shadow-sm transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/20 hover:border-orange-300 font-mono tracking-wide"
                    inputMode="text"
                    pattern="[A-Za-z0-9]*"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

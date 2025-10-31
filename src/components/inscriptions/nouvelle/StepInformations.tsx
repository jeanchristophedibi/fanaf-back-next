'use client';

import React from 'react';
import { Card } from '../../ui/card';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, IdCard } from 'lucide-react';

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
}

export const StepInformations: React.FC<StepInformationsProps> = ({
  participantPrincipal,
  onChange,
}) => {
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
              <Button type="button" variant="outline" className="h-12 px-4 rounded-r-none rounded-l-xl border-2 border-r-0 border-orange-600 bg-orange-600 flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </Button>
              <Input
                value={participantPrincipal.telephone}
                onChange={(e) => onChange({ telephone: e.target.value })}
                placeholder="+225 XX XX XX XX XX"
                className="h-12 text-base bg-white border-2 border-gray-200 border-l-0 -ml-px rounded-none rounded-r-xl shadow-sm focus:border-orange-500 focus:ring-orange-500/30"
              />
            </div>
          </div>

          {/* Pays */}
          <div className="space-y-3 mb-6">
            <Label className="text-gray-700 font-medium">Pays *</Label>
            <div className="flex items-stretch w-full max-w-md">
              <Button type="button" variant="outline" className="h-12 px-4 rounded-r-none rounded-l-xl border-2 border-r-0 border-orange-600 bg-orange-600 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </Button>
              <Input
                value={participantPrincipal.pays}
                onChange={(e) => onChange({ pays: e.target.value })}
                placeholder="Ex : Côte d’Ivoire"
                className="h-12 text-base bg-white border-2 border-gray-200 border-l-0 -ml-px rounded-none rounded-r-xl shadow-sm focus:border-orange-500 focus:ring-orange-500/30"
              />
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

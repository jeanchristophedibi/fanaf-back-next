'use client';

import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { motion } from 'motion/react';
import { User, Users, X, Phone, IdCard, Briefcase } from 'lucide-react';

type TypeInscription = 'individuel' | 'groupe' | '';

interface StepInscriptionProps {
  typeInscription: TypeInscription;
  setTypeInscription: (v: 'individuel' | 'groupe') => void;
  participantsGroupe: any[];
  setParticipantsGroupe: (items: any[]) => void;
}

export const StepInscription: React.FC<StepInscriptionProps> = ({ typeInscription, setTypeInscription, participantsGroupe, setParticipantsGroupe }) => {
  const addParticipant = () => setParticipantsGroupe([...participantsGroupe, { nom: '', prenom: '', email: '', telephone: '', numeroIdentite: '', jobTitle: '' }]);
  const updateParticipant = (index: number, patch: any) => {
    const next = [...participantsGroupe];
    next[index] = { ...next[index], ...patch };
    setParticipantsGroupe(next);
  };
  const removeParticipant = (index: number) => setParticipantsGroupe(participantsGroupe.filter((_, i) => i !== index));

  return (
    <Card className="p-10 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border border-gray-100 space-y-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Type d'inscription</h2>
        <p className="text-gray-600 mt-2 text-lg">Inscription individuelle ou groupée</p>
      </div>

      <div className="flex flex-wrap justify-center gap-16">
        {/* Individuel */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setTypeInscription('individuel')}
          className={`relative flex flex-col items-center justify-center w-64 h-64 rounded-full transition-all duration-300 
            ${typeInscription === 'individuel'
              ? 'bg-orange-600 text-white shadow-2xl scale-105'
              : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg'}
          `}
        >
          {/* halo removed */}
          <div className="relative z-10 text-center">
            <div className={`w-24 h-24 mx-auto mb-5 rounded-full flex items-center justify-center ${typeInscription === 'individuel' ? 'bg-transparent' : 'bg-orange-50'}`}>
              <User className={`w-12 h-12 ${typeInscription === 'individuel' ? 'text-white' : 'text-orange-600'}`} />
            </div>
            <h3 className={`text-xl font-semibold mb-1 ${typeInscription === 'individuel' ? 'text-white' : 'text-gray-900'}`}>Individuel</h3>
            <p className={`${typeInscription === 'individuel' ? 'text-white/80' : 'text-gray-600'}`}>Un seul participant</p>
          </div>
        </motion.button>

        {/* Groupe */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setTypeInscription('groupe')}
          className={`relative flex flex-col items-center justify-center w-64 h-64 rounded-full transition-all duration-300 
            ${typeInscription === 'groupe'
              ? 'bg-blue-600 text-white shadow-2xl scale-105'
              : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg'}
          `}
        >
          {/* halo removed */}
          <div className="relative z-10 text-center">
            <div className={`w-24 h-24 mx-auto mb-5 rounded-full flex items-center justify-center ${typeInscription === 'groupe' ? 'bg-transparent' : 'bg-blue-50'}`}>
              <Users className={`w-12 h-12 ${typeInscription === 'groupe' ? 'text-white' : 'text-blue-600'}`} />
            </div>
            <h3 className={`text-xl font-semibold mb-1 ${typeInscription === 'groupe' ? 'text-white' : 'text-gray-900'}`}>Groupe</h3>
            <p className={`${typeInscription === 'groupe' ? 'text-white/80' : 'text-gray-600'}`}>Plusieurs participants</p>
          </div>
        </motion.button>
      </div>
      <div className="mb-24" />

      {typeInscription === 'groupe' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">Participants du groupe</h4>
            <Button onClick={addParticipant} className="bg-blue-600 hover:bg-blue-700 text-white">Ajouter</Button>
          </div>
          {participantsGroupe.map((p, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-100">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-md font-medium text-gray-900">Participant #{idx + 2}</h5>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => removeParticipant(idx)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                {/* Première ligne : Prénom, Nom, Email */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Prénom <span className="text-red-500">*</span></Label>
                    <Input 
                      value={p.prenom || ''} 
                      onChange={(e) => updateParticipant(idx, { prenom: e.target.value })} 
                      placeholder="Prénom" 
                      className="border-2 focus:border-indigo-500 h-10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Nom <span className="text-red-500">*</span></Label>
                    <Input 
                      value={p.nom || ''} 
                      onChange={(e) => updateParticipant(idx, { nom: e.target.value })} 
                      placeholder="Nom" 
                      className="border-2 focus:border-indigo-500 h-10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Email <span className="text-red-500">*</span></Label>
                    <Input 
                      type="email"
                      value={p.email || ''} 
                      onChange={(e) => updateParticipant(idx, { email: e.target.value })} 
                      placeholder="email@exemple.com" 
                      className="border-2 focus:border-indigo-500 h-10" 
                    />
                  </div>
                </div>
                
                {/* Deuxième ligne : Téléphone, Numéro d'identité, Job Title */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Téléphone
                    </Label>
                    <Input 
                      type="tel"
                      value={p.telephone || ''} 
                      onChange={(e) => updateParticipant(idx, { telephone: e.target.value })} 
                      placeholder="+225 XX XX XX XX XX" 
                      className="border-2 focus:border-indigo-500 h-10" 
                    />
                    <p className="text-xs text-gray-500">Si vide, utilisera le téléphone du participant principal</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600 flex items-center gap-1">
                      <IdCard className="w-3 h-3" />
                      Numéro de passeport/CNI
                    </Label>
                    <Input 
                      value={p.numeroIdentite || ''} 
                      onChange={(e) => {
                        const raw = e.target.value;
                        const sanitized = raw.replace(/\s+/g, '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                        updateParticipant(idx, { numeroIdentite: sanitized });
                      }}
                      placeholder="ABC123456" 
                      className="border-2 focus:border-indigo-500 h-10 font-mono tracking-wide" 
                    />
                    <p className="text-xs text-gray-500">Si vide, utilisera le numéro du participant principal</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      Fonction/Poste
                    </Label>
                    <Input 
                      value={p.jobTitle || ''} 
                      onChange={(e) => updateParticipant(idx, { jobTitle: e.target.value })} 
                      placeholder="Directeur Commercial" 
                      className="border-2 focus:border-indigo-500 h-10" 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};



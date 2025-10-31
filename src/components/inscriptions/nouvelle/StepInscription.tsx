'use client';

import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { motion } from 'motion/react';
import { User, Users, X } from 'lucide-react';

type TypeInscription = 'individuel' | 'groupe' | '';

interface StepInscriptionProps {
  typeInscription: TypeInscription;
  setTypeInscription: (v: 'individuel' | 'groupe') => void;
  participantsGroupe: any[];
  setParticipantsGroupe: (items: any[]) => void;
}

export const StepInscription: React.FC<StepInscriptionProps> = ({ typeInscription, setTypeInscription, participantsGroupe, setParticipantsGroupe }) => {
  const addParticipant = () => setParticipantsGroupe([...participantsGroupe, { nom: '', prenom: '', email: '' }]);
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input value={p.prenom} onChange={(e) => updateParticipant(idx, { prenom: e.target.value })} placeholder="Prénom" className="border-2 focus:border-indigo-500" />
                <Input value={p.nom} onChange={(e) => updateParticipant(idx, { nom: e.target.value })} placeholder="Nom" className="border-2 focus:border-indigo-500" />
                <Input value={p.email} onChange={(e) => updateParticipant(idx, { email: e.target.value })} placeholder="Email" className="border-2 focus:border-indigo-500" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};



'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../ui/card';
import { motion } from 'motion/react';
import { Shield, Briefcase, Check } from 'lucide-react';
import { fanafApi } from '../../../services/fanafApi';
import { Skeleton } from '../../ui/skeleton';

export type StatutParticipant = 'membre' | 'non-membre' | 'vip' | 'speaker';

interface StepTypeProps {
  typeParticipant: StatutParticipant | '';
  setTypeParticipant: (v: StatutParticipant) => void;
}

export const StepType: React.FC<StepTypeProps> = ({ typeParticipant, setTypeParticipant }) => {
  // Récupérer les types d'inscription depuis l'API
  const { data: registrationTypesResponse, isLoading: isLoadingTypes, isError: isErrorTypes } = useQuery({
    queryKey: ['registrationTypes'],
    queryFn: async () => {
      return await fanafApi.getRegistrationTypes();
    },
    staleTime: 5 * 60 * 1000, // Cache pendant 5 minutes
    gcTime: 10 * 60 * 1000, // Garder en cache pendant 10 minutes
  });

  const registrationTypes = registrationTypesResponse?.data || [];

  // Mapper les données de l'API vers les options
  const options = registrationTypes.map((rt) => {
    // Déterminer le type de participant selon le slug
    let id: StatutParticipant = 'non-membre';
    let icon = Briefcase;
    let color = 'orange';
    let description = 'Autre organisation';

    if (rt.slug === 'membre-fanaf') {
      id = 'membre';
      icon = Shield;
      color = 'blue';
      description = 'Organisation membre';
    }

    return {
      id,
      label: rt.name,
      description,
      price: rt.amount_formatted,
      icon,
      color,
      slug: rt.slug,
    };
  });

  // Afficher un loader pendant le chargement
  if (isLoadingTypes) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-center"
      >
        <Card className="p-10 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border border-gray-100 w-full max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Choisissez le type de participant</h2>
            <p className="text-gray-600 mt-2 text-lg">Chargement des tarifs...</p>
          </div>
          <div className="flex flex-wrap justify-center gap-16">
            {registrationTypes.length > 0 
              ? registrationTypes.map((_, i) => (
                  <Skeleton key={i} className="w-64 h-64 rounded-full" />
                ))
              : [1, 2].map((i) => (
                  <Skeleton key={i} className="w-64 h-64 rounded-full" />
                ))}
          </div>
        </Card>
      </motion.div>
    );
  }

  // Afficher une erreur si le chargement a échoué ou si aucune donnée n'est disponible
  if (isErrorTypes || options.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-center"
      >
        <Card className="p-10 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border border-gray-100 w-full max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Choisissez le type de participant</h2>
            <p className="text-red-600 mt-2 text-lg">
              {isErrorTypes 
                ? 'Erreur lors du chargement des types d\'inscription. Veuillez réessayer.'
                : 'Aucun type d\'inscription disponible.'}
            </p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex justify-center"
    >
      <Card className="p-10 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border border-gray-100 w-full max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Choisissez le type de participant</h2>
          <p className="text-gray-600 mt-2 text-lg">Sélectionnez une option pour continuer</p>
        </div>

        {/* ✅ Alignement horizontal */}
        <div className="flex flex-wrap justify-center gap-16">
          {options.map((option) => {
            const Icon = option.icon;
            const isActive = typeParticipant === option.id;

            return (
              <motion.button
                key={option.id}
                type="button"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setTypeParticipant(option.id)}
                className={`relative flex flex-col items-center justify-center w-64 h-64 rounded-full transition-all duration-300 
                  ${
                    isActive
                      ? `bg-gradient-to-br from-${option.color}-600 to-${option.color}-700 text-white shadow-2xl scale-105`
                      : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg'
                  }`}
              >
                {/* Halo lumineux animé */}
                {isActive && (
                  <motion.div
                    className={`absolute inset-0 rounded-full bg-gradient-to-br from-${option.color}-400/40 to-${option.color}-700/20 blur-xl`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                {/* Contenu centré */}
                <div className="relative z-10 text-center">
                  <div
                    className={`w-24 h-24 mx-auto mb-5 rounded-full flex items-center justify-center 
                      ${isActive ? 'bg-white/20' : `bg-${option.color}-50`}
                    `}
                  >
                    <Icon
                      className={`w-12 h-12 ${
                        isActive ? 'text-white' : `text-${option.color}-600`
                      }`}
                    />
                  </div>

                  <h3
                    className={`text-xl font-semibold mb-1 ${
                      isActive ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {option.label}
                  </h3>
                  <p
                    className={`text-sm ${
                      isActive ? 'text-white/80' : 'text-gray-600'
                    }`}
                  >
                    {option.description}
                  </p>
                  <p
                    className={`mt-3 font-semibold ${
                      isActive ? 'text-white' : `text-${option.color}-700`
                    }`}
                  >
                    {option.price}
                  </p>
                </div>

                {/* Check animé */}
                {isActive && (
                  <motion.div
                    className="absolute top-5 right-5 bg-white/30 backdrop-blur-md p-2 rounded-full"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 15 }}
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
        {/* Espace supplémentaire au bas pour éloigner du footer sticky */}
        <div className="mt-12" />
      </Card>
    </motion.div>
  );
};

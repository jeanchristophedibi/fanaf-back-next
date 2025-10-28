import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, TrendingUp, Building2, Calendar } from 'lucide-react';
import { useDynamicInscriptions } from './hooks/useDynamicInscriptions';
import { Badge } from './ui/badge';

interface DynamicDataIndicatorProps {
  enabled?: boolean;
  includeOrganisations?: boolean;
  includeRendezVous?: boolean;
  includeReservations?: boolean;
}

export function DynamicDataIndicator({ 
  enabled = true,
  includeOrganisations = true,
  includeRendezVous = true,
  includeReservations = false, // Désactivé car la rubrique stand a été retirée
}: DynamicDataIndicatorProps) {
  const { 
    lastAddedParticipant, 
    lastAddedOrganisation,
    lastAddedRendezVous,
    lastAddedReservation,
    totalAdded 
  } = useDynamicInscriptions({ 
    enabled,
    includeOrganisations,
    includeRendezVous,
    includeReservations: false, // Désactivé car la rubrique stand a été retirée
  });

  const getNotificationColor = () => {
    if (lastAddedOrganisation) return 'from-blue-500 to-blue-600';
    if (lastAddedRendezVous) return 'from-purple-500 to-purple-600';
    return 'from-orange-500 to-orange-600';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Compteur total - Caché */}
      {/* <AnimatePresence>
        {totalAdded > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-green-500"
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Données simulées</p>
                <p className="text-gray-900">+{totalAdded} mise{totalAdded > 1 ? 's' : ''} à jour</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}

      {/* Notification de nouvelle inscription */}
      <AnimatePresence>
        {lastAddedParticipant && (
          <motion.div
            key="participant"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`bg-gradient-to-r ${getNotificationColor()} text-white rounded-lg shadow-xl p-4 max-w-sm`}
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 1 }}
                className="bg-white/20 p-2 rounded-full"
              >
                <UserPlus className="w-5 h-5" />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">Nouvelle inscription</p>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                  </motion.div>
                </div>
                <p className="text-sm text-white/90">
                  {lastAddedParticipant.prenom} {lastAddedParticipant.nom}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    className={
                      lastAddedParticipant.statut === 'membre' ? 'bg-green-700' :
                      lastAddedParticipant.statut === 'non-membre' ? 'bg-gray-700' :
                      lastAddedParticipant.statut === 'vip' ? 'bg-purple-700' :
                      'bg-blue-700'
                    }
                  >
                    {lastAddedParticipant.statut === 'membre' ? 'Membre' :
                     lastAddedParticipant.statut === 'non-membre' ? 'Non-membre' :
                     lastAddedParticipant.statut === 'vip' ? 'VIP' :
                     lastAddedParticipant.statut === 'speaker' ? 'Speaker' :
                     'Référent'}
                  </Badge>
                  {lastAddedParticipant.statutInscription === 'finalisée' && (
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">
                      ✓ Finalisée
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification de nouvelle organisation */}
      <AnimatePresence>
        {lastAddedOrganisation && (
          <motion.div
            key="organisation"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-xl p-4 max-w-sm"
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 1 }}
                className="bg-white/20 p-2 rounded-full"
              >
                <Building2 className="w-5 h-5" />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">Nouvelle organisation</p>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                  </motion.div>
                </div>
                <p className="text-sm text-white/90">
                  {lastAddedOrganisation.nom}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    className={
                      lastAddedOrganisation.statut === 'membre' ? 'bg-green-700' :
                      lastAddedOrganisation.statut === 'sponsor' ? 'bg-yellow-700' :
                      'bg-gray-700'
                    }
                  >
                    {lastAddedOrganisation.statut === 'membre' ? 'Membre' :
                     lastAddedOrganisation.statut === 'sponsor' ? 'Sponsor' :
                     'Non-membre'}
                  </Badge>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    {lastAddedOrganisation.pays}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification de nouveau rendez-vous */}
      <AnimatePresence>
        {lastAddedRendezVous && (
          <motion.div
            key="rendezVous"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-xl p-4 max-w-sm"
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 1 }}
                className="bg-white/20 p-2 rounded-full"
              >
                <Calendar className="w-5 h-5" />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">Nouvelle demande RDV</p>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                  </motion.div>
                </div>
                <p className="text-sm text-white/90">
                  {lastAddedRendezVous.date} à {lastAddedRendezVous.heure}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    className={
                      lastAddedRendezVous.type === 'sponsor' ? 'bg-yellow-700' : 'bg-blue-700'
                    }
                  >
                    {lastAddedRendezVous.type === 'sponsor' ? 'RDV Sponsor' : 'RDV Participant'}
                  </Badge>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                     {lastAddedRendezVous.statut === 'en-attente' ? '⏳ En attente' :
                      lastAddedRendezVous.statut === 'acceptée' ? '✓ Accepté' :
                      '✗ Refusé'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification de réservation de stand désactivée car cette rubrique a été retirée */}
    </div>
  );
}

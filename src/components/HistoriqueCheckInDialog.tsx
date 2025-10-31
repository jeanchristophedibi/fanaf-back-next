import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { type Participant } from './data/types';

interface CheckInHistorique {
  jour: string;
  date: string;
  heure: string;
  present: boolean;
}

interface HistoriqueCheckInDialogProps {
  participant: Participant | null;
  isOpen: boolean;
  onClose: () => void;
}

// Générer un historique de check-in simulé
const generateCheckInHistory = (participant: Participant | null): CheckInHistorique[] => {
  if (!participant) return [];

  const joursEvenement = [
    { jour: 'Jour 1', date: '09 février 2026' },
    { jour: 'Jour 2', date: '10 février 2026' },
    { jour: 'Jour 3', date: '11 février 2026' },
  ];

  return joursEvenement.map((jour, index) => {
    // Si le participant a fait un check-in, on considère qu'il était présent le premier jour
    const present = !!(participant.checkIn && index === 0);
    
    return {
      jour: jour.jour,
      date: jour.date,
      heure: present ? '08:30' : '-',
      present,
    };
  });
};

export function HistoriqueCheckInDialog({ participant, isOpen, onClose }: HistoriqueCheckInDialogProps) {
  const historique = generateCheckInHistory(participant);
  
  if (!participant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Historique de présence - {participant.prenom} {participant.nom}
          </DialogTitle>
          <DialogDescription>
            Suivi de la présence du participant durant l'événement FANAF 2026
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informations du participant */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-blue-700 mb-1">Référence</p>
                <p className="text-sm text-blue-900">{participant.reference}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700 mb-1">Organisation</p>
                <p className="text-sm text-blue-900">{participant.organisationId}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700 mb-1">Email</p>
                <p className="text-sm text-blue-900">{participant.email}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700 mb-1">Statut</p>
                <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                  {participant.statut}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Historique par jour */}
          <div className="space-y-3">
            <h3 className="text-gray-900">Présence par jour</h3>
            
            {historique.map((entry, index) => (
              <Card key={index} className={`p-4 ${
                entry.present 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      entry.present ? 'bg-green-200' : 'bg-gray-200'
                    }`}>
                      {entry.present ? (
                        <CheckCircle2 className="w-5 h-5 text-green-700" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    
                    <div>
                      <p className={`text-sm ${entry.present ? 'text-green-900' : 'text-gray-900'}`}>
                        {entry.jour}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <p className="text-xs text-gray-600">{entry.date}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    {entry.present ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">
                          Check-in: {entry.heure}
                        </span>
                      </div>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 border-gray-300">
                        Non présent
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Résumé */}
          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-orange-700">Taux de présence</p>
              <p className="text-2xl text-orange-900">
                {historique.filter(h => h.present).length} / {historique.length} jours
              </p>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

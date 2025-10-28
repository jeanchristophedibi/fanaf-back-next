import { Card, CardContent } from '../ui/card';
import { CheckCircle2, Clock } from 'lucide-react';
import { AnimatedStat } from '../AnimatedStat';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Phone, Mail, Globe, Calendar } from 'lucide-react';
import { getOrganisationById, type Participant } from '../data/mockData';

interface WidgetStatsInscriptionsProps {
  stats: {
    total: number;
    membres: number;
    nonMembres: number;
    vip: number;
    speakers: number;
    finalises: number;
    enAttente: number;
  };
  participants: Participant[];
}

const statutColors: Record<string, string> = {
  'membre': 'bg-purple-100 text-purple-800',
  'non-membre': 'bg-amber-100 text-amber-800',
  'vip': 'bg-cyan-100 text-cyan-800',
  'speaker': 'bg-yellow-100 text-yellow-800',
};

export function WidgetStatsInscriptions({ stats, participants }: WidgetStatsInscriptionsProps) {
  return (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Card Widget Stats Inscriptions Finalisées */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Inscriptions finalisées
                  </p>
                  <AnimatedStat value={stats.finalises} className="text-3xl text-green-900" />
                  <p className="text-xs text-green-600 mt-1">Paiements effectués</p>
                </div>
                <div className="bg-green-600 p-3 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Card Widget Stats Inscriptions Finalisées */}

          <Dialog>
            <DialogTrigger asChild>
              <div>
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-700 mb-1 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          En attente de paiement
                        </p>
                        <AnimatedStat value={stats.enAttente} className="text-3xl text-orange-900" />
                        <p className="text-xs text-orange-600 mt-1">Cliquer pour voir les détails</p>
                      </div>
                      <div className="bg-orange-600 p-3 rounded-lg">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Participants en attente de paiement ({stats.enAttente})
                </DialogTitle>
                <DialogDescription>
                  Liste des participants dont l'inscription n'est pas encore finalisée. Utilisez ces informations pour effectuer un suivi (appel, email, SMS).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                {participants.filter(p => p.statutInscription !== 'finalisée' && p.statut !== 'vip' && p.statut !== 'speaker').length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Aucun participant en attente de paiement</p>
                ) : (
                  participants.filter(p => p.statutInscription !== 'finalisée' && p.statut !== 'vip' && p.statut !== 'speaker').map((participant) => {
                  const organisation = getOrganisationById(participant.organisationId);
                  return (
                    <Card key={participant.id} className="border-orange-200">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-gray-500">Participant</p>
                              <p className="text-sm font-medium text-gray-900">{participant.prenom} {participant.nom}</p>
                              <p className="text-xs text-gray-600">{participant.reference}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Organisation</p>
                              <p className="text-sm text-gray-900">{organisation?.nom || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Statut</p>
                              <Badge className={statutColors[participant.statut]}>
                                {participant.statut}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <Phone className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500">Téléphone</p>
                                <a href={`tel:${participant.telephone}`} className="text-sm text-orange-600 hover:text-orange-700 hover:underline">
                                  {participant.telephone}
                                </a>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Mail className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500">Email</p>
                                <a href={`mailto:${participant.email}`} className="text-sm text-orange-600 hover:text-orange-700 hover:underline truncate block">
                                  {participant.email}
                                </a>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Globe className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500">Pays</p>
                                <p className="text-sm text-gray-900">{participant.pays}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Calendar className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500">Date d'inscription</p>
                                <p className="text-sm text-gray-900">{new Date(participant.dateInscription).toLocaleDateString('fr-FR')}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
    );
}

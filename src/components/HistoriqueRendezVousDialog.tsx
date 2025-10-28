import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Clock, User, Building2, Send, Inbox, Mail, Phone, ArrowLeft } from 'lucide-react';
import { getParticipantById, getReferentSponsor, getOrganisationById, type RendezVous } from './data/mockData';

interface HistoriqueRendezVousDialogProps {
  isOpen: boolean;
  onClose: () => void;
  participantId: string;
  rendezVousList: RendezVous[];
  onReturnToDetails?: () => void;
}

const statutRdvColors: Record<string, string> = {
  'acceptée': 'bg-green-100 text-green-800 border-green-300',
  'en-attente': 'bg-orange-100 text-orange-800 border-orange-300',
  'occupée': 'bg-red-100 text-red-800 border-red-300',
};

export function HistoriqueRendezVousDialog({ 
  isOpen, 
  onClose, 
  participantId, 
  rendezVousList,
  onReturnToDetails
}: HistoriqueRendezVousDialogProps) {
  const participant = getParticipantById(participantId);
  const participantOrganisation = participant ? getOrganisationById(participant.organisationId) : undefined;

  if (!participant) return null;

  // Rendez-vous envoyés (participant est demandeur)
  const rendezVousEnvoyes = rendezVousList.filter(rdv => rdv.demandeurId === participantId);

  // Rendez-vous reçus (participant est récepteur)
  const rendezVousRecus = rendezVousList.filter(rdv => rdv.recepteurId === participantId);

  const RdvRow: React.FC<{ rdv: RendezVous; isDemandeur: boolean }> = ({ rdv, isDemandeur }) => {
    const autreParticipant = isDemandeur 
      ? getParticipantById(rdv.recepteurId)
      : getParticipantById(rdv.demandeurId);
    const autreOrganisation = autreParticipant ? getOrganisationById(autreParticipant.organisationId) : undefined;
    const referentSponsor = rdv.type === 'sponsor' ? getReferentSponsor(rdv.recepteurId) : undefined;

    return (
      <TableRow key={rdv.id}>
        <TableCell>
          <Badge className={rdv.type === 'participant' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
            {rdv.type === 'participant' ? 'Participant' : 'Sponsor'}
          </Badge>
        </TableCell>
        <TableCell>
          {isDemandeur ? (
            // Afficher le récepteur
            rdv.type === 'sponsor' && referentSponsor ? (
              <div>
                <p className="text-gray-900">{referentSponsor.prenom} {referentSponsor.nom}</p>
                <p className="text-xs text-orange-600">{referentSponsor.fonction}</p>
                <p className="text-xs text-gray-500">{referentSponsor.organisationNom}</p>
              </div>
            ) : autreParticipant ? (
              <div>
                <p className="text-gray-900">{autreParticipant.prenom} {autreParticipant.nom}</p>
                <p className="text-xs text-gray-500">{autreOrganisation?.nom}</p>
              </div>
            ) : (
              <span className="text-gray-400">Indisponible</span>
            )
          ) : (
            // Afficher le demandeur
            autreParticipant ? (
              <div>
                <p className="text-gray-900">{autreParticipant.prenom} {autreParticipant.nom}</p>
                <p className="text-xs text-gray-500">{autreOrganisation?.nom}</p>
              </div>
            ) : (
              <span className="text-gray-400">Indisponible</span>
            )
          )}
        </TableCell>
        <TableCell className="text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            {new Date(rdv.date).toLocaleDateString('fr-FR')}
          </div>
        </TableCell>
        <TableCell className="text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            {rdv.heure}
          </div>
        </TableCell>
        <TableCell>
          <Badge className={statutRdvColors[rdv.statut]}>
            {rdv.statut}
          </Badge>
        </TableCell>
        <TableCell className="text-sm text-gray-600 max-w-xs truncate">
          {rdv.commentaire || '-'}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {onReturnToDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReturnToDetails}
                className="hover:bg-orange-50 hover:text-orange-600"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="flex-1">
              <DialogTitle>Historique des rendez-vous</DialogTitle>
              <DialogDescription>
                Historique complet des demandes de rendez-vous pour {participant.prenom} {participant.nom}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Informations du participant */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-orange-600" />
                  <h3 className="text-gray-900">{participant.prenom} {participant.nom}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <span className="font-medium">Email:</span>
                    <span className="truncate">{participant.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <span className="font-medium">Téléphone:</span>
                    <span>{participant.telephone}</span>
                  </div>
                  {participantOrganisation && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-4 h-4 text-orange-600 flex-shrink-0" />
                      <span className="font-medium">Organisation:</span>
                      <span className="truncate">{participantOrganisation.nom}</span>
                      <Badge className="ml-2 bg-orange-600 text-white flex-shrink-0">
                        {participantOrganisation.statut}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm text-gray-600">Total rendez-vous</div>
                <div className="text-3xl text-orange-600">
                  {rendezVousEnvoyes.length + rendezVousRecus.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs pour envoyés/reçus */}
        <Tabs defaultValue="envoyes" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="envoyes" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Demandes envoyées ({rendezVousEnvoyes.length})
            </TabsTrigger>
            <TabsTrigger value="recus" className="flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Demandes reçues ({rendezVousRecus.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="envoyes" className="flex-1 overflow-auto mt-4">
            {rendezVousEnvoyes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Send className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucune demande de rendez-vous envoyée</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Récepteur</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Heure</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Commentaire</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rendezVousEnvoyes.map(rdv => (
                          <RdvRow key={rdv.id} rdv={rdv} isDemandeur={true} />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recus" className="flex-1 overflow-auto mt-4">
            {rendezVousRecus.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucune demande de rendez-vous reçue</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Demandeur</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Heure</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Commentaire</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rendezVousRecus.map(rdv => (
                          <RdvRow key={rdv.id} rdv={rdv} isDemandeur={false} />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

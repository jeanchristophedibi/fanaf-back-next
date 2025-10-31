import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Clock, User, Building2, Send, Inbox, Mail, Phone, ArrowLeft } from 'lucide-react';
import { type RendezVous } from './data/types';
import { getParticipantById, getReferentSponsor, getOrganisationById } from './data/helpers';

interface HistoriqueRendezVousDialogProps {
  isOpen: boolean;
  onClose: () => void;
  participantId: string;
  rendezVousList: any[]; // accepte données API networking ou mock RendezVous
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
  // Helpers pour supporter soit le modèle mock, soit la réponse API
  const getRequester = (rdv: any) => rdv.requester || rdv.user || rdv.demandeur || (rdv.demandeurId ? getParticipantById(rdv.demandeurId) : undefined);
  const getReceiver = (rdv: any) => rdv.receiver || rdv.target_user || rdv.recepteur || (rdv.recepteurId ? getParticipantById(rdv.recepteurId) : undefined);
  const getRequesterId = (rdv: any): string | undefined => (getRequester(rdv)?.id || rdv.demandeurId || rdv.user_id)?.toString();
  const getReceiverId = (rdv: any): string | undefined => (getReceiver(rdv)?.id || rdv.recepteurId || rdv.target_user_id)?.toString();
  const getStatus = (rdv: any): string => {
    const v = String(rdv.statut || rdv.status || '').toLowerCase();
    if (v.includes('accept')) return 'acceptée';
    if (v.includes('attent')) return 'en-attente';
    if (v.includes('occup')) return 'occupée';
    return rdv.statut || rdv.status || '—';
  };
  const getDateStr = (rdv: any): string => {
    const d = rdv.date || rdv.scan_at || rdv.created_at || rdv.updated_at || rdv.datetime;
    try { return d ? new Date(d).toLocaleDateString('fr-FR') : '—'; } catch { return '—'; }
  };
  const getTimeStr = (rdv: any): string => {
    if (rdv.heure) return rdv.heure;
    const d = rdv.date || rdv.scan_at || rdv.created_at || rdv.updated_at || rdv.datetime;
    try { return d ? new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'; } catch { return '—'; }
  };

  // Construire un fallback participant si absent des mocks
  const participant = getParticipantById(participantId) as any;
  let participantOrganisation = participant ? getOrganisationById(participant.organisationId) : undefined;
  let participantDisplay = participant ? {
    prenom: participant.prenom,
    nom: participant.nom,
    email: participant.email,
    telephone: participant.telephone,
    organisation: participantOrganisation?.nom,
  } : undefined;

  if (!participantDisplay) {
    const rdvSample = rendezVousList.find((rdv) => getRequesterId(rdv) === participantId || getReceiverId(rdv) === participantId);
    const userLike = rdvSample ? (getRequesterId(rdvSample) === participantId ? getRequester(rdvSample) : getReceiver(rdvSample)) : undefined;
    if (userLike) {
      participantDisplay = {
        prenom: userLike.prenom || '',
        nom: userLike.nom || userLike.name || '',
        email: userLike.email || userLike.contact?.email || '',
        telephone: userLike.phone || userLike.contact?.phone || '',
        organisation: userLike.company || userLike.organisation || userLike.organization || userLike.organisation?.name || userLike.organization?.name,
      };
    }
  }

  if (!participantDisplay) return null;

  // Rendez-vous envoyés (participant est demandeur)
  const rendezVousEnvoyes = rendezVousList.filter(rdv => getRequesterId(rdv) === participantId);

  // Rendez-vous reçus (participant est récepteur)
  const rendezVousRecus = rendezVousList.filter(rdv => getReceiverId(rdv) === participantId);

  const RdvRow: React.FC<{ rdv: any; isDemandeur: boolean }> = ({ rdv, isDemandeur }) => {
    const requester = getRequester(rdv);
    const receiver = getReceiver(rdv);
    const autre = isDemandeur ? receiver : requester;
    const autreMock = autre?.id ? getParticipantById(autre.id) : undefined;
    const autreOrganisation = (autre?.company || autre?.organisation || autre?.organization || autreMock)
      ? (autreMock?.organisationId ? getOrganisationById(autreMock.organisationId) : undefined)
      : undefined;
    const receiverIdStr: string = String(getReceiverId(rdv) ?? '');
    const referentSponsor = rdv.type === 'sponsor' ? getReferentSponsor(receiverIdStr) : undefined;
    const sponsorOrganisation = rdv.type === 'sponsor' && receiverIdStr ? getOrganisationById(receiverIdStr) : undefined;

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
                <p className="text-xs text-gray-500">{sponsorOrganisation?.nom || ''}</p>
              </div>
            ) : (autre || autreMock) ? (
              <div>
                <p className="text-gray-900">{autre?.prenom || ''} {autre?.nom || autre?.name || autreMock?.nom || ''}</p>
                <p className="text-xs text-gray-500">{autre?.company || autreOrganisation?.nom || ''}</p>
              </div>
            ) : (
              <span className="text-gray-400">Indisponible</span>
            )
          ) : (
            // Afficher le demandeur
            (autre || autreMock) ? (
              <div>
                <p className="text-gray-900">{autre?.prenom || ''} {autre?.nom || autre?.name || autreMock?.nom || ''}</p>
                <p className="text-xs text-gray-500">{autre?.company || autreOrganisation?.nom || ''}</p>
              </div>
            ) : (
              <span className="text-gray-400">Indisponible</span>
            )
          )}
        </TableCell>
        <TableCell className="text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            {getDateStr(rdv)}
          </div>
        </TableCell>
        <TableCell className="text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            {getTimeStr(rdv)}
          </div>
        </TableCell>
        <TableCell>
          <Badge className={statutRdvColors[getStatus(rdv)] || 'bg-gray-100 text-gray-700 border-gray-300'}>
            {getStatus(rdv)}
          </Badge>
        </TableCell>
        <TableCell className="text-sm text-gray-600 max-w-xs truncate">
          {rdv.commentaire || rdv.comment || '-'}
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
                Historique complet des demandes de rendez-vous pour {participantDisplay.prenom} {participantDisplay.nom}
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
                  <h3 className="text-gray-900">{participantDisplay.prenom} {participantDisplay.nom}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <span className="font-medium">Email:</span>
                    <span className="truncate">{participantDisplay.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <span className="font-medium">Téléphone:</span>
                    <span>{participantDisplay.telephone}</span>
                  </div>
                  {(participantDisplay.organisation || participantOrganisation) && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-4 h-4 text-orange-600 flex-shrink-0" />
                      <span className="font-medium">Organisation:</span>
                      <span className="truncate">{participantDisplay.organisation || participantOrganisation?.nom}</span>
                      {participantOrganisation && (
                        <Badge className="ml-2 bg-orange-600 text-white flex-shrink-0">
                          {participantOrganisation.statut}
                        </Badge>
                      )}
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

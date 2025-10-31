'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Card, CardContent } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Calendar, CheckCircle2, Clock, Users, User, Building, Download, UserPlus } from 'lucide-react';
import { type Participant, type StatutParticipant } from '../../data/types';
import { getOrganisationById } from '../../data/helpers';
import { useDynamicInscriptions } from '../../hooks/useDynamicInscriptions';

function getTypeInscription(participant: Participant): 'Groupée' | 'Individuelle' {
  return participant.groupeId ? 'Groupée' : 'Individuelle';
}

function getMontant(statut: Participant['statut']): number {
  const PRIX: Record<StatutParticipant, number> = {
    membre: 350000,
    'non-membre': 400000,
    vip: 0,
    speaker: 0,
  };
  return PRIX[statut];
}

function isParticipantExonere(participant: Participant): boolean {
  return participant.statut === 'vip' || participant.statut === 'speaker';
}

export function AgentInscriptionsTabs() {
  const router = useRouter();
  const { participants } = useDynamicInscriptions({ includeOrganisations: false });
  const [selectedTab, setSelectedTab] = useState<'en-cours' | 'finalisees'>('en-cours');
  const [searchTerm, setSearchTerm] = useState('');

  // Query pour filtrer les inscriptions en cours
  const inscriptionsEnCoursQuery = useQuery({
    queryKey: ['agentInscriptionsTabs', 'inscriptionsEnCours', participants],
    queryFn: () => participants.filter((p) => p.statutInscription !== 'finalisée'),
    enabled: true,
    staleTime: 0,
  });

  const inscriptionsEnCours = inscriptionsEnCoursQuery.data ?? [];

  // Query pour filtrer les inscriptions finalisées
  const inscriptionsFinaliseesQuery = useQuery({
    queryKey: ['agentInscriptionsTabs', 'inscriptionsFinalisees', participants],
    queryFn: () => participants.filter((p) => p.statutInscription === 'finalisée'),
    enabled: true,
    staleTime: 0,
  });

  const inscriptionsFinalisees = inscriptionsFinaliseesQuery.data ?? [];

  const filterBySearch = (list: Participant[]) => {
    if (!searchTerm) return list;
    const needle = searchTerm.toLowerCase();
    return list.filter((p) => {
      const org = getOrganisationById(p.organisationId);
      return (
        p.nom.toLowerCase().includes(needle) ||
        p.prenom.toLowerCase().includes(needle) ||
        p.email.toLowerCase().includes(needle) ||
        p.reference.toLowerCase().includes(needle) ||
        p.telephone.toLowerCase().includes(needle) ||
        (org?.nom || '').toLowerCase().includes(needle)
      );
    });
  };

  const filteredInscriptionsEnCours = filterBySearch(inscriptionsEnCours);
  const filteredInscriptionsFinalisees = filterBySearch(inscriptionsFinalisees);

  const ouvrirFinalisation = (participant: Participant) => {
    router.push('/dashboard/agent-inscription/inscriptions/creer');
  };

  const ouvrirChoixFacture = (participant: Participant) => {
    // Redirection simple vers la page de confirmation où la facture est générée
    router.push('/dashboard/agent-inscription/inscriptions/creer');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl text-gray-900">Inscriptions</h1>
        <div className="w-72">
          <Input
            placeholder="Rechercher (nom, email, réf., org, téléphone)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="en-cours" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <Clock className="w-4 h-4 mr-2" />
            Inscriptions en cours ({inscriptionsEnCours.length})
          </TabsTrigger>
          <TabsTrigger value="finalisees" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Inscriptions finalisées ({inscriptionsFinalisees.length})
          </TabsTrigger>
        </TabsList>

        {/* En cours */}
        <TabsContent value="en-cours">
          <Card>
            <CardContent className="p-6">
              {filteredInscriptionsEnCours.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-900 mb-2">Aucune inscription en cours</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    {searchTerm ? 'Aucun résultat trouvé pour votre recherche' : 'Toutes les inscriptions ont été finalisées'}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => router.push('/dashboard/agent-inscription/inscriptions/creer')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Créer une nouvelle inscription
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Participant</TableHead>
                        <TableHead>Type participant</TableHead>
                        <TableHead>Type inscription</TableHead>
                        <TableHead>Organisation</TableHead>
                        <TableHead>Date début</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInscriptionsEnCours.map((participant) => {
                        const org = getOrganisationById(participant.organisationId);
                        return (
                          <TableRow key={participant.id} className="hover:bg-orange-50/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
                                  {participant.prenom[0]}
                                  {participant.nom[0]}
                                </div>
                                <div>
                                  <p className="text-gray-900">
                                    {participant.prenom} {participant.nom}
                                  </p>
                                  <p className="text-sm text-gray-500">{participant.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                participant.statut === 'membre'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                              }>
                                {participant.statut === 'membre' ? 'Membre' : 'Non-membre'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTypeInscription(participant) === 'Groupée' ? (
                                  <Users className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <User className="w-4 h-4 text-gray-600" />
                                )}
                                <span className="text-sm text-gray-700">
                                  {getTypeInscription(participant)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{org?.nom || 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  {new Date(participant.dateInscription).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button onClick={() => ouvrirFinalisation(participant)} className="bg-blue-600 hover:bg-blue-700 shadow-md" size="sm">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Finaliser l'inscription
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finalisées */}
        <TabsContent value="finalisees">
          <Card>
            <CardContent className="p-6">
              {filteredInscriptionsFinalisees.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-900 mb-2">Aucune inscription finalisée</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    {searchTerm ? 'Aucun résultat trouvé pour votre recherche' : 'Les inscriptions finalisées apparaîtront ici'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => router.push('/dashboard/agent-inscription/inscriptions/creer')} className="bg-blue-600 hover:bg-blue-700">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Créer une nouvelle inscription
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Participant</TableHead>
                        <TableHead>Type participant</TableHead>
                        <TableHead>Type inscription</TableHead>
                        <TableHead>Organisation</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInscriptionsFinalisees.map((participant) => {
                        const org = getOrganisationById(participant.organisationId);
                        const montant = getMontant(participant.statut);
                        return (
                          <TableRow key={participant.id} className="hover:bg-blue-50/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                                  {participant.prenom[0]}
                                  {participant.nom[0]}
                                </div>
                                <div>
                                  <p className="text-gray-900">
                                    {participant.prenom} {participant.nom}
                                  </p>
                                  <p className="text-sm text-gray-500">{participant.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                participant.statut === 'membre'
                                  ? 'bg-purple-100 text-purple-800'
                                  : participant.statut === 'vip'
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : participant.statut === 'speaker'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-amber-100 text-amber-800'
                              }>
                                {participant.statut === 'membre'
                                  ? 'Membre'
                                  : participant.statut === 'vip'
                                  ? 'VIP'
                                  : participant.statut === 'speaker'
                                  ? 'Speaker'
                                  : 'Non-membre'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTypeInscription(participant) === 'Groupée' ? (
                                  <Users className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <User className="w-4 h-4 text-gray-600" />
                                )}
                                <span className="text-sm text-gray-700">
                                  {getTypeInscription(participant)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{org?.nom || 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-gray-900">
                                  {montant === 0 ? 'Exonéré' : `${montant.toLocaleString('fr-FR')} FCFA`}
                                </span>
                                {montant > 0 && (
                                  <span className="text-xs text-blue-600">✓ Payé</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {isParticipantExonere(participant) ? (
                                <div className="text-sm text-gray-500 italic">Inscription gratuite</div>
                              ) : (
                                <Button onClick={() => ouvrirChoixFacture(participant)} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50" size="sm">
                                  <Download className="w-4 h-4 mr-2" />
                                  Facture Proforma
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



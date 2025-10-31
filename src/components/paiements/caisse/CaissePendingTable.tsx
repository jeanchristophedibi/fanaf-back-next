'use client';

import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { CheckCircle2, Clock } from 'lucide-react';
import { type Participant } from '../../data/types';
import { getOrganisationById } from '../../data/helpers';

interface CaissePendingTableProps {
  items: Participant[];
  onFinalize: (p: Participant) => void;
  getMontant: (p: Participant) => string;
}

export function CaissePendingTable({ items, onFinalize, getMontant }: CaissePendingTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Participant</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Date inscription</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                      <p className="text-lg font-medium">Aucun paiement en attente</p>
                      <p className="text-sm">Tous les paiements ont été finalisés !</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((participant) => {
                  const organisation = getOrganisationById(participant.organisationId);
                  const montant = getMontant(participant);
                  const joursDAttente = Math.floor(
                    (Date.now() - new Date(participant.dateInscription).getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <TableRow key={participant.id} className="hover:bg-orange-50 transition-colors">
                      <TableCell className="font-mono text-sm text-gray-900">
                        {participant.reference}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-gray-900 font-medium">
                            {participant.prenom} {participant.nom}
                          </p>
                          <p className="text-xs text-gray-500">{participant.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {organisation?.nom || 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {participant.telephone}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          participant.statut === 'membre' 
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }>
                          {participant.statut}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-semibold text-green-700">
                            {montant}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-gray-600 text-sm">
                            {new Date(participant.dateInscription).toLocaleDateString('fr-FR')}
                          </p>
                          {joursDAttente > 0 && (
                            <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {joursDAttente} jour{joursDAttente > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Badge className="bg-orange-100 text-orange-700">
                            En attente de paiement
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => onFinalize(participant)}
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Finaliser le paiement
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}



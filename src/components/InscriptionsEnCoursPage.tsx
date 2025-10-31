import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { 
  Search, 
  Download, 
  Eye,
  RefreshCw,
  FileText,
  Clock
} from 'lucide-react';
import { Participant } from './data/types';
import { getOrganisationById, getParticipantById, getReferentSponsor, getParticipantsByOrganisation } from './data/helpers';

import { companiesDataService } from './data/companiesData';
import { toast } from 'sonner';
import { useDynamicInscriptions } from './hooks/useDynamicInscriptions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ProformaInvoiceGenerator } from './ProformaInvoiceGenerator';
import html2canvas from 'html2canvas';

export const InscriptionsEnCoursPage = () => {
  const { participants } = useDynamicInscriptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showProformaDialog, setShowProformaDialog] = useState(false);
  
  // Filtrer uniquement les inscriptions en attente de paiement (statutInscription = 'non-finalisée')
  const inscriptionsEnCours = participants.filter(p => 
    p.statutInscription === 'non-finalisée'
  );

  // Recherche
  const filteredInscriptions = inscriptionsEnCours.filter(participant => {
    const searchLower = searchTerm.toLowerCase();
    return (
      participant.nom.toLowerCase().includes(searchLower) ||
      participant.prenom.toLowerCase().includes(searchLower) ||
      participant.email.toLowerCase().includes(searchLower) ||
      participant.reference.toLowerCase().includes(searchLower)
    );
  });

  const getOrganisationNom = (organisationId: string) => {
    const org = companiesDataService.getOrganisationById(organisationId);
    return org?.nom || '-';
  };

  const getOrganisation = (organisationId: string) => {
    return companiesDataService.getOrganisationById(organisationId);
  };

  const getMontant = (statut: string) => {
    switch (statut) {
      case 'membre':
        return '350 000 FCFA';
      case 'non-membre':
        return '400 000 FCFA';
      case 'vip':
      case 'speaker':
        return 'Exonéré';
      default:
        return '-';
    }
  };

  const voirProforma = (participant: Participant) => {
    setSelectedParticipant(participant);
    setShowProformaDialog(true);
  };

  const telechargerProforma = async (participant: Participant) => {
    const element = document.getElementById(`proforma-${participant.id}`);
    if (!element) {
      toast.error('Impossible de générer la facture');
      return;
    }

    toast.info('Génération de la facture en cours...');

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `facture-proforma-${participant.reference}.png`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success('Facture téléchargée avec succès');
        }
      });
    } catch (error) {
      console.error('Erreur génération facture:', error);
      toast.error('Erreur lors de la génération de la facture');
    }
  };

  const exporterCSV = () => {
    const headers = ['Référence', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Statut', 'Organisation', 'Montant', 'Date inscription'];
    const rows = filteredInscriptions.map(p => [
      p.reference,
      p.nom,
      p.prenom,
      p.email,
      p.telephone,
      p.statut,
      getOrganisationNom(p.organisationId),
      getMontant(p.statut),
      new Date(p.dateInscription).toLocaleDateString('fr-FR')
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inscriptions-en-cours-${new Date().toISOString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Export CSV réussi');
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Inscriptions en cours</h1>
          <p className="text-gray-600">Inscriptions en attente de paiement</p>
        </div>
        <Button 
          onClick={exporterCSV}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total en attente</p>
              <p className="text-3xl text-gray-900 mt-2">{inscriptionsEnCours.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Membres</p>
              <p className="text-3xl text-gray-900 mt-2">
                {inscriptionsEnCours.filter(p => p.statut === 'membre').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Non-membres</p>
              <p className="text-3xl text-gray-900 mt-2">
                {inscriptionsEnCours.filter(p => p.statut === 'non-membre').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom, prénom, email ou référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Participant</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Date inscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Aucune inscription en cours
                  </TableCell>
                </TableRow>
              ) : (
                filteredInscriptions.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <span className="text-amber-600">{participant.reference}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-gray-900">{participant.prenom} {participant.nom}</p>
                        <p className="text-sm text-gray-600">{participant.telephone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{participant.email}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-900">
                        {getOrganisationNom(participant.organisationId)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          participant.statut === 'membre' 
                            ? 'border-blue-600 text-blue-600' 
                            : participant.statut === 'non-membre'
                            ? 'border-orange-600 text-orange-600'
                            : 'border-purple-600 text-purple-600'
                        }
                      >
                        {participant.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">{getMontant(participant.statut)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(participant.dateInscription).toLocaleDateString('fr-FR')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => voirProforma(participant)}
                          className="text-amber-600 hover:text-amber-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => telechargerProforma(participant)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Dialog Proforma */}
      {selectedParticipant && (
        <Dialog open={showProformaDialog} onOpenChange={setShowProformaDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Facture Proforma - {selectedParticipant.reference}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {(() => {
                const org = getOrganisation(selectedParticipant.organisationId);
                if (!org) {
                  return (
                    <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                      Organisation introuvable pour cette inscription.
                    </div>
                  );
                }
                return (
                  <ProformaInvoiceGenerator 
                    participant={selectedParticipant}
                    organisation={org}
                    numeroFacture={`PRO-${new Date().getFullYear()}-${selectedParticipant.reference.split('-')[2]}`}
                  />
                );
              })()}
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <Button
                onClick={() => telechargerProforma(selectedParticipant)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowProformaDialog(false)}
              >
                Fermer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

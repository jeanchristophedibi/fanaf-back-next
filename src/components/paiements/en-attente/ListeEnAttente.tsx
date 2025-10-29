"use client";

import { useState, useMemo } from "react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { CheckCircle2, Upload, File, X } from "lucide-react";
import { useDynamicInscriptions } from "../../hooks/useDynamicInscriptions";
import { getOrganisationById, type ModePaiement } from "../../data/mockData";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../ui/alert-dialog";
import { List, type Column } from "../../list/List";
import { Label } from "../../ui/label";

type PaiementEnAttente = {
  id: string;
  reference: string;
  participantNom: string;
  participantEmail: string;
  organisationNom: string;
  statut: string;
  montant: number;
  modePaiement: ModePaiement | string;
  canalEncaissement: string;
  dateInscription: Date | string;
  datePaiement: Date | string;
  administrateurEncaissement: string;
  pays: string;
};

export function ListeEnAttente() {
  const { participants } = useDynamicInscriptions();
  const [filterModePaiement, setFilterModePaiement] = useState('all');
  const [filterStatut, setFilterStatut] = useState('all');
  
  // États pour la gestion des paiements
  const [selectedParticipant, setSelectedParticipant] = useState<PaiementEnAttente | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Transformer les participants non-finalisés en paiements en attente
  const paiementsEnAttente = useMemo(() => {
    return participants
      .filter(p => p.statutInscription === 'non-finalisée')
      .filter(p => p.statut === 'membre' || p.statut === 'non-membre')
      .map(p => {
        const organisation = getOrganisationById(p.organisationId);
        
        let tarif = 0;
        if (p.statut === 'non-membre') {
          tarif = 400000;
        } else if (p.statut === 'membre') {
          tarif = 350000;
        }

        return {
          id: p.id,
          reference: p.reference,
          participantNom: `${p.prenom} ${p.nom}`,
          participantEmail: p.email,
          organisationNom: organisation?.nom || 'N/A',
          statut: p.statut,
          montant: tarif,
          modePaiement: p.modePaiement || 'espèce',
          canalEncaissement: p.canalEncaissement || 'externe',
          dateInscription: p.dateInscription,
          datePaiement: p.datePaiement || p.dateInscription,
          administrateurEncaissement: p.caissier || 'N/A',
          pays: p.pays,
        } as PaiementEnAttente;
      });
  }, [participants]);

  // Filtrer les paiements
  const filteredPaiements = useMemo(() => {
    let filtered = [...paiementsEnAttente];

    if (filterModePaiement !== 'all') {
      filtered = filtered.filter(p => p.modePaiement === filterModePaiement);
    }

    if (filterStatut !== 'all') {
      if (filterStatut === 'membre') {
        filtered = filtered.filter(p => p.statut === 'membre');
      } else if (filterStatut === 'non-membre') {
        filtered = filtered.filter(p => p.statut === 'non-membre');
      }
    }

    return filtered;
  }, [paiementsEnAttente, filterModePaiement, filterStatut]);

  const handleConfirmPayment = (participant: PaiementEnAttente) => {
    setSelectedParticipant(participant);
    setShowConfirmDialog(true);
  };
  
  const handleValidatePayment = () => {
    // TODO: Implémenter la logique de validation
    console.log('Validation du paiement:', selectedParticipant);
    setShowConfirmDialog(false);
    setSelectedParticipant(null);
    setUploadedFile(null);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };
  
  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  const exportHeaders = [
    'Référence',
    'Participant',
    'Email',
    'Organisation',
    'Statut',
    'Montant (FCFA)',
    'Mode de paiement',
    'Canal',
    'Date inscription',
    'Date paiement',
    'Validé par',
    'Pays',
  ];

  const exportData = (p: PaiementEnAttente) => [
    p.reference,
    p.participantNom,
    p.participantEmail,
    p.organisationNom,
    p.statut,
    p.montant.toString(),
    p.modePaiement,
    p.canalEncaissement,
    new Date(p.dateInscription).toLocaleDateString('fr-FR'),
    new Date(p.datePaiement).toLocaleDateString('fr-FR'),
    p.administrateurEncaissement,
    p.pays,
  ];

  const columns: Column<PaiementEnAttente>[] = [
    { key: 'reference', header: 'Référence', sortable: true },
    {
      key: 'participantNom',
      header: 'Participant',
      sortable: true,
      render: (p) => (
        <div>
          <p className="text-sm text-gray-900">{p.participantNom}</p>
          <p className="text-xs text-gray-500">{p.participantEmail}</p>
        </div>
      )
    },
    { key: 'organisationNom', header: 'Organisation', sortable: true },
    {
      key: 'statut',
      header: 'Statut',
      sortable: true,
      render: (p) => (
        <Badge 
          variant={p.statut === 'membre' ? 'default' : 'secondary'}
          className={p.statut === 'membre' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
        >
          {p.statut === 'membre' ? 'Membre' : 'Non-Membre'}
        </Badge>
      )
    },
    {
      key: 'modePaiement',
      header: 'Mode Paiement',
      sortable: true,
      render: (p) => (
        <Badge 
          variant="outline"
          className={
            p.modePaiement === 'espèce' ? 'border-green-300 text-green-700 bg-green-50' :
            p.modePaiement === 'virement' ? 'border-blue-300 text-blue-700 bg-blue-50' :
            'border-purple-300 text-purple-700 bg-purple-50'
          }
        >
          {p.modePaiement}
        </Badge>
      )
    },
    {
      key: 'montant',
      header: 'Montant',
      sortable: true,
      render: (p) => <span className="text-gray-900">{p.montant.toLocaleString()} FCFA</span>
    },
    {
      key: 'dateInscription',
      header: 'Date Inscription',
      sortable: true,
      render: (p) => <span className="text-sm text-gray-500">{new Date(p.dateInscription).toLocaleDateString('fr-FR')}</span>
    },
    {
      key: 'actions',
      header: 'Action',
      render: (p) => (
        <Button
          onClick={() => handleConfirmPayment(p)}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Finaliser le paiement
        </Button>
      )
    }
  ];

  const filterComponent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-sm text-gray-600">Mode de paiement</Label>
        <Select value={filterModePaiement} onValueChange={setFilterModePaiement}>
          <SelectTrigger>
            <SelectValue placeholder="Tous les modes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les modes</SelectItem>
            <SelectItem value="espèce">Cash</SelectItem>
            <SelectItem value="virement">Virement bancaire</SelectItem>
            <SelectItem value="chèque">Chèque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-gray-600">Statut participant</Label>
        <Select value={filterStatut} onValueChange={setFilterStatut}>
          <SelectTrigger>
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="membre">Membre</SelectItem>
            <SelectItem value="non-membre">Non-Membre</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <>
      <List
        data={filteredPaiements}
        columns={columns}
        getRowId={(p) => p.id}
        searchPlaceholder="Rechercher par nom, prénom, référence, email ou organisation..."
        searchKeys={["reference", "participantNom", "participantEmail", "organisationNom"]}
        filterComponent={filterComponent}
        filterTitle="Paiements en attente"
        exportFilename="paiements-en-attente-fanaf"
        exportHeaders={exportHeaders}
        exportData={exportData}
        itemsPerPage={10}
        emptyMessage="Aucun paiement en attente. Les paiements en Cash, Virement ou Chèque apparaîtront ici."
      />

      {/* Dialog de confirmation */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-orange-600" />
              Confirmation d'encaissement
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-2">
                <span className="block text-gray-700">
                  Confirmez-vous avoir encaissé ce paiement ?
                </span>
                
                {selectedParticipant && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Participant :</span>
                      <span className="text-gray-900">{selectedParticipant.participantNom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Référence :</span>
                      <span className="text-gray-900">{selectedParticipant.reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mode de paiement :</span>
                      <Badge variant="outline" className="ml-2">
                        {selectedParticipant.modePaiement}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant :</span>
                      <span className="text-gray-900">
                        {selectedParticipant.montant.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Organisation :</span>
                      <span className="text-gray-900 text-right max-w-[200px]">{selectedParticipant.organisationNom}</span>
                    </div>
                  </div>
                )}

                {/* Section d'importation de preuve de paiement */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-blue-900">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Preuve de paiement (optionnel)</span>
                  </div>
                  
                  {!uploadedFile ? (
                    <div>
                      <label 
                        htmlFor="file-upload" 
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 rounded-md text-sm text-blue-700 hover:bg-blue-50 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Importer un fichier
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-blue-600 mt-2">
                        Formats acceptés : JPG, PNG, PDF (max 5 Mo)
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white border border-blue-200 rounded-md p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-900">{uploadedFile?.name}</p>
                          <p className="text-xs text-gray-500">
                            {uploadedFile?.size ? (uploadedFile.size / 1024).toFixed(0) : '0'} Ko
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={removeUploadedFile}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <span className="block text-sm text-orange-600 bg-orange-50 p-3 rounded border border-orange-200">
                  ⚠️ Cette action marquera le paiement comme "Finalisé" et l'inscription sera validée. Le participant disparaîtra de cette liste et apparaîtra dans "Liste des paiements".
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleValidatePayment}
              className="bg-green-600 hover:bg-green-700"
            >
              Oui, confirmer l'encaissement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge as BadgeUI } from './ui/badge';
import { FileText, Download, CheckCircle2, Loader2, Package } from 'lucide-react';
import { type Participant, getOrganisationById } from './data/types';
import { getOrganisationById, getParticipantById, getReferentSponsor, getParticipantsByOrganisation } from './data/helpers';

import { toast } from 'sonner';
import { BadgeGenerator } from './BadgeGenerator';
import { ReceiptGenerator } from './ReceiptGenerator';
import { InvoiceGenerator } from './InvoiceGenerator';
import { InvitationLetterGenerator } from './InvitationLetterGenerator';

interface GroupDocumentsGeneratorProps {
  participants: Participant[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DocumentType = 'badge' | 'receipt' | 'invoice' | 'invitation';

interface DocumentStatus {
  participantId: string;
  badge: boolean;
  receipt: boolean;
  invoice: boolean;
  invitation: boolean;
}

export function GroupDocumentsGenerator({ participants, open, onOpenChange }: GroupDocumentsGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [documentStatuses, setDocumentStatuses] = useState<Map<string, DocumentStatus>>(new Map());
  
  // États pour les dialogs individuels
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [openBadge, setOpenBadge] = useState(false);
  const [openReceipt, setOpenReceipt] = useState(false);
  const [openInvoice, setOpenInvoice] = useState(false);
  const [openInvitation, setOpenInvitation] = useState(false);

  const generateAllDocuments = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Calculer le nombre total de documents à générer
    let totalDocuments = 0;
    participants.forEach(p => {
      const isPaid = p.statutInscription === 'finalisée' || p.statut === 'vip' || p.statut === 'speaker';
      totalDocuments += isPaid ? 4 : 2; // 4 si payé (tous), 2 sinon (badge + lettre)
    });
    
    let completed = 0;
    const statuses = new Map<string, DocumentStatus>();
    
    for (const participant of participants) {
      const isPaid = participant.statutInscription === 'finalisée' || 
                     participant.statut === 'vip' || 
                     participant.statut === 'speaker';
      
      const status: DocumentStatus = {
        participantId: participant.id,
        badge: false,
        receipt: false,
        invoice: false,
        invitation: false,
      };
      
      // Badge (toujours disponible)
      await new Promise(resolve => setTimeout(resolve, 200));
      status.badge = true;
      completed++;
      setGenerationProgress((completed / totalDocuments) * 100);
      
      // Reçu (uniquement si payé)
      if (isPaid) {
        await new Promise(resolve => setTimeout(resolve, 200));
        status.receipt = true;
        completed++;
        setGenerationProgress((completed / totalDocuments) * 100);
      }
      
      // Facture (uniquement si payé)
      if (isPaid) {
        await new Promise(resolve => setTimeout(resolve, 200));
        status.invoice = true;
        completed++;
        setGenerationProgress((completed / totalDocuments) * 100);
      }
      
      // Lettre d'invitation (toujours disponible)
      await new Promise(resolve => setTimeout(resolve, 200));
      status.invitation = true;
      completed++;
      setGenerationProgress((completed / totalDocuments) * 100);
      
      statuses.set(participant.id, status);
      setDocumentStatuses(new Map(statuses));
    }
    
    setIsGenerating(false);
    
    const paidCount = participants.filter(p => 
      p.statutInscription === 'finalisée' || p.statut === 'vip' || p.statut === 'speaker'
    ).length;
    
    toast.success(
      `Documents générés : ${paidCount} participant(s) avec tous les documents, ` +
      `${participants.length - paidCount} avec badge et lettre uniquement`
    );
  };

  const downloadAllAsZip = () => {
    // En production, utiliser JSZip pour créer une archive
    toast.success(`Archive ZIP créée avec ${participants.length * 4} documents`);
    console.log('Téléchargement de l\'archive ZIP avec tous les documents');
  };

  const generateSingleDocument = (participant: Participant, type: DocumentType) => {
    setSelectedParticipant(participant);
    
    switch (type) {
      case 'badge':
        setOpenBadge(true);
        break;
      case 'receipt':
        setOpenReceipt(true);
        break;
      case 'invoice':
        setOpenInvoice(true);
        break;
      case 'invitation':
        setOpenInvitation(true);
        break;
    }
  };

  const getDocumentIcon = (type: DocumentType) => {
    return <FileText className="w-4 h-4" />;
  };

  const getDocumentLabel = (type: DocumentType) => {
    switch (type) {
      case 'badge': return 'Badge';
      case 'receipt': return 'Reçu';
      case 'invoice': return 'Facture';
      case 'invitation': return 'Lettre';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Génération des Documents du Groupe
            </DialogTitle>
            <DialogDescription>
              {participants.length} participant(s) • 4 documents par participant
            </DialogDescription>
          </DialogHeader>

          {/* Boutons de génération globale */}
          <div className="flex gap-2 justify-between border-b pb-4">
            <div className="text-sm text-gray-600 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              {participants.length * 4} documents au total
            </div>
            <div className="flex gap-2">
              {documentStatuses.size > 0 && (
                <Button
                  variant="outline"
                  onClick={downloadAllAsZip}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Télécharger tout (ZIP)
                </Button>
              )}
              <Button
                onClick={generateAllDocuments}
                disabled={isGenerating}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération en cours... {Math.round(generationProgress)}%
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Générer tous les documents
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Barre de progression */}
          {isGenerating && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          )}

          {/* Liste des participants et leurs documents */}
          <div className="space-y-4">
            {participants.map((participant) => {
              const organisation = getOrganisationById(participant.organisationId);
              const status = documentStatuses.get(participant.id);

              return (
                <div
                  key={participant.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  {/* Informations participant */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {participant.prenom} {participant.nom}
                      </p>
                      <p className="text-sm text-gray-600">{organisation?.nom}</p>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {participant.reference}
                      </code>
                    </div>
                    <BadgeUI
                      variant="outline"
                      className={
                        participant.statut === 'membre'
                          ? 'bg-green-50 text-green-700 border-green-300'
                          : 'bg-blue-50 text-blue-700 border-blue-300'
                      }
                    >
                      {participant.statut === 'membre' ? 'Membre' : 'Non-membre'}
                    </BadgeUI>
                  </div>

                  {/* Grille des documents */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(['badge', 'receipt', 'invoice', 'invitation'] as DocumentType[]).map((docType) => {
                      // Reçu et facture uniquement disponibles après paiement
                      const isPaiementRequired = docType === 'receipt' || docType === 'invoice';
                      const isPaid = participant.statutInscription === 'finalisée' || 
                                    participant.statut === 'vip' || 
                                    participant.statut === 'speaker';
                      const isDisabled = isPaiementRequired && !isPaid;
                      
                      return (
                        <Button
                          key={docType}
                          variant="outline"
                          size="sm"
                          onClick={() => !isDisabled && generateSingleDocument(participant, docType)}
                          disabled={isDisabled}
                          className={`flex items-center justify-between ${
                            status?.[docType] ? 'bg-green-50 border-green-300' : ''
                          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={isDisabled ? 'Disponible après finalisation du paiement' : ''}
                        >
                          <span className="flex items-center gap-2">
                            {getDocumentIcon(docType)}
                            {getDocumentLabel(docType)}
                          </span>
                          {status?.[docType] && (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Résumé et avertissements */}
          {documentStatuses.size > 0 ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-green-900 font-medium">
                    Documents générés avec succès
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {documentStatuses.size} participant(s) traité(s) sur {participants.length}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-orange-900 font-medium">
                      Documents en attente de génération
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                      Cliquez sur "Générer tous les documents" pour créer les badges et lettres d'invitation.
                    </p>
                  </div>
                </div>
              </div>
              
              {participants.some(p => p.statutInscription !== 'finalisée' && p.statut !== 'vip' && p.statut !== 'speaker') && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-900 font-medium">
                        Restrictions sur les documents financiers
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Les reçus et factures ne seront générés que pour les participants ayant finalisé leur paiement.
                        Les VIP et speakers en sont exonérés.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogs pour les documents individuels */}
      {selectedParticipant && (
        <>
          <BadgeGenerator
            participant={selectedParticipant}
            isOpen={openBadge}
            onClose={() => setOpenBadge(false)}
          />
          
          <ReceiptGenerator
            participant={{
              id: selectedParticipant.id,
              nom: selectedParticipant.nom,
              prenom: selectedParticipant.prenom,
              email: selectedParticipant.email,
              telephone: selectedParticipant.telephone,
              organisation: getOrganisationById(selectedParticipant.organisationId)?.nom || '',
              statut: selectedParticipant.statut,
              statutInscription: selectedParticipant.statutInscription,
              modePaiement: selectedParticipant.modePaiement,
              dateInscription: selectedParticipant.dateInscription,
            }}
            open={openReceipt}
            onOpenChange={setOpenReceipt}
          />
          
          <InvoiceGenerator
            participant={selectedParticipant}
            open={openInvoice}
            onOpenChange={setOpenInvoice}
          />
          
          <InvitationLetterGenerator
            participant={selectedParticipant}
            open={openInvitation}
            onOpenChange={setOpenInvitation}
          />
        </>
      )}
    </>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { 
  Search, 
  Download, 
  Users, 
  QrCode, 
  CheckCircle2, 
  ChevronLeft,
  ChevronRight,
  FileText,
  Receipt
} from 'lucide-react';
import { getOrganisationById, type Participant } from './data/mockData';
import { useDynamicInscriptions } from './hooks/useDynamicInscriptions';
import { toast } from 'sonner';
import { BadgeGenerator } from './BadgeGenerator';
import { motion } from 'motion/react';

const statutColors: Record<string, string> = {
  'membre': 'bg-purple-100 text-purple-800',
  'non-membre': 'bg-amber-100 text-amber-800',
  'vip': 'bg-cyan-100 text-cyan-800',
  'speaker': 'bg-yellow-100 text-yellow-800',
};

export function ParticipantsFinalisesPage() {
  const { participants } = useDynamicInscriptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false);
  const itemsPerPage = 10;

  // Filtrer uniquement les participants avec paiement finalisé
  const participantsFiltered = useMemo(() => {
    return participants.filter(p => {
      // Inclure UNIQUEMENT les participants avec inscription finalisée (paiement effectué)
      return p.statutInscription === 'finalisée';
    });
  }, [participants]);

  // Recherche
  const searchedParticipants = useMemo(() => {
    if (!searchTerm) return participantsFiltered;
    
    const term = searchTerm.toLowerCase();
    return participantsFiltered.filter(p => 
      p.nom.toLowerCase().includes(term) ||
      p.prenom.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      p.reference.toLowerCase().includes(term) ||
      getOrganisationById(p.organisationId)?.nom.toLowerCase().includes(term)
    );
  }, [participantsFiltered, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(searchedParticipants.length / itemsPerPage);
  const paginatedParticipants = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return searchedParticipants.slice(startIndex, endIndex);
  }, [searchedParticipants, currentPage]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Statistiques
  const stats = useMemo(() => {
    const membres = participantsFiltered.filter(p => p.statut === 'membre').length;
    const nonMembres = participantsFiltered.filter(p => p.statut === 'non-membre').length;
    const vips = participantsFiltered.filter(p => p.statut === 'vip').length;
    const speakers = participantsFiltered.filter(p => p.statut === 'speaker').length;
    
    return {
      total: participantsFiltered.length,
      membres,
      nonMembres,
      vipsEtSpeakers: vips + speakers,
    };
  }, [participantsFiltered]);

  const handleViewBadge = (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsBadgeDialogOpen(true);
  };

  const handleDownloadLetter = (participant: Participant) => {
    toast.success(`Lettre téléchargée pour ${participant.prenom} ${participant.nom}`);
    // Logique de téléchargement de la lettre
  };

  const handleDownloadReceipt = (participant: Participant) => {
    toast.success(`Reçu téléchargé pour ${participant.prenom} ${participant.nom}`);
    // Logique de téléchargement du reçu
  };

  return (
    <div className="p-8 space-y-6 animate-page-enter">
      {/* En-tête */}
      <div>
        <h2 className="text-3xl text-gray-900 mb-2">Participants</h2>
        <p className="text-sm text-gray-500">
          Liste des participants avec paiement finalisé - Téléchargement des documents
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-700">Total Participants</p>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl text-green-900">{stats.total}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-purple-700">Membres</p>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl text-purple-900">{stats.membres}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-amber-700">Non-membres</p>
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl text-amber-900">{stats.nonMembres}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-cyan-700">VIP & Speakers</p>
            <QrCode className="w-5 h-5 text-cyan-600" />
          </div>
          <p className="text-3xl text-cyan-900">{stats.vipsEtSpeakers}</p>
        </Card>
      </div>

      {/* Barre de recherche */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher par nom, prénom, email, référence ou organisation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {searchedParticipants.length} participant(s) trouvé(s)
        </p>
      </Card>

      {/* Liste des participants */}
      {searchedParticipants.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun participant trouvé</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {paginatedParticipants.map((participant, index) => {
            const organisation = getOrganisationById(participant.organisationId);
            
            return (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between gap-4">
                    {/* Informations participant */}
                    <div className="flex-1 grid grid-cols-5 gap-4">
                      {/* Nom et référence */}
                      <div>
                        <p className="text-sm text-gray-900">
                          {participant.prenom} {participant.nom}
                        </p>
                        <p className="text-xs text-gray-500">Réf: {participant.reference}</p>
                      </div>

                      {/* Organisation */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Organisation</p>
                        <p className="text-sm text-gray-900">{organisation?.nom || 'N/A'}</p>
                      </div>

                      {/* Email */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Contact</p>
                        <p className="text-sm text-gray-900 truncate">{participant.email}</p>
                        <p className="text-xs text-gray-500 mt-1">{participant.telephone}</p>
                      </div>

                      {/* Statut */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Statut</p>
                        <Badge className={`${statutColors[participant.statut]} text-xs`}>
                          {participant.statut}
                        </Badge>
                      </div>

                      {/* Mode de paiement */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Paiement</p>
                        <p className="text-sm text-gray-900 capitalize">{participant.modePaiement || 'N/A'}</p>
                        <Badge className="bg-green-100 text-green-700 border-green-300 mt-1 text-xs">
                          ✓ Finalisé
                        </Badge>
                      </div>
                    </div>

                    {/* Actions - Documents */}
                    <div className="flex items-center gap-2">
                      {/* 1. Badge */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewBadge(participant)}
                        className="gap-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                        title="Télécharger le badge"
                      >
                        <QrCode className="w-4 h-4" />
                        Badge
                      </Button>

                      {/* 2. Lettre */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadLetter(participant)}
                        className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                        title="Télécharger la lettre"
                      >
                        <FileText className="w-4 h-4" />
                        Lettre
                      </Button>

                      {/* 3. Reçu */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReceipt(participant)}
                        className="gap-2 border-green-200 text-green-700 hover:bg-green-50"
                        title="Télécharger le reçu"
                      >
                        <Receipt className="w-4 h-4" />
                        Reçu
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {searchedParticipants.length > 0 && totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages} ({searchedParticipants.length} résultat{searchedParticipants.length > 1 ? 's' : ''})
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? "bg-orange-600 hover:bg-orange-700" : ""}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Dialog Badge */}
      {selectedParticipant && (
        <Dialog open={isBadgeDialogOpen} onOpenChange={setIsBadgeDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Badge - {selectedParticipant.prenom} {selectedParticipant.nom}</DialogTitle>
              <DialogDescription>
                Téléchargez et imprimez le badge de participation pour {selectedParticipant.prenom} {selectedParticipant.nom}
              </DialogDescription>
            </DialogHeader>
            <BadgeGenerator 
              participant={selectedParticipant}
              isOpen={isBadgeDialogOpen}
              onClose={() => setIsBadgeDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

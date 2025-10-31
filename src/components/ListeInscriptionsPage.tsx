import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { Search, Download, Filter, Users, UserCheck, Award, Mic, Eye, FileDown, User, Mail, Phone, Globe, Building, Calendar, FileText, X, QrCode, Package, Receipt, CheckCircle2, Clock } from 'lucide-react';
import { type Participant } from './data/types';
import { getOrganisationById } from './data/helpers';
import { useParticipantsQuery } from '../hooks/useParticipantsQuery';
import { useOrganisationsQuery } from '../hooks/useOrganisationsQuery';
import { AnimatedStat } from './AnimatedStat';
import { toast } from 'sonner';
import { BadgeGenerator } from './BadgeGenerator';
import { ReceiptGenerator } from './ReceiptGenerator';
import { WidgetStatsInscriptions } from './inscriptions/WidgetStatsInscriptions';
import { LoaderOverlay } from './ui/LoaderOverlay';
import JSZip from 'jszip';

const statutColors = {
  'membre': 'bg-purple-100 text-purple-800',
  'non-membre': 'bg-amber-100 text-amber-800',
  'vip': 'bg-cyan-100 text-cyan-800',
  'speaker': 'bg-yellow-100 text-yellow-800',
  'referent': 'bg-green-100 text-green-800',
};

const statutInscriptionColors = {
  'finalisée': 'bg-emerald-100 text-emerald-800',
  'non-finalisée': 'bg-red-100 text-red-800',
  'exonéré': 'bg-purple-100 text-purple-800',
};

// Fonction pour déterminer le libellé du statut de paiement
const getStatutPaiementLabel = (participant: Participant) => {
  if (participant.statut === 'vip' || participant.statut === 'speaker') {
    return 'exonéré';
  }
  return participant.statutInscription;
};

interface ListeInscriptionsPageProps {
  readOnly?: boolean;
  userProfile?: 'agence' | 'fanaf' | 'asaci';
}

export function ListeInscriptionsPage({ readOnly = false, userProfile = 'agence' }: ListeInscriptionsPageProps = {}) {
  // Utiliser React Query pour les participants et organisations avec cache optimisé
  const { participants, isLoading: isLoadingParticipants, isError: isErrorParticipants } = useParticipantsQuery({ includeOrganisations: true });
  const { organisations, isLoading: isLoadingOrganisations, isError: isErrorOrganisations } = useOrganisationsQuery();
  
  const isLoading = isLoadingParticipants || isLoadingOrganisations;
  const isError = isErrorParticipants || isErrorOrganisations;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // États pour les filtres multi-sélection (avant validation)
  const [tempStatutFilters, setTempStatutFilters] = useState<string[]>([]);
  const [tempStatutInscriptionFilters, setTempStatutInscriptionFilters] = useState<string[]>([]);
  const [tempOrganisationFilters, setTempOrganisationFilters] = useState<string[]>([]);
  const [tempPaysFilters, setTempPaysFilters] = useState<string[]>([]);
  
  // États pour les filtres appliqués (après validation)
  const [appliedStatutFilters, setAppliedStatutFilters] = useState<string[]>([]);
  const [appliedStatutInscriptionFilters, setAppliedStatutInscriptionFilters] = useState<string[]>([]);
  const [appliedOrganisationFilters, setAppliedOrganisationFilters] = useState<string[]>([]);
  const [appliedPaysFilters, setAppliedPaysFilters] = useState<string[]>([]);
  
  const [showFilters, setShowFilters] = useState(false);
  const [isDownloadingBadges, setIsDownloadingBadges] = useState(false);

  const ParticipantDetailsDialog = ({ participant }: { participant: Participant }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isBadgeOpen, setIsBadgeOpen] = useState(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const organisation = getOrganisationById(participant.organisationId);

    const handleOpenBadge = () => {
      setIsBadgeOpen(true);
    };

    const handleDownloadInvitation = () => {
      toast.success(`Lettre d'invitation de ${participant.prenom} ${participant.nom} téléchargée`);
      console.log('Téléchargement de la lettre d\'invitation pour:', participant.reference);
    };

    const handleOpenReceipt = () => {
      setIsReceiptOpen(true);
    };

    // Vérifier si le participant a un reçu disponible (paiement finalisé)
    const hasReceipt = participant.statutInscription === 'finalisée' && 
                       (participant.statut === 'membre' || participant.statut === 'non-membre');

    // Les badges ne peuvent être générés que si l'inscription est finalisée
    const canGenerateBadge = participant.statutInscription === 'finalisée';

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
            <Eye className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
                {participant.prenom[0]}{participant.nom[0]}
              </div>
              {participant.prenom} {participant.nom}
            </DialogTitle>
            <DialogDescription>
              Référence: {participant.reference}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 overflow-y-auto pr-2 flex-1">
            {/* Section identité avec fond coloré */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
              <h3 className="text-orange-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations personnelles
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-orange-600 mb-1">Nom</p>
                  <p className="text-gray-900">{participant.nom}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-orange-600 mb-1">Prénom</p>
                  <p className="text-gray-900">{participant.prenom}</p>
                </div>
                <div className="bg-white p-3 rounded-lg col-span-2">
                  <p className="text-xs text-orange-600 mb-1">Email</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-orange-500" />
                    {participant.email}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg col-span-2">
                  <p className="text-xs text-orange-600 mb-1">Téléphone</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-orange-500" />
                    {participant.telephone}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg col-span-2">
                  <p className="text-xs text-orange-600 mb-1">Pays</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-orange-500" />
                    {participant.pays}
                  </p>
                </div>
              </div>
            </div>

            {/* Section organisation */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <h3 className="text-blue-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Organisation
              </h3>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-gray-900">{organisation?.nom || 'N/A'}</p>
                <div className="flex gap-2 mt-3">
                  <Badge className={statutColors[participant.statut]}>
                    {participant.statut}
                  </Badge>
                  <Badge className={statutInscriptionColors[getStatutPaiementLabel(participant)]}>
                    {getStatutPaiementLabel(participant)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Section documents avec design amélioré */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <h3 className="text-purple-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents disponibles
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleOpenBadge}
                  className="bg-white hover:bg-purple-600 hover:text-white border-2 border-purple-300 text-purple-700 h-auto py-4 justify-start button-press transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-purple-700"
                  variant="outline"
                  disabled={!canGenerateBadge}
                  title={!canGenerateBadge ? "Le badge ne peut être généré que lorsque l'inscription est finalisée (paiement effectué)" : ""}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <QrCode className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Badge</p>
                      <p className="text-xs opacity-70">
                        {canGenerateBadge ? 'Générer & Télécharger' : 'Inscription non finalisée'}
                      </p>
                    </div>
                  </div>
                </Button>
                <Button 
                  onClick={handleDownloadInvitation}
                  className="bg-white hover:bg-purple-600 hover:text-white border-2 border-purple-300 text-purple-700 h-auto py-4 justify-start button-press transition-all duration-200"
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FileDown className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium truncate">Invitation</p>
                      <p className="text-xs opacity-70">PDF</p>
                    </div>
                  </div>
                </Button>
                {/* Le reçu de paiement est visible uniquement pour l'administrateur FANAF */}
                {hasReceipt && userProfile === 'fanaf' && (
                  <Button 
                    onClick={handleOpenReceipt}
                    className="bg-white hover:bg-purple-600 hover:text-white border-2 border-purple-300 text-purple-700 h-auto py-4 col-span-2 justify-start button-press transition-all duration-200"
                    variant="outline"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Receipt className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Reçu de Paiement</p>
                        <p className="text-xs opacity-70">Télécharger le reçu officiel</p>
                      </div>
                    </div>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
        <BadgeGenerator participant={participant} isOpen={isBadgeOpen} onClose={() => setIsBadgeOpen(false)} />
        {hasReceipt && (
          <ReceiptGenerator 
            participant={{
              ...participant,
              organisation: organisation?.nom || 'N/A'
            }} 
            open={isReceiptOpen} 
            onOpenChange={setIsReceiptOpen} 
          />
        )}
      </Dialog>
    );
  };

  // Statistiques pour le tableau de bord avec distinction finalisés/en attente
  const stats = {
    total: participants.length,
    finalises: participants.filter(p => p.statutInscription === 'finalisée').length,
    enAttente: participants.filter(p => p.statutInscription !== 'finalisée').length,
    membres: participants.filter(p => p.statut === 'membre').length,
    nonMembres: participants.filter(p => p.statut === 'non-membre').length,
    vip: participants.filter(p => p.statut === 'vip').length,
    speakers: participants.filter(p => p.statut === 'speaker').length,
  };

  // Liste unique des pays pour le filtre
  const uniquePays = Array.from(new Set(participants.map(p => p.pays))).sort();

  // Fonction pour appliquer les filtres
  const handleApplyFilters = () => {
    setAppliedStatutFilters(tempStatutFilters);
    setAppliedStatutInscriptionFilters(tempStatutInscriptionFilters);
    setAppliedOrganisationFilters(tempOrganisationFilters);
    setAppliedPaysFilters(tempPaysFilters);
    setCurrentPage(1); // Réinitialiser la page lors de l'application des filtres
    setShowFilters(false);
    toast.success('Filtres appliqués');
  };

  // Fonction pour réinitialiser les filtres
  const handleResetFilters = () => {
    setTempStatutFilters([]);
    setTempStatutInscriptionFilters([]);
    setTempOrganisationFilters([]);
    setTempPaysFilters([]);
    setAppliedStatutFilters([]);
    setAppliedStatutInscriptionFilters([]);
    setAppliedOrganisationFilters([]);
    setAppliedPaysFilters([]);
    setCurrentPage(1); // Réinitialiser la page lors de la réinitialisation des filtres
    toast.success('Filtres réinitialisés');
  };

  // Compter les filtres actifs
  const activeFiltersCount = appliedStatutFilters.length + appliedStatutInscriptionFilters.length + 
                             appliedOrganisationFilters.length + appliedPaysFilters.length;

  const filteredParticipants = useMemo(() => {
    let filtered = [...participants];

    // Filtre par recherche universelle
    if (searchTerm) {
      filtered = filtered.filter(p => {
        const organisation = getOrganisationById(p.organisationId);
        
        return (
          p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.telephone.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.pays.toLowerCase().includes(searchTerm.toLowerCase()) ||
          organisation?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.statut.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.statutInscription.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Application des filtres multi-sélection
    if (appliedStatutFilters.length > 0) {
      filtered = filtered.filter(p => appliedStatutFilters.includes(p.statut));
    }

    if (appliedStatutInscriptionFilters.length > 0) {
      filtered = filtered.filter(p => appliedStatutInscriptionFilters.includes(getStatutPaiementLabel(p)));
    }

    if (appliedOrganisationFilters.length > 0) {
      filtered = filtered.filter(p => appliedOrganisationFilters.includes(p.organisationId));
    }

    if (appliedPaysFilters.length > 0) {
      filtered = filtered.filter(p => appliedPaysFilters.includes(p.pays));
    }

    return filtered;
  }, [searchTerm, appliedStatutFilters, appliedStatutInscriptionFilters, appliedOrganisationFilters, appliedPaysFilters]);

  // Calculer le nombre de badges générables (inscriptions finalisées uniquement)
  const badgesGenerables = filteredParticipants.filter(p => p.statutInscription === 'finalisée').length;

  // Logique de pagination
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedParticipants = filteredParticipants.slice(startIndex, endIndex);

  // Réinitialiser la page lors d'un changement de recherche (via handler)
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Réinitialiser la page lors de la recherche
  };

  const exportToCSV = () => {
    const headers = ['Référence', 'Nom', 'Prénom', 'Email', 'Contact', 'Organisation', 'Pays', 'Statut Participant', 'Statut Inscription', 'Mode de paiement', 'Date Inscription'];
    const csvContent = [
      headers.join(','),
      ...filteredParticipants.map(p => {
        const org = getOrganisationById(p.organisationId);
        return [
          p.reference,
          p.nom,
          p.prenom,
          p.email,
          p.telephone,
          org?.nom || '',
          p.pays,
          p.statut,
          getStatutPaiementLabel(p),
          getStatutPaiementLabel(p) === 'finalisée' && p.modePaiement ? p.modePaiement : 'N/A',
          new Date(p.dateInscription).toLocaleDateString('fr-FR')
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'liste-inscriptions-fanaf.csv';
    a.click();
  };

  const getStatutBadgeColor = (statut: string) => {
    switch (statut) {
      case 'vip':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'speaker':
        return 'bg-gradient-to-r from-purple-500 to-purple-700';
      case 'membre':
        return 'bg-gradient-to-r from-orange-500 to-orange-700';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-700';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'vip':
        return 'VIP';
      case 'speaker':
        return 'SPEAKER';
      case 'membre':
        return 'MEMBRE';
      case 'non-membre':
        return 'PARTICIPANT';
      default:
        return statut.toUpperCase();
    }
  };

  const downloadAllBadges = async () => {
    setIsDownloadingBadges(true);
    const zip = new JSZip();
    const badgesFolder = zip.folder('badges-participants-fanaf-2026');

    // Filtrer uniquement les participants avec inscription finalisée
    const participantsAvecBadge = filteredParticipants.filter(p => p.statutInscription === 'finalisée');
    const participantsSansBadge = filteredParticipants.filter(p => p.statutInscription !== 'finalisée');

    if (participantsSansBadge.length > 0) {
      toast.warning(`${participantsSansBadge.length} participant(s) exclu(s) - inscription non finalisée`);
    }

    if (participantsAvecBadge.length === 0) {
      toast.error('Aucun participant avec inscription finalisée');
      setIsDownloadingBadges(false);
      return;
    }

    try {
      toast.info(`Génération de ${participantsAvecBadge.length} badge(s) en cours...`);

      for (let i = 0; i < participantsAvecBadge.length; i++) {
        const participant = participantsAvecBadge[i];
        const organisation = getOrganisationById(participant.organisationId);
        
        // Créer un canvas pour dessiner le badge
        const canvas = document.createElement('canvas');
        const width = 800;
        const height = 1100;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) continue;

        // Fond blanc
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Couleur du header selon le statut
        let headerGradient;
        switch (participant.statut) {
          case 'vip':
            headerGradient = ctx.createLinearGradient(0, 0, width, 0);
            headerGradient.addColorStop(0, '#facc15');
            headerGradient.addColorStop(1, '#ca8a04');
            break;
          case 'speaker':
            headerGradient = ctx.createLinearGradient(0, 0, width, 0);
            headerGradient.addColorStop(0, '#a855f7');
            headerGradient.addColorStop(1, '#7e22ce');
            break;
          case 'membre':
            headerGradient = ctx.createLinearGradient(0, 0, width, 0);
            headerGradient.addColorStop(0, '#f97316');
            headerGradient.addColorStop(1, '#ea580c');
            break;
          default:
            headerGradient = ctx.createLinearGradient(0, 0, width, 0);
            headerGradient.addColorStop(0, '#3b82f6');
            headerGradient.addColorStop(1, '#1d4ed8');
            break;
        }

        // Header
        ctx.fillStyle = headerGradient;
        ctx.fillRect(0, 0, width, 180);

        // Texte du header
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('FANAF 2026', width / 2, 70);
        
        ctx.font = '28px Arial';
        ctx.fillText('26-29 Octobre 2025 • Abidjan', width / 2, 130);

        // Badge de statut
        const statutLabel = getStatutLabel(participant.statut);
        ctx.fillStyle = headerGradient;
        ctx.beginPath();
        ctx.roundRect(width / 2 - 120, 160, 240, 50, 25);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(statutLabel, width / 2, 195);

        // Photo placeholder (cercle)
        ctx.fillStyle = '#e5e7eb';
        ctx.beginPath();
        ctx.arc(width / 2, 350, 100, 0, Math.PI * 2);
        ctx.fill();
        
        // Icône utilisateur dans le cercle
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(width / 2, 330, 40, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(width / 2, 410, 60, 3.5, 6, false);
        ctx.stroke();

        // Nom et prénom
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${participant.prenom} ${participant.nom}`, width / 2, 520);

        // Organisation
        let yPos = 580;
        if (organisation) {
          ctx.fillStyle = '#4b5563';
          ctx.font = '28px Arial';
          const orgText = organisation.nom.length > 40 ? organisation.nom.substring(0, 37) + '...' : organisation.nom;
          ctx.fillText(orgText, width / 2, yPos);
          yPos += 50;
        }

        // Pays
        ctx.fillStyle = '#4b5563';
        ctx.font = '28px Arial';
        ctx.fillText(participant.pays, width / 2, yPos);
        yPos += 80;

        // QR Code (placeholder simple)
        ctx.fillStyle = '#000000';
        ctx.fillRect(width / 2 - 100, yPos, 200, 200);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(width / 2 - 90, yPos + 10, 180, 180);
        
        // Texte dans le QR code
        ctx.fillStyle = '#000000';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        const qrData = `FANAF2026-${participant.id}`;
        ctx.fillText(qrData, width / 2, yPos + 100);
        
        yPos += 230;

        // Référence
        ctx.fillStyle = '#6b7280';
        ctx.font = '22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Ref: ${participant.reference}`, width / 2, yPos);
        yPos += 50;

        // Badge généré
        if (participant.badgeGenere) {
          ctx.fillStyle = '#059669';
          ctx.font = '20px Arial';
          ctx.fillText('✓ Badge généré', width / 2, yPos);
          yPos += 40;
        }

        // Footer
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, height - 80, width, 80);
        
        ctx.fillStyle = '#6b7280';
        ctx.font = '22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Veuillez présenter ce badge à l\'entrée', width / 2, height - 35);

        // Bordure
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, width - 8, height - 8);

        // Convertir en blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, 'image/png');
        });

        // Ajouter au ZIP
        const fileName = `badge-${participant.reference}-${participant.nom}-${participant.prenom}.png`;
        badgesFolder?.file(fileName, blob);

        // Mettre à jour le toast de progression
        if ((i + 1) % 5 === 0 || i === participantsAvecBadge.length - 1) {
          toast.info(`Progression: ${i + 1}/${participantsAvecBadge.length} badges générés`);
        }
      }

      // Générer et télécharger le ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `badges-fanaf-2026-${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success(`${participantsAvecBadge.length} badge(s) téléchargé(s) avec succès !`);
    } catch (error) {
      console.error('Erreur lors de la génération des badges:', error);
      toast.error('Erreur lors de la génération des badges');
    } finally {
      setIsDownloadingBadges(false);
    }
  };

  // Gestion des erreurs uniquement (pas de loader)
  if (isError) {
    return (
      <div className="animate-page-enter flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement des données</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-page-enter">

      {/* Tableau de bord amélioré */}
      <div className="mb-4">
        {/* Cartes principales : Finalisés vs En Attente */}
        <WidgetStatsInscriptions stats={stats} participants={participants} />

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-5 gap-3">
          <Card className="p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Total</p>
                <p className="text-xl text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-500 p-1.5 rounded-lg">
                <Users className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Membres</p>
                <p className="text-xl text-gray-900">{stats.membres}</p>
              </div>
              <div className="bg-green-500 p-1.5 rounded-lg">
                <UserCheck className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Non-Membres</p>
                <p className="text-xl text-gray-900">{stats.nonMembres}</p>
              </div>
              <div className="bg-gray-500 p-1.5 rounded-lg">
                <Users className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">VIP</p>
                <p className="text-xl text-gray-900">{stats.vip}</p>
              </div>
              <div className="bg-purple-500 p-1.5 rounded-lg">
                <Award className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Speakers</p>
                <p className="text-xl text-gray-900">{stats.speakers}</p>
              </div>
              <div className="bg-orange-500 p-1.5 rounded-lg">
                <Mic className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Liste des inscrits */}
      <div>
        <Card className="mb-3">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span className="text-sm">Recherche et Filtres</span>
              </div>
              <Button 
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 h-7 text-xs"
              >
                <Filter className="w-3 h-3" />
                Filtres
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-orange-600 text-white text-xs h-4 px-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
            {/* Champ de recherche */}
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, prénom, email, référence, téléphone, pays, organisation..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>

            {/* Panneau de filtres multi-sélection */}
            {showFilters && (
              <div className="border border-gray-200 rounded-lg p-2 mb-2 bg-gray-50 animate-slide-down">
                <div className="grid grid-cols-4 gap-3">
                  {/* Filtre Statut Participant */}
                  <div>
                    <Label className="text-xs mb-1.5 block text-gray-900">Statut Participant</Label>
                    <div className="space-y-1">
                      {['membre', 'non-membre', 'vip', 'speaker'].map((statut) => (
                        <div key={statut} className="flex items-center space-x-1.5">
                          <Checkbox
                            id={`statut-${statut}`}
                            checked={tempStatutFilters.includes(statut)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setTempStatutFilters([...tempStatutFilters, statut]);
                              } else {
                                setTempStatutFilters(tempStatutFilters.filter(s => s !== statut));
                              }
                            }}
                            className="h-3 w-3"
                          />
                          <label
                            htmlFor={`statut-${statut}`}
                            className="text-xs cursor-pointer capitalize"
                          >
                            {statut}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filtre Statut Inscription */}
                  <div>
                    <Label className="text-xs mb-1.5 block text-gray-900">Statut Inscription</Label>
                    <div className="space-y-1">
                      {['finalisée', 'non-finalisée', 'exonéré'].map((statut) => (
                        <div key={statut} className="flex items-center space-x-1.5">
                          <Checkbox
                            id={`statut-inscription-${statut}`}
                            checked={tempStatutInscriptionFilters.includes(statut)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setTempStatutInscriptionFilters([...tempStatutInscriptionFilters, statut]);
                              } else {
                                setTempStatutInscriptionFilters(tempStatutInscriptionFilters.filter(s => s !== statut));
                              }
                            }}
                            className="h-3 w-3"
                          />
                          <label
                            htmlFor={`statut-inscription-${statut}`}
                            className="text-xs cursor-pointer capitalize"
                          >
                            {statut}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filtre Organisation */}
                  <div>
                    <Label className="text-xs mb-1.5 block text-gray-900">Organisation</Label>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {organisations.slice(0, 6).map((org) => (
                        <div key={org.id} className="flex items-center space-x-1.5">
                          <Checkbox
                            id={`org-${org.id}`}
                            checked={tempOrganisationFilters.includes(org.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setTempOrganisationFilters([...tempOrganisationFilters, org.id]);
                              } else {
                                setTempOrganisationFilters(tempOrganisationFilters.filter(o => o !== org.id));
                              }
                            }}
                            className="h-3 w-3"
                          />
                          <label
                            htmlFor={`org-${org.id}`}
                            className="text-xs cursor-pointer truncate"
                          >
                            {org.nom}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filtre Pays */}
                  <div>
                    <Label className="text-xs mb-1.5 block text-gray-900">Pays</Label>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {uniquePays.slice(0, 6).map((pays) => (
                        <div key={pays} className="flex items-center space-x-1.5">
                          <Checkbox
                            id={`pays-${pays}`}
                            checked={tempPaysFilters.includes(pays)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setTempPaysFilters([...tempPaysFilters, pays]);
                              } else {
                                setTempPaysFilters(tempPaysFilters.filter(p => p !== pays));
                              }
                            }}
                            className="h-3 w-3"
                          />
                          <label
                            htmlFor={`pays-${pays}`}
                            className="text-xs cursor-pointer"
                          >
                            {pays}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator className="my-2" />

                {/* Boutons d'action */}
                <div className="flex justify-end gap-1.5">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleResetFilters}
                    className="h-7 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Réinitialiser
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleApplyFilters}
                    className="bg-orange-600 hover:bg-orange-700 h-7 text-xs"
                  >
                    Appliquer les filtres
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-600">
                <p>
                  {filteredParticipants.length} participant(s) sur {participants.length}
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 text-orange-600">
                      ({activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''})
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-1.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={downloadAllBadges} 
                        variant="default"
                        className="bg-orange-600 hover:bg-orange-700 text-white h-7 text-xs"
                        disabled={badgesGenerables === 0 || isDownloadingBadges || readOnly}
                      >
                        {isDownloadingBadges ? (
                          <>
                            <Package className="w-3 h-3 mr-1 animate-pulse" />
                            Génération...
                          </>
                        ) : (
                          <>
                            <Package className="w-3 h-3 mr-1" />
                            Télécharger badges ({badgesGenerables})
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {badgesGenerables > 0 
                          ? `Téléchargera ${badgesGenerables} badge(s) - inscriptions finalisées uniquement` 
                          : `Aucun badge générable - aucune inscription finalisée`
                        }
                      </p>
                      {filteredParticipants.length > badgesGenerables && (
                        <p className="text-xs text-orange-400 mt-1">
                          {filteredParticipants.length - badgesGenerables} participant(s) exclu(s) - paiement en attente
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={exportToCSV} 
                        variant="outline" 
                        disabled={filteredParticipants.length === 0}
                        className="h-7 text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        CSV
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {activeFiltersCount > 0 
                          ? `Exportera ${filteredParticipants.length} participant(s) filtrés` 
                          : `Exportera tous les ${filteredParticipants.length} participants`
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredParticipants.length > badgesGenerables && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <QrCode className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-orange-900">
                    <span className="font-medium">{filteredParticipants.length - badgesGenerables} participant(s)</span> ne peuvent pas encore générer leur badge car leur inscription n'est pas finalisée (paiement en attente).
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    Les badges seront disponibles uniquement après validation du paiement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="h-8">
                    <TableHead className="text-xs py-1.5">Référence</TableHead>
                    <TableHead className="text-xs py-1.5">Participant</TableHead>
                    <TableHead className="text-xs py-1.5">Contact</TableHead>
                    <TableHead className="text-xs py-1.5">Organisation</TableHead>
                    <TableHead className="text-xs py-1.5">Pays</TableHead>
                    <TableHead className="text-xs py-1.5">Statut Participant</TableHead>
                    <TableHead className="text-xs py-1.5">Statut Inscription</TableHead>
                    <TableHead className="text-xs py-1.5">Mode de paiement</TableHead>
                    <TableHead className="text-xs py-1.5">Date d'inscription</TableHead>
                    <TableHead className="text-xs py-1.5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-gray-500 py-4 text-xs">
                        Aucun participant trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedParticipants.map((participant) => {
                      const organisation = getOrganisationById(participant.organisationId);
                      return (
                        <TableRow key={participant.id} className="h-9">
                          <TableCell className="text-gray-900 py-1.5 text-xs">{participant.reference}</TableCell>
                          <TableCell className="py-1.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-medium text-gray-900">{participant.prenom} {participant.nom}</span>
                              <div className="flex items-center gap-1">
                                <Mail className="w-2.5 h-2.5 text-gray-400" />
                                <span className="text-xs text-gray-500 truncate max-w-[200px]">{participant.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600 py-1.5 text-xs">{participant.telephone}</TableCell>
                          <TableCell className="text-gray-600 py-1.5 text-xs">{organisation?.nom || 'N/A'}</TableCell>
                          <TableCell className="py-1.5 text-xs">{participant.pays}</TableCell>
                          <TableCell className="py-1.5">
                            <Badge className={`${statutColors[participant.statut]} text-xs h-5 px-1.5`}>
                              {participant.statut}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-1.5">
                            <Badge className={`${statutInscriptionColors[getStatutPaiementLabel(participant)]} text-xs h-5 px-1.5`}>
                              {getStatutPaiementLabel(participant)}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-1.5 text-xs">
                            {getStatutPaiementLabel(participant) === 'finalisée' && participant.modePaiement ? (
                              <div className="flex items-center gap-1">
                                <span>
                                  {participant.modePaiement === 'espèce' && '💵'}
                                  {participant.modePaiement === 'carte bancaire' && '💳'}
                                  {participant.modePaiement === 'orange money' && '🟠'}
                                  {participant.modePaiement === 'wave' && '🌊'}
                                  {participant.modePaiement === 'virement' && '🏦'}
                                </span>
                                <span className="text-gray-700 capitalize">{participant.modePaiement}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-600 py-1.5 text-xs">
                            {new Date(participant.dateInscription).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="py-1.5">
                            <ParticipantDetailsDialog participant={participant} />
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

        {/* Pagination */}
        {filteredParticipants.length > 0 && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {/* Pages */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // N'afficher que certaines pages pour éviter trop de boutons
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
      <LoaderOverlay isLoading={isLoading} message="Chargement des inscriptions..." subMessage="Récupération des données en cours" />
    </div>
  );
}

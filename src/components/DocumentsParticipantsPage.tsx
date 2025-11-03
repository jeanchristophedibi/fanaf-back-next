'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { 
  Search, 
  FileText, 
  Download, 
  Eye,
  QrCode,
  Receipt,
  Mail,
  Calendar,
  Building2,
  User,
  CheckCircle2,
  Filter,
  X,
  FileDown,
  PackageOpen,
  RefreshCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useDynamicInscriptions } from './hooks/useDynamicInscriptions';
import { BadgeGenerator } from './BadgeGenerator';
import { ReceiptGenerator } from './ReceiptGenerator';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import QRCodeReact from 'react-qr-code';
import participantService from '@/services/participantService';
import { paymentService } from '@/services/paymentService';
import { DocumentViewer } from './DocumentViewer';

export function DocumentsParticipantsPage() {
  // const { participants } = useDynamicInscriptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<any | null>(null);
  const [isBadgeOpen, setIsBadgeOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isDownloadingBadges, setIsDownloadingBadges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshingBadgeId, setRefreshingBadgeId] = useState<string | null>(null);
  const badgesContainerRef = useRef<HTMLDivElement>(null);
  
  // État pour le visualiseur de documents
  const [documentViewer, setDocumentViewer] = useState<{
    open: boolean;
    url: string;
    title: string;
    type: 'badge' | 'recu' | 'lettre' | 'facture';
  }>({
    open: false,
    url: '',
    title: '',
    type: 'badge',
  });
  
  // Filtres
  const [filtreModePaiement, setFiltreModePaiement] = useState<string>('all');
  const [filtreOrganisation, setFiltreOrganisation] = useState<string>('all');
  const [filtrePeriode, setFiltrePeriode] = useState<string>('all');
  const [dateDebut, setDateDebut] = useState<string>('');
  const [dateFin, setDateFin] = useState<string>('');
  const [organisations, setOrganisations] = useState<any[]>([]);

  // État pour la confirmation de remise
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    participantId: string;
    registrationId: string;
    type: 'badge' | 'kit';
    participantName: string;
  }>({
    open: false,
    participantId: '',
    registrationId: '',
    type: 'badge',
    participantName: '',
  });

  // Charger les participants finalisés depuis localStorage
  const [finalisedParticipantsIds, setFinalisedParticipantsIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const stored = localStorage.getItem('finalisedParticipantsIds');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Fonction pour obtenir le nombre de remises d'un participant spécifique
  const getParticipantRemisesCount = (participantId: string): { badge: number; kit: number } => {
    if (typeof window === 'undefined') return { badge: 0, kit: 0 };
    const remisesData = JSON.parse(localStorage.getItem('remisesDocuments') || '{}');
    const participantRemises = remisesData[participantId];

    if (!participantRemises) {
      return { badge: 0, kit: 0 };
    }

    // Compatibilité avec l'ancien format (string ISO) et le nouveau format (array)
    const badgeCount = Array.isArray(participantRemises.badge) 
      ? participantRemises.badge.length 
      : participantRemises.badge ? 1 : 0;
    
    const kitCount = Array.isArray(participantRemises.kit)
      ? participantRemises.kit.length
      : participantRemises.kit ? 1 : 0;

    return { badge: badgeCount, kit: kitCount };
  };

  // Écouter les changements du localStorage pour mettre à jour en temps réel
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('finalisedParticipantsIds');
      setFinalisedParticipantsIds(stored ? new Set(JSON.parse(stored)) : new Set());
    };

    // Écouter l'événement personnalisé de finalisation de paiement
    const handlePaymentFinalized = () => {
      handleStorageChange();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('paymentFinalized', handlePaymentFinalized);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('paymentFinalized', handlePaymentFinalized);
    };
  }, []);

  // État pour forcer le re-render des compteurs
  const [remisesUpdateTrigger, setRemisesUpdateTrigger] = useState(0);

  // Écouter les changements de remises pour forcer la mise à jour
  useEffect(() => {
    const handleRemiseUpdate = () => {
      setRemisesUpdateTrigger(prev => prev + 1);
    };

    window.addEventListener('remiseDocumentUpdated', handleRemiseUpdate);
    window.addEventListener('storage', handleRemiseUpdate);

    return () => {
      window.removeEventListener('remiseDocumentUpdated', handleRemiseUpdate);
      window.removeEventListener('storage', handleRemiseUpdate);
    };
  }, []);

  // Fonction helper pour obtenir les infos de paiement (depuis participant ou localStorage)
  const getPaymentInfo = (participant: any) => {
    // Vérifier les deux formats possibles de champs (snake_case et camelCase)
    const datePaiement = participant.date_paiement || participant.datePaiement;
    const modePaiement = participant.mode_paiement || participant.modePaiement;
    
    if (datePaiement || modePaiement) {
      return {
        datePaiement,
        modePaiement,
      };
    }
    
    // Sinon, chercher dans localStorage (pour compatibilité avec anciennes données)
    if (typeof window === 'undefined') return { datePaiement: null, modePaiement: null };
    const finalisedPayments = JSON.parse(localStorage.getItem('finalisedPayments') || '{}');
    const paymentInfo = finalisedPayments[participant.id];
    
    if (paymentInfo) {
      return {
        datePaiement: paymentInfo.datePaiement ? new Date(paymentInfo.datePaiement).toISOString().split('T')[0] : null,
        modePaiement: paymentInfo.modePaiement,
      };
    }
    
    return {
      datePaiement: null,
      modePaiement: null,
    };
  };
  
  // Récupérer les participants par API
  // Filtrer les participants avec paiement finalisé (statut_inscription ou localStorage)
  const [currentApiPage, setCurrentApiPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    from: 0,
    to: 0,
    perPage: 20,
  });

  // Charger les organisations depuis l'API
  useEffect(() => {
    const fetchOrganisations = async () => {
      try {
        const response = await paymentService.getOrganisations();
        console.log('Réponse API organisations:', response);
        const data = response?.data?.data || response?.data || [];
        console.log('Organisations extraites:', data);
        setOrganisations(Array.isArray(data) ? data : []);
        console.log('Organisations chargées:', data.length);
        if (data.length > 0) {
          console.log('Exemple organisation:', data[0]);
        }
      } catch (error) {
        console.error('Erreur chargement organisations:', error);
        setOrganisations([]);
      }
    };
    fetchOrganisations();
  }, []);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentApiPage(1);
  }, [searchTerm, filtreModePaiement, filtreOrganisation, filtrePeriode, dateDebut, dateFin]);

  // Charger les participants avec React Query
  const { data: participantsData, isLoading: isLoadingParticipants, refetch: refetchParticipants } = useQuery({
    queryKey: [
      'documentsParticipants',
      currentApiPage,
      searchTerm,
      filtreModePaiement !== 'all' ? filtreModePaiement : null,
      filtreOrganisation !== 'all' ? filtreOrganisation : null,
      filtrePeriode !== 'all' ? filtrePeriode : null,
      dateDebut,
      dateFin,
    ],
    queryFn: async () => {
      try {
        // Préparer les filtres API
        const filters: any = {
          page: currentApiPage,
          per_page: 20,
        };
        
        // Mode de paiement
        if (filtreModePaiement !== 'all') {
          filters.payment_method = filtreModePaiement;
        }

        // Organisation
        if (filtreOrganisation !== 'all') {
          filters.company_id = filtreOrganisation;
        }

        // Dates pour filtrePeriode custom
        if (filtrePeriode === 'custom') {
          if (dateDebut) filters.start_date = dateDebut;
          if (dateFin) filters.end_date = dateFin;
        }

        console.log('Filtres documents envoyés à l\'API:', filters);

        const response = searchTerm
          ? await participantService.search(searchTerm, filters)
          : await participantService.getAll(filters);
        
        // Extraire les données et la pagination
        const apiData = response?.data || response;
        const participantsList = Array.isArray(apiData?.data) ? apiData.data : (apiData || []);
        
        // Mettre à jour les infos de pagination
        if (apiData?.current_page) {
          setPaginationInfo({
            currentPage: apiData?.current_page || 1,
            lastPage: apiData?.last_page || 1,
            total: apiData?.total || 0,
            from: apiData?.from || 0,
            to: apiData?.to || 0,
            perPage: apiData?.per_page || 20,
          });
        }

        return participantsList;
      } catch (error: any) {
        console.error('Erreur chargement participants:', error);
        const errorMsg = error?.message || 'Impossible de récupérer les participants';
        toast.error(errorMsg, {
          duration: 5000
        });
        return [];
      }
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  const participants = participantsData || [];

  // Fonction pour recharger les participants (utilisée après confirmation de remise)
  const fetchParticipants = async () => {
    await refetchParticipants();
  };

  const handleDownloadDocument = (participant: any, type: 'badge' | 'recu' | 'lettre' | 'facture') => {
    const docNames = {
      'badge': 'Badge',
      'recu': 'Reçu de paiement',
      'lettre': 'Lettre d\'invitation',
      'facture': 'Facture',
    };

    // Récupérer l'URL du document depuis l'API
    let documentUrl: string | null = null;
    
    if (type === 'badge' && participant.documents?.badge) {
      documentUrl = participant.documents.badge;
    } else if (type === 'lettre' && participant.documents?.invitation) {
      documentUrl = participant.documents.invitation;
    } else if (type === 'recu' && participant.documents?.invoices?.length > 0) {
      // Prendre le premier reçu disponible
      const invoice = participant.documents.invoices.find((inv: any) => inv.receipt_url);
      documentUrl = invoice?.receipt_url || null;
    } else if (type === 'facture' && participant.documents?.invoices?.length > 0) {
      // Prendre la première facture disponible
      const invoice = participant.documents.invoices.find((inv: any) => inv.invoice_path);
      documentUrl = invoice?.invoice_path || null;
    }

    console.log('URL du document extraite:', documentUrl);

    if (documentUrl) {
      // Ouvrir le document dans le visualiseur
      setDocumentViewer({
        open: true,
        url: documentUrl,
        title: docNames[type],
        type: type,
      });
      setSelectedParticipant(participant);
    } else {
      console.error('Document non trouvé dans participant.documents');
      toast.error(`${docNames[type]} non disponible`, {
        description: `Aucune URL trouvée pour ${participant.prenom} ${participant.nom}`,
        duration: 5000
      });
    }
  };

  // Ouvrir la boîte de dialogue de confirmation
  const openConfirmDialog = (registrationId: string, type: 'badge' | 'kit') => {
    const participant = participants.find((p: any) => p.registration?.id === registrationId);
    if (!participant) return;

    setConfirmDialog({
      open: true,
      participantId: participant.id,
      registrationId: participant.registration?.id,
      type,
      participantName: `${participant.prenom} ${participant.nom}`,
    });
  };

  // Confirmer la remise du document
  const confirmRemiseBadge = async (registrationId: string) => {
    setIsLoading(true);
    try {
      const response = await participantService.confirmRemiseBadge(registrationId);
      if (response.status === 200 || response.status === 201 || response.status === 'success') {
        toast.success('Remise de badge confirmée avec succès', {
          duration: 4000
        });
        
        // Recharger les participants AVANT de fermer le dialog
        await fetchParticipants();
        
        // Fermer le dialog après le rechargement
        setConfirmDialog({ ...confirmDialog, open: false });
      } else if (response.status === 400 || response.status === 401 || response.status === 'error') {
        toast.error(response.message || 'Erreur lors de la confirmation de remise', {
          duration: 5000
        });
        // Ne pas fermer le dialog en cas d'erreur
      } else {
        toast.error('Une erreur est survenue lors de la confirmation de remise', {
          duration: 5000
        });
        // Ne pas fermer le dialog en cas d'erreur
      }
    } catch (error: any) {
      console.error('Erreur confirmation remise badge:', error);
      const errorMsg = error?.message || 'Une erreur est survenue lors de la confirmation de remise';
      toast.error(errorMsg, {
        duration: 5000
      });
      // Ne pas fermer le dialog en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmer la remise du document
  const confirmRemiseKit = async () => {
    setIsLoading(true);
    const { participantId, registrationId, type, participantName } = confirmDialog;

    try {
      const response = await participantService.confirmRemiseKit(registrationId);
      if (response.status === 200 || response.status === 201 || response.status === 'success') {
        toast.success('Remise de kit confirmée avec succès', {
          duration: 4000
        });
        
        // Recharger les participants AVANT de fermer le dialog
        await fetchParticipants();
        
        // Fermer le dialog après le rechargement
        setConfirmDialog({ ...confirmDialog, open: false });
      } else if (response.status === 400 || response.status === 401 || response.status === 'error') {
        toast.error(response.message || 'Erreur lors de la confirmation de remise', {
          duration: 5000
        });
        // Ne pas fermer le dialog en cas d'erreur
      } else {
        toast.error('Une erreur est survenue lors de la confirmation de remise', {
          duration: 5000
        });
        // Ne pas fermer le dialog en cas d'erreur
      }
    } catch (error: any) {
      console.error('Erreur confirmation remise kit:', error);
      const errorMsg = error?.message || 'Une erreur est survenue lors de la confirmation de remise';
      toast.error(errorMsg, {
        duration: 5000
      });
      // Ne pas fermer le dialog en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBadge = async (participantId: string) => {
    setRefreshingBadgeId(participantId);
    try {
      const response = await participantService.refreshDocument(participantId);
      if (response.status === 200 || response.status === 201 || response.status === 'success') {
        toast.success('Document régénéré avec succès', {
          duration: 4000
        });
        // Recharger les participants pour obtenir le badge mis à jour
        await fetchParticipants();
      } else {
        toast.error(response.message || 'Erreur lors de la régénération', {
          duration: 5000
        });
      }
    } catch (error: any) {
      console.error('Erreur rafraîchissement badge:', error);
      const errorMsg = error?.message || 'Erreur lors de la régénération du document';
      toast.error(errorMsg, {
        duration: 5000
      });
    } finally {
      setRefreshingBadgeId(null);
    }
  };

  const resetFilters = () => {
    setFiltreModePaiement('all');
    setFiltreOrganisation('all');
    setFiltrePeriode('all');
    setDateDebut('');
    setDateFin('');
    setSearchTerm('');
    setCurrentApiPage(1);
  };

  const hasActiveFilters = filtreModePaiement !== 'all' || filtreOrganisation !== 'all' || filtrePeriode !== 'all' || searchTerm !== '' || dateDebut !== '' || dateFin !== '';

  const exportToCSV = () => {
    const headers = ['Référence', 'Nom', 'Prénom', 'Email', 'Organisation', 'Statut', 'Date Paiement', 'Mode Paiement', 'Nombre de remises de badge', 'Nombre de remises de kit'];
    const csvContent = [
      headers.join(','),
      ...participants.filter((p: any) => p.statut_inscription === 'finalisée').map((p: any) => {
        const org = p.organisation;
        const paymentInfo = getPaymentInfo(p);
        const remisesCount = getParticipantRemisesCount(p.id);
        return [
          p.reference,
          p.nom,
          p.prenom,
          p.email,
          org?.nom || '',
          p.statut,
          paymentInfo.datePaiement || '',
          paymentInfo.modePaiement || '',
          remisesCount.badge,
          remisesCount.kit,
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `documents_participants_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Export CSV téléchargé avec succès');
  };

  const downloadAllBadges = async () => {
    if (participants.length === 0) {
      toast.error('Aucun participant finalisé');
      return;
    }

    setIsDownloadingBadges(true);
    toast.info('Génération des badges en cours...', {
      description: `${participants.length} badge(s) à générer`,
    });

    try {
      const zip = new JSZip();
      
      // Créer un conteneur temporaire pour les badges
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      document.body.appendChild(tempContainer);

      // Générer chaque badge
      for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        const organisation = participant.organisation;
        
        // Créer le badge HTML
        const badgeElement = createBadgeElement(participant, organisation);
        tempContainer.appendChild(badgeElement);

        // Attendre un peu pour que le rendu soit complet
        await new Promise(resolve => setTimeout(resolve, 100));

        // Capturer le badge en image avec options pour éviter oklch
        const canvas = await html2canvas(badgeElement, {
          scale: 2,
          backgroundColor: 'rgb(255, 255, 255)',
          logging: false,
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: false,
          ignoreElements: (element) => {
            // Ignorer les éléments qui pourraient avoir des styles oklch
            return element.tagName === 'STYLE' || element.tagName === 'LINK';
          },
          onclone: (clonedDoc) => {
            // Supprimer tous les styles CSS globaux du document cloné
            const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
            styles.forEach(style => style.remove());
            
            // S'assurer que l'élément cloné a des styles inline corrects
            const clonedBadge = clonedDoc.body.querySelector('div');
            if (clonedBadge) {
              // Forcer tous les styles pour éviter l'héritage oklch
              clonedBadge.style.all = 'initial';
              clonedBadge.style.width = '400px';
              clonedBadge.style.backgroundColor = 'rgb(255, 255, 255)';
            }
          }
        });

        // Convertir en blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/png');
        });

        // Ajouter au ZIP
        const fileName = `badge_${participant.reference}_${participant.nom}_${participant.prenom}.png`;
        zip.file(fileName, blob);

        // Nettoyer
        tempContainer.removeChild(badgeElement);
      }

      // Nettoyer le conteneur temporaire
      document.body.removeChild(tempContainer);

      // Générer le ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Télécharger le ZIP
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `badges_fanaf2026_${new Date().toISOString().split('T')[0]}.zip`;
      link.click();

      toast.success('Badges téléchargés avec succès', {
        description: `${participants.length} badge(s) dans le fichier ZIP`,
      });
    } catch (error) {
      console.error('Erreur lors de la génération des badges:', error);
      toast.error('Erreur lors de la génération des badges');
    } finally {
      setIsDownloadingBadges(false);
    }
  };

  // Fonction helper pour créer un élément de badge
  const createBadgeElement = (participant: any, organisation: any) => {
    const container = document.createElement('div');
    // Isoler complètement l'élément des styles globaux
    container.style.all = 'initial';
    container.style.width = '400px';
    container.style.padding = '0';
    container.style.backgroundColor = 'rgb(255, 255, 255)';
    container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
    container.style.boxSizing = 'border-box';
    
    const getStatutBadgeColor = (statut: string) => {
      switch (statut) {
        case 'vip':
          return 'rgb(251, 191, 36)'; // Jaune VIP
        case 'speaker':
          return 'rgb(168, 85, 247)'; // Violet Speaker
        case 'membre':
          return 'rgb(249, 115, 22)'; // Orange Membre
        case 'referent':
          return 'rgb(16, 185, 129)'; // Vert Référent
        default:
          return 'rgb(59, 130, 246)'; // Bleu par défaut
      }
    };

    const getStatutLabel = (statut: string) => {
      switch (statut) {
        case 'vip': return 'VIP';
        case 'speaker': return 'SPEAKER';
        case 'membre': return 'MEMBRE';
        case 'non-membre': return 'PARTICIPANT';
        case 'referent': return 'RÉFÉRENT SPONSOR';
        default: return 'PARTICIPANT';
      }
    };

    container.innerHTML = `
      <div style="all: initial; display: block; background: rgb(255, 255, 255); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; box-sizing: border-box;">
        <div style="all: initial; display: block; background: ${getStatutBadgeColor(participant.statut)}; padding: 24px; text-align: center; box-sizing: border-box;">
          <div style="all: initial; display: inline-block; background: rgb(255, 255, 255); border-radius: 12px; padding: 12px; margin-bottom: 16px; box-sizing: border-box;">
            <div style="all: initial; display: block; font-size: 24px; font-weight: bold; color: rgb(249, 115, 22); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">FANAF</div>
            <div style="all: initial; display: block; font-size: 14px; color: rgb(102, 102, 102); margin-top: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">9-11 Février 2026</div>
          </div>
          <div style="all: initial; display: inline-block; background: rgba(255,255,255,0.95); color: rgb(51, 51, 51); padding: 8px 20px; border-radius: 20px; font-weight: 600; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; box-sizing: border-box;">
            ${getStatutLabel(participant.statut)}
          </div>
        </div>
        <div style="all: initial; display: block; padding: 24px; box-sizing: border-box;">
          <div style="all: initial; display: block; text-align: center; margin-bottom: 20px; box-sizing: border-box;">
            <div style="all: initial; display: flex; width: 100px; height: 100px; background: rgb(249, 115, 22); border-radius: 50%; margin: 0 auto 16px; align-items: center; justify-content: center; color: rgb(255, 255, 255); font-size: 40px; font-weight: bold; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; box-sizing: border-box;">
              ${participant.prenom[0]}${participant.nom[0]}
            </div>
            <h2 style="all: initial; display: block; font-size: 24px; font-weight: bold; color: rgb(31, 41, 55); margin: 0 0 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">${participant.prenom} ${participant.nom}</h2>
            <p style="all: initial; display: block; color: rgb(107, 114, 128); margin: 0; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">${participant.fonction || 'Participant'}</p>
          </div>
          <div style="all: initial; display: block; background: rgb(243, 244, 246); padding: 12px; border-radius: 8px; margin-bottom: 16px; box-sizing: border-box;">
            <div style="all: initial; display: flex; align-items: center; gap: 8px; box-sizing: border-box;">
              <div style="all: initial; display: inline-block; color: rgb(249, 115, 22); font-size: 16px;">🏢</div>
              <div style="all: initial; display: block; flex: 1; box-sizing: border-box;">
                <div style="all: initial; display: block; font-size: 12px; color: rgb(107, 114, 128); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">Organisation</div>
                <div style="all: initial; display: block; font-size: 14px; font-weight: 600; color: rgb(31, 41, 55); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">${organisation?.nom || 'N/A'}</div>
              </div>
            </div>
          </div>
          <div style="all: initial; display: block; margin-bottom: 16px; box-sizing: border-box;">
            <div style="all: initial; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; box-sizing: border-box;">
              <div style="all: initial; display: inline-block; color: rgb(249, 115, 22);">✉️</div>
              <div style="all: initial; display: inline-block; font-size: 13px; color: rgb(75, 85, 99); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">${participant.email}</div>
            </div>
            <div style="all: initial; display: flex; align-items: center; gap: 8px; box-sizing: border-box;">
              <div style="all: initial; display: inline-block; color: rgb(249, 115, 22);">📱</div>
              <div style="all: initial; display: inline-block; font-size: 13px; color: rgb(75, 85, 99); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">${participant.telephone}</div>
            </div>
          </div>
          <div style="all: initial; display: block; text-align: center; padding: 16px; background: rgb(249, 250, 251); border-radius: 8px; box-sizing: border-box;">
            <div id="qr-placeholder-${participant.id}" style="all: initial; display: inline-block;"></div>
            <div style="all: initial; display: block; font-size: 11px; color: rgb(156, 163, 175); margin-top: 8px; font-family: monospace;">${participant.reference}</div>
          </div>
        </div>
      </div>
    `;

    // Ajouter le QR code
    const qrPlaceholder = container.querySelector(`#qr-placeholder-${participant.id}`);
    if (qrPlaceholder) {
      const qrCanvas = document.createElement('canvas');
      qrCanvas.width = 120;
      qrCanvas.height = 120;
      const ctx = qrCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillRect(0, 0, 120, 120);
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('QR CODE', 60, 60);
        ctx.fillText(participant.reference, 60, 75);
      }
      qrPlaceholder.appendChild(qrCanvas);
    }

    return container;
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700">Documents disponibles</p>
                <p className="text-3xl text-green-900">{paginationInfo.total || participants.filter((p: any) => p.statut_inscription === 'finalisée').length}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-700">Badges générables</p>
                <p className="text-3xl text-purple-900">{paginationInfo.total || participants.length}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Invitations</p>
                <p className="text-3xl text-blue-900">{paginationInfo.total || participants.length}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-700">Reçus</p>
                <p className="text-3xl text-orange-900">
                  {paginationInfo.total || participants.filter((p: any) => p.statut === 'membre' || p.statut === 'non-membre').length}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Barre d'outils */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-green-600" />
            <span className="text-sm">Filtres et Actions</span>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button 
                onClick={resetFilters} 
                variant="outline"
                size="sm"
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <X className="w-4 h-4 mr-2" />
                Réinitialiser filtres
              </Button>
            )}
            <Button 
              onClick={downloadAllBadges}
              disabled={participants.length === 0 || isDownloadingBadges}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isDownloadingBadges ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Génération...
                </>
              ) : (
                <>
                  <PackageOpen className="w-4 h-4 mr-2" />
                  Badges (ZIP)
                </>
              )}
            </Button>
            <Button 
              onClick={exportToCSV} 
              variant="outline"
              disabled={participants.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Recherche */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom, prénom, email, référence, organisation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtres avancés */}
        <div className={`grid grid-cols-1 gap-4 ${filtrePeriode === 'custom' ? 'md:grid-cols-5' : 'md:grid-cols-3'}`}>
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Mode de paiement</label>
            <Select value={filtreModePaiement} onValueChange={setFiltreModePaiement}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les modes</SelectItem>
                <SelectItem value="cash">Espèce</SelectItem>
                <SelectItem value="bank_transfer">Virement</SelectItem>
                <SelectItem value="check">Chèque</SelectItem>
                <SelectItem value="mobile_money">AsaPay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Organisation</label>
            <Select value={filtreOrganisation} onValueChange={setFiltreOrganisation}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les organisations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les organisations</SelectItem>
                {organisations.map((org: any) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name || org.nom || 'Sans nom'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Période de paiement</label>
            <Select value={filtrePeriode} onValueChange={setFiltrePeriode}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les périodes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les périodes</SelectItem>
                <SelectItem value="7days">7 derniers jours</SelectItem>
                <SelectItem value="30days">30 derniers jours</SelectItem>
                <SelectItem value="90days">90 derniers jours</SelectItem>
                <SelectItem value="custom">Intervalle personnalisé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Champs de date pour intervalle personnalisé */}
          {filtrePeriode === 'custom' && (
            <>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-2 block">Date de début</label>
                <Input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-2 block">Date de fin</label>
                <Input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full"
                  min={dateDebut}
                />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Liste des participants */}
      <Card className="p-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              Tous ({paginationInfo.total || participants.length})
            </TabsTrigger>
            <TabsTrigger value="membre">
              Membres ({participants.filter((p: any) => p.statut === 'membre').length})
            </TabsTrigger>
            <TabsTrigger value="non-membre">
              Non-membres ({participants.filter((p: any) => p.statut === 'non-membre').length})
            </TabsTrigger>
            <TabsTrigger value="vip">
              VIP ({participants.filter((p: any) => p.statut === 'vip').length})
            </TabsTrigger>
            <TabsTrigger value="speaker">
              Speakers ({participants.filter((p: any) => p.statut === 'speaker').length})
            </TabsTrigger>
          </TabsList>

          {['all', 'membre', 'non-membre', 'vip', 'speaker'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-3">
              {(() => {
                const filtered = tab === 'all' 
                  ? participants 
                  : participants.filter((p: any) => p.statut === tab);

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucun participant trouvé</p>
                    </div>
                  );
                }

                return filtered.map((participant: any, index: number) => {
                  const organisation = participant.organisation;
                  // Vérifier la disponibilité des documents depuis l'API
                  const hasBadge = participant.documents?.has_badge || participant.documents?.badge;
                  const hasInvitation = participant.documents?.has_invitation || participant.documents?.invitation;
                  const hasInvoices = participant.documents?.invoices_count > 0 || participant.documents?.invoices?.length > 0;
                  const hasReceipt = hasInvoices && participant.documents?.invoices?.some((inv: any) => inv.receipt_url);
                  const hasInvoice = hasInvoices && participant.documents?.invoices?.some((inv: any) => inv.invoice_path);
                  const paymentInfo = getPaymentInfo(participant);
                  // Obtenir les compteurs de remises pour ce participant
                  const remisesCount = getParticipantRemisesCount(participant.id);

                  return (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Card className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          {/* Informations participant - Layout à 4 colonnes */}
                          <div className="flex-1 grid grid-cols-4 gap-4">
                            {/* Nom et référence */}
                            <div>
                              <p className="text-sm text-gray-900">
                                {participant.prenom} {participant.nom}
                              </p>
                              <p className="text-xs text-gray-500">Réf: {participant.reference}</p>
                              <Badge 
                                className={
                                  participant.statut === 'membre' ? 'bg-purple-100 text-purple-800 mt-1 text-xs' :
                                  participant.statut === 'non-membre' ? 'bg-amber-100 text-amber-800 mt-1 text-xs' :
                                  participant.statut === 'vip' ? 'bg-cyan-100 text-cyan-800 mt-1 text-xs' :
                                  'bg-yellow-100 text-yellow-800 mt-1 text-xs'
                                }
                              >
                                {participant.statut}
                              </Badge>
                            </div>

                            {/* Organisation */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Organisation</p>
                              <p className="text-sm text-gray-900">{participant?.organisation?.name || 'N/A'}</p>
                            </div>

                            {/* Contact */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Contact</p>
                              <p className="text-sm text-gray-900 truncate">{participant.email}</p>
                            </div>

                            {/* Paiement */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Paiement</p>
                              <p className="text-sm text-gray-900">
                                {participant.date_paiement ? new Date(participant.date_paiement).toLocaleDateString('fr-FR') : 'N/A'}
                              </p>
                              {participant.mode_paiement && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {participant.mode_paiement}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refreshBadge(participant.id)}
                                disabled={refreshingBadgeId === participant.id}
                                className="gap-2 border-teal-200 text-teal-700 hover:bg-teal-50 disabled:opacity-50"
                              >
                                <RefreshCcw className={`w-4 h-4 ${refreshingBadgeId === participant.id ? 'animate-spin' : ''}`} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Regénérer les documents</p>
                            </TooltipContent>
                          </Tooltip>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 border-green-200 text-green-700 hover:bg-green-50"
                              >
                                <FileText className="w-4 h-4" />
                                Documents
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleDownloadDocument(participant, 'badge')}
                                disabled={!hasBadge}
                              >
                                <QrCode className="w-4 h-4 mr-2" />
                                Télécharger Badge
                              </DropdownMenuItem>
                              {hasInvitation && (
                                <DropdownMenuItem onClick={() => handleDownloadDocument(participant, 'lettre')}>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Télécharger Lettre
                                </DropdownMenuItem>
                              )}
                              {hasReceipt && (
                                <DropdownMenuItem onClick={() => handleDownloadDocument(participant, 'recu')}>
                                  <Receipt className="w-4 h-4 mr-2" />
                                  Télécharger Reçu
                                </DropdownMenuItem>
                              )}
                              {hasInvoice && (
                                <DropdownMenuItem onClick={() => handleDownloadDocument(participant, 'facture')}>
                                  <FileDown className="w-4 h-4 mr-2" />
                                  Télécharger Facture
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openConfirmDialog(participant.registration.id, 'badge')}
                            className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                          >
                            <QrCode className="w-4 h-4" />
                            ({participant.registration?.badge_given_count}) Remise de badge
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openConfirmDialog(participant.registration.id, 'kit')}
                            className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                          >
                            <QrCode className="w-4 h-4" />
                            ({participant.registration?.kit_given_count}) Remise de kit
                          </Button>
                        </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                });
              })()}
            </TabsContent>
          ))}
        </Tabs>

        {/* Pagination */}
        {!isLoadingParticipants && paginationInfo.lastPage > 1 && (
          <div className="p-4 border-t mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Affichage de {paginationInfo.from} à {paginationInfo.to} sur {paginationInfo.total} résultat{paginationInfo.total > 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentApiPage(p => Math.max(1, p - 1))}
                  disabled={currentApiPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Précédent
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, paginationInfo.lastPage) }, (_, i) => {
                    let pageNum;
                    if (paginationInfo.lastPage <= 5) {
                      pageNum = i + 1;
                    } else if (currentApiPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentApiPage >= paginationInfo.lastPage - 2) {
                      pageNum = paginationInfo.lastPage - 4 + i;
                    } else {
                      pageNum = currentApiPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentApiPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentApiPage(pageNum)}
                        className={currentApiPage === pageNum ? "bg-orange-600 hover:bg-orange-700" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentApiPage(p => Math.min(paginationInfo.lastPage, p + 1))}
                  disabled={currentApiPage === paginationInfo.lastPage}
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* AlertDialog pour confirmation de remise du badge */}
      <AlertDialog 
        open={confirmDialog.open && confirmDialog.type === 'badge'} 
        onOpenChange={(open) => {
          // Empêcher la fermeture si une requête est en cours
          if (!open && isLoading) {
            toast.warning('Veuillez attendre la fin du traitement');
            return;
          }
          setConfirmDialog({ ...confirmDialog, open });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation de remise du badge</AlertDialogTitle>
            <AlertDialogDescription>
              Confirmez-vous la remise du badge pour {confirmDialog.participantName} ?
              {isLoading && (
                <div className="flex items-center gap-2 mt-3 text-sm text-blue-600 bg-blue-50 p-3 rounded border border-blue-200">
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  <span>Traitement en cours...</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isLoading}
              onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            >
              Annuler
            </AlertDialogCancel>
            <Button
              onClick={(e) => {
                e.preventDefault();
                confirmRemiseBadge(confirmDialog.registrationId);
              }}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                  Confirmation...
                </>
              ) : (
                'Confirmer'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog pour confirmation de remise du kit */}
      <AlertDialog 
        open={confirmDialog.open && confirmDialog.type === 'kit'} 
        onOpenChange={(open) => {
          // Empêcher la fermeture si une requête est en cours
          if (!open && isLoading) {
            toast.warning('Veuillez attendre la fin du traitement');
            return;
          }
          setConfirmDialog({ ...confirmDialog, open });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation de remise du kit</AlertDialogTitle>
            <AlertDialogDescription>
              Confirmez-vous la remise du kit pour {confirmDialog.participantName} ?
              {isLoading && (
                <div className="flex items-center gap-2 mt-3 text-sm text-blue-600 bg-blue-50 p-3 rounded border border-blue-200">
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  <span>Traitement en cours...</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isLoading}
              onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            >
              Annuler
            </AlertDialogCancel>
            <Button
              onClick={(e) => {
                e.preventDefault();
                confirmRemiseKit();
              }}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                  Confirmation...
                </>
              ) : (
                'Confirmer'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Badge */}
      {selectedParticipant && (
        <>
          <Dialog open={isBadgeOpen} onOpenChange={setIsBadgeOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-green-600" />
                  Badge - {selectedParticipant.prenom} {selectedParticipant.nom}
                </DialogTitle>
                <DialogDescription>
                  Aperçu et téléchargement du badge pour {selectedParticipant.prenom} {selectedParticipant.nom}
                </DialogDescription>
              </DialogHeader>
              <BadgeGenerator participant={selectedParticipant} isOpen={isBadgeOpen} onClose={() => setIsBadgeOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-green-600" />
                  Reçu de paiement - {selectedParticipant.prenom} {selectedParticipant.nom}
                </DialogTitle>
                <DialogDescription>
                  Aperçu et téléchargement du reçu de paiement pour {selectedParticipant.prenom} {selectedParticipant.nom}
                </DialogDescription>
              </DialogHeader>
              <ReceiptGenerator participant={{
                ...selectedParticipant,
                organisation: selectedParticipant.organisation?.nom || 'N/A'
              }} open={isReceiptOpen} onOpenChange={setIsReceiptOpen} />
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Visualiseur de documents */}
      <DocumentViewer
        open={documentViewer.open}
        onOpenChange={(open) => setDocumentViewer({ ...documentViewer, open })}
        documentUrl={documentViewer.url}
        documentTitle={documentViewer.title}
        participantName={selectedParticipant ? `${selectedParticipant.prenom} ${selectedParticipant.nom}` : ''}
        documentType={documentViewer.type}
      />
    </div>
  );
}

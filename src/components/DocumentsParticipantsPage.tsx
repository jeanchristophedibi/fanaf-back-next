import React, { useState, useRef } from 'react';
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
  PackageOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { useDynamicInscriptions } from './hooks/useDynamicInscriptions';
import { type Participant } from './data/types';
import { getOrganisationById } from './data/helpers';
import { useOrganisationsQuery } from '../hooks/useOrganisationsQuery';

import { BadgeGenerator } from './BadgeGenerator';
import { ReceiptGenerator } from './ReceiptGenerator';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import QRCodeReact from 'react-qr-code';

export function DocumentsParticipantsPage() {
  const { participants } = useDynamicInscriptions();
  const { organisations } = useOrganisationsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isBadgeOpen, setIsBadgeOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isDownloadingBadges, setIsDownloadingBadges] = useState(false);
  const badgesContainerRef = useRef<HTMLDivElement>(null);
  
  // Filtres
  const [filtreModePaiement, setFiltreModePaiement] = useState<string>('all');
  const [filtreOrganisation, setFiltreOrganisation] = useState<string>('all');
  const [filtrePeriode, setFiltrePeriode] = useState<string>('all');
  const [dateDebut, setDateDebut] = useState<string>('');
  const [dateFin, setDateFin] = useState<string>('');

  // État pour la confirmation de remise
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    participantId: string;
    type: 'badge' | 'kit';
    participantName: string;
  }>({
    open: false,
    participantId: '',
    type: 'badge',
    participantName: '',
  });

  // Charger les participants finalisés depuis localStorage
  const [finalisedParticipantsIds, setFinalisedParticipantsIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('finalisedParticipantsIds');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Fonction pour obtenir le nombre de remises d'un participant spécifique
  const getParticipantRemisesCount = (participantId: string): { badge: number; kit: number } => {
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

  // Query pour écouter les changements du localStorage pour mettre à jour en temps réel
  useQuery({
    queryKey: ['documentsParticipants', 'localStorage', finalisedParticipantsIds],
    queryFn: () => {
      if (typeof window === 'undefined') return false;
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

      return true;
    },
    enabled: true,
    staleTime: 0,
  });

  // État pour forcer le re-render des compteurs
  const [remisesUpdateTrigger, setRemisesUpdateTrigger] = useState(0);

  // Query pour écouter les changements de remises pour forcer la mise à jour
  useQuery({
    queryKey: ['documentsParticipants', 'remisesUpdate', remisesUpdateTrigger],
    queryFn: () => {
      if (typeof window === 'undefined') return false;
      const handleRemiseUpdate = () => {
        setRemisesUpdateTrigger(prev => prev + 1);
      };

      window.addEventListener('remiseDocumentUpdated', handleRemiseUpdate);
      window.addEventListener('storage', handleRemiseUpdate);

      return true;
    },
    enabled: true,
    staleTime: 0,
  });

  // Fonction helper pour obtenir les infos de paiement (depuis participant ou localStorage)
  const getPaymentInfo = (participant: Participant) => {
    // Si les infos sont déjà dans le participant, les retourner
    if (participant.datePaiement && participant.modePaiement) {
      return {
        datePaiement: participant.datePaiement,
        modePaiement: participant.modePaiement,
      };
    }
    
    // Sinon, chercher dans localStorage
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

  // Query pour filtrer les participants avec paiement finalisé (statutInscription ou localStorage)
  const participantsFinalisésQuery = useQuery({
    queryKey: ['documentsParticipants', 'filtered', participants, finalisedParticipantsIds, searchTerm, filtreModePaiement, filtreOrganisation, filtrePeriode, dateDebut, dateFin],
    queryFn: () => {
      let filtered = participants.filter(p => 
        p.statutInscription === 'finalisée' || finalisedParticipantsIds.has(p.id)
      );

      // Filtre par recherche
      if (searchTerm) {
        filtered = filtered.filter(p => {
          const org = getOrganisationById(p.organisationId);
          return (
            p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org?.nom.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      }

      // Filtre par mode de paiement
      if (filtreModePaiement !== 'all') {
        filtered = filtered.filter(p => {
          const paymentInfo = getPaymentInfo(p);
          return paymentInfo.modePaiement === filtreModePaiement;
        });
      }

      // Filtre par organisation
      if (filtreOrganisation !== 'all') {
        filtered = filtered.filter(p => p.organisationId === filtreOrganisation);
      }

      // Filtre par période de paiement
      if (filtrePeriode !== 'all') {
        const now = new Date();
        filtered = filtered.filter(p => {
        const paymentInfo = getPaymentInfo(p);
        const datePaiement = paymentInfo.datePaiement ? new Date(paymentInfo.datePaiement) : null;
        if (!datePaiement) return false;
        
        if (filtrePeriode === 'custom') {
          // Intervalle personnalisé
          if (!dateDebut && !dateFin) return true;
          
          const paiementTime = datePaiement.getTime();
          const debutTime = dateDebut ? new Date(dateDebut).getTime() : -Infinity;
          const finTime = dateFin ? new Date(dateFin + 'T23:59:59').getTime() : Infinity;
          
          return paiementTime >= debutTime && paiementTime <= finTime;
        } else {
          // Périodes prédéfinies
          const diffTime = now.getTime() - datePaiement.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          switch (filtrePeriode) {
            case '7days':
              return diffDays <= 7;
            case '30days':
              return diffDays <= 30;
            case '90days':
              return diffDays <= 90;
            default:
              return true;
          }
        }
      });
    }

      return filtered;
    },
    enabled: true,
    staleTime: 0,
  });

  const participantsFinalisés = participantsFinalisésQuery.data ?? [];

  const handleDownloadDocument = (participant: Participant, type: 'badge' | 'recu' | 'lettre' | 'facture') => {
    const docNames = {
      'badge': 'Badge',
      'recu': 'Reçu de paiement',
      'lettre': 'Lettre d\'invitation',
      'facture': 'Facture',
    };
    toast.success(`${docNames[type]} téléchargé(e)`, {
      description: `${participant.prenom} ${participant.nom}`,
    });
  };

  // Ouvrir la boîte de dialogue de confirmation
  const openConfirmDialog = (participantId: string, type: 'badge' | 'kit') => {
    const participant = participants.find(p => p.id === participantId);
    if (!participant) return;

    setConfirmDialog({
      open: true,
      participantId,
      type,
      participantName: `${participant.prenom} ${participant.nom}`,
    });
  };

  // Confirmer la remise du document
  const confirmRemiseDocument = () => {
    const { participantId, type, participantName } = confirmDialog;
    
    // Récupérer les données de remise existantes
    const remisesData = JSON.parse(localStorage.getItem('remisesDocuments') || '{}');
    
    // Initialiser si nécessaire
    if (!remisesData[participantId]) {
      remisesData[participantId] = {
        badge: [],
        kit: []
      };
    }

    // Convertir l'ancien format en nouveau format si nécessaire
    if (!Array.isArray(remisesData[participantId].badge)) {
      remisesData[participantId].badge = remisesData[participantId].badge 
        ? [remisesData[participantId].badge] 
        : [];
    }
    if (!Array.isArray(remisesData[participantId].kit)) {
      remisesData[participantId].kit = remisesData[participantId].kit 
        ? [remisesData[participantId].kit] 
        : [];
    }

    // Ajouter la nouvelle date de remise
    remisesData[participantId][type].push(new Date().toISOString());

    // Sauvegarder
    localStorage.setItem('remisesDocuments', JSON.stringify(remisesData));

    // Toast de confirmation
    const labels = {
      badge: 'Badge',
      kit: 'Kit'
    };
    
    const count = remisesData[participantId][type].length;
    
    toast.success(`${labels[type]} remis`, {
      description: `${participantName} (${count} remise${count > 1 ? 's' : ''})`,
    });

    // Fermer le dialogue
    setConfirmDialog({
      open: false,
      participantId: '',
      type: 'badge',
      participantName: '',
    });
  };

  const resetFilters = () => {
    setFiltreModePaiement('all');
    setFiltreOrganisation('all');
    setFiltrePeriode('all');
    setDateDebut('');
    setDateFin('');
    setSearchTerm('');
  };

  const hasActiveFilters = filtreModePaiement !== 'all' || filtreOrganisation !== 'all' || filtrePeriode !== 'all' || searchTerm !== '' || dateDebut !== '' || dateFin !== '';

  const exportToCSV = () => {
    const headers = ['Référence', 'Nom', 'Prénom', 'Email', 'Organisation', 'Statut', 'Date Paiement', 'Mode Paiement', 'Nombre de remises de badge', 'Nombre de remises de kit'];
    const csvContent = [
      headers.join(','),
      ...participantsFinalisés.map(p => {
        const org = getOrganisationById(p.organisationId);
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
    if (participantsFinalisés.length === 0) {
      toast.error('Aucun participant finalisé');
      return;
    }

    setIsDownloadingBadges(true);
    toast.info('Génération des badges en cours...', {
      description: `${participantsFinalisés.length} badge(s) à générer`,
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
      for (let i = 0; i < participantsFinalisés.length; i++) {
        const participant = participantsFinalisés[i];
        const organisation = getOrganisationById(participant.organisationId);
        
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
        description: `${participantsFinalisés.length} badge(s) dans le fichier ZIP`,
      });
    } catch (error) {
      console.error('Erreur lors de la génération des badges:', error);
      toast.error('Erreur lors de la génération des badges');
    } finally {
      setIsDownloadingBadges(false);
    }
  };

  // Fonction helper pour créer un élément de badge
  const createBadgeElement = (participant: Participant, organisation: any) => {
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
                <p className="text-3xl text-green-900">{participantsFinalisés.length}</p>
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
                <p className="text-3xl text-purple-900">{participantsFinalisés.length}</p>
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
                <p className="text-3xl text-blue-900">{participantsFinalisés.length}</p>
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
                  {participantsFinalisés.filter(p => p.statut === 'membre' || p.statut === 'non-membre').length}
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
              disabled={participantsFinalisés.length === 0 || isDownloadingBadges}
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
              disabled={participantsFinalisés.length === 0}
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
                <SelectItem value="espèce">Espèce</SelectItem>
                <SelectItem value="carte bancaire">Carte bancaire</SelectItem>
                <SelectItem value="orange money">Orange Money</SelectItem>
                <SelectItem value="wave">Wave</SelectItem>
                <SelectItem value="virement">Virement</SelectItem>
                <SelectItem value="chèque">Chèque</SelectItem>
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
                    {org.nom}
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
              Tous ({participantsFinalisés.length})
            </TabsTrigger>
            <TabsTrigger value="membre">
              Membres ({participantsFinalisés.filter(p => p.statut === 'membre').length})
            </TabsTrigger>
            <TabsTrigger value="non-membre">
              Non-membres ({participantsFinalisés.filter(p => p.statut === 'non-membre').length})
            </TabsTrigger>
            <TabsTrigger value="vip">
              VIP ({participantsFinalisés.filter(p => p.statut === 'vip').length})
            </TabsTrigger>
            <TabsTrigger value="speaker">
              Speakers ({participantsFinalisés.filter(p => p.statut === 'speaker').length})
            </TabsTrigger>
          </TabsList>

          {['all', 'membre', 'non-membre', 'vip', 'speaker'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-3">
              {(() => {
                const filtered = tab === 'all' 
                  ? participantsFinalisés 
                  : participantsFinalisés.filter(p => p.statut === tab);

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucun participant trouvé</p>
                    </div>
                  );
                }

                return filtered.map((participant, index) => {
                  const organisation = getOrganisationById(participant.organisationId);
                  // Reçu et facture disponibles uniquement après paiement finalisé
                  const hasReceipt = participant.statutInscription === 'finalisée' && 
                                    (participant.statut === 'membre' || participant.statut === 'non-membre');
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
                              <p className="text-sm text-gray-900">{organisation?.nom || 'N/A'}</p>
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
                                {paymentInfo.datePaiement ? new Date(paymentInfo.datePaiement).toLocaleDateString('fr-FR') : 'N/A'}
                              </p>
                              {paymentInfo.modePaiement && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {paymentInfo.modePaiement}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                        <div className="flex items-center gap-2">
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
                              <DropdownMenuItem onClick={() => handleDownloadDocument(participant, 'badge')}>
                                <QrCode className="w-4 h-4 mr-2" />
                                Télécharger Badge
                              </DropdownMenuItem>
                              {hasReceipt && (
                                <DropdownMenuItem onClick={() => handleDownloadDocument(participant, 'recu')}>
                                  <Receipt className="w-4 h-4 mr-2" />
                                  Télécharger Reçu
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDownloadDocument(participant, 'lettre')}>
                                <Mail className="w-4 h-4 mr-2" />
                                Télécharger Lettre
                              </DropdownMenuItem>
                              {hasReceipt && (
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
                            onClick={() => openConfirmDialog(participant.id, 'badge')}
                            className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                          >
                            <QrCode className="w-4 h-4" />
                            ({remisesCount.badge}) Remise badge
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openConfirmDialog(participant.id, 'kit')}
                            className="gap-2 border-teal-200 text-teal-700 hover:bg-teal-50"
                          >
                            <PackageOpen className="w-4 h-4" />
                            ({remisesCount.kit}) Remise kit
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
      </Card>

      {/* AlertDialog pour confirmation de remise */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation de remise</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'badge' 
                ? `Confirmez-vous la remise du badge pour ${confirmDialog.participantName} ?`
                : `Confirmez-vous la remise du kit pour ${confirmDialog.participantName} ?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemiseDocument}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Confirmer
            </AlertDialogAction>
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
                organisation: getOrganisationById(selectedParticipant.organisationId)?.nom || 'N/A'
              }} open={isReceiptOpen} onOpenChange={setIsReceiptOpen} />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

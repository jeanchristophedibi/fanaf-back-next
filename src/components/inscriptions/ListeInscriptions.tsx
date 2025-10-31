'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Eye, User, Mail, Phone, Globe, Building, Calendar, QrCode, Package, Download, X, Loader2 } from 'lucide-react';
import { type Participant, type Organisation } from '../data/types';
import { getOrganisationById } from '../data/helpers';
import { inscriptionsDataService } from '../data/inscriptionsData';
import { documentsDataService } from '../data/documentsData';
import { toast } from 'sonner';
import { List, type Column, type ListAction } from '../list/List';
import { WidgetStatsInscriptions } from './WidgetStatsInscriptions';

interface ListeInscriptionsProps {
    readOnly?: boolean;
    userProfile?: 'agence' | 'fanaf' | 'asaci';
    defaultStatuts?: Array<'membre' | 'non-membre' | 'vip' | 'speaker'>;
    restrictStatutOptions?: Array<'membre' | 'non-membre' | 'vip' | 'speaker'>;
    showStats?: boolean; // Nouveau prop pour afficher/masquer les stats
  onlyNonFinalisees?: boolean; // Filtrer uniquement les inscriptions non finalisées
}

export function ListeInscriptions({ 
    readOnly = false, 
    userProfile = 'agence', 
    defaultStatuts,
    restrictStatutOptions,
  showStats = false,
  onlyNonFinalisees = false,
}: ListeInscriptionsProps = {}) {
    // État pour les données de l'API
    const [apiParticipants, setApiParticipants] = useState<Participant[]>([]);
    const [organisations, setOrganisations] = useState<Organisation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [badgeByEmail, setBadgeByEmail] = useState<Record<string, string>>({});
    const [selectedParticipants, setSelectedParticipants] = useState<Participant[]>([]);
    
    // Charger les données (participants et organisations) depuis l'API
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setApiError(null);
            
            try {
                // Charger les organisations en premier
                const loadedOrganisations = await inscriptionsDataService.loadOrganisations();
                setOrganisations(loadedOrganisations);
                
                // Mapper les statuts vers les catégories API si nécessaire
                const categoriesToFetch: Array<'member' | 'not_member' | 'vip'> = [];
                
                if (defaultStatuts && defaultStatuts.length > 0) {
                    if (defaultStatuts.includes('membre')) {
                        categoriesToFetch.push('member');
                    }
                    if (defaultStatuts.includes('non-membre')) {
                        categoriesToFetch.push('not_member');
                    }
                    if (defaultStatuts.includes('vip')) {
                        categoriesToFetch.push('vip');
                    }
                } else {
                    categoriesToFetch.push('member', 'not_member', 'vip');
                }
                
                // Charger les participants
                const loadedParticipants = await inscriptionsDataService.loadParticipants(
                    categoriesToFetch.length > 0 ? categoriesToFetch : undefined
                );
                setApiParticipants(loadedParticipants);

                // Charger les documents (badges/liens) et indexer par email
                try {
                    const docs = await documentsDataService.loadDocuments();
                    const map: Record<string, string> = {};
                    docs.forEach((d) => {
                        if (d.email && d.badgeUrl) {
                            map[d.email.toLowerCase()] = d.badgeUrl;
                        }
                    });
                    setBadgeByEmail(map);
                } catch (e) {
                    console.warn('[ListeInscriptions] Documents API non disponible:', e);
                }
            } catch (err: any) {
                console.error('Erreur lors du chargement des données:', err);
                setApiError(err.message || 'Erreur lors du chargement des données');
                toast.error(err.message || 'Erreur lors du chargement des données');
            } finally {
                setIsLoading(false);
            }
        };
        
        loadData();
    }, [defaultStatuts]);
    
    // S'assurer que les participants ont des IDs uniques (déduplication finale pour compatibilité avec mock)
    const participants = useMemo(() => {
        const source = apiParticipants;
        
        console.log(`[ListeInscriptions] Participants reçus: ${source.length} (API: ${apiParticipants.length})`);
        
        // Pour les données API, la déduplication est déjà faite dans le service
        // Vérifier que les participants ont bien tous des IDs et des propriétés essentielles
        const invalidParticipants = source.filter(p => !p.id || !p.email);
        if (invalidParticipants.length > 0) {
            console.warn(`[ListeInscriptions] ${invalidParticipants.length} participants invalides (sans ID ou email):`, invalidParticipants);
        }
        if (source.length > 0) {
            console.log(`[ListeInscriptions] Exemple de participant:`, {
                id: source[0].id,
                nom: source[0].nom,
                prenom: source[0].prenom,
                email: source[0].email,
                reference: source[0].reference,
                statut: source[0].statut,
                statutInscription: source[0].statutInscription,
            });
        }
        
        return source;
    }, [apiParticipants]);
    
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
    // Initialiser à true pour éviter les erreurs d'hydratation (sera mis à jour dans useEffect)
    const [showBadgeNotification, setShowBadgeNotification] = useState(true);
    
    // Initialiser l'état depuis localStorage après le montage pour éviter les erreurs d'hydratation
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('badgeNotificationDismissed');
            setShowBadgeNotification(stored !== 'true');
        }
    }, []);
    
    const statutColors: Record<string, string> = {
        'membre': 'bg-purple-100 text-purple-800',
        'non-membre': 'bg-amber-100 text-amber-800',
        'vip': 'bg-cyan-100 text-cyan-800',
        'speaker': 'bg-yellow-100 text-yellow-800',
    };
    
    const statutInscriptionColors: Record<string, string> = {
        'finalisée': 'bg-emerald-100 text-emerald-800',
        'non-finalisée': 'bg-red-100 text-red-800',
        'exonéré': 'bg-purple-100 text-purple-800',
    };

    // Options de statuts disponibles (peuvent être restreintes via props)
    const allStatutOptions: Array<'membre' | 'non-membre' | 'vip' | 'speaker'> = ['membre', 'non-membre', 'vip', 'speaker'];
    const statutOptions = restrictStatutOptions && restrictStatutOptions.length > 0
        ? restrictStatutOptions
        : allStatutOptions;

    // Verrouiller le filtre Statut si des valeurs par défaut ET une restriction sont définies côté appelant
    const isStatutLocked = Array.isArray(defaultStatuts) && defaultStatuts.length > 0 
        && Array.isArray(restrictStatutOptions) && restrictStatutOptions.length > 0;

    // Appliquer des statuts par défaut au chargement si fournis
    useEffect(() => {
        if (defaultStatuts && defaultStatuts.length > 0) {
            setTempStatutFilters(defaultStatuts);
            setAppliedStatutFilters(defaultStatuts);
        } else if (!defaultStatuts || defaultStatuts.length === 0) {
            // Si aucun defaultStatuts, réinitialiser les filtres
            setTempStatutFilters([]);
            setAppliedStatutFilters([]);
        }
    }, [defaultStatuts]);
    
    const getStatutPaiementLabel = (p: Participant) => {
        if (p.statut === 'vip' || p.statut === 'speaker') return 'exonéré';
        return p.statutInscription;
    };
    
    const activeFiltersCount = appliedStatutFilters.length + appliedStatutInscriptionFilters.length + appliedOrganisationFilters.length + appliedPaysFilters.length;
    
    const handleResetFilters = () => {
        setTempStatutFilters([]);
        setTempStatutInscriptionFilters([]);
        setTempOrganisationFilters([]);
        setTempPaysFilters([]);
        // Si verrouillé, conserver les statuts par défaut
        if (isStatutLocked && defaultStatuts) {
            setAppliedStatutFilters(defaultStatuts);
            setTempStatutFilters(defaultStatuts);
        } else {
        setAppliedStatutFilters([]);
        }
        setAppliedStatutInscriptionFilters([]);
        setAppliedOrganisationFilters([]);
        setAppliedPaysFilters([]);
        toast.success('Filtres réinitialisés');
    };
    
    const handleApplyFilters = () => {
        // Si verrouillé, imposer les statuts par défaut
        if (isStatutLocked && defaultStatuts) {
            setAppliedStatutFilters(defaultStatuts);
            setTempStatutFilters(defaultStatuts);
        } else {
        setAppliedStatutFilters(tempStatutFilters);
        }
        setAppliedStatutInscriptionFilters(tempStatutInscriptionFilters);
        setAppliedOrganisationFilters(tempOrganisationFilters);
        setAppliedPaysFilters(tempPaysFilters);
        setShowFilters(false);
        toast.success('Filtres appliqués');
    };
    
    // Filtrer les participants selon les filtres appliqués
    const filteredParticipants = useMemo(() => {
        // Debug: vérifier les statuts des participants
        const statutsCounts = participants.reduce((acc, p) => {
            acc[p.statut] = (acc[p.statut] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        console.log(`[ListeInscriptions] Répartition des statuts:`, statutsCounts);
        console.log(`[ListeInscriptions] Filtres appliqués:`, {
            appliedStatutFilters,
            appliedStatutInscriptionFilters,
            appliedOrganisationFilters,
            appliedPaysFilters
        });
        
    const filtered = participants.filter(participant => {
            const org = inscriptionsDataService.getOrganisationById(participant.organisationId);
            const matchesStatut = appliedStatutFilters.length === 0 || appliedStatutFilters.includes(participant.statut);
            const matchesStatutInscription = appliedStatutInscriptionFilters.length === 0 || 
                appliedStatutInscriptionFilters.includes(participant.statutInscription) ||
                (appliedStatutInscriptionFilters.includes('exonéré') && (participant.statut === 'vip' || participant.statut === 'speaker'));
            const matchesOrganisation = appliedOrganisationFilters.length === 0 || appliedOrganisationFilters.includes(participant.organisationId);
            const matchesPays = appliedPaysFilters.length === 0 || appliedPaysFilters.includes(participant.pays);
      const matchesOnlyNonFinalisees = !onlyNonFinalisees || participant.statutInscription === 'non-finalisée';
            
      return matchesStatut && matchesStatutInscription && matchesOrganisation && matchesPays && matchesOnlyNonFinalisees;
        });
        
        // Logs de debug pour comprendre pourquoi la liste est vide
        console.log(`[ListeInscriptions] Participants filtrés: ${filtered.length} sur ${participants.length}`, {
            totalParticipants: participants.length,
            appliedStatutFilters,
            appliedStatutInscriptionFilters,
            appliedOrganisationFilters,
            appliedPaysFilters,
            statutsUniques: [...new Set(participants.map(p => p.statut))],
            // Exemple de quelques participants pour voir leurs statuts
            exemplesParticipants: participants.slice(0, 3).map(p => ({
                id: p.id,
                statut: p.statut,
                statutInscription: p.statutInscription,
                nom: `${p.prenom} ${p.nom}`
            }))
        });
        
        return filtered;
    }, [participants, appliedStatutFilters, appliedStatutInscriptionFilters, appliedOrganisationFilters, appliedPaysFilters]);
    
    const uniquePays = [...new Set(participants.map(p => p.pays))].sort();
    const badgesGenerables = filteredParticipants.filter(p => p.statutInscription === 'finalisée').length;

    const getBadgeUrlFor = (p: Participant): string | undefined => {
        const emailKey = p.email?.toLowerCase();
        if (emailKey && badgeByEmail[emailKey]) return badgeByEmail[emailKey];
        return undefined;
    };

    const downloadFile = (url: string, filename?: string) => {
        try {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || '';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (e) {
            console.error('Download error:', e);
            toast.error('Impossible de télécharger le fichier');
        }
    };
    
    // Calculer les stats basées sur les participants chargés (API ou mock)
    const stats = useMemo(() => ({
        total: participants.length,
        membres: participants.filter(p => p.statut === 'membre').length,
        nonMembres: participants.filter(p => p.statut === 'non-membre').length,
        vip: participants.filter(p => p.statut === 'vip').length,
        speakers: participants.filter(p => p.statut === 'speaker').length,
        finalises: participants.filter(p => p.statutInscription === 'finalisée').length,
        enAttente: participants.filter(p => p.statutInscription === 'non-finalisée' && p.statut !== 'vip' && p.statut !== 'speaker').length,
    }), [participants]);
    
    // Composant Dialog pour les détails du participant
    const ParticipantDetailsDialog = ({ participant }: { participant: Participant }) => {
        const [isOpen, setIsOpen] = useState(false);
        const organisation = inscriptionsDataService.getOrganisationById(participant.organisationId);
       
        
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Eye className="w-4 h-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Détails du Participant
                        </DialogTitle>
                        <DialogDescription>
                            Informations complètes de {participant.prenom} {participant.nom}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="space-y-3">
                            <div>
                                <Label className="text-xs text-gray-500">Référence</Label>
                                <p className="text-sm font-medium mt-1">{participant.reference}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Nom complet</Label>
                                <p className="text-sm font-medium mt-1">{participant.prenom} {participant.nom}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Email</Label>
                                <p className="text-sm mt-1 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {participant.email}
                                </p>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Téléphone</Label>
                                <p className="text-sm mt-1 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {participant.telephone}
                                </p>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Pays</Label>
                                <p className="text-sm mt-1 flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    {participant.pays}
                                </p>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <div>
                                <Label className="text-xs text-gray-500">Statut Participant</Label>
                                <div className="mt-1">
                                    <Badge className={`${statutColors[participant.statut]} text-xs`}>
                                        {participant.statut}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Statut Inscription</Label>
                                <div className="mt-1">
                                    <Badge className={`${statutInscriptionColors[getStatutPaiementLabel(participant)]} text-xs`}>
                                        {getStatutPaiementLabel(participant)}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Organisation</Label>
                                <p className="text-sm mt-1 flex items-center gap-1">
                                    <Building className="w-3 h-3" />
                                    {organisation?.nom || 'N/A'}
                                </p>
                            </div>
                            {participant.modePaiement && (
                                <div>
                                    <Label className="text-xs text-gray-500">Mode de paiement</Label>
                                    <p className="text-sm mt-1 capitalize">{participant.modePaiement}</p>
                                </div>
                            )}
                            <div>
                                <Label className="text-xs text-gray-500">Date d'inscription</Label>
                                <p className="text-sm mt-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(participant.dateInscription).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    };
    
    // Colonnes pour le composant List
    const columns: Column<Participant>[] = [
        {
            key: 'dateInscription',
            header: "Date d'inscription",
            sortable: true,
            render: (p) => (
                <span className="text-gray-600 text-xs">
                    {new Date(p.dateInscription).toLocaleDateString('fr-FR')}
                </span>
            )
        },
        { 
            key: 'reference', 
            header: 'Référence', 
            sortable: true 
        },
        {
            key: 'nom',
            header: 'Participant',
            sortable: true,
            render: (p) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-gray-900">{p.prenom} {p.nom}</span>
                    <div className="flex items-center gap-1">
                        <Mail className="w-2.5 h-2.5 text-gray-400" />
                        <span className="text-xs text-gray-500 truncate max-w-[200px]">{p.email}</span>
                    </div>
      </div>
            )
        },
        { key: 'telephone', header: 'Contact', sortable: true },
        {
            key: 'organisation',
            header: 'Organisation',
            sortable: true,
            render: (p) => {
                const org = inscriptionsDataService.getOrganisationById(p.organisationId);
                return <span className="text-gray-600 text-xs">{org?.nom || 'N/A'}</span>;
            },
            sortKey: 'organisationId'
        },
        { key: 'pays', header: 'Pays', sortable: true },
        {
            key: 'statut',
            header: 'Statut Participant',
            sortable: true,
            render: (p) => (
                <Badge className={`${statutColors[p.statut]} text-xs h-5 px-1.5`}>
                    {p.statut}
                </Badge>
            )
        },
        {
            key: 'statutInscription',
            header: 'Statut Inscription',
            sortable: true,
            render: (p) => (
                <Badge className={`${statutInscriptionColors[getStatutPaiementLabel(p)]} text-xs h-5 px-1.5`}>
                    {getStatutPaiementLabel(p)}
          </Badge>
            )
        },
        {
            key: 'modePaiement',
            header: 'Mode de paiement',
            render: (p) => {
                const label = getStatutPaiementLabel(p);
                return label === 'finalisée' && p.modePaiement ? (
                    <div className="flex items-center gap-1">
                        <span>
                            {p.modePaiement === 'espèce' && '💵'}
                            {p.modePaiement === 'carte bancaire' && '💳'}
                            {p.modePaiement === 'orange money' && '🟠'}
                            {p.modePaiement === 'wave' && '🌊'}
                            {p.modePaiement === 'virement' && '🏦'}
                        </span>
                        <span className="text-gray-700 capitalize text-xs">{p.modePaiement}</span>
    </div>
                ) : (
                    <span className="text-gray-400 text-xs">-</span>
                );
            }
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (p) => (
                <div className="flex items-center gap-1">
                    <ParticipantDetailsDialog participant={p} />
                    {getBadgeUrlFor(p) ? (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                        onClick={() => {
                                            const url = getBadgeUrlFor(p) as string;
                                            try {
                                                window.open(url, '_blank', 'noopener');
                                            } catch (e) {
                                                console.error('open error:', e);
                                            }
                                        }}
                                        aria-label="Ouvrir le badge dans un nouvel onglet"
                                    >
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Ouvrir le badge dans un nouvel onglet
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ) : (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-gray-300"
                                            disabled
                                        >
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Badge indisponible
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            )
        }
    ];

    // Composant de filtres personnalisé
    const filterComponent = (
        <div className="w-full">
    {showFilters && (
                <div className="border border-gray-200 rounded-lg p-2 mt-2 bg-gray-50">
        <div className="grid grid-cols-4 gap-3">
          <div>
            <Label className="text-xs mb-1.5 block text-gray-900">Statut Participant</Label>
            <div className="space-y-1">
                                {statutOptions.map((statut) => (
                <div key={statut} className="flex items-center space-x-1.5">
                  <Checkbox
                    id={`statut-${statut}`}
                    checked={tempStatutFilters.includes(statut)}
                                            disabled={isStatutLocked}
                    onCheckedChange={(checked) => {
                                                if (isStatutLocked) return;
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

          <div>
            {!onlyNonFinalisees && (
              <>
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
              </>
            )}
          </div>

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

        <div className="flex justify-end gap-1.5">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleResetFilters}
            className="h-7 text-xs"
          >
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
              <div className="flex items-center justify-between mt-2">
              <Button 
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-7 text-xs"
            >
                {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="mr-1 bg-orange-600 text-white text-xs h-4 px-1">
                        {activeFiltersCount}
                    </Badge>
                )}
                Filtres
              </Button>
              </div>
        </div>
    );

    const exportHeaders = [
        'Référence',
        'Nom',
        'Prénom',
        'Email',
        'Téléphone',
        'Organisation',
        'Pays',
        'Statut',
        'Statut Inscription',
        'Mode de paiement',
        'Date inscription'
    ];

    const exportData = (p: Participant) => {
        const org = inscriptionsDataService.getOrganisationById(p.organisationId);
        return [
            p.reference,
            p.nom,
            p.prenom,
            p.email,
            p.telephone,
            org?.nom || 'N/A',
            p.pays,
            p.statut,
            getStatutPaiementLabel(p),
            p.modePaiement || '-',
            new Date(p.dateInscription).toLocaleDateString('fr-FR')
        ];
    };

    const buildActions: ListAction<Participant>[] = [
        {
            label: `Télécharger badges`,
            icon: <Package className="w-4 h-4" />,
            onClick: async (items) => {
                const withBadges = items
                  .map(p => ({ p, url: getBadgeUrlFor(p) }))
                  .filter(x => !!x.url) as Array<{ p: Participant; url: string }>;
                if (withBadges.length === 0) {
                    toast.error('Aucun badge disponible pour la sélection');
                    return;
                }
                setIsDownloadingBadges(true);
                toast.info(`Téléchargement de ${withBadges.length} badge(s)...`);
                try {
                    withBadges.forEach(({ p, url }) => {
                        const filename = p.reference ? `badge-${p.reference}.pdf` : undefined;
                        downloadFile(url, url);
                    });
                    toast.success(`${withBadges.length} badge(s) téléchargé(s)`);
                } finally {
                    setIsDownloadingBadges(false);
                }
            },
            disabled: (items) => items.every(p => !getBadgeUrlFor(p)) || readOnly,
        }
    ];

    const handleDismissNotification = () => {
        setShowBadgeNotification(false);
        if (typeof window !== 'undefined') {
            localStorage.setItem('badgeNotificationDismissed', 'true');
        }
    };

    return (
        <>
            {/* Loader overlay pendant le chargement */}
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">Chargement des données...</p>
                    </div>
                </div>
            )}
            
            {/* Afficher les stats si demandé */}
            {showStats && (
                <div className="mb-6">
                    <WidgetStatsInscriptions stats={stats} participants={participants} loading={isLoading} />
                </div>
            )}
            
            {filteredParticipants.length > badgesGenerables && showBadgeNotification && (
                <Card className="border-orange-200 bg-orange-50 pt-5 mb-3">
    <CardContent className="p-3">
      <div className="flex items-start gap-2">
        <QrCode className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
          <p className="text-xs text-orange-900">
            <span className="font-medium">{filteredParticipants.length - badgesGenerables} participant(s)</span> ne peuvent pas encore générer leur badge car leur inscription n'est pas finalisée (paiement en attente).
          </p>
          <p className="text-xs text-orange-700 mt-1">
            Les badges seront disponibles uniquement après validation du paiement.
          </p>
        </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDismissNotification}
                                className="h-6 w-6 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-100 flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </Button>
      </div>
    </CardContent>
  </Card>
)}

            <List
                data={filteredParticipants}
                columns={columns}
                getRowId={(p) => p.id}
                searchPlaceholder="Rechercher par nom, prénom, email, référence, téléphone, pays, organisation..."
                searchKeys={["nom", "prenom", "email", "reference", "telephone", "pays"]}
                filterComponent={filterComponent}
                filterTitle="Inscriptions"
                exportFilename="inscriptions-fanaf"
                exportHeaders={exportHeaders}
                exportData={exportData}
                itemsPerPage={10}
                readOnly={readOnly}
                enableSelection={true}
                selectedItems={selectedParticipants}
                onSelectionChange={setSelectedParticipants}
                buildActions={buildActions}
                emptyMessage="Aucun participant trouvé"
                loading={isLoading}
            />
            
            {/* Affichage de l'erreur API si présente */}
            {apiError && (
                <Card className="border-red-200 bg-red-50 mt-4">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                            <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-900">Erreur lors du chargement des données</p>
                                <p className="text-xs text-red-700 mt-1">{apiError}</p>
                                <p className="text-xs text-red-600 mt-2">
                                    Les données affichées proviennent du mode démo. Veuillez vérifier votre connexion et réessayer.
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setApiError(null);
                                    // Recharger les données
                                    window.location.reload();
                                }}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
}

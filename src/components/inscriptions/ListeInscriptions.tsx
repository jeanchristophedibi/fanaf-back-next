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
import { Eye, User, Mail, Phone, Globe, Building, Calendar, QrCode, Package, Download, X } from 'lucide-react';
import { type Participant, type Organisation } from '../data/mockData';
import { inscriptionsDataService } from '../data/inscriptionsData';
import { useDynamicInscriptions } from '../hooks/useDynamicInscriptions';
import { toast } from 'sonner';
import { List, type Column, type ListAction } from '../list/List';

interface ListeInscriptionsProps {
    readOnly?: boolean;
    userProfile?: 'agence' | 'fanaf' | 'asaci';
    defaultStatuts?: Array<'membre' | 'non-membre' | 'vip' | 'speaker'>;
    restrictStatutOptions?: Array<'membre' | 'non-membre' | 'vip' | 'speaker'>;
}

export function ListeInscriptions({ 
    readOnly = false, 
    userProfile = 'agence', 
    defaultStatuts,
    restrictStatutOptions,
}: ListeInscriptionsProps = {}) {
    // État pour les données de l'API
    const [apiParticipants, setApiParticipants] = useState<Participant[]>([]);
    const [organisations, setOrganisations] = useState<Organisation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    
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
    
    // Utiliser les données API si disponibles, sinon les données mock (pour compatibilité)
    const { participants: mockParticipants } = useDynamicInscriptions({ includeOrganisations: false });
    
    // S'assurer que les participants ont des IDs uniques (déduplication finale pour compatibilité avec mock)
    const participants = useMemo(() => {
        const source = apiParticipants.length > 0 ? apiParticipants : mockParticipants;
        
        console.log(`[ListeInscriptions] Participants reçus: ${source.length} (API: ${apiParticipants.length}, Mock: ${mockParticipants.length})`);
        
        // Pour les données API, la déduplication est déjà faite dans le service
        if (apiParticipants.length > 0) {
            // Vérifier que les participants ont bien tous des IDs et des propriétés essentielles
            const invalidParticipants = apiParticipants.filter(p => !p.id || !p.email);
            if (invalidParticipants.length > 0) {
                console.warn(`[ListeInscriptions] ${invalidParticipants.length} participants invalides (sans ID ou email):`, invalidParticipants);
            }
            if (apiParticipants.length > 0) {
                console.log(`[ListeInscriptions] Exemple de participant:`, {
                    id: apiParticipants[0].id,
                    nom: apiParticipants[0].nom,
                    prenom: apiParticipants[0].prenom,
                    email: apiParticipants[0].email,
                    reference: apiParticipants[0].reference,
                    statut: apiParticipants[0].statut,
                    statutInscription: apiParticipants[0].statutInscription,
                });
            }
            return apiParticipants;
        }
        
        // Pour les mock data, effectuer une déduplication basée sur email et référence
        const uniqueParticipants = new Map<string, Participant>();
        const usedEmails = new Set<string>();
        const usedReferences = new Set<string>();
        
        source.forEach((participant) => {
            const emailKey = participant.email?.toLowerCase().trim() || '';
            const refKey = participant.reference?.trim() || '';
            const key = emailKey || refKey || participant.id;
            
            // Dédupliquer par email ou référence pour les mock data
            const isDuplicate = 
                (emailKey && usedEmails.has(emailKey)) ||
                (refKey && usedReferences.has(refKey)) ||
                uniqueParticipants.has(key);
            
            if (!isDuplicate) {
                uniqueParticipants.set(key, participant);
                if (emailKey) usedEmails.add(emailKey);
                if (refKey) usedReferences.add(refKey);
            }
        });
        
        return Array.from(uniqueParticipants.values());
    }, [apiParticipants, mockParticipants]);
    
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
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
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
        const filtered = participants.filter(participant => {
            const org = inscriptionsDataService.getOrganisationById(participant.organisationId);
            const matchesStatut = appliedStatutFilters.length === 0 || appliedStatutFilters.includes(participant.statut);
            const matchesStatutInscription = appliedStatutInscriptionFilters.length === 0 || 
                appliedStatutInscriptionFilters.includes(participant.statutInscription) ||
                (appliedStatutInscriptionFilters.includes('exonéré') && (participant.statut === 'vip' || participant.statut === 'speaker'));
            const matchesOrganisation = appliedOrganisationFilters.length === 0 || appliedOrganisationFilters.includes(participant.organisationId);
            const matchesPays = appliedPaysFilters.length === 0 || appliedPaysFilters.includes(participant.pays);
            
            return matchesStatut && matchesStatutInscription && matchesOrganisation && matchesPays;
        });
        
        console.log(`[ListeInscriptions] Participants filtrés: ${filtered.length} sur ${participants.length}`, {
            appliedStatutFilters,
            appliedStatutInscriptionFilters,
            appliedOrganisationFilters,
            appliedPaysFilters
        });
        
        return filtered;
    }, [participants, appliedStatutFilters, appliedStatutInscriptionFilters, appliedOrganisationFilters, appliedPaysFilters]);
    
    const uniquePays = [...new Set(participants.map(p => p.pays))].sort();
    const badgesGenerables = filteredParticipants.filter(p => p.statutInscription === 'finalisée').length;
    
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
            render: (p) => <ParticipantDetailsDialog participant={p} />
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
              <Button 
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="mt-2 h-7 text-xs"
            >
                {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="mr-1 bg-orange-600 text-white text-xs h-4 px-1">
                        {activeFiltersCount}
                    </Badge>
                )}
                Filtres
              </Button>
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
            label: `Télécharger badges (${badgesGenerables})`,
            icon: <Package className="w-4 h-4" />,
            onClick: async (items) => {
                const finalisees = items.filter(p => p.statutInscription === 'finalisée');
                if (finalisees.length === 0) {
                    toast.error('Aucun participant finalisé sélectionné');
                    return;
                }
                setIsDownloadingBadges(true);
                toast.info(`Génération de ${finalisees.length} badge(s)...`);
                // TODO: Implémenter la génération
                setTimeout(() => {
                    setIsDownloadingBadges(false);
                    toast.success(`${finalisees.length} badge(s) généré(s)`);
                }, 2000);
            },
            disabled: (items) => items.filter(p => p.statutInscription === 'finalisée').length === 0 || readOnly,
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

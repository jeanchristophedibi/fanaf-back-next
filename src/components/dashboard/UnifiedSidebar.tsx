'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Home, FileText, CreditCard, Users, Building2, Calendar, ChevronDown, RefreshCw, ScanLine, UserCog, Coins, Handshake, UserPlus, Loader2, BarChart3, Settings, Shield } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Button } from '../ui/button';
import { Logo } from '../ui/Logo';

type UserProfile = 'agence' | 'admin-fanaf' | 'admin-asaci' | 'admin' | 'agent-inscription' | 'operateur-caisse' | 'operateur-badge';

interface UnifiedSidebarProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  userProfile: UserProfile;
  onSwitchProfile?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  require?: UserProfile[];
  exclude?: UserProfile[];
}

interface SubMenuItem {
  id: string;
  label: string;
  badge?: number | null;
  badgeColor?: string;
}

export function UnifiedSidebar({ activeNav, onNavChange, userProfile, onSwitchProfile }: UnifiedSidebarProps) {
  // State for collapsible menus
  // Initialiser à false pour éviter les erreurs d'hydratation, puis mettre à true après montage
  const [inscriptionsOpen, setInscriptionsOpen] = useState(false);
  const [organisationsOpen, setOrganisationsOpen] = useState(false);
  const [networkingOpen, setNetworkingOpen] = useState(false);
  const [paiementsOpen, setPaiementsOpen] = useState(false);
  const [tresorerieOpen, setTresorerieOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [loadingNav, setLoadingNav] = useState<string | null>(null);

  // Query pour synchroniser l'état après le montage pour éviter les erreurs d'hydratation
  useQuery({
    queryKey: ['unifiedSidebar', 'mount', isMounted],
    queryFn: () => {
      setIsMounted(true);
      setInscriptionsOpen(true);
      setOrganisationsOpen(true);
      setNetworkingOpen(true);
      setPaiementsOpen(true);
      setTresorerieOpen(true);
      return true;
    },
    enabled: !isMounted,
    staleTime: 0,
  });

  // Menu configuration based on user profile
  const getMenuConfig = () => {
    switch (userProfile) {
      case 'agence':
        return {
          mainNavItems: [
            { id: 'home', label: 'Accueil', icon: Home },
            { id: 'check-in', label: 'Check-in', icon: ScanLine },
            { id: 'comite-organisation', label: 'Comité d\'Organisation', icon: UserCog },
          ],
          showInscriptions: true,
          showOrganisations: true,
          showNetworking: true,
          showPaiements: false,
          showTresorerie: false,
          title: 'Agence de communication',
        };

      case 'admin-fanaf':
        return {
          mainNavItems: [
            { id: 'home', label: 'Accueil', icon: Home },
          ],
          showInscriptions: true,
          showTresorerie: true,
          showOrganisations: true,
          showNetworking: true,
          showPaiements: false,
          title: 'Administration FANAF',
        };

      case 'admin':
        return {
          mainNavItems: [
            { id: 'home', label: 'Accueil', icon: Home },
            { id: 'users', label: 'Utilisateurs', icon: UserCog },
            { id: 'companies', label: 'Compagnies', icon: Building2 },
            { id: 'statistiques', label: 'Statistiques', icon: BarChart3 },
          ],
          showInscriptions: true,
          showOrganisations: true,
          showNetworking: true,
          showPaiements: true,
          showTresorerie: true,
          title: 'Administration globale',
        };

      case 'admin-asaci':
        return {
          mainNavItems: [
            { id: 'home', label: 'Accueil', icon: Home },
            { id: 'compagnies', label: 'Compagnies', icon: Building2 },
            { id: 'inscriptions', label: 'Liste des inscriptions', icon: FileText },
          ],
          showInscriptions: false,
          showOrganisations: false,
          showNetworking: false,
          showPaiements: true,
          showTresorerie: false,
          title: 'Administration ASACI',
        };

      case 'agent-inscription':
        return {
          mainNavItems: [
            { id: 'home', label: 'Accueil', icon: Home },
            { id: 'caisse-inscriptions', label: 'Liste des inscriptions', icon: FileText },
            { id: 'inscriptions-creer', label: 'Nouvelle inscription', icon: UserPlus },
          ],
          showInscriptions: false,
          showOrganisations: false,
          showNetworking: false,
          showPaiements: true,
          showTresorerie: false,
          title: 'Agent Inscription',
        };

      case 'operateur-caisse':
        return {
          mainNavItems: [
            { id: 'home', label: 'Tableau de bord', icon: Home },
          ],
          showInscriptions: false,
          showOrganisations: false,
          showNetworking: false,
          showPaiements: true,
          showTresorerie: false,
          title: 'Opérateur caisse',
        };

      case 'operateur-badge':
        return {
          mainNavItems: [
            { id: 'home', label: 'Tableau de bord', icon: Home },
            { id: 'documents', label: 'Documents participants', icon: FileText },
          ],
          showInscriptions: false,
          showOrganisations: false,
          showNetworking: false,
          showPaiements: false,
          showTresorerie: false,
          title: 'Opérateur badge',
        };

      default:
        return {
          mainNavItems: [],
          showInscriptions: false,
          showOrganisations: false,
          showNetworking: false,
          showPaiements: false,
          showTresorerie: false,
          title: 'Dashboard',
        };
    }
  };

  const menuConfig = getMenuConfig();

  // Sub menu items
  const inscriptionsSubItems = [
    { id: 'inscriptions-liste', label: 'Liste des inscriptions' },
    { id: 'inscriptions-membre', label: 'Membres' },
    { id: 'inscriptions-non-membre', label: 'Non-Membres' },
    { id: 'inscriptions-vip', label: 'VIP' },
    { id: 'inscriptions-speaker', label: 'Speakers' },
    { id: 'inscriptions-planvol', label: 'Plan de vol' },
  ];

  const organisationsSubItems = [
    { id: 'organisations-liste', label: 'Liste des organisations' },
    { id: 'organisations-membre', label: 'Associations membre' },
    { id: 'organisations-non-membre', label: 'Entreprise' },
    { id: 'organisations-sponsor', label: 'Sponsors' },
  ];

  const networkingSubItems = [
    { id: 'networking-liste', label: 'Liste des rendez-vous' },
    { id: 'networking-participant', label: 'Rendez-vous participant' },
    { id: 'networking-sponsor', label: 'Rendez-vous sponsor' },
    { id: 'networking-historique', label: 'Récap des demandes' },
  ];

  const paiementsSubItems = [
    { id: 'paiements-attente', label: 'Paiements en attente' },
    { id: 'paiements', label: 'Liste des paiements' },
  ];

  const tresorerieSubItems = [
    { id: 'finance', label: 'Vue d\'ensemble' },
    { id: 'finance-paiements', label: 'Liste des paiements' },
  ];

  const isInscriptionsActive = activeNav.startsWith('inscriptions');
  const isOrganisationsActive = activeNav.startsWith('organisations');
  const isNetworkingActive = activeNav.startsWith('networking');
  const isPaiementsActive = activeNav.startsWith('paiements');
  const isTresorerieActive = activeNav.startsWith('finance');

  // Éviter l'hydratation SSR: rendre côté client uniquement
  if (!isMounted) {
    return null;
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-hidden">
      <div className="p-6">
        <div className="space-y-3">
          <Logo className="h-16 w-auto object-contain" alt="ASACI Technologies" />
          <div>
            <h1 className="text-gray-900">FANAF 2026</h1>
            <p className="text-xs text-gray-500">{menuConfig.title}</p>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Main navigation items */}
        {menuConfig.mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          const isLoadingItem = loadingNav === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setLoadingNav(item.id);
                // Appeler onNavChange et réinitialiser le loader après un court délai
                onNavChange(item.id);
                // Réinitialiser le loader après un délai pour permettre au contenu de se charger
                setTimeout(() => {
                  setLoadingNav(null);
                }, 500);
              }}
              disabled={isLoadingItem}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-50'
              } ${isLoadingItem ? 'opacity-75 cursor-wait' : ''}`}
            >
              {isLoadingItem ? (
                <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}

        {/* Inscriptions submenu */}
        {menuConfig.showInscriptions && (
          <Collapsible open={inscriptionsOpen} onOpenChange={setInscriptionsOpen}>
            <CollapsibleTrigger asChild>
              <button
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isInscriptionsActive
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">Inscriptions</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    inscriptionsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1">
              {inscriptionsSubItems.map((subItem) => {
                const isActive = activeNav === subItem.id;
                const isLoadingItem = loadingNav === subItem.id;
                
                return (
                  <button
                    key={subItem.id}
                    onClick={() => {
                      setLoadingNav(subItem.id);
                      onNavChange(subItem.id);
                      setTimeout(() => {
                        setLoadingNav(null);
                      }, 500);
                    }}
                    disabled={isLoadingItem}
                    className={`w-full flex items-center gap-3 pl-12 pr-4 py-2 rounded-lg transition-colors text-sm ${
                      isActive
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    } ${isLoadingItem ? 'opacity-75 cursor-wait' : ''}`}
                  >
                    {isLoadingItem ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                        <span>{subItem.label}</span>
                      </>
                    ) : (
                      subItem.label
                    )}
                  </button>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Encaissement submenu */}
        {menuConfig.showTresorerie && (
          <Collapsible open={tresorerieOpen} onOpenChange={setTresorerieOpen}>
            <CollapsibleTrigger asChild>
              <button
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isTresorerieActive
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Coins className="w-5 h-5" />
                  <span className="text-sm">Encaissement</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    tresorerieOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1">
              {tresorerieSubItems.map((subItem) => {
                const isActive = activeNav === subItem.id;
                const isLoadingItem = loadingNav === subItem.id;
                
                return (
                  <button
                    key={subItem.id}
                    onClick={() => {
                      setLoadingNav(subItem.id);
                      onNavChange(subItem.id);
                      setTimeout(() => {
                        setLoadingNav(null);
                      }, 500);
                    }}
                    disabled={isLoadingItem}
                    className={`w-full flex items-center gap-3 pl-12 pr-4 py-2 rounded-lg transition-colors text-sm ${
                      isActive
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    } ${isLoadingItem ? 'opacity-75 cursor-wait' : ''}`}
                  >
                    {isLoadingItem ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                        <span>{subItem.label}</span>
                      </>
                    ) : (
                      subItem.label
                    )}
                  </button>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Organisations submenu */}
        {menuConfig.showOrganisations && (
          <Collapsible open={organisationsOpen} onOpenChange={setOrganisationsOpen}>
            <CollapsibleTrigger asChild>
              <button
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isOrganisationsActive
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5" />
                  <span className="text-sm">Organisations</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    organisationsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1">
              {organisationsSubItems.map((subItem) => {
                const isActive = activeNav === subItem.id;
                const isLoadingItem = loadingNav === subItem.id;
                
                return (
                  <button
                    key={subItem.id}
                    onClick={() => {
                      setLoadingNav(subItem.id);
                      onNavChange(subItem.id);
                      setTimeout(() => {
                        setLoadingNav(null);
                      }, 500);
                    }}
                    disabled={isLoadingItem}
                    className={`w-full flex items-center gap-3 pl-12 pr-4 py-2 rounded-lg transition-colors text-sm ${
                      isActive
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    } ${isLoadingItem ? 'opacity-75 cursor-wait' : ''}`}
                  >
                    {isLoadingItem ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                        <span>{subItem.label}</span>
                      </>
                    ) : (
                      subItem.label
                    )}
                  </button>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Networking submenu */}
        {menuConfig.showNetworking && (
          <Collapsible open={networkingOpen} onOpenChange={setNetworkingOpen}>
            <CollapsibleTrigger asChild>
              <button
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isNetworkingActive
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Handshake className="w-5 h-5" />
                  <span className="text-sm">Networking</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    networkingOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1">
              {networkingSubItems.map((subItem) => {
                const isActive = activeNav === subItem.id;
                const isLoadingItem = loadingNav === subItem.id;
                
                return (
                  <button
                    key={subItem.id}
                    onClick={() => {
                      setLoadingNav(subItem.id);
                      onNavChange(subItem.id);
                      setTimeout(() => {
                        setLoadingNav(null);
                      }, 500);
                    }}
                    disabled={isLoadingItem}
                    className={`w-full flex items-center gap-3 pl-12 pr-4 py-2 rounded-lg transition-colors text-sm ${
                      isActive
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    } ${isLoadingItem ? 'opacity-75 cursor-wait' : ''}`}
                  >
                    {isLoadingItem ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                        <span>{subItem.label}</span>
                      </>
                    ) : (
                      subItem.label
                    )}
                  </button>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Paiements submenu */}
        {menuConfig.showPaiements && (
          <Collapsible open={paiementsOpen} onOpenChange={setPaiementsOpen}>
            <CollapsibleTrigger asChild>
              <button
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isPaiementsActive
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-sm">Paiements</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    paiementsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1">
              {paiementsSubItems.map((subItem) => {
                const isActive = activeNav === subItem.id;
                const isLoadingItem = loadingNav === subItem.id;
                
                return (
                  <button
                    key={subItem.id}
                    onClick={() => {
                      setLoadingNav(subItem.id);
                      onNavChange(subItem.id);
                      setTimeout(() => {
                        setLoadingNav(null);
                      }, 500);
                    }}
                    disabled={isLoadingItem}
                    className={`w-full flex items-center gap-3 pl-12 pr-4 py-2 rounded-lg transition-colors text-sm ${
                      isActive
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    } ${isLoadingItem ? 'opacity-75 cursor-wait' : ''}`}
                  >
                    {isLoadingItem ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                        <span>{subItem.label}</span>
                      </>
                    ) : (
                      subItem.label
                    )}
                  </button>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}

      </nav>
      
      <Separator />
      
      <div className="p-4 space-y-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Connecté en tant que</p>
          <p className="text-sm text-gray-900">{menuConfig.title}</p>
        </div>
        {/* {onSwitchProfile && (
          <Button 
            onClick={onSwitchProfile}
            variant="outline"
            className="w-full justify-start gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Changer de profil
          </Button>
        )} */}
      </div>
    </aside>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  FileText, 
  Users, 
  ChevronDown, 
  RefreshCw, 
  Building2, 
  UserCog, 
  BarChart3, 
  Settings, 
  Shield, 
  Award,
  Handshake,
  Coins
} from 'lucide-react';
import { Separator } from '../../../components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../components/ui/collapsible';
import { Button } from '../../../components/ui/button';
import { Logo } from '../../../components/ui/Logo';
import type { NavItem } from './layout';

interface AdminSidebarProps {
  activeNav: NavItem;
  onNavChange: (nav: NavItem | string) => void;
  onSwitchProfile?: () => void;
}

export function Sidebar({ activeNav, onNavChange, onSwitchProfile }: AdminSidebarProps) {
  const pathname = usePathname();
  const [inscriptionsOpen, setInscriptionsOpen] = useState(true);
  const [organisationsOpen, setOrganisationsOpen] = useState(true);
  const [networkingOpen, setNetworkingOpen] = useState(true);

  const mainNavItems = [
    { id: 'home' as NavItem, label: 'Accueil', icon: Home },
    { id: 'users' as NavItem, label: 'Utilisateurs', icon: UserCog },
    { id: 'companies' as NavItem, label: 'Compagnies', icon: Building2 },
    { id: 'badges' as NavItem, label: 'Badges', icon: Award },
    { id: 'sponsors' as NavItem, label: 'Sponsors', icon: Shield },
    { id: 'statistiques' as NavItem, label: 'Statistiques', icon: BarChart3 },
    { id: 'parametres' as NavItem, label: 'Paramètres', icon: Settings },
  ];

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


  // Utiliser pathname pour une détection précise de l'état actif
  const isInscriptionsActive = pathname?.includes('/inscriptions');
  const isOrganisationsActive = pathname?.includes('/organisations');
  const isNetworkingActive = pathname?.includes('/networking');

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-hidden">
      <div className="p-6">
        <div className="space-y-3">
          <Logo className="h-16 w-auto object-contain" alt="Administration globale" />
          <div>
            <h1 className="text-gray-900">FANAF 2026</h1>
            <p className="text-xs text-gray-500">Administration globale</p>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Main navigation items */}
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}

        <Separator className="my-2" />

        {/* Inscriptions submenu */}
        <Collapsible open={inscriptionsOpen} onOpenChange={setInscriptionsOpen}>
          <CollapsibleTrigger asChild>
            <button
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                isInscriptionsActive
                  ? 'bg-purple-50 text-purple-700'
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
              // Détection précise basée sur le pathname
              let isActive = false;
              if (subItem.id === 'inscriptions-liste') {
                isActive = pathname === '/dashboard/admin/inscriptions' || pathname === '/dashboard/admin/inscriptions/liste';
              } else if (subItem.id === 'inscriptions-membre') {
                isActive = pathname?.includes('/inscriptions/membre');
              } else if (subItem.id === 'inscriptions-non-membre') {
                isActive = pathname?.includes('/inscriptions/non-membre');
              } else if (subItem.id === 'inscriptions-vip') {
                isActive = pathname?.includes('/inscriptions/vip');
              } else if (subItem.id === 'inscriptions-speaker') {
                isActive = pathname?.includes('/inscriptions/speaker');
              } else if (subItem.id === 'inscriptions-planvol') {
                isActive = pathname?.includes('/inscriptions/planvol');
              }
              
              return (
                <button
                  key={subItem.id}
                  onClick={() => onNavChange(subItem.id)}
                  className={`w-full flex items-center gap-3 pl-12 pr-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {subItem.label}
                </button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Organisations submenu */}
        <Collapsible open={organisationsOpen} onOpenChange={setOrganisationsOpen}>
          <CollapsibleTrigger asChild>
            <button
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                isOrganisationsActive
                  ? 'bg-purple-50 text-purple-700'
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
              // Détection précise basée sur le pathname
              let isActive = false;
              if (subItem.id === 'organisations-liste') {
                isActive = pathname === '/dashboard/admin/organisations';
              } else if (subItem.id === 'organisations-membre') {
                isActive = pathname?.includes('/organisations/membre');
              } else if (subItem.id === 'organisations-non-membre') {
                isActive = pathname?.includes('/organisations/non-membre');
              } else if (subItem.id === 'organisations-sponsor') {
                isActive = pathname?.includes('/organisations/sponsor');
              }
              
              return (
                <button
                  key={subItem.id}
                  onClick={() => onNavChange(subItem.id)}
                  className={`w-full flex items-center gap-3 pl-12 pr-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {subItem.label}
                </button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Networking submenu */}
        <Collapsible open={networkingOpen} onOpenChange={setNetworkingOpen}>
          <CollapsibleTrigger asChild>
            <button
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                isNetworkingActive
                  ? 'bg-purple-50 text-purple-700'
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
              // Détection précise basée sur le pathname et activeNav
              let isActive = activeNav === subItem.id;
              
              // Fallback sur pathname si activeNav ne correspond pas
              if (!isActive) {
                if (subItem.id === 'networking-liste') {
                  isActive = pathname === '/dashboard/admin/networking' || 
                             pathname === '/dashboard/admin/networking/' ||
                             (pathname?.includes('/networking') && 
                              !pathname?.includes('/networking/participant') && 
                              !pathname?.includes('/networking/sponsor') && 
                              !pathname?.includes('/networking/historique'));
                } else if (subItem.id === 'networking-participant') {
                  isActive = pathname?.includes('/networking/participant');
                } else if (subItem.id === 'networking-sponsor') {
                  isActive = pathname?.includes('/networking/sponsor');
                } else if (subItem.id === 'networking-historique') {
                  isActive = pathname?.includes('/networking/historique');
                }
              }
              
              return (
                <button
                  key={subItem.id}
                  onClick={() => onNavChange(subItem.id)}
                  className={`w-full flex items-center gap-3 pl-12 pr-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {subItem.label}
                </button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>


      </nav>
      
      <Separator />
      
      <div className="p-4 space-y-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Connecté en tant que</p>
          <p className="text-sm text-gray-900">Administration globale</p>
        </div>
        {onSwitchProfile && (
          <Button 
            onClick={onSwitchProfile}
            variant="outline"
            className="w-full justify-start gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Changer de profil
          </Button>
        )}
      </div>
    </aside>
  );
}

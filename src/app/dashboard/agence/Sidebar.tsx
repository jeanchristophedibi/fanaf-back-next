'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Home, Users, Building2, Calendar, ChevronDown, UserCog, ScanLine, RefreshCw } from 'lucide-react';
import { Separator } from '../../../components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../components/ui/collapsible';
import { Button } from '../../../components/ui/button';
import type { NavItem } from './Dashboard';
import asaciLogo from '../../../assets/logo.png';

interface SidebarProps {
  activeNav: NavItem;
  onNavChange: (nav: NavItem) => void;
  onLogout?: () => void;
  onSwitchProfile?: () => void;
}

export function Sidebar({ activeNav, onNavChange, onSwitchProfile }: SidebarProps) {
  const [inscriptionsOpen, setInscriptionsOpen] = useState(true);
  const [organisationsOpen, setOrganisationsOpen] = useState(true);
  const [networkingOpen, setNetworkingOpen] = useState(true);

  const mainNavItems = [
    { id: 'home' as NavItem, label: 'Accueil', icon: Home },
    { id: 'check-in' as NavItem, label: 'Check-in', icon: ScanLine },
    { id: 'comite-organisation' as NavItem, label: 'Comité d\'Organisation', icon: UserCog },
  ];

  const inscriptionsSubItems = [
    { id: 'inscriptions-liste' as NavItem, label: 'Liste des inscriptions' },
    { id: 'inscriptions-membre' as NavItem, label: 'Membres' },
    { id: 'inscriptions-non-membre' as NavItem, label: 'Non-Membres' },
    { id: 'inscriptions-vip' as NavItem, label: 'VIP' },
    { id: 'inscriptions-speaker' as NavItem, label: 'Speakers' },
    { id: 'inscriptions-planvol' as NavItem, label: 'Plan de vol' },
  ];

  const organisationsSubItems = [
    { id: 'organisations-liste' as NavItem, label: 'Liste des organisations' },
    { id: 'organisations-membre' as NavItem, label: 'Associations membre' },
    { id: 'organisations-non-membre' as NavItem, label: 'Entreprise' },
    { id: 'organisations-sponsor' as NavItem, label: 'Sponsors' },
  ];

  const networkingSubItems = [
    { id: 'networking-liste' as NavItem, label: 'Liste des rendez-vous' },
    { id: 'networking-participant' as NavItem, label: 'Rendez-vous participant' },
    { id: 'networking-sponsor' as NavItem, label: 'Rendez-vous sponsor' },
    { id: 'networking-historique' as NavItem, label: 'Récap des demandes' },
  ];

  const isInscriptionsActive = activeNav.startsWith('inscriptions');
  const isOrganisationsActive = activeNav.startsWith('organisations');
  const isNetworkingActive = activeNav.startsWith('networking');

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <div className="space-y-3">
          <Image 
            src={asaciLogo} 
            alt="ASACI Technologies" 
            width={120}
            height={40}
            className="h-10 w-auto object-contain"
          />
          <div>
            <h1 className="text-gray-900">FANAF 2026</h1>
            <p className="text-xs text-gray-500">Agence de communication</p>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}

        {/* Menu déroulant Inscriptions */}
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
              
              return (
                <button
                  key={subItem.id}
                  onClick={() => onNavChange(subItem.id)}
                  className={`w-full flex items-center gap-3 pl-12 pr-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {subItem.label}
                </button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Menu déroulant Organisations */}
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
              
              return (
                <button
                  key={subItem.id}
                  onClick={() => onNavChange(subItem.id)}
                  className={`w-full flex items-center gap-3 pl-12 pr-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {subItem.label}
                </button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Menu déroulant Networking */}
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
                <Calendar className="w-5 h-5" />
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
              
              return (
                <button
                  key={subItem.id}
                  onClick={() => onNavChange(subItem.id)}
                  className={`w-full flex items-center gap-3 pl-12 pr-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-orange-100 text-orange-700'
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
          <p className="text-sm text-gray-900">Admin Agence</p>
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

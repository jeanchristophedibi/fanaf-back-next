'use client';

import React, { useState } from 'react';
import { Home, FileText, ChevronDown, RefreshCw, CreditCard } from 'lucide-react';
import { Separator } from '../../../components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../components/ui/collapsible';
import { Button } from '../../../components/ui/button';
import { Logo } from '../../../components/ui/Logo';
import type { NavItem } from './layout';

interface AdminAsaciSidebarProps {
  activeNav: NavItem;
  onNavChange: (nav: NavItem) => void;
  onSwitchProfile?: () => void;
}

export function Sidebar({ activeNav, onNavChange, onSwitchProfile }: AdminAsaciSidebarProps) {
  const [paiementsOpen, setPaiementsOpen] = useState(true);

  const mainNavItems = [
    { id: 'home' as NavItem, label: 'Accueil', icon: Home },
    { id: 'inscriptions' as NavItem, label: 'Liste des inscriptions', icon: FileText },
  ];

  const paiementsSubItems = [
    { id: 'paiements-attente' as NavItem, label: 'Paiements en attente' },
    { id: 'paiements' as NavItem, label: 'Liste des paiements' },
  ];

  const isPaiementsActive = activeNav.startsWith('paiements');

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <div className="space-y-3">
          <Logo className="h-10 w-auto object-contain" alt="ASACI Technologies" />
          <div>
            <h1 className="text-gray-900">FANAF 2026</h1>
            <p className="text-xs text-gray-500">Administration ASACI</p>
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

        {/* Menu déroulant Paiements */}
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
          <p className="text-sm text-gray-900">Admin ASACI</p>
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

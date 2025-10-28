'use client';

import React, { useState, useEffect } from 'react';
import { Home, CreditCard, LogOut, ChevronRight, ChevronDown } from 'lucide-react';
import { useDynamicInscriptions } from '../../../components/hooks/useDynamicInscriptions';

interface OperateurCaisseSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchProfile?: () => void;
}

export function OperateurCaisseSidebar({ activeTab, setActiveTab, onSwitchProfile }: OperateurCaisseSidebarProps) {
  const { participants } = useDynamicInscriptions();
  const [isPaiementsExpanded, setIsPaiementsExpanded] = useState(
    activeTab === 'paiements' || activeTab === 'tous-paiements' || activeTab === 'paiements-groupes'
  );

  // Ouvrir automatiquement le sous-menu si on navigue vers une sous-rubrique
  useEffect(() => {
    if (activeTab === 'paiements' || activeTab === 'tous-paiements' || activeTab === 'paiements-groupes') {
      setIsPaiementsExpanded(true);
    }
  }, [activeTab]);

  // Compter les paiements en attente (uniquement membre et non-membre)
  const paiementsEnAttente = participants.filter(p => 
    p.statutInscription === 'non-finalisée' && 
    (p.statut === 'membre' || p.statut === 'non-membre')
  ).length;

  // Compter les participants finalisés
  const participantsFinalisés = participants.filter(p => 
    p.statutInscription === 'finalisée'
  ).length;

  const paiementsSubItems = [
    {
      id: 'paiements',
      label: 'En attente',
      badge: paiementsEnAttente > 0 ? paiementsEnAttente : null,
      badgeColor: 'bg-orange-600',
    },
    {
      id: 'tous-paiements',
      label: 'Tous les paiements',
      badge: participantsFinalisés > 0 ? participantsFinalisés : null,
      badgeColor: 'bg-green-600',
    },
    {
      id: 'paiements-groupes',
      label: 'Paiement groupé',
      badge: paiementsEnAttente > 0 ? paiementsEnAttente : null,
      badgeColor: 'bg-blue-600',
    },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-purple-600 to-purple-700 text-white p-6 flex flex-col h-screen">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">FANAF 2026</h1>
            <p className="text-purple-100 text-xs">Opérateur caisse</p>
          </div>
        </div>
        <div className="text-xs text-purple-200 mt-3 bg-purple-800/30 p-2 rounded">
          9-11 février 2026
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
            activeTab === 'dashboard'
              ? 'bg-white text-purple-600 shadow-lg'
              : 'text-white hover:bg-purple-500/30'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Tableau de bord</span>
        </button>

        {/* Section Paiement avec sous-menu */}
        <div className="space-y-1">
          <button
            onClick={() => setIsPaiementsExpanded(!isPaiementsExpanded)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-2 transition-all ${
              isPaiementsExpanded || activeTab === 'paiements' || activeTab === 'tous-paiements' || activeTab === 'paiements-groupes'
                ? 'bg-purple-500/30 text-white'
                : 'text-white hover:bg-purple-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5" />
              <span>Paiements</span>
            </div>
            <div className="flex items-center gap-2">
              {(paiementsEnAttente > 0 || participantsFinalisés > 0) && (
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  {paiementsEnAttente + participantsFinalisés}
                </span>
              )}
              {isPaiementsExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </button>

          {/* Sous-menu Paiement */}
          {isPaiementsExpanded && (
            <div className="ml-6 space-y-1">
              {paiementsSubItems.map((subItem) => {
                const isActive = activeTab === subItem.id;

                return (
                  <button
                    key={subItem.id}
                    onClick={() => setActiveTab(subItem.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-white text-purple-600 shadow-lg'
                        : 'text-purple-100 hover:bg-purple-500/30 hover:text-white'
                    }`}
                  >
                    <span className="text-sm">{subItem.label}</span>
                    <div className="flex items-center gap-2">
                      {subItem.badge !== null && (
                        <span className={`${isActive ? subItem.badgeColor : 'bg-white/20'} text-white text-xs px-2 py-0.5 rounded-full`}>
                          {subItem.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-purple-500/30">
        <button
          onClick={onSwitchProfile}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-purple-500/30 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Changer de profil</span>
        </button>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UserPlus, Clock, FileText, LogOut, List } from 'lucide-react';

interface AgentInscriptionSidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onSwitchProfile?: () => void;
}

export const AgentInscriptionSidebar = ({ currentPage, onNavigate, onSwitchProfile }: AgentInscriptionSidebarProps) => {
  const pathname = usePathname();
  const menuItems = [
    { href: '/dashboard/agent-inscription', key: 'accueil', label: 'Accueil', icon: Home },
    { href: '/dashboard/agent-inscription/inscriptions', key: 'en-cours', label: 'Inscriptions', icon: List },
    { href: '/dashboard/agent-inscription/inscriptions/creer', key: 'nouvelle', label: 'Nouvelle inscription', icon: UserPlus },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">F</div>
          <div>
            <h1 className="text-lg text-gray-900">FANAF 2026</h1>
            <p className="text-xs text-gray-600">Agent d'inscription</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isRouteActive = pathname === item.href || (item.href !== '/dashboard/agent-inscription' && pathname.startsWith(item.href));
            const isStateActive = currentPage ? currentPage === item.key : false;
            const isActive = onNavigate ? isStateActive : isRouteActive;

            if (onNavigate) {
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Action rapide */}
        <div className="mt-4">
          {onNavigate ? (
            <button onClick={() => onNavigate('nouvelle')} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors">
              <UserPlus className="w-4 h-4" />
              <span className="text-sm">Nouvelle inscription</span>
            </button>
          ) : (
            <Link href="/dashboard/agent-inscription/inscriptions/creer" className="block">
              <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                <UserPlus className="w-4 h-4" />
                <span className="text-sm">Nouvelle inscription</span>
              </div>
            </Link>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Bouton changer de profil */}
        {onSwitchProfile && (
          <button
            onClick={onSwitchProfile}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
          >
            <LogOut className="w-5 h-5 text-gray-500" />
            <span className="text-sm">Changer de profil</span>
          </button>
        )}
        
        {/* Information */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-700 mt-0.5" />
            <div>
              <p className="text-sm text-gray-900">Information</p>
              <p className="text-xs text-gray-600 mt-1">
                Les inscriptions sont en attente de paiement jusqu'à finalisation par la caisse
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

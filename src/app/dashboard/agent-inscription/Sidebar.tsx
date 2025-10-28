'use client';

import React from 'react';
import { Home, UserPlus, Clock, FileText, LogOut } from 'lucide-react';

interface AgentInscriptionSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onSwitchProfile?: () => void;
}

export const AgentInscriptionSidebar = ({ currentPage, onNavigate, onSwitchProfile }: AgentInscriptionSidebarProps) => {
  const menuItems = [
    { id: 'accueil', label: 'Accueil', icon: Home },
    { id: 'nouvelle', label: 'Nouvelle inscription', icon: UserPlus },
    { id: 'en-cours', label: 'Inscriptions en cours', icon: Clock },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">F</span>
          </div>
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
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-gray-500'}`} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
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
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-amber-600 mt-0.5" />
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

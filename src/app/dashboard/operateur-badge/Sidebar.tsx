'use client';

import React from 'react';
import { Home, FileText, LogOut } from 'lucide-react';
import { useDynamicInscriptions } from '../../../components/hooks/useDynamicInscriptions';

interface OperateurBadgeSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchProfile?: () => void;
}

export function OperateurBadgeSidebar({ activeTab, setActiveTab, onSwitchProfile }: OperateurBadgeSidebarProps) {
  const { participants } = useDynamicInscriptions();

  // Compter les documents disponibles (inscriptions finalisées)
  const documentsDisponibles = participants.filter(p => 
    p.statutInscription === 'finalisée'
  ).length;

  return (
    <div className="w-64 bg-gradient-to-b from-teal-600 to-cyan-700 text-white p-6 flex flex-col h-screen">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">FANAF 2026</h1>
            <p className="text-teal-100 text-xs">Opérateur Badge</p>
          </div>
        </div>
        <div className="text-xs text-teal-200 mt-3 bg-teal-800/30 p-2 rounded">
          9-11 février 2026
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            activeTab === 'dashboard'
              ? 'bg-white text-teal-600 shadow-lg'
              : 'text-white hover:bg-teal-500/30'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Tableau de bord</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
            activeTab === 'documents'
              ? 'bg-white text-teal-600 shadow-lg'
              : 'text-white hover:bg-teal-500/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5" />
            <span>Documents</span>
          </div>
          {documentsDisponibles > 0 && (
            <span className={`${
              activeTab === 'documents' ? 'bg-teal-600' : 'bg-white/20'
            } text-white text-xs px-2 py-0.5 rounded-full`}>
              {documentsDisponibles}
            </span>
          )}
        </button>
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-teal-500/30">
        <button
          onClick={onSwitchProfile}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-teal-500/30 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Changer de profil</span>
        </button>
      </div>
    </div>
  );
}

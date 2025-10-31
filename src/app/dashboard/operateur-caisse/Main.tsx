'use client';

import React, { useEffect, useState } from 'react';
import OperateurCaisseDashboard from './Dashboard';
import { CaissePaiementsPage } from '../../../components/CaissePaiementsPage';
import { TousPaiementsPage } from '../../../components/TousPaiementsPage';
import { PaiementsGroupesPage } from '../../../components/PaiementsGroupesPage';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';

export type OperateurTab = 'dashboard' | 'paiements' | 'tous-paiements' | 'paiements-groupes';

interface OperateurCaisseMainProps {
  onSwitchProfile?: () => void;
}

export default function OperateurCaisseMain({ onSwitchProfile }: OperateurCaisseMainProps = {}) {
  const [activeTab, setActiveTab] = useState<OperateurTab>('paiements');
  // Synchroniser avec la sidebar unifiée (layout) via localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mapNavToTab = (nav: string): OperateurTab => {
      if (nav === 'paiements-attente') return 'paiements';
      if (nav === 'paiements') return 'tous-paiements';
      return 'dashboard';
    };

    const applyFromStorage = () => {
      try {
        const stored = localStorage.getItem('operateur_caisse_active_nav');
        if (stored) setActiveTab(mapNavToTab(stored));
      } catch (_) {}
    };

    applyFromStorage();
    const onStorage = () => applyFromStorage();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const [caissierName, setCaissierName] = useState<string>('');
  const [isCaissierDialogOpen, setIsCaissierDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('caissierName') : null;
    if (stored) setCaissierName(stored);
  }, []);

  const handleSaveCaissier = () => {
    localStorage.setItem('caissierName', caissierName.trim());
    setIsCaissierDialogOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <OperateurCaisseDashboard />;
      
      case 'paiements':
        return <CaissePaiementsPage />;
      
      case 'tous-paiements':
        return <TousPaiementsPage />;
      
      case 'paiements-groupes':
        return <PaiementsGroupesPage />;

      default:
        return <OperateurCaisseDashboard />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Tableau de bord';
      case 'paiements':
        return 'Paiements - En attente';
      case 'tous-paiements':
        return 'Paiements - Tous les paiements';
      case 'paiements-groupes':
        return 'Paiements - Paiement groupé';
      default:
        return 'Tableau de bord';
    }
  };

  return (
    <div className="min-h-full">
      {/* Barre supérieure locale */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">{getPageTitle()}</h1>
            <p className="text-sm text-gray-500">FANAF 2026 - Opérateur caisse</p>
          </div>
          <div className="flex items-center gap-3">
            {caissierName ? (
              <div className="text-sm text-gray-700">
                Caissier: <span className="font-medium">{caissierName}</span>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Caissier non défini</div>
            )}
            <Button variant="outline" size="sm" onClick={() => setIsCaissierDialogOpen(true)}>
              Définir caissier
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div>
        {renderContent()}
      </div>

      {/* Dialog pour définir le nom du caissier */}
      <Dialog open={isCaissierDialogOpen} onOpenChange={setIsCaissierDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Définir le nom du caissier</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              placeholder="Entrez le nom et prénom"
              value={caissierName}
              onChange={(e) => setCaissierName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCaissierDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveCaissier} disabled={!caissierName.trim()}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

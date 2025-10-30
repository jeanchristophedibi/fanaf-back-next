'use client';

import React from 'react';
import { Button } from '../../ui/button';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

interface FooterNavProps {
  etapeActuelle: number;
  loading?: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export const FooterNav: React.FC<FooterNavProps> = ({ etapeActuelle, loading, onPrev, onNext }) => {
  const isLast = etapeActuelle === 5;
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur border-t border-gray-200 z-[9999] pointer-events-auto">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between relative z-[10000]">
        <Button type="button" variant="outline" onClick={onPrev} disabled={etapeActuelle === 1 || !!loading} className="px-6">
          <ChevronLeft className="w-4 h-4 mr-2" /> Précédent
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!!loading}
          className={isLast ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6' : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 px-6'}
        >
          {isLast ? (
            <>
              {loading ? 'Finalisation...' : "Finaliser l'inscription"}
              <CheckCircle className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Suivant <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};



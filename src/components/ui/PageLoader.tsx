'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PageLoaderProps {
  isLoading?: boolean;
  delay?: number; // Délai minimum d'affichage en ms pour éviter le flash
}

export function PageLoader({ isLoading = true, delay = 300 }: PageLoaderProps) {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (isLoading) {
      // Afficher le loader après un court délai pour éviter le flash
      const timer = setTimeout(() => {
        setShowLoader(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setShowLoader(false);
    }
  }, [isLoading, delay]);

  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">Chargement des données...</p>
          <p className="text-xs text-gray-500 mt-1">Veuillez patienter</p>
        </div>
      </div>
    </div>
  );
}


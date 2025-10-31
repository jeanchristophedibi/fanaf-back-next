'use client';

import { Loader2 } from 'lucide-react';

interface LoaderOverlayProps {
  isLoading: boolean;
  message?: string;
  subMessage?: string;
}

export function LoaderOverlay({ isLoading, message = 'Chargement...', subMessage = 'Veuillez patienter' }: LoaderOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center space-y-4">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
        <p className="text-gray-900 font-medium">{message}</p>
        <p className="text-sm text-gray-500">{subMessage}</p>
      </div>
    </div>
  );
}


'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { fanafApi } from '../../services/fanafApi';

export default function NoAccessPage() {
  // Query pour déconnecter l'utilisateur au chargement de la page
  useQuery({
    queryKey: ['noAccessPage', 'logout'],
    queryFn: () => {
      try {
        fanafApi.logout();
        return true;
      } catch (_) {
        return false;
      }
    },
    enabled: true,
    staleTime: 0,
  });
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <Card className="max-w-lg w-full p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl text-gray-900 mb-2">Accès au dashboard refusé</h1>
        <p className="text-sm text-gray-600 mb-6">
          Votre profil n'a pas accès au dashboard. Si vous pensez qu'il s'agit d'une erreur, contactez un administrateur.
        </p>
        <Button asChild className="bg-orange-600 hover:bg-orange-700">
          <Link href="/login">Se reconnecter</Link>
        </Button>
      </Card>
    </div>
  );
}



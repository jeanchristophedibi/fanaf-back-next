'use client';

import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Clock, User, Building, DollarSign } from 'lucide-react';

interface CaisseHeaderStatsProps {
  total: number;
  membres: number;
  nonMembres: number;
  montantTotal: number;
}

export function CaisseHeaderStats({ total, membres, nonMembres, montantTotal }: CaisseHeaderStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 animate-fade-in">
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 mb-1">Total en attente</p>
              <p className="text-3xl text-orange-900">{total}</p>
              <p className="text-xs text-orange-600 mt-1">paiements</p>
            </div>
            <Clock className="w-10 h-10 text-orange-600 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 mb-1">Membres</p>
              <p className="text-3xl text-purple-900">{membres}</p>
              <p className="text-xs text-purple-600 mt-1">en attente</p>
            </div>
            <User className="w-10 h-10 text-purple-600 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700 mb-1">Non-membres</p>
              <p className="text-3xl text-amber-900">{nonMembres}</p>
              <p className="text-xs text-amber-600 mt-1">en attente</p>
            </div>
            <Building className="w-10 h-10 text-amber-600 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 mb-1">Montant total</p>
              <p className="text-xl text-green-900">{montantTotal.toLocaleString('fr-FR')}</p>
              <p className="text-xs text-green-600 mt-1">FCFA</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-600 opacity-50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



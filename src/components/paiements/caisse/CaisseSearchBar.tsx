'use client';

import React from 'react';
import { Input } from '../../ui/input';
import { Card, CardContent } from '../../ui/card';
import { Search } from 'lucide-react';

interface CaisseSearchBarProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  resultsCount: number;
}

export function CaisseSearchBar({ searchTerm, setSearchTerm, resultsCount }: CaisseSearchBarProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher par nom, email, référence, organisation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {resultsCount} paiement(s) en attente
          </p>
        </div>
      </CardContent>
    </Card>
  );
}



"use client";

import { useMemo } from "react";
import { Building2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { useDynamicInscriptions } from "../hooks/useDynamicInscriptions";

export function WidgetOrganisations() {
  const { organisations } = useDynamicInscriptions({ includeOrganisations: true });

  // Statistiques pour la vue "liste"
  const stats = useMemo(() => {
    const membre = organisations.filter(o => o.statut === 'membre').length;
    const nonMembre = organisations.filter(o => o.statut === 'non-membre').length;
    const sponsor = organisations.filter(o => o.statut === 'sponsor').length;
    
    return { membre, nonMembre, sponsor, total: organisations.length };
  }, [organisations]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 mb-1">Total organisations</p>
              <p className="text-3xl text-purple-900">{stats.total}</p>
            </div>
            <Building2 className="w-10 h-10 text-purple-600 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-teal-700 mb-1">Associations membre</p>
              <p className="text-3xl text-teal-900">{stats.membre}</p>
            </div>
            <Building2 className="w-10 h-10 text-teal-600 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 mb-1">Entreprise</p>
              <p className="text-3xl text-gray-900">{stats.nonMembre}</p>
            </div>
            <Building2 className="w-10 h-10 text-gray-600 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700 mb-1">Sponsors</p>
              <p className="text-3xl text-amber-900">{stats.sponsor}</p>
            </div>
            <Building2 className="w-10 h-10 text-amber-600 opacity-50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


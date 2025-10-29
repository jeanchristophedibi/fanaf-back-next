import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Building2 } from 'lucide-react';

interface OrganisationsSectionProps {
  statsOrganisations: {
    membres: number;
    nonMembres: number;
    sponsors: number;
  };
}

export function OrganisationsSection({ statsOrganisations }: OrganisationsSectionProps) {
  return (
    <div className="mb-8 p-6 section-organisations rounded-xl animate-slide-up shadow-sm hover:shadow-md transition-shadow duration-300" style={{ animationDelay: '200ms' }}>
      <h2 className="text-gray-900 mb-4 flex items-center gap-2">
        <Building2 className="w-5 h-5" />
        Organisations
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Total</CardTitle>
            <div className="bg-blue-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
              <Building2 className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{statsOrganisations.membres + statsOrganisations.nonMembres + statsOrganisations.sponsors}</div>
          </CardContent>
        </Card>

        <Card className="card gla-hover cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Membres</CardTitle>
            <div className="bg-green-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
              <Building2 className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{statsOrganisations.membres}</div>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Non-Membres</CardTitle>
            <div className="bg-gray-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
              <Building2 className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{statsOrganisations.nonMembres}</div>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Sponsors</CardTitle>
            <div className="bg-orange-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
              <Building2 className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{statsOrganisations.sponsors}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


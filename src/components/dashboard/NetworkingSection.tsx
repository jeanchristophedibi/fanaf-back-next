import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar, Users, Building2, Handshake } from 'lucide-react';

interface NetworkingSectionProps {
  statsNetworking: {
    rdvSponsors: number;
    rdvParticipants: number;
  };
}

export function NetworkingSection({ statsNetworking }: NetworkingSectionProps) {
  return (
    <div className="p-6 section-networking rounded-xl animate-slide-up shadow-sm hover:shadow-md transition-shadow duration-300" style={{ animationDelay: '300ms' }}>
      <h2 className="text-gray-900 mb-4 flex items-center gap-2">
        <Handshake className="w-5 h-5" />
        Networking
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-hover cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Total RDV</CardTitle>
            <div className="bg-purple-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
              <Calendar className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{statsNetworking.rdvSponsors + statsNetworking.rdvParticipants}</div>
            <p className="text-xs text-gray-500 mt-1">Rendez-vous programmés</p>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">RDV Participants</CardTitle>
            <div className="bg-blue-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
              <Users className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{statsNetworking.rdvParticipants}</div>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">RDV Sponsors</CardTitle>
            <div className="bg-orange-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
              <Building2 className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{statsNetworking.rdvSponsors}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


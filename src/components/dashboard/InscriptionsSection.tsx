import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, UserCheck, Award, Mic } from 'lucide-react';
import { AnimatedStat } from '../AnimatedStat';

interface InscriptionsSectionProps {
  statsInscriptions: {
    membres: number;
    nonMembres: number;
    vip: number;
    speakers: number;
    enAttenteMembres: number;
    enAttenteNonMembres: number;
  };
}

export function InscriptionsSection({ statsInscriptions }: InscriptionsSectionProps) {
  return (
    <div className="mb-8 p-6 section-inscriptions rounded-xl animate-slide-up shadow-sm hover:shadow-md transition-shadow duration-300">
      <h2 className="text-gray-900 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Inscriptions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="card-hover cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Total</CardTitle>
            <div className="bg-blue-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
              <Users className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <AnimatedStat 
              value={statsInscriptions.membres + statsInscriptions.nonMembres + statsInscriptions.vip + statsInscriptions.speakers}
              className="text-gray-900"
            />
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Membres</CardTitle>
            <div className="bg-green-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
              <UserCheck className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <AnimatedStat value={statsInscriptions.membres} className="text-gray-900" />
            {statsInscriptions.enAttenteMembres > 0 && (
              <p className="text-xs text-orange-600 mt-1">+{statsInscriptions.enAttenteMembres} en attente</p>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Non-Membres</CardTitle>
            <div className="bg-gray-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
              <Users className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <AnimatedStat value={statsInscriptions.nonMembres} className="text-gray-900" />
            {statsInscriptions.enAttenteNonMembres > 0 && (
              <p className="text-xs text-orange-600 mt-1">+{statsInscriptions.enAttenteNonMembres} en attente</p>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">VIP</CardTitle>
            <div className="bg-purple-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
              <Award className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <AnimatedStat value={statsInscriptions.vip} className="text-gray-900" />
            <p className="text-xs text-purple-600 mt-1">Exonéré</p>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Speakers</CardTitle>
            <div className="bg-orange-500 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
              <Mic className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <AnimatedStat value={statsInscriptions.speakers} className="text-gray-900" />
            <p className="text-xs text-orange-600 mt-1">Exonéré</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


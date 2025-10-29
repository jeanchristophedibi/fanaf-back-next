import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, CheckCircle2, FileText, TrendingUp, CreditCard } from 'lucide-react';
import { AnimatedStat } from '../AnimatedStat';

interface AgentMissionsSectionProps {
  statsInscriptions: {
    membres: number;
    nonMembres: number;
    vip: number;
    speakers: number;
    enAttenteMembres: number;
    enAttenteNonMembres: number;
  };
  participants: any[];
}

export function AgentMissionsSection({ statsInscriptions, participants }: AgentMissionsSectionProps) {
  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl animate-slide-up shadow-sm hover:shadow-md transition-shadow duration-300">
      <h2 className="text-gray-900 mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        Mes missions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover cursor-pointer border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Paiements en attente</CardTitle>
            <div className="bg-orange-600 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <AnimatedStat 
              value={statsInscriptions.enAttenteMembres + statsInscriptions.enAttenteNonMembres}
              className="text-gray-900"
            />
            <p className="text-xs text-orange-600 mt-1">
              {statsInscriptions.enAttenteMembres} membres + {statsInscriptions.enAttenteNonMembres} non-membres
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Paiements finalisés</CardTitle>
            <div className="bg-green-600 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <AnimatedStat 
              value={statsInscriptions.membres + statsInscriptions.nonMembres + statsInscriptions.vip + statsInscriptions.speakers}
              className="text-gray-900"
            />
            <p className="text-xs text-green-600 mt-1">Documents disponibles</p>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Badges générés</CardTitle>
            <div className="bg-purple-600 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
              <FileText className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <AnimatedStat 
              value={participants.filter(p => p.statutInscription === 'finalisée' && p.badgeGenere).length}
              className="text-gray-900"
            />
            <p className="text-xs text-purple-600 mt-1">Sur {participants.filter(p => p.statutInscription === 'finalisée').length} finalisés</p>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Revenus collectés</CardTitle>
            <div className="bg-blue-600 p-2 rounded-lg transition-transform duration-200 hover:scale-110">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-900">
              {((statsInscriptions.membres * 350000) + (statsInscriptions.nonMembres * 400000)).toLocaleString()} 
            </div>
            <p className="text-xs text-blue-600 mt-1">FCFA</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


import React from 'react';
import { Card } from '../ui/card';
import { Users, UserCheck, Award, Mic } from 'lucide-react';

interface StatsInscriptionsProps {
  stats: {
    total: number;
    membres: number;
    nonMembres: number;
    vip: number;
    speakers: number;
  };
}

export function StatsInscriptions({ stats }: StatsInscriptionsProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      <Card className="p-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 mb-0.5">Total</p>
            <p className="text-xl text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-blue-500 p-1.5 rounded-lg">
            <Users className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </Card>

      <Card className="p-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 mb-0.5">Membres</p>
            <p className="text-xl text-gray-900">{stats.membres}</p>
          </div>
          <div className="bg-green-500 p-1.5 rounded-lg">
            <UserCheck className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </Card>

      <Card className="p-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 mb-0.5">Non-Membres</p>
            <p className="text-xl text-gray-900">{stats.nonMembres}</p>
          </div>
          <div className="bg-gray-500 p-1.5 rounded-lg">
            <Users className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </Card>

      <Card className="p-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 mb-0.5">VIP</p>
            <p className="text-xl text-gray-900">{stats.vip}</p>
          </div>
          <div className="bg-purple-500 p-1.5 rounded-lg">
            <Award className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </Card>

      <Card className="p-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 mb-0.5">Speakers</p>
            <p className="text-xl text-gray-900">{stats.speakers}</p>
          </div>
          <div className="bg-orange-500 p-1.5 rounded-lg">
            <Mic className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </Card>
    </div>
  );
}

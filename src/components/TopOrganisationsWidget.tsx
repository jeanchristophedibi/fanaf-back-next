'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Building } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import participantService from '@/services/participantService';

type OrganisationRanking = {
  id: string;
  name: string;
  code: string;
  country: string;
  badges_count: number;
  rank: number;
};

type TopOrganisationsResponse = {
  [key: string]: OrganisationRanking | { total_associations: number; total_badges: number };
  totals: {
    total_associations: number;
    total_badges: number;
  };
};

const getRankBadgeColor = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-yellow-400 text-yellow-900';
    case 2:
      return 'bg-gray-300 text-gray-700';
    case 3:
      return 'bg-orange-400 text-orange-900';
    default:
      return 'bg-gray-200 text-gray-600';
  }
};

export function TopOrganisationsWidget() {
  const [topOrganisations, setTopOrganisations] = useState<OrganisationRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopOrganisations = async () => {
      setIsLoading(true);
      try {
        const response = await participantService.getTopOrganisations();
        console.log('Top 5 Organisations:', response);
        
        // Parser la réponse pour extraire les organisations
        const data: TopOrganisationsResponse = response?.data || response;
        const organisations: OrganisationRanking[] = [];
        
        Object.keys(data).forEach(key => {
          if (key !== 'totals' && key.startsWith('assoc_')) {
            const org = data[key] as OrganisationRanking;
            organisations.push(org);
          }
        });
        
        // Trier par rang
        organisations.sort((a, b) => a.rank - b.rank);
        
        setTopOrganisations(organisations);
      } catch (error) {
        console.error('Erreur récupération top organisations:', error);
        const errorMsg = (error as any)?.message || 'Impossible de récupérer le classement des organisations';
        toast.error(errorMsg, { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopOrganisations();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-teal-600" />
            Top 5 Organisations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Trouver le max pour calculer les pourcentages de la barre
  const maxCount = Math.max(...topOrganisations.map(org => org.badges_count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5 text-teal-600" />
          Top 5 Organisations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topOrganisations.slice(0, 5).map((org, index) => {
            const percentage = (org.badges_count / maxCount) * 100;
            return (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                {/* Badge de rang */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getRankBadgeColor(
                    org.rank
                  )}`}
                >
                  {org.rank}
                </div>

                {/* Contenu */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {org.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {org.badges_count} badge{org.badges_count > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {/* Barre de progression */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-teal-600 h-2 rounded-full"
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {topOrganisations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucune donnée disponible</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


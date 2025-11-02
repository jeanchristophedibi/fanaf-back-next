"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Calendar, Users, Sparkles } from 'lucide-react';
import { useParticipantsQuery } from '../../hooks/useParticipantsQuery';
import type { Participant } from '../data/types';

// Fonction helper pour formater la date
const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleDateString('fr-FR', { month: 'short' });
  return `${day} ${month}`;
};

// Fonction helper pour obtenir le début de la semaine (lundi)
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour lundi
  return new Date(d.setDate(diff));
};

// Fonction helper pour obtenir le numéro de semaine depuis une date de référence
const getWeekNumber = (date: Date, startDate: Date): number => {
  const weekStart = getWeekStart(date);
  const startWeekStart = getWeekStart(startDate);
  const diffTime = weekStart.getTime() - startWeekStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
};

// Custom Tooltip pour le graphique d'évolution
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-2xl border-2 border-orange-100">
        <p className="text-sm text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-600">{entry.name}:</span>
            </span>
            <span className="font-semibold" style={{ color: entry.color }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Tooltip pour le graphique hebdomadaire
const WeeklyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl shadow-2xl border-2 border-orange-200">
        <p className="text-sm text-orange-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
              <span className="text-gray-700">{entry.name}:</span>
            </span>
            <span className="font-semibold text-orange-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function InscriptionsEvolutionChart() {
  const { participants, isLoading } = useParticipantsQuery({
    enabled: true,
    categories: ['member', 'not_member', 'vip']
  });

  // Calculer les données d'évolution dynamiquement
  const { evolutionData, weeklyData, stats } = useMemo(() => {
    if (!participants || participants.length === 0) {
      return {
        evolutionData: [],
        weeklyData: [],
        stats: {
          growthRate: null,
          avgPerDay: 0,
          recordWeek: { week: 0, count: 0 }
        }
      };
    }

    // Trier les participants par date d'inscription
    const sortedParticipants = [...participants].sort((a, b) => {
      const dateA = new Date(a.dateInscription || (a as any).created_at || 0);
      const dateB = new Date(b.dateInscription || (b as any).created_at || 0);
      return dateA.getTime() - dateB.getTime();
    });

    if (sortedParticipants.length === 0) {
      return {
        evolutionData: [],
        weeklyData: [],
        stats: {
          growthRate: null,
          avgPerDay: 0,
          recordWeek: { week: 0, count: 0 }
        }
      };
    }

    // Trouver la date de début (première inscription) et la date actuelle
    const firstDate = new Date(sortedParticipants[0].dateInscription || (sortedParticipants[0] as any).created_at);
    const lastDate = new Date(sortedParticipants[sortedParticipants.length - 1].dateInscription || (sortedParticipants[sortedParticipants.length - 1] as any).created_at);
    const today = new Date();

    // Créer des buckets de dates (tous les 5 jours)
    const startDate = new Date(firstDate);
    startDate.setHours(0, 0, 0, 0);
    
    // Créer un map pour stocker les cumuls par période
    const evolutionDataMap = new Map<string, { date: string; membres: number; nonMembres: number; vip: number; speakers: number; total: number }>();
    
    // Initialiser les compteurs cumulatifs
    let cumulMembres = 0;
    let cumulNonMembres = 0;
    let cumulVip = 0;
    let cumulSpeakers = 0;

    // Grouper les participants par période de 5 jours
    for (const participant of sortedParticipants) {
      const participantDate = new Date(participant.dateInscription || (participant as any).created_at);
      participantDate.setHours(0, 0, 0, 0);
      
      // Calculer le nombre de jours depuis le début
      const daysDiff = Math.floor((participantDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      // Grouper par période de 5 jours
      const periodDays = Math.floor(daysDiff / 5) * 5;
      const periodDate = new Date(startDate);
      periodDate.setDate(periodDate.getDate() + periodDays);
      
      const dateKey = formatDate(periodDate);
      
      // Initialiser si nécessaire
      if (!evolutionDataMap.has(dateKey)) {
        evolutionDataMap.set(dateKey, {
          date: dateKey,
          membres: cumulMembres,
          nonMembres: cumulNonMembres,
          vip: cumulVip,
          speakers: cumulSpeakers,
          total: cumulMembres + cumulNonMembres + cumulVip + cumulSpeakers
        });
      }

      // Incrémenter les compteurs selon le statut
      const statut = (participant.statut || '').toLowerCase();
      if (statut === 'membre' || statut === 'member') {
        cumulMembres++;
      } else if (statut === 'non-membre' || statut === 'not_member' || statut === 'non membre') {
        cumulNonMembres++;
      } else if (statut === 'vip') {
        cumulVip++;
      } else if (statut === 'speaker') {
        cumulSpeakers++;
      }

      // Mettre à jour les valeurs cumulatives pour cette période
      const data = evolutionDataMap.get(dateKey)!;
      data.membres = cumulMembres;
      data.nonMembres = cumulNonMembres;
      data.vip = cumulVip;
      data.speakers = cumulSpeakers;
      data.total = cumulMembres + cumulNonMembres + cumulVip + cumulSpeakers;
    }

    // Convertir en tableau et trier par date
    const evolutionDataArray = Array.from(evolutionDataMap.values()).sort((a, b) => {
      // Parser les dates pour comparer
      const parseDate = (dateStr: string) => {
        const parts = dateStr.split(' ');
        const months: Record<string, number> = {
          'jan': 0, 'fév': 1, 'mar': 2, 'avr': 3, 'mai': 4, 'jun': 5,
          'jul': 6, 'aoû': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'déc': 11
        };
        return new Date(today.getFullYear(), months[parts[1].toLowerCase()] || 0, parseInt(parts[0]));
      };
      return parseDate(a.date).getTime() - parseDate(b.date).getTime();
    });

    // Remplir les périodes manquantes avec les dernières valeurs
    const filledEvolutionData: typeof evolutionDataArray = [];
    let lastValues = { membres: 0, nonMembres: 0, vip: 0, speakers: 0, total: 0 };
    
    // Créer des points tous les 5 jours depuis le début jusqu'à aujourd'hui
    const currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateKey = formatDate(currentDate);
      const existing = evolutionDataArray.find(d => d.date === dateKey);
      
      if (existing) {
        lastValues = existing;
        filledEvolutionData.push(existing);
      } else {
        filledEvolutionData.push({
          date: dateKey,
          ...lastValues,
          total: lastValues.membres + lastValues.nonMembres + lastValues.vip + lastValues.speakers
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 5);
    }

    // Calculer les données hebdomadaires (à partir de T0 = première inscription)
    const weeklyMap = new Map<number, { 
      semaine: string; 
      total: number; 
      membres: number; 
      nonMembres: number;
      weekStart: Date; // Date de début de la semaine pour l'affichage
    }>();
    
    // Grouper par semaine depuis T0
    for (const participant of sortedParticipants) {
      const participantDate = new Date(participant.dateInscription || (participant as any).created_at);
      const weekNum = getWeekNumber(participantDate, firstDate);
      
      // Calculer la date de début de cette semaine (lundi de cette semaine)
      const weekStartDate = getWeekStart(participantDate);
      const weekKey = `Sem ${weekNum}`;
      
      if (!weeklyMap.has(weekNum)) {
        weeklyMap.set(weekNum, { 
          semaine: weekKey, 
          total: 0, 
          membres: 0, 
          nonMembres: 0,
          weekStart: weekStartDate
        });
      }
      
      const weekData = weeklyMap.get(weekNum)!;
      weekData.total++;
      
      const statut = (participant.statut || '').toLowerCase();
      if (statut === 'membre' || statut === 'member') {
        weekData.membres++;
      } else if (statut === 'non-membre' || statut === 'not_member' || statut === 'non membre') {
        weekData.nonMembres++;
      }
    }

    const weeklyDataArray = Array.from(weeklyMap.values()).sort((a, b) => {
      const weekNumA = parseInt(a.semaine.replace('Sem ', ''));
      const weekNumB = parseInt(b.semaine.replace('Sem ', ''));
      return weekNumA - weekNumB;
    });

    // Calculer les statistiques
    const totalDays = Math.max(1, Math.ceil((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
    const avgPerDay = sortedParticipants.length / totalDays;
    
    // Calculer le taux de croissance (comparer les 2 dernières semaines)
    let growthRate: number | null = null; // null = pas de données, 0 = croissance nulle
    if (weeklyDataArray.length >= 2) {
      const lastWeek = weeklyDataArray[weeklyDataArray.length - 1];
      const prevWeek = weeklyDataArray[weeklyDataArray.length - 2];
      if (prevWeek.total > 0) {
        growthRate = ((lastWeek.total - prevWeek.total) / prevWeek.total) * 100;
      } else if (lastWeek.total > 0) {
        // Si la semaine précédente était à 0 et la dernière > 0, croissance infinie (ou très élevée)
        growthRate = 100; // Limiter à 100% pour l'affichage
      } else {
        growthRate = 0; // Les deux semaines à 0 = croissance nulle
      }
    }

    // Trouver la semaine record
    const recordWeek = weeklyDataArray.reduce((max, week) => 
      week.total > max.count ? { week: parseInt(week.semaine.replace('Sem ', '')), count: week.total } : max,
      { week: 0, count: 0 }
    );

    return {
      evolutionData: filledEvolutionData.slice(-7), // Garder les 7 derniers points
      weeklyData: weeklyDataArray.slice(-5), // Garder les 5 dernières semaines
      stats: {
        growthRate: growthRate !== null ? Math.round(growthRate * 10) / 10 : null,
        avgPerDay: Math.round(avgPerDay * 10) / 10,
        recordWeek
      }
    };
  }, [participants]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span>Chargement des données...</span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques clés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-green-700">Taux de croissance</p>
                 {stats.growthRate !== null ? (
                   <>
                     <p className="text-2xl text-green-900 mt-1">
                       {stats.growthRate > 0 ? '+' : ''}{stats.growthRate}%
                     </p>
                     <p className="text-xs text-green-600 mt-1">
                       vs semaine précédente
                     </p>
                   </>
                 ) : (
                   <>
                     <p className="text-2xl text-green-900 mt-1">—</p>
                     <p className="text-xs text-green-600 mt-1">
                       {weeklyData.length === 0 
                         ? 'Aucune donnée disponible' 
                         : weeklyData.length === 1 
                         ? 'Données insuffisantes (2 semaines min.)' 
                         : 'Calcul en cours...'}
                     </p>
                   </>
                 )}
               </div>
              <TrendingUp className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Moyenne par jour</p>
                <p className="text-2xl text-blue-900 mt-1">{stats.avgPerDay}</p>
                <p className="text-xs text-blue-600 mt-1">inscriptions</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Semaine record</p>
                <p className="text-2xl text-orange-900 mt-1">{stats.recordWeek.count}</p>
                <p className="text-xs text-orange-600 mt-1">
                  {stats.recordWeek.week > 0 ? `Semaine ${stats.recordWeek.week}` : 'N/A'}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Graphique d'évolution cumulée avec Area Chart amélioré */}
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-100 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />
        <CardHeader className="bg-gradient-to-br from-orange-50 to-white pb-4">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Évolution des inscriptions
            </span>
          </CardTitle>
          <p className="text-sm text-gray-600 ml-11">Croissance cumulée par catégorie avec tendance</p>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={evolutionData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMembres" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorNonMembres" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                style={{ fontSize: '13px', fontWeight: '500' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                stroke="#94a3b8"
                style={{ fontSize: '13px', fontWeight: '500' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '13px', fontWeight: '500', paddingTop: '20px' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#ea580c"
                strokeWidth={3}
                fill="url(#colorTotal)"
                name="Total"
                dot={{ fill: '#ea580c', r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="membres"
                stroke="#22c55e"
                strokeWidth={2.5}
                fill="url(#colorMembres)"
                name="Membres"
                dot={{ fill: '#22c55e', r: 4, strokeWidth: 2, stroke: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="nonMembres"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#colorNonMembres)"
                name="Non-Membres"
                dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="vip"
                stroke="#a855f7"
                strokeWidth={2}
                name="VIP"
                dot={{ fill: '#a855f7', r: 3, strokeWidth: 2, stroke: '#fff' }}
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="speakers"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Speakers"
                dot={{ fill: '#f59e0b', r: 3, strokeWidth: 2, stroke: '#fff' }}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique de répartition hebdomadaire amélioré */}
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-100 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600" />
        <CardHeader className="bg-gradient-to-br from-blue-50 to-white pb-4">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Répartition hebdomadaire
            </span>
          </CardTitle>
          <p className="text-sm text-gray-600 ml-11">
            Nouvelles inscriptions par semaine depuis T0 (première inscription) avec détails
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={weeklyData} barGap={8}>
              <defs>
                <linearGradient id="gradientMembres" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={0.9}/>
                </linearGradient>
                <linearGradient id="gradientNonMembres" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.9}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="semaine" 
                stroke="#94a3b8"
                style={{ fontSize: '13px', fontWeight: '500' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                stroke="#94a3b8"
                style={{ fontSize: '13px', fontWeight: '500' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip content={<WeeklyTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
              <Legend 
                wrapperStyle={{ fontSize: '13px', fontWeight: '500', paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar 
                dataKey="membres" 
                fill="url(#gradientMembres)"
                name="Membres"
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="nonMembres" 
                fill="url(#gradientNonMembres)"
                name="Non-Membres"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      
    </div>
  );
}


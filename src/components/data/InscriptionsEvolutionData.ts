/**
 * Génère les séries d'évolution cumulée des inscriptions à partir des données API
 */
import { inscriptionsDataService } from './inscriptionsData';

export type EvolutionPoint = {
  date: string; // format court pour l'axe (ex: '01 Jan')
  membres: number;
  nonMembres: number;
  vip: number;
  speakers: number;
  total: number;
};

function toDateOnlyISOString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatAxisLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

export async function loadInscriptionsEvolutionSeries(options?: {
  days?: number; // nombre de jours à couvrir (par défaut: 30)
}): Promise<EvolutionPoint[]> {
  const days = options?.days ?? 30;

  // Charger les participants (toutes catégories)
  const participants = await inscriptionsDataService.loadParticipants(['member', 'not_member', 'vip']);

  // Indexer par date (dateInscription tronquée à AAAA-MM-JJ)
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - (days - 1));

  const byDate = new Map<string, { membres: number; nonMembres: number; vip: number; speakers: number }>();

  for (const p of participants) {
    const raw = p.dateInscription ? new Date(p.dateInscription) : null;
    if (!raw || isNaN(raw.getTime())) continue;
    const dateKey = toDateOnlyISOString(raw);
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, { membres: 0, nonMembres: 0, vip: 0, speakers: 0 });
    }
    const bucket = byDate.get(dateKey)!;
    if (p.statut === 'membre') bucket.membres += 1;
    else if (p.statut === 'non-membre') bucket.nonMembres += 1;
    else if (p.statut === 'vip') bucket.vip += 1;
    else if (p.statut === 'speaker') bucket.speakers += 1;
  }

  // Construire la série quotidienne et faire des cumuls
  const series: EvolutionPoint[] = [];
  let cumM = 0, cumNM = 0, cumVIP = 0, cumSP = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = toDateOnlyISOString(d);
    const add = byDate.get(key) || { membres: 0, nonMembres: 0, vip: 0, speakers: 0 };
    cumM += add.membres;
    cumNM += add.nonMembres;
    cumVIP += add.vip;
    cumSP += add.speakers;
    series.push({
      date: formatAxisLabel(d),
      membres: cumM,
      nonMembres: cumNM,
      vip: cumVIP,
      speakers: cumSP,
      total: cumM + cumNM + cumVIP + cumSP,
    });
  }

  return series;
}



/**
 * Génère la répartition hebdomadaire des inscriptions à partir des données API
 */
import { inscriptionsDataService } from './inscriptionsData';

export type WeeklyPoint = {
  semaine: string; // ex: 'Sem 1'
  total: number;
  membres: number;
  nonMembres: number;
};

function getISOWeek(date: Date): { year: number; week: number } {
  // Copier la date et la normaliser à minuit
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Jeudi de la semaine en cours pour ISO week
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

export async function loadInscriptionsWeeklySeries(options?: {
  weeks?: number; // nombre de semaines récentes (par défaut: 8)
}): Promise<WeeklyPoint[]> {
  const weeks = options?.weeks ?? 8;

  // Charger les participants
  const participants = await inscriptionsDataService.loadParticipants(['member', 'not_member', 'vip']);

  // Grouper par année-semaine
  const buckets = new Map<string, { membres: number; nonMembres: number }>();
  for (const p of participants) {
    const raw = p.dateInscription ? new Date(p.dateInscription) : null;
    if (!raw || isNaN(raw.getTime())) continue;
    const { year, week } = getISOWeek(raw);
    const key = `${year}-W${String(week).padStart(2, '0')}`;
    if (!buckets.has(key)) buckets.set(key, { membres: 0, nonMembres: 0 });
    const b = buckets.get(key)!;
    if (p.statut === 'membre') b.membres += 1;
    else if (p.statut === 'non-membre') b.nonMembres += 1;
  }

  // Ordonner par clé temporelle et ne garder que les X dernières semaines
  const sortedKeys = Array.from(buckets.keys()).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const lastKeys = sortedKeys.slice(-weeks);

  const series: WeeklyPoint[] = lastKeys.map(key => {
    const b = buckets.get(key)!;
    const weekNum = key.split('-W')[1];
    return {
      semaine: `Sem ${Number(weekNum)}`,
      membres: b.membres,
      nonMembres: b.nonMembres,
      total: b.membres + b.nonMembres,
    };
  });

  return series;
}



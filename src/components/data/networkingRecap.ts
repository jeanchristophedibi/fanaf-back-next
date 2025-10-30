// Utilitaires de normalisation pour les récapitulatifs Networking

export type NormalizedStatus = 'acceptée' | 'en-attente' | 'occupée' | 'autre';

// Extraire de façon robuste un tableau de demandes depuis différentes formes de réponse
export function getApiRequestsArray(networkingRequests: any): any[] {
  if (!networkingRequests) return [];
  if (Array.isArray((networkingRequests as any)?.data)) return (networkingRequests as any).data as any[];
  if (Array.isArray(networkingRequests)) return networkingRequests as any[];
  return [];
}

// Normaliser un statut quelconque en valeurs canoniques
export function normalizeStatus(status: any): NormalizedStatus {
  const v = String(status || '').toLowerCase();
  if (v.includes('accept')) return 'acceptée';
  if (v.includes('attent')) return 'en-attente';
  if (v.includes('occup')) return 'occupée';
  return 'autre';
}

// Tenter d'extraire l'objet "demandeur" (requester)
export function extractRequester(req: any): any {
  return (
    req?.requester ||
    req?.user ||
    req?.demandeur ||
    (req?.user_id || req?.user_email || req?.user_name
      ? { id: req.user_id, email: req.user_email, name: req.user_name }
      : undefined)
  );
}

// Tenter d'extraire l'objet "destinataire" (receiver)
export function extractReceiver(req: any): any {
  return (
    req?.receiver ||
    req?.target_user ||
    req?.recepteur ||
    (req?.target_user_id || req?.target_user_email || req?.target_user_name
      ? { id: req.target_user_id, email: req.target_user_email, name: req.target_user_name }
      : undefined)
  );
}

// Obtenir le nom d'organisation/entreprise à partir d'un objet utilisateur
export function extractOrganisationName(userLike: any): string | undefined {
  if (!userLike) return undefined;
  if (typeof userLike.company === 'string' && userLike.company.trim().length > 0) return userLike.company;
  if (typeof userLike.organisation === 'string' && userLike.organisation.trim().length > 0) return userLike.organisation;
  if (typeof userLike.organization === 'string' && userLike.organization.trim().length > 0) return userLike.organization;
  if (userLike.organisation?.name) return userLike.organisation.name;
  if (userLike.organization?.name) return userLike.organization.name;
  return undefined;
}



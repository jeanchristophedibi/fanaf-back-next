import { fanafApi } from '../../services/fanafApi';

export interface UserDocumentsItem {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  registrationReference?: string | null;
  registrationStatus?: string | null;
  badgeUrl?: string | null;
  invitationUrl?: string | null;
  invoices: string[];
  hasBadge: boolean;
  hasInvitation: boolean;
  invoicesCount: number;
}

export const documentsDataService = {
  async loadDocuments(): Promise<UserDocumentsItem[]> {
    const response = await fanafApi.getDocuments();
    const items: any[] = Array.isArray(response?.data) ? response.data : [];

    return items.map((entry: any): UserDocumentsItem => {
      const user = entry?.user || {};
      const docs = entry?.documents || {};
      return {
        userId: String(user?.id || ''),
        name: String(user?.name || ''),
        email: String(user?.email || ''),
        phone: user?.phone ? String(user.phone) : undefined,
        registrationReference: user?.registration?.reference ?? null,
        registrationStatus: user?.registration?.status ?? null,
        badgeUrl: docs?.badge ?? null,
        invitationUrl: docs?.invitation ?? null,
        invoices: Array.isArray(docs?.invoices) ? docs.invoices : [],
        hasBadge: Boolean(docs?.has_badge),
        hasInvitation: Boolean(docs?.has_invitation),
        invoicesCount: Number(docs?.invoices_count || 0),
      };
    });
  },
};



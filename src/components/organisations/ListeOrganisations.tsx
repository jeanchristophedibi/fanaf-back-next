"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { Eye, Download, User, QrCode, History } from "lucide-react";
import { List, type Column, type ListAction } from "../list/List";
import { getParticipantsByOrganisation } from "../data/mockData";
import type { Organisation } from "../data/mockData";
import { companiesDataService } from "../data/companiesData";
import { useDynamicInscriptions } from "../hooks/useDynamicInscriptions";
import { BadgeReferentGenerator } from "../BadgeReferentGenerator";
import { HistoriqueRendezVousDialog } from "../HistoriqueRendezVousDialog";
import type { OrganisationSubSection } from "../../app/dashboard/agence/types";

const statutOrgColors = {
  'membre': 'bg-teal-100 text-teal-800',
  'non-membre': 'bg-gray-100 text-gray-800',
  'sponsor': 'bg-amber-100 text-amber-800',
};

const statutOrgLabels = {
  'membre': 'Association membre',
  'non-membre': 'Entreprise',
  'sponsor': 'Sponsor',
};

interface ListeOrganisationsProps {
  subSection?: OrganisationSubSection;
  filter?: 'all' | 'membre' | 'non-membre' | 'sponsor';
  readOnly?: boolean;
}

export function ListeOrganisations({ subSection, filter, readOnly = false }: ListeOrganisationsProps) {
  // Rendez-vous toujours depuis le hook existant
  const { rendezVous } = useDynamicInscriptions({ includeRendezVous: true });
  // Organisations depuis le service centralisé companiesDataService
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const activeFilter = filter || subSection;
  const [searchTerm, setSearchTerm] = useState('');
  const [paysFilter, setPaysFilter] = useState<string>('tous');
  const [historiqueParticipantId, setHistoriqueParticipantId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Charger les organisations via le service au montage
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const orgs = await companiesDataService.loadOrganisations();
        if (mounted) setOrganisations(orgs);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredOrganisations = useMemo(() => {
    let filtered = [...organisations];

    if (activeFilter && activeFilter !== 'all' && activeFilter !== 'liste') {
      filtered = filtered.filter(o => o.statut === activeFilter);
    }
    if (paysFilter !== 'tous') {
      filtered = filtered.filter(o => o.pays === paysFilter);
    }
    return filtered;
  }, [organisations, activeFilter, paysFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOrganisations.length / itemsPerPage);
  const paginatedOrganisations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrganisations.slice(startIndex, endIndex);
  }, [filteredOrganisations, currentPage]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, paysFilter, activeFilter]);

  // Récupérer la liste unique des pays
  const paysList = useMemo(() => {
    const pays = new Set(organisations.map(o => o.pays));
    return Array.from(pays).sort();
  }, [organisations]);

  // Colonnes pour List
  const columns: Column<(typeof organisations)[number]>[] = [
    { key: 'nom', header: "Nom de l'organisation", sortable: true },
    { key: 'contact', header: 'Contact', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'pays', header: 'Pays', sortable: true },
    {
      key: 'dateCreation',
      header: 'Date de création',
      sortable: true,
      render: (o) => new Date(o.dateCreation).toLocaleDateString('fr-FR')
    },
    {
      key: 'statut',
      header: 'Statut',
      sortable: true,
      render: (o) => (
        <Badge className={statutOrgColors[o.statut]}>
          {statutOrgLabels[o.statut]}
        </Badge>
      )
    },
    ...(subSection === 'sponsor' || filter === 'sponsor'
      ? [{ key: 'referent', header: 'Référent', render: (o: any) => (
          o.referent ? (
            <div className="text-sm">
              <p className="text-gray-900">{o.referent.prenom} {o.referent.nom}</p>
              <p className="text-xs text-orange-600">{o.referent.fonction}</p>
            </div>
          ) : <span className="text-sm text-gray-400">Aucun référent</span>
        )}] as Column<(typeof organisations)[number]>[]
      : []),
    {
      key: 'actions',
      header: 'Actions',
      render: (o) => {
        const participants = getParticipantsByOrganisation(o.id);
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                <Eye className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{o.nom}</DialogTitle>
                <DialogDescription>
                  Informations détaillées sur l'organisation et ses participants
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="text-gray-900">{o.contact}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{o.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pays</p>
                    <p className="text-gray-900">{o.pays}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Statut</p>
                    <Badge className={`${statutOrgColors[o.statut]} mt-1`}>
                      {statutOrgLabels[o.statut]}
                    </Badge>
                  </div>
                </div>

                {o.statut === 'sponsor' && o.referent && (
                  <ReferentSection 
                    referent={o.referent}
                    organisationNom={o.nom}
                    organisationId={o.id}
                  />
                )}

                <div className="border-t pt-4">
                  <h3 className="text-gray-900 mb-4">
                    Participants de cette organisation ({participants.length})
                  </h3>
                  {participants.length === 0 ? (
                    <p className="text-sm text-gray-500">Aucun participant inscrit</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {participants.map(participant => (
                        <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-900">
                              {participant.prenom} {participant.nom}
                            </p>
                            <p className="text-xs text-gray-500">{participant.email}</p>
                          </div>
                          <Badge className="text-xs">
                            {participant.statut}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      }
    }
  ];

  // Filtre composant pour List
  const filterComponent = (
    <div className="flex items-center gap-2">
      <Select value={paysFilter} onValueChange={setPaysFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Pays" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tous">Tous les pays</SelectItem>
          {paysList.map(pays => (
            <SelectItem key={pays} value={pays}>{pays}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const exportHeaders = ['Nom', 'Email', 'Contact', 'Pays', 'Statut', 'Nombre de Participants'];
  const exportData = (org: (typeof organisations)[number]) => {
    const participants = getParticipantsByOrganisation(org.id);
    return [org.nom, org.email, org.contact, org.pays, org.statut, String(participants.length)];
  };

  const buildActions: ListAction<(typeof organisations)[number]>[] = [
    {
      label: 'Exporter sélection',
      onClick: (items) => {
        const csv = [exportHeaders.join(','), ...items.map(exportData).map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `organisations-selection-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    }
  ];

  // Composant pour afficher la section référent avec badge
  const ReferentSection = ({ 
    referent, 
    organisationNom, 
    organisationId 
  }: { 
    referent: typeof organisations[0]['referent'], 
    organisationNom: string,
    organisationId: string
  }) => {
    const [isBadgeOpen, setIsBadgeOpen] = useState(false);

    if (!referent) return null;

    // Trouver le participant correspondant au référent pour avoir son ID
    const referentParticipant = getParticipantsByOrganisation(organisationId).find(
      p => p.statut === 'referent'
    );

    return (
      <>
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-orange-600" />
              <h3 className="text-gray-900">Référent (contact pour les rendez-vous)</h3>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsBadgeOpen(true)}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Badge référent
              </Button>
              {referentParticipant && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setHistoriqueParticipantId(referentParticipant.id)}
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                >
                  <History className="w-4 h-4 mr-2" />
                  Historique RDV
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 bg-orange-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Nom complet</p>
              <p className="text-gray-900">{referent.prenom} {referent.nom}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fonction</p>
              <p className="text-gray-900">{referent.fonction}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{referent.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Téléphone</p>
              <p className="text-gray-900">{referent.telephone}</p>
            </div>
          </div>
        </div>
        <BadgeReferentGenerator
          referent={referent}
          organisationNom={organisationNom}
          organisationId={organisationId}
          isOpen={isBadgeOpen}
          onClose={() => setIsBadgeOpen(false)}
        />
      </>
    );
  };

  const exportToCSV = () => {
    const headers = ['Nom', 'Email', 'Contact', 'Pays', 'Statut', 'Nombre de Participants'];
    const csvContent = [
      headers.join(','),
      ...filteredOrganisations.map(org => {
        const participants = getParticipantsByOrganisation(org.id);
        return [
          org.nom,
          org.email,
          org.contact,
          org.pays,
          org.statut,
          participants.length
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `organisations-${subSection || filter || 'liste'}-fanaf.csv`;
    a.click();
  };

  return (
    <>
      <List
        data={filteredOrganisations}
        columns={columns}
        getRowId={(o) => o.id}
        searchPlaceholder="Rechercher par nom, email, pays ou contact..."
        searchKeys={["nom", "email", "pays", "contact"]}
        filterComponent={filterComponent}
        filterTitle="Organisations"
        exportFilename={`organisations-${subSection || filter || 'liste'}`}
        exportHeaders={exportHeaders}
        exportData={exportData}
        itemsPerPage={10}
        readOnly={readOnly}
        enableSelection={true}
        buildActions={buildActions}
        loading={isLoading as any}
      />

      {/* Dialogue historique rendez-vous */}
      {historiqueParticipantId && (
        <HistoriqueRendezVousDialog
          isOpen={!!historiqueParticipantId}
          onClose={() => setHistoriqueParticipantId(null)}
          participantId={historiqueParticipantId}
          rendezVousList={rendezVous}
        />
      )}
    </>
  );
}


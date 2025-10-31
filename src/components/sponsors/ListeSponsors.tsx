"use client";

import { useState, useMemo, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Download, ExternalLink, Image as ImageIcon, Loader2 } from "lucide-react";
import { SponsorDetailsDialog } from "./SponsorDetailsDialog";
import { List, type Column, type ListAction } from "../list/List";
import type { Organisation } from '../data/types';
import { sponsorsDataService } from "../data/sponsorsData";

interface ListeSponsorsProps {
  readOnly?: boolean;
}

export function ListeSponsors({ readOnly = false }: ListeSponsorsProps) {
  // Sponsors depuis le service centralisé sponsorsDataService
  const [sponsors, setSponsors] = useState<Organisation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState<string>('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Charger les sponsors via le service au montage
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const sponsorsData = await sponsorsDataService.loadSponsors();
        if (mounted) setSponsors(sponsorsData);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredSponsors = useMemo(() => {
    let filtered = [...sponsors];

    if (typeFilter !== 'tous') {
      filtered = filtered.filter(s => s.secteurActivite === typeFilter);
    }
    return filtered;
  }, [sponsors, typeFilter]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter]);

  // Récupérer la liste unique des types de sponsors (ARGENT, GOLD, etc.)
  const sponsorTypes = useMemo(() => {
    const types = new Set(sponsors.map(s => s.secteurActivite).filter(Boolean));
    return Array.from(types).sort();
  }, [sponsors]);

  // Colonnes pour List
  const columns: Column<(typeof sponsors)[number]>[] = [
    { key: 'nom', header: "Nom du sponsor", sortable: true },
    { 
      key: 'secteurActivite', 
      header: 'Type', 
      sortable: true,
      render: (s) => (
        <Badge className="bg-amber-100 text-amber-800">
          {s.secteurActivite || 'N/A'}
        </Badge>
      )
    },
    { 
      key: 'email', 
      header: 'Email', 
      sortable: true,
      render: (s) => s.email || <span className="text-gray-400">N/A</span>
    },
    {
      key: 'dateCreation',
      header: 'Date de création',
      sortable: true,
      render: (s) => s.dateCreation ? new Date(s.dateCreation).toLocaleDateString('fr-FR') : '-'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s) => <SponsorDetailsDialog sponsor={s} />
    }
  ];

  // Filtre composant pour List
  const filterComponent = (
    <div className="flex items-center gap-2">
      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Type de sponsor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tous">Tous les types</SelectItem>
          {sponsorTypes.map(type => (
            <SelectItem key={type} value={type || ''}>{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const exportHeaders = ['Nom', 'Type', 'Email', 'Date de création'];
  const exportData = (sponsor: (typeof sponsors)[number]) => {
    return [
      sponsor.nom, 
      sponsor.secteurActivite || 'N/A', 
      sponsor.email || 'N/A', 
      sponsor.dateCreation ? new Date(sponsor.dateCreation).toLocaleDateString('fr-FR') : '-'
    ];
  };

  const buildActions: ListAction<(typeof sponsors)[number]>[] = [
    {
      label: 'Exporter sélection',
      onClick: (items) => {
        const csv = [exportHeaders.join(','), ...items.map(exportData).map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sponsors-selection-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    }
  ];

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
            </div>
            <p className="text-sm font-medium text-gray-700">Chargement des sponsors...</p>
          </div>
        </div>
      )}
      <List
        data={filteredSponsors}
        columns={columns}
        getRowId={(s) => s.id}
        searchPlaceholder="Rechercher par nom, email ou type..."
        searchKeys={["nom", "email", "secteurActivite"]}
        filterComponent={filterComponent}
        filterTitle="Sponsors"
        exportFilename="sponsors"
        exportHeaders={exportHeaders}
        exportData={exportData}
        itemsPerPage={10}
        readOnly={readOnly}
        enableSelection={true}
        buildActions={buildActions}
        loading={isLoading as any}
      />
    </>
  );
}


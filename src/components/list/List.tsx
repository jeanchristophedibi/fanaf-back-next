"use client";

import { useState, useMemo, useEffect, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Search, Filter, Download, ArrowUpDown, ArrowUp, ArrowDown, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Skeleton } from "../ui/skeleton";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  sortKey?: string; // Clé alternative pour le tri (si différente de key)
  width?: string; // Largeur de la colonne (ex: "w-16", "w-24", "min-w-[100px]")
}

export interface ListAction<T> {
  label: string;
  icon?: ReactNode;
  onClick: (selectedItems: T[]) => void;
  variant?: "default" | "destructive" | "outline";
  disabled?: (selectedItems: T[]) => boolean;
}

export interface RowAction<T> {
  label: string;
  icon?: ReactNode;
  onClick: (item: T) => void;
  variant?: "default" | "destructive" | "outline" | "ghost";
  disabled?: (item: T) => boolean;
  shouldShow?: (item: T) => boolean; // Condition d'affichage
  className?: string; // Classes CSS personnalisées
  title?: string; // Tooltip
}

export interface ListProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowId: (item: T) => string | number;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  filterComponent?: ReactNode;
  exportFilename?: string;
  exportHeaders?: string[];
  exportData?: (item: T) => string[];
  onExport?: (filteredData: T[]) => void;
  itemsPerPage?: number;
  readOnly?: boolean;
  emptyMessage?: string;
  buildActions?: ListAction<T>[];
  selectedItems?: T[];
  onSelectionChange?: (selectedItems: T[]) => void;
  enableSelection?: boolean;
  filterTitle?: string;
  loading?: boolean;
  rowActions?: RowAction<T>[]; // Actions par ligne
  rowActionsWidth?: string; // Largeur de la colonne Actions (défaut: "w-32")
}

export function List<T extends Record<string, any>>({
  data,
  columns,
  getRowId,
  searchPlaceholder = "Rechercher...",
  searchKeys,
  filterComponent,
  exportFilename = "export",
  exportHeaders,
  exportData,
  onExport,
  itemsPerPage = 10,
  readOnly = false,
  emptyMessage = "Aucun élément trouvé",
  buildActions = [],
  selectedItems: controlledSelectedItems,
  onSelectionChange,
  enableSelection = false,
  filterTitle = "Filtres et recherche",
  loading = false,
  rowActions = [],
  rowActionsWidth = "w-32",
}: ListProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [internalSelectedItems, setInternalSelectedItems] = useState<Set<string | number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(true);

  // Utiliser la sélection contrôlée ou interne
  const isControlled = controlledSelectedItems !== undefined && onSelectionChange !== undefined;
  const selectedIds = useMemo(() => {
    if (isControlled) {
      return new Set(controlledSelectedItems.map(getRowId));
    }
    return internalSelectedItems;
  }, [isControlled, controlledSelectedItems, internalSelectedItems, getRowId]);

  const selectedItems = useMemo(() => {
    const ids = isControlled
      ? new Set(controlledSelectedItems?.map(getRowId) || [])
      : internalSelectedItems;
    return data.filter((item) => ids.has(getRowId(item)));
  }, [data, isControlled, controlledSelectedItems, internalSelectedItems, getRowId]);

  // Recherche
  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (searchTerm && searchKeys) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        searchKeys.some((key) => {
          const value = item[key];
          return value && String(value).toLowerCase().includes(term);
        })
      );
    }

    // Tri
    if (sortConfig) {
      filtered.sort((a, b) => {
        const column = columns.find((col) => col.key === sortConfig.key);
        const sortKey = column?.sortKey || sortConfig.key;
        let aValue = a[sortKey];
        let bValue = b[sortKey];

        // Gérer les dates
        if (aValue instanceof Date || (typeof aValue === "string" && sortKey.toLowerCase().includes("date"))) {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          // Les nombres sont déjà corrects
        } else {
          aValue = String(aValue || "").toLowerCase();
          bValue = String(bValue || "").toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, searchKeys, sortConfig, columns]);

  // Calculer si le bouton d'export doit être désactivé
  const isExportDisabled = useMemo(() => {
    const hasNoData = filteredData.length === 0;
    const isReadOnly = readOnly;
    const missingConfig = !onExport && (!exportHeaders || !exportData);
    
    return hasNoData || isReadOnly || missingConfig;
  }, [filteredData.length, readOnly, onExport, exportHeaders, exportData]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);
  
  // Calculer la plage d'éléments affichés
  const startItem = filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, filteredData.length);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  // Fonction de tri
  const handleSort = (key: string) => {
    const column = columns.find((col) => col.key === key);
    if (!column || !column.sortable) return;

    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Sélection
  const handleSelectAll = (checked: boolean) => {
    const ids = new Set(filteredData.map(getRowId));
    if (isControlled) {
      const newSelection = checked ? filteredData : [];
      onSelectionChange?.(newSelection);
    } else {
      setInternalSelectedItems(checked ? ids : new Set());
    }
  };

  const handleSelectItem = (item: T, checked: boolean) => {
    const id = getRowId(item);
    if (isControlled) {
      const currentIds = new Set(selectedItems.map(getRowId));
      if (checked) {
        currentIds.add(id);
      } else {
        currentIds.delete(id);
      }
      const newSelection = data.filter((item) => currentIds.has(getRowId(item)));
      onSelectionChange?.(newSelection);
    } else {
      const newSelection = new Set(internalSelectedItems);
      if (checked) {
        newSelection.add(id);
      } else {
        newSelection.delete(id);
      }
      setInternalSelectedItems(newSelection);
    }
  };

  const allSelected = filteredData.length > 0 && filteredData.every((item) => selectedIds.has(getRowId(item)));
  const someSelected = filteredData.some((item) => selectedIds.has(getRowId(item)));

  // Fonction pour échapper les valeurs CSV (gérer les virgules, guillemets, retours à la ligne)
  const escapeCSVValue = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    
    // Si la valeur contient des virgules, guillemets ou retours à la ligne, l'entourer de guillemets
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      // Échapper les guillemets en les doublant
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Export CSV (respecte filtres/tri, et colonnes visibles; exporte la sélection si présente)
  const handleExport = () => {
    const dataset = selectedItems.length > 0 ? selectedItems : filteredData;

    if (onExport) {
      onExport(dataset);
      return;
    }

    // Construire automatiquement en se basant sur les colonnes si aucune config fournie
    const effectiveHeaders = exportHeaders && exportHeaders.length > 0
      ? exportHeaders
      : columns.map((c) => c.header);

    const effectiveRowBuilder = exportData
      ? exportData
      : (item: T) => columns.map((c) => {
          const value = item[c.sortKey || c.key];
          // Eviter d'exporter des objets complexes
          if (value === null || value === undefined) return '';
          if (value instanceof Date) return value.toISOString();
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value);
        });

    try {
      const csvRows = [
        effectiveHeaders.map(escapeCSVValue).join(","),
        ...dataset.map(item => effectiveRowBuilder(item).map(escapeCSVValue).join(","))
      ];

      const csvContent = csvRows.join("\n");
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exportFilename}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[List] Erreur lors de l\'export CSV:', error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {filterTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </>
            ) : (
              <>
                {/* Barre de recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Filtres sous la barre de recherche */}
                {filterComponent && (
                  <div className="mt-4">
                    {filterComponent}
                  </div>
                )}

                {/* Actions en masse */}
                {enableSelection && selectedItems.length > 0 && buildActions.length > 0 && (
                  <Collapsible open={showBulkActions} onOpenChange={setShowBulkActions}>
                    <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <span className="text-sm text-orange-900 font-medium">
                        {selectedItems.length} élément{selectedItems.length > 1 ? "s" : ""} sélectionné{selectedItems.length > 1 ? "s" : ""}
                      </span>
                      <div className="flex items-center gap-2 ml-auto">
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-orange-700 hover:text-orange-800 hover:bg-orange-100"
                          >
                            {showBulkActions ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-1" />
                                Masquer
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-1" />
                                Afficher
                              </>
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    <CollapsibleContent>
                      <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200 border-t-0 rounded-t-none">
                        <div className="flex items-center gap-2 ml-auto">
                          {buildActions.map((action, index) => {
                            const disabled = action.disabled ? action.disabled(selectedItems) : false;
                            return (
                              <Button
                                key={index}
                                variant={action.variant || "default"}
                                size="sm"
                                onClick={() => action.onClick(selectedItems)}
                                disabled={disabled || readOnly}
                              >
                                {action.icon}
                                {action.label}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {filteredData.length} résultat{filteredData.length > 1 ? "s" : ""} trouvé{filteredData.length > 1 ? "s" : ""}
                  </p>
                  <Button
                    onClick={handleExport}
                    variant="outline"
                    size="sm"
                    disabled={isExportDisabled}
                    title={
                      filteredData.length === 0 
                        ? "Aucune donnée à exporter"
                        : readOnly 
                        ? "Mode lecture seule"
                        : (!onExport && (!exportHeaders || !exportData))
                        ? "Configuration d'export manquante"
                        : "Exporter les données au format CSV"
                    }
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter CSV
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Tableau intégré dans la même card */}
          <div className="mt-6 border-t pt-6">
            <div className="overflow-x-auto max-h-[520px] rounded-lg border">
              <Table>
              <TableHeader className="sticky top-0 bg-orange-600 z-10 shadow-sm">
                <TableRow>
                  {enableSelection && (
                    <TableHead className="w-12 py-3 text-white">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        className={someSelected && !allSelected ? "data-[state=checked]:bg-orange-500" : ""}
                      />
                    </TableHead>
                  )}
                  {columns.map((column) => (
                    <TableHead key={column.key} className={`${column.width || ''} py-3 text-white whitespace-nowrap font-semibold`}>
                      {column.sortable ? (
                        <button
                          onClick={() => handleSort(column.key)}
                          className="flex items-center gap-1 hover:text-white"
                        >
                          {column.header}
                          {sortConfig?.key === column.key ? (
                            sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowDown className="w-3 h-3" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        column.header
                      )}
                    </TableHead>
                  ))}
                  {rowActions.length > 0 && (
                    <TableHead className={`${rowActionsWidth} text-center py-3 text-white font-semibold`}>
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Skeleton loader
                  Array.from({ length: itemsPerPage }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      {enableSelection && (
                        <TableCell className="py-3">
                          <Skeleton className="h-4 w-4" />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell key={column.key} className="py-3">
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                      {rowActions.length > 0 && (
                        <TableCell className="py-3">
                          <Skeleton className="h-8 w-24" />
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={enableSelection ? columns.length + 1 + (rowActions.length > 0 ? 1 : 0) : columns.length + (rowActions.length > 0 ? 1 : 0)}
                      className="text-center text-gray-500 py-12"
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item, rowIndex) => {
                    const id = getRowId(item);
                    const isSelected = selectedIds.has(id);
                    return (
                      <TableRow key={String(id)} className={`${isSelected ? "bg-orange-50" : rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-orange-50 transition-colors`}>
                        {enableSelection && (
                          <TableCell className="py-3">
                            <Checkbox checked={isSelected} onCheckedChange={(checked) => handleSelectItem(item, checked as boolean)} />
                          </TableCell>
                        )}
                        {columns.map((column) => (
                          <TableCell key={column.key} className={`${column.width || ''} py-3 align-middle`}>
                            {column.render ? column.render(item) : String(item[column.key] || "")}
                          </TableCell>
                        ))}
                        {rowActions.length > 0 && (
                          <TableCell className={`${rowActionsWidth} text-center py-3`}>
                            <div className="flex justify-center items-center gap-1">
                              {rowActions
                                .filter((action) => {
                                  // Vérifier si l'action doit être affichée
                                  if (action.shouldShow) {
                                    return action.shouldShow(item);
                                  }
                                  return true; // Afficher par défaut si shouldShow n'est pas défini
                                })
                                .map((action, index) => {
                                  const isDisabled = action.disabled ? action.disabled(item) : false;
                                  
                                  return (
                                    <Button
                                      key={index}
                                      size="sm"
                                      variant={action.variant || "ghost"}
                                      className={action.className || "h-8 w-8 p-0"}
                                      onClick={() => action.onClick(item)}
                                      disabled={isDisabled || readOnly}
                                      title={action.title || action.label}
                                    >
                                      {action.icon || action.label}
                                    </Button>
                                  );
                                })}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredData.length > 0 && totalPages > 1 && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages} (Éléments {startItem}-{endItem} sur {filteredData.length})
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? "bg-orange-600 hover:bg-orange-700" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}


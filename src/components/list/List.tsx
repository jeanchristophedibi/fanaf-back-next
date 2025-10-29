"use client";

import { useState, useMemo, useEffect, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Search, Filter, Download, ArrowUpDown, ArrowUp, ArrowDown, Check } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  sortKey?: string; // Clé alternative pour le tri (si différente de key)
}

export interface ListAction<T> {
  label: string;
  icon?: ReactNode;
  onClick: (selectedItems: T[]) => void;
  variant?: "default" | "destructive" | "outline";
  disabled?: (selectedItems: T[]) => boolean;
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
}: ListProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [internalSelectedItems, setInternalSelectedItems] = useState<Set<string | number>>(new Set());

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

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

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

  // Export CSV
  const handleExport = () => {
    if (onExport) {
      onExport(filteredData);
      return;
    }

    if (!exportHeaders || !exportData) return;

    const csvContent = [
      exportHeaders.join(","),
      ...filteredData.map(exportData).map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFilename}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {filterComponent}
            </div>

            {/* Actions en masse */}
            {enableSelection && selectedItems.length > 0 && buildActions.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-sm text-orange-900 font-medium">
                  {selectedItems.length} élément{selectedItems.length > 1 ? "s" : ""} sélectionné{selectedItems.length > 1 ? "s" : ""}
                </span>
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
            )}

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredData.length} résultat{filteredData.length > 1 ? "s" : ""} trouvé{filteredData.length > 1 ? "s" : ""}
              </p>
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                disabled={filteredData.length === 0 || readOnly || (!onExport && (!exportHeaders || !exportData))}
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </div>

          {/* Tableau intégré dans la même card */}
          <div className="mt-6 border-t pt-6">
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  {enableSelection && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        className={someSelected && !allSelected ? "data-[state=checked]:bg-orange-500" : ""}
                      />
                    </TableHead>
                  )}
                  {columns.map((column) => (
                    <TableHead key={column.key}>
                      {column.sortable ? (
                        <button
                          onClick={() => handleSort(column.key)}
                          className="flex items-center gap-1 hover:text-gray-700"
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={enableSelection ? columns.length + 1 : columns.length}
                      className="text-center text-gray-500 py-8"
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => {
                    const id = getRowId(item);
                    const isSelected = selectedIds.has(id);
                    return (
                      <TableRow key={String(id)} className={isSelected ? "bg-orange-50" : ""}>
                        {enableSelection && (
                          <TableCell>
                            <Checkbox checked={isSelected} onCheckedChange={(checked) => handleSelectItem(item, checked as boolean)} />
                          </TableCell>
                        )}
                        {columns.map((column) => (
                          <TableCell key={column.key}>
                            {column.render ? column.render(item) : String(item[column.key] || "")}
                          </TableCell>
                        ))}
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
                Page {currentPage} sur {totalPages} ({filteredData.length} résultat{filteredData.length > 1 ? "s" : ""})
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


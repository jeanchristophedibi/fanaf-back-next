# Composant List - Liste générique réutilisable

Ce composant `List` est un composant générique et réutilisable pour toutes les listes de l'application. Il gère automatiquement :

- ✅ **Sélection** : Sélection individuelle et sélection globale (checkboxes)
- ✅ **Recherche** : Recherche textuelle sur plusieurs colonnes
- ✅ **Tri** : Tri sur les colonnes configurables
- ✅ **Pagination** : Pagination automatique
- ✅ **Export CSV** : Export des données filtrées
- ✅ **Actions en masse** : Actions sur les éléments sélectionnés
- ✅ **Structure visuelle** : Filtres collés au tableau (style uniforme)

## Utilisation de base

```tsx
import { List, Column } from '../list/List';

interface MyData {
  id: string;
  name: string;
  email: string;
  date: Date;
}

const columns: Column<MyData>[] = [
  {
    key: 'name',
    header: 'Nom',
    sortable: true,
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true,
  },
  {
    key: 'date',
    header: 'Date',
    sortable: true,
    render: (item) => new Date(item.date).toLocaleDateString('fr-FR'),
  },
];

export function MyList({ data }: { data: MyData[] }) {
  return (
    <List
      data={data}
      columns={columns}
      getRowId={(item) => item.id}
      searchKeys={['name', 'email']}
      searchPlaceholder="Rechercher par nom ou email..."
    />
  );
}
```

## Avec sélection et actions en masse

```tsx
import { List, Column, ListAction } from '../list/List';
import { Trash2, Download, Check } from 'lucide-react';

const buildActions: ListAction<MyData>[] = [
  {
    label: 'Exporter sélection',
    icon: <Download className="w-4 h-4 mr-2" />,
    onClick: (selectedItems) => {
      console.log('Exporter:', selectedItems);
      // Exporter les éléments sélectionnés
    },
  },
  {
    label: 'Supprimer',
    icon: <Trash2 className="w-4 h-4 mr-2" />,
    variant: 'destructive',
    onClick: (selectedItems) => {
      console.log('Supprimer:', selectedItems);
      // Supprimer les éléments sélectionnés
    },
    disabled: (selectedItems) => selectedItems.length === 0,
  },
];

export function MyListWithSelection({ data }: { data: MyData[] }) {
  return (
    <List
      data={data}
      columns={columns}
      getRowId={(item) => item.id}
      searchKeys={['name', 'email']}
      enableSelection={true}
      buildActions={buildActions}
    />
  );
}
```

## Export CSV personnalisé

```tsx
const handleExport = (filteredData: MyData[]) => {
  // Logique d'export personnalisée
  const csv = filteredData.map(item => `${item.name},${item.email}`).join('\n');
  // Télécharger le CSV
};

// Ou utiliser les props automatiques
<List
  data={data}
  columns={columns}
  getRowId={(item) => item.id}
  exportFilename="mes-donnees"
  exportHeaders={['Nom', 'Email', 'Date']}
  exportData={(item) => [
    item.name,
    item.email,
    new Date(item.date).toLocaleDateString('fr-FR')
  ]}
/>
```

## Sélection contrôlée

Pour gérer la sélection depuis le composant parent :

```tsx
const [selectedItems, setSelectedItems] = useState<MyData[]>([]);

<List
  data={data}
  columns={columns}
  getRowId={(item) => item.id}
  enableSelection={true}
  selectedItems={selectedItems}
  onSelectionChange={setSelectedItems}
/>
```

## Props complètes

| Prop | Type | Description |
|------|------|-------------|
| `data` | `T[]` | Données à afficher |
| `columns` | `Column<T>[]` | Configuration des colonnes |
| `getRowId` | `(item: T) => string \| number` | Fonction pour obtenir l'ID unique d'un élément |
| `searchPlaceholder` | `string` | Placeholder pour le champ de recherche |
| `searchKeys` | `(keyof T)[]` | Clés sur lesquelles effectuer la recherche |
| `filterComponent` | `ReactNode` | Composant de filtre personnalisé (optionnel) |
| `exportFilename` | `string` | Nom du fichier d'export |
| `exportHeaders` | `string[]` | En-têtes pour l'export CSV |
| `exportData` | `(item: T) => string[]` | Fonction pour convertir un élément en ligne CSV |
| `onExport` | `(data: T[]) => void` | Fonction d'export personnalisée (prioritaire sur export automatique) |
| `itemsPerPage` | `number` | Nombre d'éléments par page (défaut: 10) |
| `readOnly` | `boolean` | Mode lecture seule (désactive export et actions) |
| `emptyMessage` | `string` | Message affiché quand aucune donnée |
| `buildActions` | `ListAction<T>[]` | Actions en masse sur les éléments sélectionnés |
| `selectedItems` | `T[]` | Éléments sélectionnés (mode contrôlée) |
| `onSelectionChange` | `(items: T[]) => void` | Callback de changement de sélection |
| `enableSelection` | `boolean` | Activer les checkboxes de sélection |

## Interface Column

```tsx
interface Column<T> {
  key: string;                    // Clé de la propriété dans les données
  header: string;                 // Libellé de la colonne
  sortable?: boolean;             // Permettre le tri sur cette colonne
  render?: (item: T) => ReactNode; // Fonction de rendu personnalisée
  sortKey?: string;               // Clé alternative pour le tri
}
```

## Interface ListAction

```tsx
interface ListAction<T> {
  label: string;                                    // Libellé du bouton
  icon?: ReactNode;                                 // Icône du bouton
  onClick: (selectedItems: T[]) => void;           // Action à exécuter
  variant?: "default" | "destructive" | "outline"; // Style du bouton
  disabled?: (selectedItems: T[]) => boolean;      // Fonction pour désactiver
}
```

## Migration depuis les listes existantes

Pour migrer une liste existante vers ce composant :

1. Définir les colonnes avec la configuration `Column<T>[]`
2. Mapper les données si nécessaire
3. Configurer la recherche avec `searchKeys`
4. Ajouter les actions en masse si besoin avec `buildActions`
5. Configurer l'export CSV avec `exportHeaders` et `exportData`

Le composant gère automatiquement :
- La structure visuelle (filtres collés au tableau)
- Le tri sur les colonnes `sortable: true`
- La pagination
- La sélection


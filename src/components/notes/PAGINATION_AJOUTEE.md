# 📄 PAGINATION SYSTÉMATIQUE - 10 lignes par page

## ✅ Fichiers mis à jour avec pagination

### 1️⃣ **OrganisationsPage.tsx** ✅
- État ajouté : `currentPage`, `itemsPerPage = 10`
- Pagination calculée sur `filteredOrganisations`
- `paginatedOrganisations` utilisé dans le tableau
- Composant de pagination ajouté en bas
- Import : `useEffect`, `ChevronLeft`, `ChevronRight`

### 2️⃣ **NetworkingPage.tsx** ✅
- État ajouté : `currentPage`, `itemsPerPage = 10`
- Pagination calculée sur `filteredRendezVous`
- `paginatedRendezVous` utilisé dans le tableau
- Composant de pagination ajouté (uniquement en mode liste, pas en mode calendrier)
- Import : `useEffect`, `ChevronLeft`, `ChevronRight`

### 3️⃣ **ComiteOrganisationPage.tsx** ✅
- État ajouté : `currentPage`, `itemsPerPage = 10`
- Pagination calculée sur `filteredMembres`
- `paginatedMembres` utilisé dans le tableau
- Composant de pagination ajouté en bas
- Import : `useEffect`, `ChevronLeft`, `ChevronRight`

### 4️⃣ **InscriptionsPage.tsx** 🔄 (en cours)
- État ajouté : `currentPage`, `itemsPerPage = 10`
- Imports mis à jour : `useEffect`, `ChevronLeft`, `ChevronRight`
- Pagination à finaliser sur `filteredParticipants`

### 5️⃣ **ListeInscriptionsPage.tsx** ✅ (déjà fait)
- Pagination déjà présente avec `currentPage`, `itemsPerPage = 10`
- Système complet avec composant Pagination de ShadCN

### 6️⃣ **ListePaiementsPage.tsx** ✅ (déjà fait)
- Pagination déjà présente avec `currentPage`, `itemsPerPage = 10`
- Système complet

### 7️⃣ **CaisseInscriptionsPage.tsx** ✅ (déjà fait)
- Pagination déjà présente

---

## 📊 Composant de pagination standard

```tsx
{/* Pagination */}
{filteredData.length > 0 && totalPages > 1 && (
  <Card className="mt-4">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Page {currentPage} sur {totalPages} ({filteredData.length} résultat{filteredData.length > 1 ? 's' : ''})
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
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
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="gap-1"
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

---

## 🔧 Code pattern standard

### 1. Imports nécessaires
```tsx
import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
```

### 2. États
```tsx
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;
```

### 3. Calcul de pagination
```tsx
// Pagination
const totalPages = Math.ceil(filteredData.length / itemsPerPage);
const paginatedData = useMemo(() => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredData.slice(startIndex, endIndex);
}, [filteredData, currentPage]);

// Réinitialiser la page quand les filtres changent
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, otherFilters]);
```

### 4. Utilisation dans le tableau
```tsx
{paginatedData.map((item) => (
  // ... render item
))}
```

---

## 🎯 Fichiers restants à vérifier

### À traiter si nécessaire :
- **HistoriqueDemandesPage.tsx** - À vérifier s'il affiche des listes
- **PaiementsEnAttentePage.tsx** - À vérifier
- **ParticipantsFinalisesPage.tsx** - À vérifier
- **DocumentsParticipantsPage.tsx** - À vérifier si liste
- **ReservationsPage.tsx** - À vérifier si liste

---

## ✅ Bénéfices de la pagination

1. **Performance** : Affichage de seulement 10 éléments à la fois
2. **UX améliorée** : Navigation fluide entre les pages
3. **Cohérence** : Même système de pagination partout
4. **Accessibilité** : Boutons clairs avec icônes
5. **Responsive** : Design adapté à toutes les tailles d'écran

---

## 📱 Design de la pagination

- **Couleur active** : Orange (`bg-orange-600`, `hover:bg-orange-700`)
- **Affichage** : Maximum 5 boutons de pages visibles
- **Navigation** : Boutons "Précédent" et "Suivant" avec icônes
- **Info** : "Page X sur Y (Z résultat(s))"
- **Désactivation** : Boutons désactivés aux extrémités

---

**Date de mise à jour** : 27 octobre 2025

# Structure des Organisations

Cette documentation décrit la structure modulaire du module Organisations, organisée selon le pattern établi pour les paiements.

## 📁 Structure des fichiers

```
src/components/organisations/
├── OrganisationsPage.tsx    # Page principale qui assemble les composants
├── WidgetOrganisations.tsx  # Widget de statistiques (cartes de stats)
├── ListeOrganisations.tsx   # Composant de liste avec filtres, tableau, pagination
└── README.md               # Cette documentation
```

## 🎯 Principe d'organisation

Lorsqu'on veut accéder à la liste des organisations, on cherche `OrganisationsPage` qui se trouve dans le dossier `components/organisations/`. Cette page utilise les composants modulaires `WidgetOrganisations` et `ListeOrganisations` pour une meilleure structure et réutilisabilité.

## 📦 Composants

### `OrganisationsPage.tsx`
**Responsabilité** : Composant principal qui assemble tous les sous-composants et gère la logique générale de la page.

**Props** :
- `subSection?: OrganisationSubSection` - Sous-section (membre, non-membre, sponsor, liste)
- `filter?: 'all' | 'membre' | 'non-membre' | 'sponsor'` - Filtre alternatif
- `readOnly?: boolean` - Mode lecture seule (pour admin-fanaf)

**Fonctionnalités** :
- Affiche le titre selon la sous-section
- Gère le formulaire de création de sponsor (si section sponsor et non readOnly)
- Affiche `WidgetOrganisations` uniquement pour la vue liste
- Affiche `ListeOrganisations` pour la liste complète

### `WidgetOrganisations.tsx`
**Responsabilité** : Affichage des statistiques en cartes (Total, Membres, Non-membres, Sponsors).

**Fonctionnalités** :
- Calcule les statistiques depuis les données d'organisations
- Affiche 4 cartes avec gradients colorés
- Données en temps réel via `useDynamicInscriptions`

**Affichage** :
- Carte Total (violet)
- Carte Associations membre (teal)
- Carte Entreprise (gris)
- Carte Sponsors (ambre)

### `ListeOrganisations.tsx`
**Responsabilité** : Liste complète avec filtres, recherche, tableau, pagination et export CSV.

**Props** :
- `subSection?: OrganisationSubSection`
- `filter?: 'all' | 'membre' | 'non-membre' | 'sponsor'`
- `readOnly?: boolean`

**Fonctionnalités** :
- **Recherche** : Par nom, email, pays, contact
- **Filtre par pays** : Sélection dans une liste déroulante
- **Filtre par statut** : Appliqué automatiquement selon `subSection`/`filter`
- **Tableau** : Colonnes adaptées (avec colonne Référent pour sponsors)
- **Modal de détails** : Affiche les informations complètes de l'organisation
- **Section Référent** : Pour les sponsors, affiche le référent avec actions (badge, historique RDV)
- **Pagination** : 10 éléments par page avec navigation
- **Export CSV** : Télécharge la liste filtrée

**Composants internes** :
- `ReferentSection` : Section affichant les informations du référent pour les sponsors

## 🔗 Utilisation

### Dans les pages Next.js

```tsx
// src/app/dashboard/admin-fanaf/organisations/page.tsx
import { OrganisationsPage } from '../../../../components/organisations/OrganisationsPage';

export default function OrganisationsListePage() {
  return <OrganisationsPage readOnly />;
}
```

### Filtrer par type

```tsx
// Vue membres uniquement
<OrganisationsPage subSection="membre" readOnly />

// Vue sponsors uniquement
<OrganisationsPage subSection="sponsor" readOnly />

// Vue non-membres uniquement
<OrganisationsPage subSection="non-membre" readOnly />
```

## 🎨 Styles et design

- **Cartes de statistiques** : Gradients colorés avec icônes
- **Tableau** : Design épuré avec bordures arrondies
- **Filtres** : Carte séparée avec bordure inférieure arrondie à 0 pour être collée au tableau
- **Modal de détails** : Design moderne avec sections organisées

## 📝 Notes importantes

1. **Pattern de structure** : Cette structure suit le même pattern que `components/paiements/` pour la cohérence du codebase
2. **Réutilisabilité** : `WidgetOrganisations` et `ListeOrganisations` peuvent être utilisés indépendamment si nécessaire
3. **Mode readOnly** : Pour le profil admin-fanaf, certaines actions sont désactivées (export CSV, création sponsor)
4. **Référents** : Uniquement visible/applicable pour les sponsors (`subSection === 'sponsor'`)

## 🔄 Migration depuis l'ancienne structure

L'ancien `OrganisationsPage.tsx` dans `components/` a été déplacé et refactorisé en :
- `components/organisations/OrganisationsPage.tsx` (page principale)
- `components/organisations/WidgetOrganisations.tsx` (statistiques)
- `components/organisations/ListeOrganisations.tsx` (liste)

Tous les imports ont été mis à jour dans :
- `src/app/dashboard/admin-fanaf/organisations/*`
- `src/app/dashboard/admin-fanaf/page.tsx`
- `src/app/dashboard/admin-fanaf/Dashboard.tsx`


# Dashboard Admin FANAF

Ce dossier contient les composants spécifiques au dashboard administrateur FANAF.

## Structure

```
admin-fanaf/
├── Dashboard.tsx      # Composant principal du dashboard
├── Sidebar.tsx        # Barre latérale de navigation
├── types.ts           # Types TypeScript partagés (NavItem)
├── index.ts           # Exports publics
└── README.md          # Cette documentation
```

## Fonctionnalités

### Navigation (NavItem)

Le dashboard supporte les sections suivantes :

- **Accueil** (`home`) - Vue d'ensemble
- **Encaissement**
  - Vue d'ensemble (`finance`)
  - Liste des paiements (`finance-paiements`)
- **Inscriptions**
  - Liste des inscriptions (`inscriptions-liste`)
  - Membres (`inscriptions-membre`)
  - Non-membres (`inscriptions-non-membre`)
  - VIP (`inscriptions-vip`)
  - Speakers (`inscriptions-speaker`)
  - Plan de vol (`inscriptions-planvol`)
- **Organisations**
  - Liste des organisations (`organisations-liste`)
  - Associations membre (`organisations-membre`)
  - Entreprises (`organisations-non-membre`)
  - Sponsors (`organisations-sponsor`)
- **Networking**
  - Liste des rendez-vous (`networking-liste`)
  - Rendez-vous participant (`networking-participant`)
  - Rendez-vous sponsor (`networking-sponsor`)
  - Historique des demandes (`networking-historique`)

## Comportement en lecture seule

Tous les composants affichés sont en **lecture seule** (`readOnly`). L'administrateur FANAF peut consulter toutes les données mais ne peut pas les modifier.

## Imports

Pour importer le dashboard dans votre application :

```tsx
import { AdminFanafDashboard } from '../dashboard/admin-fanaf';
```

Ou pour importer des composants spécifiques :

```tsx
import { AdminFanafSidebar } from '../dashboard/admin-fanaf';
import type { NavItem } from '../dashboard/admin-fanaf';
```

## Composants partagés

Ce dashboard utilise les composants partagés depuis `../../components/` :
- DashboardHome
- InscriptionsPage
- ListeInscriptionsPage
- OrganisationsPage
- NetworkingPage
- FinancePage
- ListePaiementsPage
- HistoriqueDemandesPage


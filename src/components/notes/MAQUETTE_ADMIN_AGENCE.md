# Maquette Interface - Administrateur Agence de Communication
## FANAF 2026 - Back Office

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Écran de Connexion](#écran-de-connexion)
3. [Tableau de Bord Principal](#tableau-de-bord-principal)
4. [Section Inscriptions](#section-inscriptions)
5. [Section Réservations de Stand](#section-réservations-de-stand)
6. [Section Organisations](#section-organisations)
7. [Section Networking](#section-networking)
8. [Section Comité d'Organisation](#section-comité-dorganisation)
9. [Module Check-In](#module-check-in)
10. [Système de Notifications](#système-de-notifications)

---

## Vue d'ensemble

### Rôle et Permissions
**Profil** : Administrateur Agence de Communication

**Accès** :
- ✅ Gestion complète des inscriptions (création, modification, suppression)
- ✅ Gestion des réservations de stands
- ✅ Gestion des organisations et sponsors
- ✅ Création et gestion des sponsors avec référents
- ✅ Gestion du networking
- ✅ Gestion du comité d'organisation
- ✅ Check-in des participants
- ❌ **AUCUN ACCÈS** au module Finance
- ❌ **AUCUNE VISIBILITÉ** sur les paiements

**Couleur principale** : Orange (#EA580C, #F97316)

---

## Écran de Connexion

### Layout
```
┌────────────────────────────────────────────────────┐
│                                                    │
│              [Logo FANAF - Orange Circle]          │
│                                                    │
│                   FANAF 2026                       │
│        Back-office de gestion de l'événement       │
│                                                    │
│     Sélectionnez votre profil pour continuer      │
│                                                    │
│  ┌─────────────────────┐  ┌──────────────────────┐│
│  │   [Building Icon]    │  │   [Users Icon]       ││
│  │                      │  │                      ││
│  │  Agence de           │  │  Administrateur      ││
│  │  Communication       │  │  FANAF               ││
│  │                      │  │                      ││
│  │  Gestion complète    │  │  Consultation +      ││
│  │  de l'événement      │  │  Module Finance      ││
│  │                      │  │                      ││
│  │  [Accéder]           │  │  [Accéder]           ││
│  └─────────────────────┘  └──────────────────────┘│
│                                                    │
│         Événement du 9 au 11 février 2026          │
└────────────────────────────────────────────────────┘
```

**Interactions** :
- Clic sur "Accéder au dashboard" → Accès à l'interface correspondante
- Survol des cartes → Bordure orange + ombre portée

---

## Tableau de Bord Principal

### Structure Générale

#### Sidebar (Menu Latéral - Largeur fixe)
```
┌────────────────────────┐
│                        │
│  [F] FANAF 2026        │
│  Admin Agence          │
│                        │
├────────────────────────┤
│                        │
│ 🏠 Tableau de bord     │
│                        │
│ 📊 Inscriptions        │
│   → Liste complète     │
│   → Membres            │
│   → Non-membres        │
│   → VIP                │
│   → Speakers           │
│   → Plans de vol       │
│                        │
│ 🏢 Réservations        │
│   → Liste complète     │
│   → Stands 9m²         │
│   → Stands 12m²        │
│                        │
│ 🏛️ Organisations       │
│   → Liste complète     │
│   → Membres            │
│   → Non-membres        │
│   → Sponsors           │
│                        │
│ 🤝 Networking          │
│   → Vue d'ensemble     │
│   → RDV Participants   │
│   → RDV Sponsors       │
│                        │
│ 👥 Comité Org.         │
│                        │
│ ✅ Check-in            │
│                        │
├────────────────────────┤
│                        │
│ [Switch Profile Icon]  │
│ Changer de profil      │
│                        │
└────────────────────────┘
```

#### Header Principal
```
┌──────────────────────────────────────────────────────────────┐
│  Tableau de bord              [🔔 Notifications] [👤 Admin]  │
│  FANAF 2026 - Back Office Administrateur                     │
└──────────────────────────────────────────────────────────────┘
```

### Page Tableau de Bord (Home)

#### Cartes de Statistiques (4 colonnes)
```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ 👤 Participants  │ │ 🏢 Stands        │ │ 🏛️ Organisations│ │ 🤝 Rendez-vous   │
│                 │ │                 │ │                 │ │                 │
│     245         │ │      48         │ │      23         │ │      156        │
│  Total inscrits │ │  Réservés       │ │  Enregistrées   │ │  Planifiés      │
│                 │ │                 │ │                 │ │                 │
│ +12 cette       │ │ +5 cette        │ │ +2 ce mois      │ │ +23 cette       │
│ semaine         │ │ semaine         │ │                 │ │ semaine         │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

#### Onglets Graphiques
```
┌──────────────────────────────────────────────────────────────┐
│  [Vue d'ensemble] [Évolution]                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  VUE D'ENSEMBLE (Graphiques en barres)                       │
│                                                              │
│  Membres          ████████████ 120                           │
│  Non-membres      ██████ 65                                  │
│  VIP              ████ 35                                    │
│  Speakers         ██ 25                                      │
│                                                              │
│  Stand 9m²        ████████ 30                                │
│  Stand 12m²       ██████ 18                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  [Vue d'ensemble] [Évolution]                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ÉVOLUTION DES INSCRIPTIONS (Graphique linéaire)             │
│                                                              │
│  [Filtres: Tous | Membres | Non-membres | VIP | Speakers]   │
│  Période: [Derniers 30 jours ▼]                             │
│                                                              │
│  250 ┐                                            •          │
│      │                                       •               │
│  200 ┤                                  •                    │
│      │                            •                          │
│  150 ┤                       •                               │
│      │                  •                                    │
│  100 ┤             •                                         │
│      │        •                                              │
│   50 ┤   •                                                   │
│      │                                                       │
│    0 └───────────────────────────────────────────────────    │
│      1    5    10   15   20   25   30 (jours)               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Activités Récentes
```
┌──────────────────────────────────────────────────────────────┐
│  Activités récentes                                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  • Nouvelle inscription: Marie KOUADIO (VIP)                 │
│    Il y a 5 minutes                                          │
│                                                              │
│  • Réservation stand: AXA Afrique - Stand 9m² #A12          │
│    Il y a 15 minutes                                         │
│                                                              │
│  • Rendez-vous confirmé: Koné Aminata ↔ Allianz Africa      │
│    Il y a 32 minutes                                         │
│                                                              │
│  • Nouvelle organisation: Tech Insurance Solutions           │
│    Il y a 1 heure                                            │
│                                                              │
│  • Plan de vol ajouté: Jean Dupont - AF4567                 │
│    Il y a 2 heures                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Section Inscriptions

### Page Liste Complète des Inscriptions

#### Filtres et Recherche
```
┌──────────────────────────────────────────────────────────────┐
│  Liste des inscriptions                  245 participants    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 [Rechercher par nom, email, référence...]               │
│                                                              │
│  Filtres avancés:                                            │
│  Statut: [Tous ▼]  Organisation: [Toutes ▼]                 │
│  Pays: [Tous ▼]    Inscription: [Toutes ▼]                  │
│                                                              │
│  245 participant(s) trouvé(s)         [📥 Exporter CSV]     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Tableau des Participants
```
┌────────────────────────────────────────────────────────────────────────────┐
│ Référence │ Nom Complet      │ Email          │ Org.        │ Statut │ ✓ │ •│
├────────────────────────────────────────────────────────────────────────────┤
│ FANAF001  │ Jean Dupont      │ jdupont@...    │ Assurance CI│ Membre │ ✓ │👁│
│ FANAF002  │ Marie Lambert    │ mlambert@...   │ Sen Assur   │ VIP    │ ✓ │👁│
│ FANAF003  │ Koné Aminata     │ akone@...      │ Mali Assur  │ Membre │ ✗ │👁│
│ FANAF004  │ David Traoré     │ dtraore@...    │ Tech Ins.   │ Non-M. │ ✓ │👁│
│ ...                                                                        │
└────────────────────────────────────────────────────────────────────────────┘

Légende:
✓ = Inscription finalisée
✗ = Inscription non finalisée
👁 = Voir détails
```

### Popup Détails Participant

#### Clic sur l'icône 👁
```
┌─────────────────────────────────────────────────────────────┐
│  Jean Dupont                                          [✕]   │
│  Détails du participant                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  INFORMATIONS PERSONNELLES                                  │
│  ┌──────────────────┐  ┌────────────────────┐             │
│  │ Nom              │  │ Prénom              │             │
│  │ Dupont           │  │ Jean                │             │
│  └──────────────────┘  └────────────────────┘             │
│                                                             │
│  ┌────────────────────────────────────┐                    │
│  │ Email: jean.dupont@assurance-ci.com│                    │
│  └────────────────────────────────────┘                    │
│                                                             │
│  ┌──────────────────┐  ┌────────────────────┐             │
│  │ Téléphone        │  │ Pays                │             │
│  │ +225 07 12 34 56 │  │ Côte d'Ivoire       │             │
│  └──────────────────┘  └────────────────────┘             │
│                                                             │
│  INSCRIPTION                                                │
│  Référence: FANAF001                                        │
│  Statut: [Membre]                                           │
│  Organisation: Assurance CI                                 │
│  Date d'inscription: 15/01/2025                             │
│  Inscription: [Finalisée ✓]                                 │
│                                                             │
│  BADGE                                                      │
│  [🎫 Générer le badge]                                      │
│                                                             │
│  PLAN DE VOL                                                │
│  📍 Arrivée: AF4567 - 08/02/2026 14:30                      │
│     Paris → Abidjan                                         │
│                                                             │
│  📍 Départ: AF4568 - 12/02/2026 10:00                       │
│     Abidjan → Paris                                         │
│                                                             │
│                    [Modifier] [Supprimer]                   │
└─────────────────────────────────────────────────────────────┘
```

### Page Inscriptions - Membres

#### Vue Filtrée
```
┌──────────────────────────────────────────────────────────────┐
│  Inscriptions - Membres                  120 participants    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Statistiques:                                               │
│  • Finalisés: 110 (92%)                                      │
│  • Non finalisés: 10 (8%)                                    │
│  • Badges générés: 105                                       │
│                                                              │
│  [🔍 Recherche] [Filtres] [📥 Export] [🎫 Tous les badges]  │
│                                                              │
│  [Tableau identique à la liste complète, filtré]            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Page Inscriptions - VIP

#### Caractéristiques Spéciales
```
┌──────────────────────────────────────────────────────────────┐
│  Inscriptions - VIP                      35 participants     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ⚠️ Tarification VIP: EXONÉRATION (0 FCFA)                   │
│                                                              │
│  Plans de vol requis:                                        │
│  • Arrivées renseignées: 32/35                               │
│  • Départs renseignés: 30/35                                 │
│  • ⚠️ 3 VIP sans plan de vol                                 │
│                                                              │
│  [Tableau avec colonne Plan de Vol]                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Page Plans de Vol

#### Vue Dédiée
```
┌──────────────────────────────────────────────────────────────┐
│  Plans de vol                                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [Arrivées] [Départs]                                        │
│                                                              │
│  ARRIVÉES - 08 Février 2026                                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 06:00 - AF4561 │ Paris       │ 5 participants         │ │
│  │ 08:30 - ET507  │ Addis-Abeba │ 3 participants         │ │
│  │ 10:00 - KL592  │ Amsterdam   │ 2 participants         │ │
│  │ 14:30 - AF4567 │ Paris       │ 8 participants         │ │
│  │ ...                                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [📥 Exporter planning] [📧 Envoyer aux participants]        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Section Réservations de Stand

### Page Liste Complète

#### Vue d'Ensemble
```
┌──────────────────────────────────────────────────────────────┐
│  Réservations de stands                  48 stands réservés  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Statistiques:                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Total: 60    │  │ 9m²: 30/40   │  │ 12m²: 18/20  │      │
│  │ Réservés: 48 │  │ Réservés     │  │ Réservés     │      │
│  │ Dispo: 12    │  │ Dispo: 10    │  │ Dispo: 2     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Tableau des Réservations
```
┌────────────────────────────────────────────────────────────────┐
│ N° Stand │ Participant        │ Organisation  │ Taille │ 👁   │
├────────────────────────────────────────────────────────────────┤
│ A12      │ Koné Aminata       │ AXA Afrique   │ 9m²    │ 👁   │
│ A13      │ Mballa Christine   │ Allianz       │ 12m²   │ 👁   │
│ B05      │ Traoré Moussa      │ Sen Assur     │ 9m²    │ 👁   │
│ ...                                                            │
└────────────────────────────────────────────────────────────────┘
```

### Popup Détails Réservation
```
┌─────────────────────────────────────────────────────────────┐
│  Réservation Stand A12                                [✕]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  INFORMATIONS DU STAND                                      │
│  Numéro: A12                                                │
│  Taille: 9m²                                                │
│  Emplacement: Allée A, Position 12                          │
│                                                             │
│  TITULAIRE DE LA RÉSERVATION                                │
│  Nom: Koné Aminata                                          │
│  Email: a.kone@axa-afrique.com                              │
│  Téléphone: +225 05 45 67 89 01                             │
│                                                             │
│  ORGANISATION                                               │
│  AXA Afrique (Sponsor)                                      │
│  Côte d'Ivoire                                              │
│                                                             │
│  Date de réservation: 20/01/2025                            │
│                                                             │
│                    [Modifier] [Annuler]                     │
└─────────────────────────────────────────────────────────────┘
```

### Plan Interactif des Stands (Vue graphique)
```
┌──────────────────────────────────────────────────────────────┐
│  Plan des stands                            [Plan] [Liste]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│         Allée A              Allée B              Allée C    │
│                                                              │
│  ┌─────┐ ┌─────┐      ┌─────┐ ┌─────┐      ┌─────┐        │
│  │ A12 │ │ A13 │      │ B05 │ │ B06 │      │ C01 │        │
│  │ ✓   │ │ ✓   │      │ ✓   │ │     │      │ ✓   │        │
│  │ 9m² │ │ 12m²│      │ 9m² │ │ 9m² │      │ 9m² │        │
│  └─────┘ └─────┘      └─────┘ └─────┘      └─────┘        │
│                                                              │
│  Légende:                                                    │
│  ✓ = Réservé    □ = Disponible                              │
│  [9m²] [12m²]                                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Section Organisations

### Page Liste des Organisations

#### Vue Principale
```
┌──────────────────────────────────────────────────────────────┐
│  Liste des organisations                 23 organisations    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Statistiques:                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Membres      │  │ Non-membres  │  │ Sponsors     │      │
│  │ 12           │  │ 8            │  │ 3            │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  🔍 [Recherche]  Pays: [Tous ▼]                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Tableau des Organisations
```
┌────────────────────────────────────────────────────────────────────┐
│ Nom               │ Contact        │ Pays          │ Statut  │ 👁  │
├────────────────────────────────────────────────────────────────────┤
│ Assurance CI      │ contact@...    │ Côte d'Ivoire │ Membre  │ 👁  │
│ AXA Afrique       │ contact@...    │ Côte d'Ivoire │ Sponsor │ 👁  │
│ Sen Assur         │ info@...       │ Sénégal       │ Membre  │ 👁  │
│ Tech Insurance    │ info@...       │ Côte d'Ivoire │ Non-M.  │ 👁  │
│ ...                                                                │
└────────────────────────────────────────────────────────────────────┘
```

### Page Sponsors - ACCÈS SPÉCIAL ADMIN AGENCE

#### Interface de Gestion
```
┌──────────────────────────────────────────────────────────────┐
│  Sponsors                    3 sponsors    [➕ Créer sponsor]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ⭐ L'Admin Agence peut créer des sponsors et leurs référents│
│  ❌ AUCUNE visibilité sur les aspects financiers             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Modal Création Sponsor
```
┌─────────────────────────────────────────────────────────────┐
│  Créer un nouveau sponsor                             [✕]   │
│  Ajoutez un sponsor et son référent                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  INFORMATIONS DE L'ORGANISATION                             │
│  ┌──────────────────┐  ┌────────────────────┐             │
│  │ Nom *            │  │ Pays *              │             │
│  │ [____________]   │  │ [____________]      │             │
│  └──────────────────┘  └────────────────────┘             │
│                                                             │
│  ┌──────────────────┐  ┌────────────────────┐             │
│  │ Email *          │  │ Téléphone *         │             │
│  │ [____________]   │  │ [____________]      │             │
│  └──────────────────┘  └────────────────────┘             │
│                                                             │
│  RÉFÉRENT (Contact pour les rendez-vous)                    │
│  ┌──────────────────┐  ┌────────────────────┐             │
│  │ Nom *            │  │ Prénom *            │             │
│  │ [____________]   │  │ [____________]      │             │
│  └──────────────────┘  └────────────────────┘             │
│                                                             │
│  ┌──────────────────┐  ┌────────────────────┐             │
│  │ Email *          │  │ Téléphone *         │             │
│  │ [____________]   │  │ [____________]      │             │
│  └──────────────────┘  └────────────────────┘             │
│                                                             │
│  ┌────────────────────────────────────┐                    │
│  │ Fonction *                          │                    │
│  │ [Ex: Directeur Commercial_______]  │                    │
│  └────────────────────────────────────┘                    │
│                                                             │
│                [Annuler]  [Créer le sponsor]                │
└─────────────────────────────────────────────────────────────┘
```

### Popup Détails Organisation
```
┌─────────────────────────────────────────────────────────────┐
│  AXA Afrique                                          [✕]   │
│  Informations détaillées                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  INFORMATIONS GÉNÉRALES                                     │
│  Contact: +225 27 20 50 60 70                               │
│  Email: contact@axa-afrique.com                             │
│  Pays: Côte d'Ivoire                                        │
│  Statut: [Sponsor]                                          │
│                                                             │
│  RÉFÉRENT (Contact pour les rendez-vous)                    │
│  👤 Jean-Baptiste Kouassi                                   │
│  📧 jb.kouassi@axa-afrique.com                              │
│  📱 +225 05 45 67 89 01                                     │
│  💼 Directeur Commercial                                    │
│                                                             │
│  [🎫 Badge référent]  ← Générer badge du référent          │
│                                                             │
│  PARTICIPANTS DE CETTE ORGANISATION (3)                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • Koné Aminata - a.kone@axa.com [Membre]             │ │
│  │ • Diallo Fatoumata - f.diallo@axa.com [VIP]          │ │
│  │ • Yao Kouassi - y.kouassi@axa.com [Membre]           │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Section Networking

### Page Vue d'Ensemble

#### Statistiques et Calendrier
```
┌──────────────────────────────────────────────────────────────┐
│  Networking - Vue d'ensemble             156 rendez-vous     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Statistiques:                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Total RDV    │  │ Acceptés     │  │ En attente   │      │
│  │ 156          │  │ 98 (63%)     │  │ 45 (29%)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Occupés      │  │ RDV Part.    │  │ RDV Sponsor  │      │
│  │ 13 (8%)      │  │ 89           │  │ 67           │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Vue Calendrier
```
┌──────────────────────────────────────────────────────────────┐
│  📅 Calendrier des rendez-vous                               │
│                                                              │
│           Février 2026                [Liste] [Calendrier]   │
│                                                              │
│   Lun   Mar   Mer   Jeu   Ven   Sam   Dim                   │
│                              1     2                         │
│    3     4     5     6     7     8  [  9  ]  ← Jour 1       │
│  [ 10 ] [ 11 ]  12    13    14    15    16   ← Jours 2 & 3  │
│   17    18    19    20    21    22    23                    │
│   24    25    26    27    28    29                           │
│                                                              │
│  Rendez-vous du 9 Février:                                   │
│  • 09:00 - Koné Aminata ↔ AXA Afrique [Accepté]             │
│  • 10:30 - Diallo Moussa ↔ Allianz Africa [En attente]      │
│  • 14:00 - Marie Lambert ↔ AXA Afrique [Accepté]            │
│  ...                                                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Page Rendez-vous Participants

#### Tableau des RDV
```
┌────────────────────────────────────────────────────────────────────────┐
│  Rendez-vous participants                89 rendez-vous               │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Filtres: Statut [Tous ▼]  Date [Toutes ▼]                           │
│                                                                        │
│  Date/Heure │ Participant 1   │ Participant 2   │ Statut    │ 👁      │
├────────────────────────────────────────────────────────────────────────┤
│ 09/02 09:00 │ Koné Aminata    │ Diallo Fatoumata│ Accepté   │ 👁      │
│ 09/02 10:30 │ Jean Dupont     │ Marie Lambert   │ En attente│ 👁      │
│ 09/02 11:00 │ Traoré Moussa   │ Yao Kouassi     │ Occupé    │ 👁      │
│ ...                                                                    │
└────────────────────────────────────────────────────────────────────────┘
```

### Page Rendez-vous Sponsors

#### Tableau Spécifique
```
┌────────────────────────────────────────────────────────────────────────┐
│  Rendez-vous sponsors                    67 rendez-vous               │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Date/Heure │ Participant     │ Sponsor         │ Statut    │ 👁      │
├────────────────────────────────────────────────────────────────────────┤
│ 09/02 09:00 │ Koné Aminata    │ AXA Afrique     │ Accepté   │ 👁      │
│ 09/02 10:30 │ Diallo Moussa   │ Allianz Africa  │ En attente│ 👁      │
│ 09/02 14:00 │ Marie Lambert   │ AXA Afrique     │ Accepté   │ 👁      │
│ ...                                                                    │
└────────────────────────────────────────────────────────────────────────┘
```

### Popup Détails Rendez-vous
```
┌─────────────────────────────────────────────────────────────┐
│  Rendez-vous                                          [✕]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📅 09 Février 2026 - 09:00                                 │
│  ⏱️  Durée: 30 minutes                                      │
│                                                             │
│  PARTICIPANT                                                │
│  👤 Koné Aminata                                            │
│  📧 a.kone@axa-afrique.com                                  │
│  🏢 AXA Afrique                                             │
│                                                             │
│  SPONSOR                                                    │
│  🏛️ AXA Afrique                                             │
│  👤 Référent: Jean-Baptiste Kouassi                         │
│  📧 jb.kouassi@axa-afrique.com                              │
│                                                             │
│  STATUT                                                     │
│  [✓ Accepté]                                                │
│                                                             │
│  💬 Message du participant:                                 │
│  "Souhait de discuter d'une collaboration commerciale"     │
│                                                             │
│                    [Modifier] [Annuler RDV]                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Section Comité d'Organisation

### Page Gestion des Membres

#### Vue Principale
```
┌──────────────────────────────────────────────────────────────┐
│  Comité d'organisation               12 membres              │
│                                      [➕ Ajouter un membre]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Statistiques:                                               │
│  • Caissiers: 5                                              │
│  • Agents de scan: 7                                         │
│                                                              │
│  🔍 [Recherche]  Profil: [Tous ▼]                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Tableau des Membres
```
┌────────────────────────────────────────────────────────────────┐
│ Nom Complet      │ Email           │ Profil       │ Actions   │
├────────────────────────────────────────────────────────────────┤
│ Fatou Diallo     │ f.diallo@...    │ Caissier     │ ✏️  🗑️    │
│ Mamadou Traoré   │ m.traore@...    │ Agent scan   │ ✏️  🗑️    │
│ Aissata Koné     │ a.kone@...      │ Caissier     │ ✏️  🗑️    │
│ Youssouf Sidibé  │ y.sidibe@...    │ Agent scan   │ ✏️  🗑️    │
│ ...                                                            │
└────────────────────────────────────────────────────────────────┘
```

### Modal Ajout Membre
```
┌─────────────────────────────────────────────────────────────┐
│  Ajouter un membre du comité                          [✕]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌────────────────────┐             │
│  │ Nom *            │  │ Prénom *            │             │
│  │ [____________]   │  │ [____________]      │             │
│  └──────────────────┘  └────────────────────┘             │
│                                                             │
│  ┌────────────────────────────────────┐                    │
│  │ Email *                             │                    │
│  │ [__________________________]       │                    │
│  └────────────────────────────────────┘                    │
│                                                             │
│  ┌────────────────────────────────────┐                    │
│  │ Profil *                            │                    │
│  │ [ Caissier ▼ ]                     │                    │
│  └────────────────────────────────────┘                    │
│     Options: Caissier, Agent de scan                        │
│                                                             │
│  ℹ️ Profils:                                                │
│  • Caissier: Gestion des paiements                          │
│  • Agent de scan: Scan des badges                           │
│                                                             │
│                    [Annuler]  [Ajouter]                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Module Check-In

### Interface de Scan

#### Vue Principale
```
┌──────────────────────────────────────────────────────────────┐
│  Check-in Participants                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Statistiques du jour:                                       │
│  • Check-in effectués: 187/245 (76%)                         │
│  • En attente: 58                                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │          SCANNER LE QR CODE DU BADGE                   │ │
│  │                                                        │ │
│  │              ┌────────────────┐                        │ │
│  │              │                │                        │ │
│  │              │   [QR SCAN]    │                        │ │
│  │              │   ZONE ACTIVE  │                        │ │
│  │              │                │                        │ │
│  │              └────────────────┘                        │ │
│  │                                                        │ │
│  │     Ou saisir manuellement la référence:               │ │
│  │     [_______________]  [Valider]                       │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  DERNIERS CHECK-IN:                                          │
│  ✓ 14:23 - Jean Dupont (FANAF001)                           │
│  ✓ 14:25 - Marie Lambert (FANAF002)                         │
│  ✓ 14:28 - Koné Aminata (FANAF007)                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Écran de Validation

#### Après Scan Réussi
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                  ✅ CHECK-IN VALIDÉ                         │
│                                                             │
│              ┌─────────────────────────┐                    │
│              │    [Photo Profile]      │                    │
│              └─────────────────────────┘                    │
│                                                             │
│                 Jean Dupont                                 │
│                 FANAF001                                    │
│                                                             │
│              Assurance CI - Membre                          │
│                                                             │
│              ✓ Accès autorisé                               │
│              ⏰ 14:23 - 09/02/2026                           │
│                                                             │
│                  [Scanner suivant]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Alerte Badge Déjà Scanné
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                  ⚠️ ATTENTION                               │
│                                                             │
│              Badge déjà scanné 3 fois                       │
│                                                             │
│              Jean Dupont (FANAF001)                         │
│                                                             │
│              Scans précédents:                              │
│              • 09/02 08:30                                  │
│              • 09/02 10:15                                  │
│              • 09/02 14:00                                  │
│                                                             │
│              [Signaler] [Autoriser quand même]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Système de Notifications

### Centre de Notifications

#### Icône Cloche avec Badge
```
┌────────────────────────────┐
│  [🔔 3]  ← Badge de count  │
└────────────────────────────┘
```

#### Panneau Déroulant
```
┌─────────────────────────────────────────────────────────────┐
│  Notifications (3 non lues)           [Tout marquer comme lu]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🟦 INSCRIPTION - HAUTE                                     │
│  Inscription non finalisée                                  │
│  3 inscriptions non finalisées depuis plus de 48h           │
│  Il y a 2 heures                                            │
│                                                             │
│  🟧 RENDEZ-VOUS - MOYENNE                                   │
│  Nouvelles demandes de rendez-vous                          │
│  5 demandes de rendez-vous sponsor en attente               │
│  Il y a 3 heures                                            │
│                                                             │
│  🟦 VOL - HAUTE                                             │
│  Plans de vol manquants                                     │
│  4 participants VIP n'ont pas fourni leurs plans            │
│  Hier                                                       │
│                                                             │
│  🟩 ALERTE - BASSE (Lu)                                     │
│  Nouvelle organisation inscrite                             │
│  Tech Insurance Solutions vient de s'inscrire               │
│  Il y a 2 jours                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Notifications Push (Popup)

#### En Haut à Droite
```
┌─────────────────────────────────────────┐
│  🔔 Nouvelle inscription                │
│                                         │
│  Marie Lambert (VIP) vient de finaliser│
│  son inscription                        │
│                                         │
│  Il y a 30 secondes              [✕]   │
└─────────────────────────────────────────┘
```

#### Types de Notifications pour Admin Agence

**✅ Reçues** :
- 📊 Nouvelles inscriptions
- 🤝 Demandes de rendez-vous
- ✈️ Plans de vol manquants
- ⚠️ Alertes générales

**❌ NON reçues** :
- 💰 Notifications de paiement (EXCLUSIF Admin FANAF)
- 💳 Transactions financières
- 📈 Rapports financiers

---

## Parcours Utilisateur Types

### Parcours 1: Gestion d'une Nouvelle Inscription

1. **Navigation**: Sidebar → Inscriptions → Liste complète
2. **Action**: Clic sur un participant "Non finalisé"
3. **Popup**: Détails du participant s'ouvre
4. **Modification**: Admin peut modifier/compléter les informations
5. **Validation**: Changement du statut à "Finalisé"
6. **Badge**: Génération du badge si besoin
7. **Notification**: Confirmation de la mise à jour

### Parcours 2: Création d'un Sponsor

1. **Navigation**: Sidebar → Organisations → Sponsors
2. **Action**: Clic sur "➕ Créer un sponsor"
3. **Formulaire**: Remplissage des infos organisation + référent
4. **Validation**: Vérification que tous les champs requis sont remplis
5. **Création**: Sponsor ajouté à la liste
6. **Badge Référent**: Possibilité de générer le badge du référent
7. **Notification**: "Sponsor créé avec succès"

### Parcours 3: Gestion des Rendez-vous

1. **Navigation**: Sidebar → Networking → Rendez-vous Sponsors
2. **Consultation**: Visualisation de la liste des RDV
3. **Filtre**: Filtrer par "En attente"
4. **Action**: Clic sur un RDV pour voir les détails
5. **Modification**: Possibilité de changer le statut
6. **Calendrier**: Basculer sur la vue calendrier
7. **Export**: Télécharger le planning des RDV

### Parcours 4: Check-In Jour J

1. **Navigation**: Sidebar → Check-in
2. **Scan**: Scanner le QR code du badge participant
3. **Validation**: Vérification de l'inscription
4. **Confirmation**: Affichage des infos participant + "Accès autorisé"
5. **Alerte**: Si badge déjà scanné → Popup d'avertissement
6. **Options**: Autoriser quand même OU Signaler le problème
7. **Suivant**: Scanner le participant suivant

### Parcours 5: Génération de Badges en Masse

1. **Navigation**: Sidebar → Inscriptions → Membres
2. **Action**: Clic sur "🎫 Tous les badges"
3. **Traitement**: Génération de tous les badges en ZIP
4. **Notification Toast**: "Génération de 120 badges en cours..."
5. **Download**: Téléchargement automatique du fichier ZIP
6. **Confirmation**: "120 badges téléchargés avec succès"

---

## Éléments d'Interface Récurrents

### Boutons Standards

```
┌─────────────────────┐
│  [Action primaire]  │  ← Orange (#F97316)
└─────────────────────┘

┌─────────────────────┐
│  [Action secondaire]│  ← Bordure grise
└─────────────────────┘

┌─────────────────────┐
│  [❌ Supprimer]     │  ← Rouge (destructif)
└─────────────────────┘
```

### Badges de Statut

```
[Membre]        ← Vert (#22C55E)
[Non-membre]    ← Gris (#6B7280)
[VIP]           ← Violet (#8B5CF6)
[Speaker]       ← Bleu (#3B82F6)
[Sponsor]       ← Ambre (#F59E0B)
```

### États Interactifs

- **Hover**: Légère élévation + changement de couleur
- **Active**: Bordure orange épaisse
- **Disabled**: Gris + opacité réduite
- **Loading**: Spinner orange + texte "Chargement..."

### Animations

- **Page Enter**: Fade in + slide up (200ms)
- **Modal Open**: Scale up + fade in (150ms)
- **Toast Notification**: Slide in from right (300ms)
- **Hover Cards**: Subtle lift (100ms)

---

## Responsive Design

### Mobile (< 768px)

- Sidebar se transforme en menu hamburger
- Tableaux deviennent des cartes empilées
- Statistiques sur 1 colonne au lieu de 4
- Modales en plein écran

### Tablet (768px - 1024px)

- Sidebar réduite (icônes uniquement)
- Statistiques sur 2 colonnes
- Tableaux scrollables horizontalement

### Desktop (> 1024px)

- Layout complet comme décrit
- Sidebar complète toujours visible
- Grilles et tableaux en pleine largeur

---

## Accessibilité

### Contraste
- Ratio minimum 4.5:1 pour le texte
- Icônes toujours accompagnées de texte

### Navigation Clavier
- Tab pour naviguer entre les éléments
- Enter pour activer les boutons
- Escape pour fermer les modales
- Flèches pour les menus déroulants

### Lecteurs d'Écran
- Labels aria sur tous les éléments interactifs
- Annonces pour les mises à jour dynamiques
- Structure sémantique HTML5

---

## Codes Couleur de l'Interface

### Palette Principale

**Orange (Primaire)** :
- `#EA580C` - Orange 600 (foncé)
- `#F97316` - Orange 500 (principal)
- `#FB923C` - Orange 400 (clair)
- `#FED7AA` - Orange 200 (très clair)

**Gris (Neutre)** :
- `#111827` - Gray 900 (texte principal)
- `#374151` - Gray 700 (texte secondaire)
- `#6B7280` - Gray 500 (texte tertiaire)
- `#E5E7EB` - Gray 200 (bordures)
- `#F9FAFB` - Gray 50 (arrière-plans)

**Statuts** :
- `#22C55E` - Vert (succès, membres)
- `#EF4444` - Rouge (erreur, suppression)
- `#3B82F6` - Bleu (info, speakers)
- `#8B5CF6` - Violet (VIP)
- `#F59E0B` - Ambre (sponsors)

---

## Typographie

### Hiérarchie

- **H1**: 2rem (32px) - Titres de page
- **H2**: 1.5rem (24px) - Sous-titres
- **H3**: 1.25rem (20px) - Titres de section
- **Body**: 1rem (16px) - Texte principal
- **Small**: 0.875rem (14px) - Texte secondaire
- **Tiny**: 0.75rem (12px) - Légendes

### Police

- **Famille**: System Font Stack (Inter, -apple-system, BlinkMacSystemFont, etc.)
- **Poids**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

---

## Export et Impression

### Formats d'Export Disponibles

1. **CSV**: Toutes les listes (participants, organisations, RDV)
2. **PDF**: 
   - Badges individuels
   - Planning des vols
   - Liste des rendez-vous
3. **ZIP**: 
   - Badges en masse
   - Badges référents

### Boutons d'Export
```
[📥 Exporter CSV]
[📄 Exporter PDF]
[📦 Télécharger ZIP]
```

---

## Notes Techniques

### Contraintes Admin Agence

❌ **AUCUN ACCÈS** :
- Module Finance
- Montants et tarifs
- Modes de paiement
- Statuts de paiement
- Rapports financiers

✅ **ACCÈS COMPLET** :
- Toutes les autres sections
- Création et modification
- Export de données
- Génération de badges
- Gestion des sponsors (hors finances)

---

## Conclusion

Cette maquette détaille l'ensemble des écrans et parcours disponibles pour l'**Administrateur Agence de Communication** du back-office FANAF 2026. 

L'interface est conçue pour être :
- **Intuitive** : Navigation claire et logique
- **Efficace** : Actions rapides et accessibles
- **Complète** : Gestion de tous les aspects opérationnels
- **Sécurisée** : Séparation stricte des accès financiers

---

**Document généré le** : 25 Octobre 2025  
**Version** : 1.0  
**Événement** : FANAF 2026 (9-11 Février 2026)  
**Profil** : Administrateur Agence de Communication

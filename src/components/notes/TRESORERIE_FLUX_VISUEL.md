# Flux Visuel - Module Trésorerie FANAF 2026

## 🎨 Architecture Complète

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PARTICIPANT S'INSCRIT                               │
│                  (Membre ou Non-membre)                                 │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────┐
                  │   Choix Mode Paiement    │
                  └──────────────┬───────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
    ┌─────────────────┐  ┌─────────────┐  ┌─────────────────┐
    │   🪙 Espèce     │  │ 🏦 Virement │  │ 💳 Électronique │
    │                 │  │             │  │  (Carte/OM/Wave)│
    └────────┬────────┘  └──────┬──────┘  └────────┬────────┘
             │                  │                   │
             │                  │                   │
             └──────────┬───────┘                   │
                        │                           │
                        ▼                           ▼
              ┌──────────────────┐        ┌─────────────────┐
              │  CANAL FANAF 🏦  │        │ CANAL ASAPAY 💳 │
              ├──────────────────┤        ├─────────────────┤
              │ • Espèce         │        │ • Carte         │
              │ • Virement       │        │ • Orange Money  │
              │                  │        │ • Wave          │
              │ 60% encaissements│        │ 40% encaissements│
              └────────┬─────────┘        └────────┬────────┘
                       │                           │
                       │                           │
                       └──────────┬────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │  TRÉSORERIE GÉNÉRALE 🟠  │
                    ├──────────────────────────┤
                    │ Compilation FANAF+ASAPAY │
                    │                          │
                    │ ✅ Revenu Total          │
                    │ ✅ Inscriptions Payées   │
                    │ ✅ À Encaisser           │
                    │ ✅ Tous modes paiement   │
                    └──────────────────────────┘
```

---

## 📊 Vue Détaillée par Trésorerie

### 1️⃣ Trésorerie FANAF (Institutionnel)

```
┌────────────────────────────────────────────────────────────┐
│              🔵 TRÉSORERIE FANAF                           │
│         "Espèce & Virement" (Badge bleu)                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📋 STATISTIQUES PRINCIPALES                               │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │  Revenu Total    │  │ Inscriptions     │              │
│  │  270.000 FCFA    │  │ Payées: 90       │              │
│  └──────────────────┘  └──────────────────┘              │
│                                                            │
│  📊 DÉTAILS PAR CATÉGORIE                                  │
│  ┌──────────┬──────────┬────────┬──────────┐             │
│  │ Membres  │Non-Mbres │  VIP   │ Speakers │             │
│  │ 150K     │ 120K     │   0    │    0     │             │
│  │ 30 payés │ 60 payés │   -    │    -     │             │
│  └──────────┴──────────┴────────┴──────────┘             │
│                                                            │
│  💰 MODES DE PAIEMENT                                      │
│  ┌────────────────────┬────────────────────┐              │
│  │   🪙 Espèce       │   🏦 Virement      │              │
│  │   150.000 FCFA    │   120.000 FCFA     │              │
│  └────────────────────┴────────────────────┘              │
│                                                            │
│  📈 GRAPHIQUES                                             │
│  [Bar Chart: Revenus par catégorie]                       │
│  [Pie Chart: Répartition Espèce/Virement]                 │
│                                                            │
│  🔽 EXPORT                                                 │
│  [Bouton: Exporter Trésorerie FANAF]                      │
└────────────────────────────────────────────────────────────┘
```

### 2️⃣ Trésorerie ASAPAY (Fintech)

```
┌────────────────────────────────────────────────────────────┐
│              🟣 TRÉSORERIE ASAPAY                          │
│    "Paiements électroniques" (Badge violet)               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📋 STATISTIQUES PRINCIPALES                               │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │  Revenu Total    │  │ Inscriptions     │              │
│  │  180.000 FCFA    │  │ Payées: 60       │              │
│  └──────────────────┘  └──────────────────┘              │
│                                                            │
│  📊 DÉTAILS PAR CATÉGORIE                                  │
│  ┌──────────┬──────────┬────────┬──────────┐             │
│  │ Membres  │Non-Mbres │  VIP   │ Speakers │             │
│  │ 100K     │  80K     │   0    │    0     │             │
│  │ 20 payés │ 40 payés │   -    │    -     │             │
│  └──────────┴──────────┴────────┴──────────┘             │
│                                                            │
│  💳 MODES DE PAIEMENT                                      │
│  ┌──────────┬─────────────┬──────────────┐               │
│  │ 💳 Carte │ 📱 Orange M │  🌊 Wave     │               │
│  │  80K     │    60K      │    40K       │               │
│  └──────────┴─────────────┴──────────────┘               │
│                                                            │
│  📈 GRAPHIQUES                                             │
│  [Bar Chart: Revenus par catégorie]                       │
│  [Pie Chart: Répartition Carte/OM/Wave]                   │
│                                                            │
│  🔽 EXPORT                                                 │
│  [Bouton: Exporter Trésorerie ASAPAY]                     │
└────────────────────────────────────────────────────────────┘
```

### 3️⃣ Trésorerie Générale (Consolidation)

```
┌────────────────────────────────────────────────────────────┐
│              🟠 TRÉSORERIE GÉNÉRALE                        │
│        "Compilation FANAF + ASAPAY"                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📋 STATISTIQUES PRINCIPALES                               │
│  ┌──────────┬──────────┬─────────────────────┐           │
│  │  Revenu  │Inscript. │    À Encaisser      │           │
│  │  Total   │ Payées   │  (En attente)       │           │
│  │  450K    │   150    │      75.000 FCFA    │           │
│  └──────────┴──────────┴─────────────────────┘           │
│                                                            │
│  📊 DÉTAILS PAR CATÉGORIE                                  │
│  ┌──────────┬──────────┬────────┬──────────┐             │
│  │ Membres  │Non-Mbres │  VIP   │ Speakers │             │
│  │ 250K     │ 200K     │  10    │    5     │             │
│  │50p+10at  │100p+5at  │   -    │    -     │             │
│  └──────────┴──────────┴────────┴──────────┘             │
│                                                            │
│  💰 MODES DE PAIEMENT (TOUS)                               │
│  ┌────┬────┬────┬────┬────┐                              │
│  │ 🪙 │ 🏦 │ 💳 │ 📱 │ 🌊 │                              │
│  │150K│120K│ 80K│ 60K│ 40K│                              │
│  └────┴────┴────┴────┴────┘                              │
│                                                            │
│  📈 GRAPHIQUES                                             │
│  [Bar Chart: Revenus par catégorie]                       │
│  [Pie Chart: Répartition tous modes]                      │
│                                                            │
│  🔽 EXPORT                                                 │
│  [Bouton: Exporter Trésorerie Générale]                   │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux de Données Dynamiques

### Scénario 1 : Inscription au Stand FANAF

```
┌──────────────┐
│  PARTICIPANT │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│ Présente au stand FANAF  │
│ "Je veux m'inscrire"     │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Agent FANAF             │
│  "350K FCFA (membre)"    │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Participant paie         │
│ 🪙 ESPÈCE : 350K         │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Attribution Automatique  │
│ mode = 'espèce'         │
│ canal = 'fanaf'         │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Enregistrement BDD       │
│ statutInscription = OK   │
└──────────┬───────────────┘
           │
           ├─────────────────────────┐
           │                         │
           ▼                         ▼
    ┌─────────────┐        ┌──────────────┐
    │ Trésorerie  │        │  Trésorerie  │
    │   FANAF     │        │   GÉNÉRALE   │
    │  +350K      │        │    +350K     │
    └─────────────┘        └──────────────┘
```

### Scénario 2 : Inscription en Ligne via ASAPAY

```
┌──────────────┐
│  PARTICIPANT │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│ Site web FANAF 2026      │
│ "S'inscrire en ligne"    │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Formulaire inscription  │
│  Type: Non-membre        │
│  Montant: 400K FCFA      │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Choix mode paiement      │
│ 📱 ORANGE MONEY          │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Redirection ASACI Tech   │
│ Passerelle Orange Money  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Paiement réussi ✅       │
│ Callback webhook         │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Attribution Automatique  │
│ mode = 'orange money'   │
│ canal = 'asapay'        │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Enregistrement BDD       │
│ statutInscription = OK   │
│ Email confirmation       │
└──────────┬───────────────┘
           │
           ├─────────────────────────┐
           │                         │
           ▼                         ▼
    ┌─────────────┐        ┌──────────────┐
    │ Trésorerie  │        │  Trésorerie  │
    │   ASAPAY    │        │   GÉNÉRALE   │
    │  +400K      │        │    +400K     │
    └─────────────┘        └──────────────┘
```

### Scénario 3 : Virement Bancaire Entreprise

```
┌──────────────┐
│ ORGANISATION │
│  (Membre)    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│ Inscription de 5 pers.   │
│ 5 × 350K = 1.750.000 FCFA│
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Trésorier décide         │
│ "Paiement par virement"  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Effectue le virement     │
│ 🏦 Compte FANAF          │
│ Ref: FANAF2026-ORG-001   │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Relevé bancaire FANAF    │
│ Virement détecté         │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Agent FANAF valide       │
│ Marque 5 inscrits OK     │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Attribution Automatique  │
│ mode = 'virement'       │
│ canal = 'fanaf'         │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Enregistrement BDD       │
│ statutInscription = OK   │
│ × 5 participants         │
└──────────┬───────────────┘
           │
           ├─────────────────────────┐
           │                         │
           ▼                         ▼
    ┌─────────────┐        ┌──────────────┐
    │ Trésorerie  │        │  Trésorerie  │
    │   FANAF     │        │   GÉNÉRALE   │
    │  +1.750K    │        │   +1.750K    │
    └─────────────┘        └──────────────┘
```

---

## 🎯 Points de Contrôle

### Validation du Canal

```typescript
// ✅ VALIDE
{
  mode: 'espèce',
  canal: 'fanaf'
}

{
  mode: 'virement',
  canal: 'fanaf'
}

{
  mode: 'carte',
  canal: 'asapay'
}

{
  mode: 'orange money',
  canal: 'asapay'
}

{
  mode: 'wave',
  canal: 'asapay'
}

// ❌ INVALIDE (impossible par le code)
{
  mode: 'espèce',
  canal: 'asapay'  // ❌ Espèce n'est que chez FANAF
}

{
  mode: 'carte',
  canal: 'fanaf'  // ❌ Carte n'est que chez ASAPAY
}
```

---

## 📊 Dashboard Admin FANAF - Navigation

```
┌─────────────────────────────────────────────────────────────┐
│  ADMIN FANAF DASHBOARD                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Sidebar:                                                   │
│  ├─ 🏠 Accueil                                              │
│  ├─ 📝 Inscriptions (lecture seule)                         │
│  ├─ 🏢 Organisations (lecture seule)                        │
│  ├─ 🤝 Networking (lecture seule)                           │
│  ├─ 👥 Comité (lecture seule)                               │
│  └─ 💰 TRÉSORERIE ◀── Accès complet                        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         MODULE TRÉSORERIE                             │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │                                                       │ │
│  │  ┌──────────┬──────────┬──────────┐                  │ │
│  │  │ Générale │  FANAF   │  ASAPAY  │ ◀── Onglets      │ │
│  │  │   🟠     │   🔵     │   🟣     │                  │ │
│  │  └──────────┴──────────┴──────────┘                  │ │
│  │                                                       │ │
│  │  [Contenu trésorerie sélectionnée]                   │ │
│  │                                                       │ │
│  │  • Statistiques principales                          │ │
│  │  • Détails par catégorie                             │ │
│  │  • Graphiques                                        │ │
│  │  • Modes de paiement                                 │ │
│  │  • Export                                            │ │
│  │                                                       │ │
│  └───────────────────────��───────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Codes Couleur Interface

| Élément | Couleur | Utilisation |
|---------|---------|-------------|
| 🟠 Orange | `#f97316` | Trésorerie Générale, Boutons principaux |
| 🔵 Bleu | `#3b82f6` | Trésorerie FANAF, Badges institutionnels |
| 🟣 Violet | `#9333ea` | Trésorerie ASAPAY, Badges fintech |
| 🟢 Vert | `#22c55e` | Revenus, Paiements validés, Espèce |
| 🔴 Rouge | `#ef4444` | Alertes, Échecs, À encaisser |
| ⚪ Gris | `#6b7280` | Textes secondaires, Désactivé |

---

## 📈 Métriques Temps Réel

```
TRÉSORERIE GÉNÉRALE
┌─────────────────────────────────┐
│ Revenu Total    : 450.000 FCFA  │  ⬆️ +350K (78%)
│ Inscriptions    : 150 payées    │  ⬆️ +90 (60%)
│ À Encaisser     : 75.000 FCFA   │  ⬇️ En baisse
└─────────────────────────────────┘

TRÉSORERIE FANAF (60% du total)
┌─────────────────────────────────┐
│ Revenu Total    : 270.000 FCFA  │  🪙 50% | 🏦 50%
│ Inscriptions    : 90 payées     │  📊 60% du total
│ Espèce          : 135.000 FCFA  │
│ Virement        : 135.000 FCFA  │
└─────────────────────────────────┘

TRÉSORERIE ASAPAY (40% du total)
┌─────────────────────────────────┐
│ Revenu Total    : 180.000 FCFA  │  💳 44% | 📱 33% | 🌊 23%
│ Inscriptions    : 60 payées     │  📊 40% du total
│ Carte           : 80.000 FCFA   │
│ Orange Money    : 60.000 FCFA   │
│ Wave            : 40.000 FCFA   │
└─────────────────────────────────┘
```

---

*Document créé le 27 octobre 2025*  
*Version 2.0 - Visualisation complète module Trésorerie*

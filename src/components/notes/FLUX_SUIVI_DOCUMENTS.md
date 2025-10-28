# 🔄 FLUX DE SUIVI DES DOCUMENTS

## 📊 Diagramme de flux complet

```
┌─────────────────────────────────────────────────────────────┐
│                    ÉVÉNEMENT FANAF 2026                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              AGENT D'INSCRIPTION                            │
│  • Crée l'inscription                                       │
│  • Génère facture proforma                                  │
│  • Statut: "en attente de paiement"                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              OPÉRATEUR CAISSE                               │
│  • Reçoit le paiement                                       │
│  • Finalise l'inscription                                   │
│  • Statut: "validé" ou "payé"                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              OPÉRATEUR BADGE                                │
│  ┌─────────────────────────────────────────────┐           │
│  │  ÉTAPE 1: Génération des documents          │           │
│  │  • Badge                                     │           │
│  │  • Lettre d'invitation                       │           │
│  │  • Facture                                   │           │
│  │  • Reçu de paiement                         │           │
│  └─────────────────────────────────────────────┘           │
│                      │                                       │
│                      ▼                                       │
│  ┌─────────────────────────────────────────────┐           │
│  │  ÉTAPE 2: Suivi de la remise     ← NOUVEAU │           │
│  │                                              │           │
│  │  [  ] Badge                                  │           │
│  │  [  ] Lettre                                 │           │
│  │  [  ] Facture                                │           │
│  │  [  ] Reçu                                   │           │
│  │  [  ] Kit                                    │           │
│  │                                              │           │
│  │  Progression: 0/5                            │           │
│  └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              PARTICIPANT                                     │
│  • Arrive au stand                                          │
│  • Présente son identité                                    │
│  • Reçoit ses documents progressivement                     │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Cycle de vie d'un participant

```
┌──────────────┐
│  Inscription │ (Agent)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Paiement   │ (Caisse)
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│          Génération Documents             │ (Badge)
│  • Badge créé                             │
│  • Lettre créée                           │
│  • Facture disponible                     │
│  • Reçu disponible                        │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│      Remise Progressive Documents         │ (Badge - NOUVEAU)
│                                           │
│  Jour 1:                                  │
│  ✅ Badge              [14:30]            │
│  ✅ Lettre             [14:30]            │
│  ❌ Facture                                │
│  ❌ Reçu                                   │
│  ❌ Kit                                    │
│  Progression: 2/5 (40%)                   │
│                                           │
│  Jour 2:                                  │
│  ✅ Badge              [14:30]            │
│  ✅ Lettre             [14:30]            │
│  ✅ Facture            [09:15]            │
│  ✅ Reçu               [09:15]            │
│  ✅ Kit                [09:20]            │
│  Progression: 5/5 (100%) ✅               │
└───────────────────────────────────────────┘
```

## 🎯 États du participant

### État 1 : Non démarré (0/5)
```
Participant: John Doe
┌────────────────────────────┐
│  [  ] Badge                │
│  [  ] Lettre               │
│  [  ] Facture              │
│  [  ] Reçu                 │
│  [  ] Kit                  │
│                            │
│  ░░░░░░░░░░░░░░░░ 0/5      │
└────────────────────────────┘
Statut: ⚪ Aucun document remis
Action: Contacter le participant
```

### État 2 : En cours (2/5)
```
Participant: Jane Smith
┌────────────────────────────┐
│  [✓] Badge    15/01 14:30  │
│  [✓] Lettre   15/01 14:30  │
│  [  ] Facture              │
│  [  ] Reçu                 │
│  [  ] Kit                  │
│                            │
│  ████████░░░░░░░░ 2/5      │
└────────────────────────────┘
Statut: 🟠 Documents partiels
Action: Compléter le dossier
```

### État 3 : Presque complet (4/5)
```
Participant: Bob Johnson
┌────────────────────────────┐
│  [✓] Badge    16/01 09:00  │
│  [✓] Lettre   16/01 09:00  │
│  [✓] Facture  16/01 09:05  │
│  [✓] Reçu     16/01 09:05  │
│  [  ] Kit                  │
│                            │
│  ████████████████░░ 4/5    │
└────────────────────────────┘
Statut: 🟡 Presque terminé
Action: Donner le kit
```

### État 4 : Complet (5/5)
```
Participant: Alice Williams
┌────────────────────────────┐
│  [✓] Badge    17/01 10:00  │
│  [✓] Lettre   17/01 10:00  │
│  [✓] Facture  17/01 10:05  │
│  [✓] Reçu     17/01 10:05  │
│  [✓] Kit      17/01 10:10  │
│                            │
│  ████████████████████ 5/5  │
└────────────────────────────┘
Statut: 🟢 Dossier complet
Action: Aucune - Participant prêt
```

## 🔀 Scénarios d'utilisation

### Scénario A : Remise échelonnée
```
📅 JOUR 1 - Avant l'événement
┌────────────────────────────────────┐
│ Participant arrive                 │
│ • Récupère badge                   │
│ • Récupère lettre                  │
│ • N'a pas le temps pour le reste   │
└────────────────────────────────────┘
         │
         │ Opérateur coche:
         │ ✅ Badge
         │ ✅ Lettre
         │
         ▼
┌────────────────────────────────────┐
│ État enregistré: 2/5               │
│ Progression: 40%                   │
└────────────────────────────────────┘

📅 JOUR 2 - Jour de l'événement
┌────────────────────────────────────┐
│ Participant revient                │
│ • Récupère facture                 │
│ • Récupère reçu                    │
│ • Récupère kit                     │
└────────────────────────────────────┘
         │
         │ Opérateur coche:
         │ ✅ Facture
         │ ✅ Reçu
         │ ✅ Kit
         │
         ▼
┌────────────────────────────────────┐
│ État enregistré: 5/5 ✅            │
│ Progression: 100%                  │
│ Dossier complet !                  │
└────────────────────────────────────┘
```

### Scénario B : Remise en une fois
```
📅 JOUR DE L'ÉVÉNEMENT
┌────────────────────────────────────┐
│ Participant arrive                 │
│ • Tous les documents prêts         │
│ • Kit disponible                   │
└────────────────────────────────────┘
         │
         │ Opérateur clique:
         │ "Tout marquer comme remis"
         │
         ▼
┌────────────────────────────────────┐
│ Tous cochés automatiquement:       │
│ ✅ Badge    [10:00]                │
│ ✅ Lettre   [10:00]                │
│ ✅ Facture  [10:00]                │
│ ✅ Reçu     [10:00]                │
│ ✅ Kit      [10:00]                │
└────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ État enregistré: 5/5 ✅            │
│ Progression: 100%                  │
│ Temps: < 30 secondes               │
└────────────────────────────────────┘
```

## 📊 Dashboard en temps réel

```
┌──────────────────────────────────────────────────────────┐
│                  TABLEAU DE BORD                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📊 STATISTIQUES DU JOUR                                 │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Total     │  │  Complets   │  │  En cours   │     │
│  │    156      │  │     89      │  │     45      │     │
│  │    👥       │  │     ✅      │  │     🟠      │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Aucun     │  │  Taux       │  │ Objectif    │     │
│  │     22      │  │    57%      │  │    80%      │     │
│  │     ⚪      │  │    📈       │  │    🎯       │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📋 PARTICIPANTS À TRAITER (filtré sur "En cours")       │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Nom          │ Docs │ Progression │ Dernier doc   │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ John Doe     │ 2/5  │ ████░░░░░░  │ 15/01 14:30  │ │
│  │ Jane Smith   │ 3/5  │ ██████░░░░  │ 15/01 16:45  │ │
│  │ Bob Johnson  │ 4/5  │ ████████░░  │ 16/01 09:05  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 🎯 Objectifs par période

### J-30 (30 jours avant)
```
Objectif: Préparer les documents
┌────────────────────────────────┐
│ Documents générés: 80%         │
│ Documents prêts: 60%           │
│ Remis: 0%                      │
└────────────────────────────────┘
```

### J-7 (7 jours avant)
```
Objectif: Commencer les remises
┌────────────────────────────────┐
│ Documents générés: 100%        │
│ Documents prêts: 100%          │
│ Remis: 30%                     │
└────────────────────────────────┘
```

### J-1 (veille de l'événement)
```
Objectif: Finaliser 80%
┌────────────────────────────────┐
│ Documents générés: 100%        │
│ Documents prêts: 100%          │
│ Remis: 80%                     │
└────────────────────────────────┘
```

### J (jour de l'événement)
```
Objectif: 100% des participants
┌────────────────────────────────┐
│ Documents générés: 100%        │
│ Documents prêts: 100%          │
│ Remis: 100% ✅                 │
└────────────────────────────────┘
```

## 📈 Métriques de performance

### Par opérateur
```
Opérateur: Marie Dupont
┌──────────────────────────────────┐
│ Participants traités: 45         │
│ Temps moyen: 1min 30s            │
│ Taux de complétion: 95%          │
│ Documents remis: 225/225         │
│ Performance: ⭐⭐⭐⭐⭐           │
└──────────────────────────────────┘
```

### Par document
```
┌────────────────────────────────────┐
│ Badge:    142/156 (91%) ⭐⭐⭐⭐⭐  │
│ Lettre:   138/156 (88%) ⭐⭐⭐⭐    │
│ Facture:  125/156 (80%) ⭐⭐⭐⭐    │
│ Reçu:     120/156 (77%) ⭐⭐⭐      │
│ Kit:       89/156 (57%) ⭐⭐        │
└────────────────────────────────────┘

⚠️ Action requise: Accélérer la remise des kits
```

---

**📊 Vue dynamique en temps réel**  
**🔄 Mise à jour automatique**  
**✅ Prêt pour FANAF 2026**

# Règles Métier - Module Trésorerie FANAF 2026

## 📋 Vue d'ensemble

Le module Trésorerie du profil **Administrateur FANAF** est structuré en **3 sections distinctes** pour une gestion claire et efficace des encaissements.

---

## 🏦 Les 3 Trésoreries

### 1️⃣ Trésorerie Générale
**Objectif** : Vue consolidée de tous les encaissements

- ✅ Compile **FANAF + ASAPAY**
- ✅ Affiche le bloc "**À Encaisser**" (inscriptions en attente)
- ✅ Tous les modes de paiement visibles
- 🎨 Couleur : **Orange-600**
- 🔵 Icône : Coins (pièces)

**Affichage** :
- Revenu total (tous canaux confondus)
- Inscriptions payées (membres + non-membres)
- À encaisser (membres + non-membres en attente)
- Détails avec "payés + attente"
- Tous les modes de paiement actifs

---

### 2️⃣ Trésorerie FANAF
**Objectif** : Encaissements via outils propres FANAF

**🔒 Règle métier stricte** : 
> **Les paiements FANAF se font en Espèce et Virement UNIQUEMENT**

- ✅ Filtre canal : `canalEncaissement === 'fanaf'`
- ⛔ **PAS** de bloc "À Encaisser"
- ✅ **Espèce + Virement** dans modes de paiement
- 🎨 Couleur : **Blue-600**
- 🏢 Icône : Building2
- 🏷️ Badge : "Espèce & Virement"

**Affichage** :
- Revenu total (espèce + virement FANAF uniquement)
- Inscriptions payées (sans "en attente")
- Détails avec "payés" seulement
- Modes de paiement : Espèce + Virement uniquement

---

### 3️⃣ Trésorerie ASAPAY
**Objectif** : Encaissements via ASACI Technologies (fintech)

**🔒 Règle métier stricte** : 
> **Les paiements ASAPAY se font par Carte, Orange Money et Wave UNIQUEMENT**

- ✅ Filtre canal : `canalEncaissement === 'asapay'`
- ⛔ **PAS** de bloc "À Encaisser"
- ✅ **Modes électroniques uniquement** (Carte, Orange Money, Wave)
- 🎨 Couleur : **Purple-600**
- 💳 Icône : CreditCard
- 🏷️ Badge : "Paiements électroniques"

**Affichage** :
- Revenu total (ASAPAY uniquement)
- Inscriptions payées (sans "en attente")
- Détails avec "payés" seulement
- Modes de paiement : Carte, Orange Money, Wave

---

## 💡 Logique de Séparation des Canaux

La séparation entre FANAF et ASAPAY repose sur les **modes de paiement** :

| Mode de Paiement | Canal | Raison |
|------------------|-------|---------|
| 🪙 **Espèce** | FANAF | Encaissement direct par les équipes FANAF |
| 🏦 **Virement** | FANAF | Virement bancaire vers le compte FANAF |
| 💳 **Carte bancaire** | ASAPAY | Paiement en ligne via la plateforme ASACI |
| 📱 **Orange Money** | ASAPAY | Mobile Money via passerelle ASACI |
| 🌊 **Wave** | ASAPAY | Mobile Money via passerelle ASACI |

**Principe** : Les paiements physiques et bancaires traditionnels → FANAF  
Les paiements électroniques et mobile money → ASAPAY (fintech)

---

## 🔧 Implémentation Technique

### Génération des Données (`mockData.ts`)

```typescript
// RÈGLE MÉTIER : Attribution selon le mode de paiement
// - FANAF : Espèce + Virement uniquement
// - ASAPAY : Carte, Orange Money, Wave uniquement

if (participant.canalEncaissement === 'fanaf') {
  const modesFanaf: ModePaiement[] = ['espèce', 'virement'];
  participant.modePaiement = modesFanaf[Math.floor(Math.random() * modesFanaf.length)];
} else {
  const modesAsapay: ModePaiement[] = ['carte', 'orange money', 'wave'];
  participant.modePaiement = modesAsapay[Math.floor(Math.random() * modesAsapay.length)];
}
```

**Répartition automatique** :
- **FANAF** (60% des paiements)
  - 🪙 Espèce (environ 30%)
  - 🏦 Virement (environ 30%)

- **ASAPAY** (40% des paiements)
  - 💳 Carte bancaire (environ 13%)
  - 📱 Orange Money (environ 13%)
  - 🌊 Wave (environ 14%)

---

### Composant FinancePage (`FinancePage.tsx`)

**Fonction de calcul par canal** :
```typescript
const calculateStatsByCanal = (canal?: CanalEncaissement) => {
  // Filtre les participants selon le canal
  // Retourne statistiques spécifiques
}
```

**3 onglets avec Tabs** :
- `general` → statsGeneral (tous canaux)
- `fanaf` → statsFanaf (canal FANAF)
- `asapay` → statsAsapay (canal ASAPAY)

---

## 📊 Statistiques par Trésorerie

Chaque trésorerie affiche :

### Cartes principales
1. **Revenu Total** (vert) - Montant encaissé
2. **Inscriptions Payées** (bleu) - Nombre de participants
3. **À Encaisser** (orange) - *Uniquement pour Générale*

### Détails par catégorie
- Membres (orange)
- Non-Membres (bleu)
- VIP (violet) - Exonérés
- Speakers (jaune) - Exonérés

### Graphiques
- **Barres** : Revenus par catégorie
- **Circulaire** : Répartition des revenus

### Modes de paiement
- **Générale** : Tous les 5 modes (Espèce, Virement, Carte, Orange Money, Wave)
- **FANAF** : Espèce + Virement uniquement (avec badge bleu)
- **ASAPAY** : Carte + Orange Money + Wave uniquement (avec badge violet)

---

## 🎯 Expérience Utilisateur

### Navigation intuitive
- **3 onglets clairs** avec icônes et couleurs distinctes
- **Badges informatifs** pour règles spéciales (espèce FANAF)
- **Descriptions contextuelles** sous chaque titre

### Différenciation visuelle
- Trésorerie Générale → Orange (compilation)
- Trésorerie FANAF → Bleu (institutionnel)
- Trésorerie ASAPAY → Violet (technologique)

### Export adapté
Chaque trésorerie peut exporter son rapport avec :
- Titre spécifique au canal
- Statistiques filtrées
- Modes de paiement pertinents

---

## ✅ Avantages

1. **Clarté comptable** : Séparation nette des flux financiers
2. **Traçabilité** : Identification immédiate de la source d'encaissement
3. **Conformité** : Respect des règles métier (espèce FANAF)
4. **Analyse ciblée** : Statistiques par canal d'encaissement
5. **Simplicité** : Interface intuitive sans confusion

---

## 📝 Notes importantes

- ⚠️ Le bloc "À Encaisser" est volontairement absent des trésoreries FANAF et ASAPAY
- ⚠️ Les statistiques "en attente" ne sont affichées que dans la Trésorerie Générale
- ⚠️ **Règles métier strictes imposées au niveau des données** :
  - 🏦 **FANAF** → Espèce + Virement UNIQUEMENT
  - 💳 **ASAPAY** → Carte + Orange Money + Wave UNIQUEMENT
- ✅ La trésorerie Générale reste l'outil principal de pilotage global
- 🔒 L'attribution automatique du canal se fait selon le mode de paiement choisi

---

## 🎨 Représentation Visuelle

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRÉSORERIE GÉNÉRALE                          │
│                       (Compilation)                             │
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────┐   │
│  │   TRÉSORERIE FANAF       │  │   TRÉSORERIE ASAPAY      │   │
│  │   (Institutionnel)       │  │   (Fintech)              │   │
│  │                          │  │                          │   │
│  │  🪙 Espèce              │  │  💳 Carte bancaire      │   │
│  │  🏦 Virement            │  │  📱 Orange Money        │   │
│  │                          │  │  🌊 Wave                │   │
│  │  60% des encaissements   │  │  40% des encaissements   │   │
│  └──────────────────────────┘  └──────────────────────────┘   │
│                                                                 │
│  💰 Revenu Total : FANAF + ASAPAY                              │
│  📊 À Encaisser : Inscriptions en attente                      │
└─────────────────────────────────────────────────────────────────┘
```

### Codes couleur
- 🟠 **Orange** : Trésorerie Générale (vue consolidée)
- 🔵 **Bleu** : Trésorerie FANAF (espèce & virement)
- 🟣 **Violet** : Trésorerie ASAPAY (paiements électroniques)

---

*Dernière mise à jour : 27 octobre 2025*

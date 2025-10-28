# 🚀 Quick Reference - Module Trésorerie

> Guide rapide pour comprendre la séparation FANAF/ASAPAY en 2 minutes

---

## 📋 Règle d'Or

**Chaque mode de paiement appartient à UN SEUL canal**

```
FANAF    →  Espèce + Virement
ASAPAY   →  Carte + Orange Money + Wave
```

---

## 🎯 Les 3 Trésoreries

| Nom | Icône | Couleur | Contenu | Bloc "À Encaisser" |
|-----|-------|---------|---------|-------------------|
| **Générale** | 🟠 | Orange | FANAF + ASAPAY | ✅ Oui |
| **FANAF** | 🔵 | Bleu | Espèce + Virement | ❌ Non |
| **ASAPAY** | 🟣 | Violet | Carte + OM + Wave | ❌ Non |

---

## 💳 Modes de Paiement

| Mode | Icône | Couleur | Canal | % |
|------|-------|---------|-------|---|
| **Espèce** | 🪙 Banknote | Vert | FANAF | ~30% |
| **Virement** | 🏦 Building2 | Bleu | FANAF | ~30% |
| **Carte** | 💳 CreditCard | Violet | ASAPAY | ~13% |
| **Orange Money** | 📱 Smartphone | Orange | ASAPAY | ~13% |
| **Wave** | 🌊 Smartphone | Bleu clair | ASAPAY | ~14% |

---

## 🔄 Attribution Automatique

### Code
```typescript
// Lors de la création d'un participant payé
if (mode === 'espèce' || mode === 'virement') {
  canal = 'fanaf';
} else {
  canal = 'asapay';
}
```

### Résultat
- Espèce → FANAF ✅
- Virement → FANAF ✅
- Carte → ASAPAY ✅
- Orange Money → ASAPAY ✅
- Wave → ASAPAY ✅

---

## 📊 Distribution (Mock Data)

```
Total : 150 inscriptions payées
├─ 90 via FANAF (60%)
│  ├─ 45 espèce
│  └─ 45 virement
└─ 60 via ASAPAY (40%)
   ├─ 20 carte
   ├─ 20 Orange Money
   └─ 20 Wave
```

---

## 🎨 Interface

### Badges
- **FANAF** : Badge bleu "Espèce & Virement"
- **ASAPAY** : Badge violet "Paiements électroniques"

### Layout Modes de Paiement
- **Générale** : 5 colonnes (tous modes)
- **FANAF** : 2 colonnes (espèce + virement)
- **ASAPAY** : 3 colonnes (carte + OM + Wave)

### Statistiques
- **Générale** : "X payés + Y attente"
- **FANAF/ASAPAY** : "X payés" uniquement

---

## 🔍 Cas d'Usage

### ✅ Scénario 1 : Inscription au stand
- Participant vient au stand FANAF
- Paie 350K en **espèce**
- → Canal FANAF automatiquement
- → Visible dans Trésorerie FANAF + Générale

### ✅ Scénario 2 : Paiement en ligne
- Participant s'inscrit sur le site
- Paie 400K par **Orange Money**
- → Canal ASAPAY automatiquement
- → Visible dans Trésorerie ASAPAY + Générale

### ✅ Scénario 3 : Virement bancaire
- Organisation effectue un **virement**
- → Canal FANAF automatiquement
- → Visible dans Trésorerie FANAF + Générale

---

## 📁 Fichiers Clés

### Code
- `/components/data/mockData.ts` - Génération données
- `/components/FinancePage.tsx` - Interface trésorerie

### Documentation
- `TRESORERIE_REGLES_METIER.md` - Règles complètes
- `TRESORERIE_CANAUX_SEPARATION.md` - Guide détaillé
- `TRESORERIE_FLUX_VISUEL.md` - Schémas visuels
- `CHANGELOG_TRESORERIE.md` - Historique v2.0

---

## ⚡ Commandes Utiles

### Démarrer l'app
```bash
npm run dev
```

### Accéder au module
1. Choisir profil "Admin FANAF"
2. Cliquer sur "Trésorerie" dans le menu
3. Naviguer entre les 3 onglets

### Tester les données
- Trésorerie Générale : Voir TOUT
- Trésorerie FANAF : Filtrer sur `canal === 'fanaf'`
- Trésorerie ASAPAY : Filtrer sur `canal === 'asapay'`

---

## 🚨 Points d'Attention

### ✅ À Faire
- Utiliser les badges pour identifier les canaux
- Vérifier que les modes affichés correspondent au canal
- Exporter par trésorerie pour avoir des rapports séparés

### ❌ À Éviter
- Ne PAS essayer de mettre espèce dans ASAPAY (impossible)
- Ne PAS chercher le bloc "À Encaisser" dans FANAF/ASAPAY
- Ne PAS confondre les couleurs (Orange=Général, Bleu=FANAF, Violet=ASAPAY)

---

## 🎯 Mémo Rapide

**Question** : Où va un paiement en espèce ?  
**Réponse** : FANAF uniquement

**Question** : Où va un paiement Orange Money ?  
**Réponse** : ASAPAY uniquement

**Question** : Où va un virement ?  
**Réponse** : FANAF uniquement

**Question** : Où voir le total global ?  
**Réponse** : Trésorerie Générale

**Question** : Où voir les inscriptions en attente ?  
**Réponse** : Trésorerie Générale uniquement (bloc "À Encaisser")

---

## 📞 Support Rapide

**Problème** : Les montants ne correspondent pas  
**Solution** : Vérifier que Générale = FANAF + ASAPAY

**Problème** : Un mode n'apparaît pas  
**Solution** : Vérifier qu'il y a des paiements pour ce mode

**Problème** : Le bloc "À Encaisser" manque  
**Solution** : Normal pour FANAF/ASAPAY, visible uniquement dans Générale

---

## 🔢 Formules de Vérification

```
✅ Revenu Général = Revenu FANAF + Revenu ASAPAY
✅ Inscrits Général = Inscrits FANAF + Inscrits ASAPAY
✅ FANAF = Espèce + Virement
✅ ASAPAY = Carte + Orange Money + Wave
```

---

## 🎨 Cheat Sheet Couleurs

```css
/* Trésoreries */
.general   { color: #f97316; }  /* Orange */
.fanaf     { color: #3b82f6; }  /* Bleu */
.asapay    { color: #9333ea; }  /* Violet */

/* Modes de paiement */
.espece    { color: #22c55e; }  /* Vert */
.virement  { color: #3b82f6; }  /* Bleu */
.carte     { color: #9333ea; }  /* Violet */
.om        { color: #f97316; }  /* Orange */
.wave      { color: #0ea5e9; }  /* Bleu clair */
```

---

**Version** : 2.0  
**Date** : 27 Octobre 2025  
**Temps de lecture** : 2 minutes

---

*Pour plus de détails, consultez les autres documents de la section Trésorerie*

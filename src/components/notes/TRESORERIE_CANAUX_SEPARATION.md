# Séparation des Canaux d'Encaissement - FANAF 2026

## 🎯 Objectif

Permettre une **traçabilité parfaite** des encaissements selon leur provenance :
- Canal institutionnel (FANAF)
- Canal technologique (ASAPAY - fintech ASACI Technologies)

---

## 📊 Attribution des Modes de Paiement

### Canal FANAF 🏦
**Encaissements traditionnels et bancaires**

| Mode | Description | Icône |
|------|-------------|-------|
| 🪙 **Espèce** | Paiement en cash aux guichets FANAF | Banknote |
| 🏦 **Virement** | Virement bancaire sur compte FANAF | Building2 |

**Pourquoi ?**
- Contrôle direct par les équipes FANAF
- Traçabilité comptable interne
- Gestion des flux de trésorerie physiques

---

### Canal ASAPAY 💳
**Encaissements électroniques via fintech**

| Mode | Description | Icône |
|------|-------------|-------|
| 💳 **Carte bancaire** | Paiement CB via plateforme ASACI | CreditCard |
| 📱 **Orange Money** | Mobile Money via passerelle ASACI | Smartphone (orange) |
| 🌊 **Wave** | Mobile Money via passerelle ASACI | Smartphone (bleu) |

**Pourquoi ?**
- Solutions de paiement digitales
- Automatisation des encaissements
- Sécurisation des transactions en ligne
- Facilité pour les participants à distance

---

## 🔄 Flux d'Attribution Automatique

```
Participant inscrit → Paiement finalisé
                              ↓
                    Choix du mode de paiement
                              ↓
                    ┌─────────┴──────────┐
                    ↓                    ↓
            Espèce ou Virement    Carte, Orange Money, Wave
                    ↓                    ↓
            Canal = FANAF         Canal = ASAPAY
                    ↓                    ↓
            Trésorerie FANAF     Trésorerie ASAPAY
                    ↓                    ↓
                    └─────────┬──────────┘
                              ↓
                    Trésorerie GÉNÉRALE
                    (Compilation totale)
```

---

## 💻 Code d'Attribution

### Fonction de génération (`mockData.ts`)

```typescript
// Pour les données statiques (avec mode de paiement prédéfini)
if (modePaiement === 'espèce' || modePaiement === 'virement') {
  participant.canalEncaissement = 'fanaf';
  participant.modePaiement = modePaiement;
} else {
  participant.canalEncaissement = 'asapay';
  participant.modePaiement = modePaiement;
}

// Pour les données aléatoires (attribution dynamique)
if (participant.canalEncaissement === 'fanaf') {
  const modesFanaf = ['espèce', 'virement'];
  participant.modePaiement = modesFanaf[Math.floor(Math.random() * 2)];
} else {
  const modesAsapay = ['carte', 'orange money', 'wave'];
  participant.modePaiement = modesAsapay[Math.floor(Math.random() * 3)];
}
```

---

## 📈 Répartition Statistique

### Distribution actuelle (Mock Data)

**Total paiements finalisés** : 100%

| Canal | % | Modes | Répartition détaillée |
|-------|---|-------|----------------------|
| **FANAF** | 60% | Espèce + Virement | ~30% espèce + ~30% virement |
| **ASAPAY** | 40% | Carte + OM + Wave | ~13% carte + ~13% OM + ~14% Wave |

Cette répartition 60/40 reflète :
- La prédominance des paiements physiques en Afrique (espèce)
- L'importance croissante du mobile money
- L'adoption progressive des cartes bancaires

---

## 🎨 Interface Utilisateur

### Badges informatifs

| Trésorerie | Badge | Couleur | Message |
|------------|-------|---------|---------|
| Générale | - | Orange | Tous les modes |
| FANAF | 🔵 | Bleu | "Espèce & Virement" |
| ASAPAY | 🟣 | Violet | "Paiements électroniques" |

### Affichage des modes

**Trésorerie Générale**
```
┌──────┬──────┬──────┬──────┬──────┐
│ 🪙   │ 🏦   │ 💳   │ 📱   │ 🌊   │
│Espèce│Virem.│Carte │OM    │Wave  │
│150K  │120K  │80K   │60K   │50K   │
└──────┴──────┴──────┴──────┴──────┘
```

**Trésorerie FANAF**
```
┌──────┬──────┐
│ 🪙   │ 🏦   │
│Espèce│Virem.│
│150K  │120K  │
└──────┴──────┘
```

**Trésorerie ASAPAY**
```
┌──────┬──────┬──────┐
│ 💳   │ 📱   │ 🌊   │
│Carte │OM    │Wave  │
│80K   │60K   │50K   │
└──────┴──────┴──────┘
```

---

## ✅ Avantages de cette Séparation

### 1. **Traçabilité comptable**
- Identification immédiate de la source d'un encaissement
- Réconciliation bancaire simplifiée
- Audit facilité

### 2. **Gestion des flux**
- Espèce : dépôt physique quotidien par FANAF
- Virement : vérification bancaire par FANAF
- Électronique : automatisation via ASAPAY

### 3. **Analyse financière**
- Performance par canal
- Évolution des habitudes de paiement
- Optimisation des moyens d'encaissement

### 4. **Sécurité**
- Séparation des responsabilités
- Double vérification possible
- Détection d'anomalies par canal

---

## 🔒 Règles de Sécurité

### Immutabilité
Une fois le canal attribué selon le mode de paiement :
- ❌ Impossible de changer le canal sans changer le mode
- ❌ Impossible d'avoir espèce sur ASAPAY
- ❌ Impossible d'avoir carte sur FANAF
- ✅ Attribution automatique garantie par le code

### Validation
```typescript
// Validation stricte
if (mode === 'espèce' || mode === 'virement') {
  assert(canal === 'fanaf', "Mode incompatible avec ASAPAY");
}

if (mode === 'carte' || mode === 'orange money' || mode === 'wave') {
  assert(canal === 'asapay', "Mode incompatible avec FANAF");
}
```

---

## 📝 Cas d'Usage

### Scénario 1 : Inscription au guichet FANAF
1. Participant se présente au stand FANAF
2. Paie en **espèce** → `canal = 'fanaf'`
3. Reçu généré avec mention "Encaissement FANAF"
4. Montant apparaît dans **Trésorerie FANAF**

### Scénario 2 : Inscription en ligne
1. Participant s'inscrit sur le site web
2. Paie par **Orange Money** → `canal = 'asapay'`
3. Confirmation automatique via ASACI Technologies
4. Montant apparaît dans **Trésorerie ASAPAY**

### Scénario 3 : Virement bancaire entreprise
1. Organisation effectue un virement sur compte FANAF
2. Mode = **virement** → `canal = 'fanaf'`
3. Validation manuelle par FANAF après réception
4. Montant apparaît dans **Trésorerie FANAF**

---

## 🎯 Impact sur les Exports

Chaque trésorerie génère un export spécifique :

### Export Trésorerie FANAF
```
RAPPORT TRÉSORERIE FANAF - FANAF 2026
Période: XX/XX/XXXX au XX/XX/XXXX

ENCAISSEMENTS:
- Espèce: XXX.XXX FCFA
- Virement: XXX.XXX FCFA
TOTAL: XXX.XXX FCFA

Nombre d'inscriptions: XX
```

### Export Trésorerie ASAPAY
```
RAPPORT TRÉSORERIE ASAPAY - FANAF 2026
Période: XX/XX/XXXX au XX/XX/XXXX

ENCAISSEMENTS ÉLECTRONIQUES:
- Carte bancaire: XXX.XXX FCFA
- Orange Money: XXX.XXX FCFA
- Wave: XXX.XXX FCFA
TOTAL: XXX.XXX FCFA

Nombre de transactions: XX
```

---

## 📊 Évolutions Futures Possibles

### Phase 2 : Intégration API
- Connexion directe API ASAPAY
- Webhooks pour notifications temps réel
- Réconciliation automatique

### Phase 3 : Multi-devises
- Support USD, EUR
- Conversion automatique en FCFA
- Taux de change par canal

### Phase 4 : Analytics avancés
- Prédiction des flux par canal
- Optimisation des coûts de transaction
- Recommandations de modes de paiement

---

*Document créé le 27 octobre 2025*  
*Version 1.0 - Séparation FANAF/ASAPAY*

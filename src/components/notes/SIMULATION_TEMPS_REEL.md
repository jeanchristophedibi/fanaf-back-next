# 🔴 Système de Simulation en Temps Réel

## Vue d'ensemble

Le back-office FANAF 2026 intègre un **système de simulation en temps réel** qui génère automatiquement de nouvelles données toutes les 3-8 secondes pour créer une expérience dynamique et vivante.

## Données Dynamiques

### ✅ Types de données générés automatiquement :

1. **Inscriptions de participants** 👥
   - Nouveaux membres, non-membres, VIP, speakers
   - Génération de références uniques (FANAF-2026-XXX)
   - Statuts d'inscription variés (finalisée, non-finalisée)
   - Modes de paiement aléatoires

2. **Organisations** 🏢
   - Associations membres (50%)
   - Entreprises non-membres (40%)
   - Sponsors avec référents (10%)
   - Génération de contacts et emails

3. **Rendez-vous** 📅
   - RDV entre participants
   - RDV avec sponsors
   - Statuts : en attente (60%), accepté (30%), refusé (10%)
   - Dates et heures aléatoires

4. **Réservations de stands** 🏪
   - Stands 9m² et 12m²
   - Numéros de stand (A-01, B-05, etc.)
   - Statuts de paiement variés

## Composants Clés

### 1. **Hook `useDynamicInscriptions`**
```typescript
const { 
  participants, 
  organisations, 
  rendezVous, 
  reservations 
} = useDynamicInscriptions({ 
  includeOrganisations: true,
  includeRendezVous: true,
  includeReservations: true,
  interval: 8000 // millisecondes
});
```

### 2. **Composant `DynamicDataIndicator`**
Affiche en temps réel :
- Notifications toast pour chaque nouvelle donnée
- Compteur total de mises à jour
- Animations fluides avec Motion
- Couleurs selon le type de données

### 3. **Composant `AnimatedStat`**
Anime les changements de statistiques :
- Transition progressive des chiffres
- Effets visuels d'augmentation
- Mise en surbrillance des changements

## Utilisation

### Activer/Désactiver la Simulation

Dans n'importe quel composant :
```typescript
// Activer uniquement les inscriptions
const { participants } = useDynamicInscriptions({ enabled: true });

// Activer toutes les données
const data = useDynamicInscriptions({ 
  includeOrganisations: true,
  includeRendezVous: true,
  includeReservations: true
});

// Désactiver
const data = useDynamicInscriptions({ enabled: false });
```

### Modifier l'Intervalle

```typescript
// Nouvelle donnée toutes les 5 secondes
const data = useDynamicInscriptions({ interval: 5000 });
```

## Architecture Technique

### Système de Notification
```
mockData.ts
  ↓
dataUpdateListeners (subscribers)
  ↓
notifyDataUpdate()
  ↓
useDynamicInscriptions (reactive)
  ↓
Composants UI (re-render)
```

### Génération de Données

Chaque type de donnée possède :
- `generateRandom[Type]()` : Crée une nouvelle entrée
- `addRandom[Type]()` : Ajoute à la liste et notifie
- `getCurrent[Type]()` : Récupère les données actuelles

## Fonctionnalités UX

### Animations
- ✨ Apparition fluide des notifications (toast)
- 📊 Mise à jour progressive des statistiques
- 🎯 Indication visuelle de nouvelles données
- 🔄 Rotation des icônes lors de l'ajout

### Codes Couleurs
- 🟠 **Orange** : Nouvelles inscriptions
- 🔵 **Bleu** : Nouvelles organisations
- 🟣 **Violet** : Nouveaux rendez-vous
- 🟢 **Vert** : Nouvelles réservations

## Pages Dynamiques

### ✅ Pages qui utilisent les données dynamiques :
- **Dashboard Principal** (DashboardHome)
- **Inscriptions** (InscriptionsPage, ListeInscriptionsPage)
- **Organisations** (OrganisationsPage)
- **Networking** (NetworkingPage)
- **Réservations** (ReservationsPage)

### 📊 Statistiques Animées :
- Total inscriptions
- Membres / Non-membres / VIP / Speakers
- Organisations (membres, entreprises, sponsors)
- Réservations de stands
- Rendez-vous en attente / acceptés / refusés

## Fichiers Principaux

```
/components/
  ├── hooks/
  │   └── useDynamicInscriptions.ts    # Hook principal
  ├── data/
  │   └── mockData.ts                   # Générateurs de données
  ├── DynamicDataIndicator.tsx         # Notifications visuelles
  ├── AnimatedStat.tsx                  # Animations de statistiques
  └── [Pages].tsx                       # Pages utilisant les données
```

## Avantages

✅ **Démonstration réaliste** : Simule une application en production  
✅ **Tests UX** : Valide l'interface avec des flux de données  
✅ **Animations fluides** : Expérience utilisateur immersive  
✅ **Facilement configurable** : Activation/désactivation simple  
✅ **Performance** : Pas de surcharge, génération contrôlée  

## Configuration Recommandée

Pour une démo optimale :
```typescript
// Dans Dashboard.tsx
<DynamicDataIndicator 
  enabled={true}
  includeOrganisations={true}
  includeRendezVous={true}
  includeReservations={true}
/>
```

---

**Note** : Ce système est conçu pour le prototypage et la démonstration. Pour une application en production, remplacez les générateurs par des appels API réels.

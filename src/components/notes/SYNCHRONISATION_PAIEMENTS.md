# Système de Synchronisation des Paiements

## Vue d'ensemble
Le système de synchronisation permet de mettre à jour automatiquement tous les compteurs visuels et statistiques après la finalisation d'un paiement dans le profil Caisse.

## Architecture

### 1. Event-Driven Architecture
Le système utilise des événements personnalisés JavaScript pour propager les changements à travers tous les composants :

- **Événement principal** : `paymentFinalized`
- **Données stockées** : `localStorage`
- **Synchronisation** : Événements `storage` pour la synchronisation multi-onglets

### 2. Flux de données

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CaissePaiementsPage                                       │
│    - L'utilisateur finalise un paiement                      │
│    - Mise à jour du localStorage                             │
│    - Dispatch de l'événement 'paymentFinalized'              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Hook useDynamicInscriptions                               │
│    - Écoute l'événement 'paymentFinalized'                   │
│    - Recharge les IDs depuis localStorage                    │
│    - Applique le statut 'finalisée' aux participants         │
│    - Met à jour le state et déclenche un re-render           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Tous les composants utilisant le hook                    │
│    - DashboardHome                                           │
│    - AgentFanafSidebar                                       │
│    - CaissePaiementsPage (ses propres stats)                 │
│    - CaisseInscriptionsPage                                  │
│    - ParticipantsFinalisesPage                               │
│    - Etc.                                                    │
│                                                              │
│    ✅ Mise à jour automatique de tous les compteurs          │
└─────────────────────────────────────────────────────────────┘
```

## Composants modifiés

### 1. `/components/hooks/useDynamicInscriptions.ts`
**Modifications apportées :**
- Ajout d'un state `finalisedParticipantsIds` qui charge les IDs depuis localStorage
- Fonction helper `applyFinalisedStatus()` qui met à jour le statut des participants
- Écoute de l'événement `paymentFinalized` pour recharger les données
- Application automatique du statut 'finalisée' aux participants concernés

**Code clé :**
```typescript
// Charger les participants finalisés au démarrage
const [finalisedParticipantsIds, setFinalisedParticipantsIds] = useState<Set<string>>(() => {
  const stored = localStorage.getItem('finalisedParticipantsIds');
  return stored ? new Set(JSON.parse(stored)) : new Set();
});

// Appliquer le statut finalisé
function applyFinalisedStatus(participants: Participant[], finalisedIds: Set<string>) {
  return participants.map(p => {
    if (finalisedIds.has(p.id) && p.statutInscription === 'non-finalisée') {
      return { ...p, statutInscription: 'finalisée' };
    }
    return p;
  });
}

// Écouter l'événement de finalisation
useEffect(() => {
  const handlePaymentFinalized = () => {
    const stored = localStorage.getItem('finalisedParticipantsIds');
    const newFinalisedIds = stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
    setFinalisedParticipantsIds(newFinalisedIds);
    
    const currentParticipants = getCurrentParticipants();
    setParticipants(applyFinalisedStatus(currentParticipants, newFinalisedIds));
  };

  window.addEventListener('paymentFinalized', handlePaymentFinalized);
  return () => window.removeEventListener('paymentFinalized', handlePaymentFinalized);
}, []);
```

### 2. `/components/CaissePaiementsPage.tsx`
**Modifications apportées :**
- Dispatch de l'événement `paymentFinalized` après validation du paiement
- Écoute de l'événement pour mettre à jour ses propres statistiques
- Écoute de l'événement `storage` pour synchronisation multi-onglets

**Code clé :**
```typescript
// Dans handleValiderPaiement()
window.dispatchEvent(new CustomEvent('paymentFinalized', { 
  detail: { participantId: selectedParticipant.id } 
}));

// Écoute des événements
useEffect(() => {
  const handlePaymentFinalized = () => {
    const stored = localStorage.getItem('finalisedParticipantsIds');
    if (stored) {
      setFinalisedParticipants(new Set(JSON.parse(stored)));
    }
  };

  window.addEventListener('paymentFinalized', handlePaymentFinalized);
  return () => window.removeEventListener('paymentFinalized', handlePaymentFinalized);
}, []);
```

### 3. `/components/CaisseInscriptionsPage.tsx`
**Modifications apportées :**
- Écoute de l'événement `paymentFinalized` pour mettre à jour la liste
- Remplacement du polling par un système d'événements plus efficace

## Données stockées dans localStorage

### `finalisedParticipantsIds`
```json
["participant-id-1", "participant-id-2", "participant-id-3"]
```
- **Type** : Array de strings (IDs des participants)
- **Usage** : Liste des participants dont le paiement a été finalisé via la caisse
- **Synchronisation** : Partagé entre tous les composants

### `finalisedPayments`
```json
{
  "participant-id-1": {
    "modePaiement": "espèce",
    "datePaiement": "2026-02-05T14:30:00.000Z"
  },
  "participant-id-2": {
    "modePaiement": "carte bancaire",
    "datePaiement": "2026-02-05T15:45:00.000Z"
  }
}
```
- **Type** : Objet avec IDs comme clés
- **Usage** : Détails des paiements finalisés (mode et date)
- **Synchronisation** : Utilisé pour générer les documents et afficher les détails

## Éléments visuels mis à jour automatiquement

### 1. Dashboard Home (Profil Caisse)
- ✅ **Paiements en attente** : Diminue après finalisation
- ✅ **Paiements finalisés** : Augmente après finalisation
- ✅ **Badges générés** : Se met à jour
- ✅ **Revenus collectés** : Recalculé automatiquement

### 2. Sidebar (AgentFanafSidebar)
- ✅ **Badge "Paiement"** : Affiche le nombre de paiements en attente (diminue)
- ✅ **Badge "Participants"** : Affiche le nombre de documents disponibles (augmente)
- ✅ **Badge "Documents"** : Affiche le nombre de documents disponibles (augmente)

### 3. Page Paiements (CaissePaiementsPage)
- ✅ **Total en attente** : Diminue après finalisation
- ✅ **Membres en attente** : Mise à jour selon le type
- ✅ **Non-membres en attente** : Mise à jour selon le type
- ✅ **Montant total** : Recalculé automatiquement
- ✅ **Liste des paiements** : Le participant finalisé disparaît

### 4. Page Inscriptions (CaisseInscriptionsPage)
- ✅ **Liste des inscriptions** : Le participant apparaît avec statut "Finalisé"

### 5. Page Participants (ParticipantsFinalisesPage)
- ✅ **Statistiques** : Mise à jour automatique
- ✅ **Liste des participants** : Le nouveau participant finalisé apparaît

## Avantages du système

1. **Réactivité instantanée** : Les changements sont propagés immédiatement
2. **Pas de rechargement** : Aucun besoin de rafraîchir la page
3. **Synchronisation multi-onglets** : Fonctionne même avec plusieurs onglets ouverts
4. **Performance optimale** : Pas de polling coûteux en ressources
5. **Maintenabilité** : Architecture claire et modulaire
6. **Extensibilité** : Facile d'ajouter de nouveaux écouteurs

## Notes techniques

### Performance
- Les événements sont déclenchés uniquement lors d'actions utilisateur (pas de polling)
- Les composants se mettent à jour uniquement quand nécessaire grâce à React's reconciliation
- Le localStorage est utilisé comme source de vérité unique

### Compatibilité
- ✅ Fonctionne sur tous les navigateurs modernes
- ✅ Compatible avec React 18+
- ✅ Supporte la synchronisation multi-onglets via l'API Storage

### Limitations
- L'événement `storage` ne se déclenche pas dans le même onglet (c'est pourquoi on utilise un événement personnalisé)
- Les données sont stockées en localStorage (pas de persistance backend pour l'instant)

## Tests de validation

### Scénario 1 : Finalisation d'un paiement
1. Ouvrir la page Paiements
2. Cliquer sur "Finaliser le paiement" pour un participant
3. Sélectionner un mode de paiement et valider
4. ✅ Le compteur "Total en attente" doit diminuer immédiatement
5. ✅ Le participant doit disparaître de la liste
6. ✅ Le badge dans la sidebar doit se mettre à jour

### Scénario 2 : Vérification dans les autres pages
1. Après avoir finalisé un paiement
2. Naviguer vers "Inscriptions"
3. ✅ Le participant doit apparaître avec statut "Finalisé"
4. Naviguer vers "Participants"
5. ✅ Le participant doit être visible dans la liste
6. Naviguer vers "Tableau de bord"
7. ✅ Les statistiques doivent refléter les changements

### Scénario 3 : Multi-onglets
1. Ouvrir deux onglets avec l'application
2. Dans le premier onglet, finaliser un paiement
3. ✅ Dans le second onglet, les compteurs doivent se mettre à jour automatiquement

## Maintenance future

### Pour ajouter un nouveau composant qui doit réagir aux finalisations :
1. Importer et utiliser le hook `useDynamicInscriptions()`
2. Le composant recevra automatiquement les données à jour
3. Pas besoin d'ajouter d'écouteurs supplémentaires

### Pour modifier le système :
- Les modifications doivent être faites dans le hook `useDynamicInscriptions`
- Maintenir la cohérence avec le localStorage
- Tester la synchronisation multi-onglets

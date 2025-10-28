# 🚀 Quick Reference - Synchronisation des Paiements

## Pour les développeurs

### Événement principal
```javascript
// Nom : 'paymentFinalized'
// Type : CustomEvent
// Detail : { participantId: string }
```

### Dispatcher un paiement finalisé
```typescript
window.dispatchEvent(new CustomEvent('paymentFinalized', { 
  detail: { participantId: selectedParticipant.id } 
}));
```

### Écouter les paiements finalisés
```typescript
useEffect(() => {
  const handlePaymentFinalized = (event) => {
    // Votre logique ici
    console.log('Paiement finalisé pour:', event.detail.participantId);
  };

  window.addEventListener('paymentFinalized', handlePaymentFinalized);
  return () => window.removeEventListener('paymentFinalized', handlePaymentFinalized);
}, []);
```

### localStorage Keys

#### `finalisedParticipantsIds`
```typescript
// Type: string[] (JSON)
const ids = JSON.parse(localStorage.getItem('finalisedParticipantsIds') || '[]');
```

#### `finalisedPayments`
```typescript
// Type: Record<string, { modePaiement: string, datePaiement: string }> (JSON)
const payments = JSON.parse(localStorage.getItem('finalisedPayments') || '{}');
```

### Hook useDynamicInscriptions

**Utilisation standard :**
```typescript
const { participants } = useDynamicInscriptions();
// participants contient déjà les statuts mis à jour
```

**Les participants finalisés via la caisse ont automatiquement :**
```typescript
participant.statutInscription === 'finalisée'
```

### Filtrer les paiements en attente
```typescript
const paiementsEnAttente = participants.filter(p => 
  p.statutInscription === 'non-finalisée' && 
  (p.statut === 'membre' || p.statut === 'non-membre')
);
```

### Filtrer les paiements finalisés
```typescript
const paiementsFinalisés = participants.filter(p => 
  p.statutInscription === 'finalisée'
);
```

### Composants automatiquement synchronisés
- ✅ `DashboardHome` → Utilise le hook
- ✅ `AgentFanafSidebar` → Utilise le hook
- ✅ `CaissePaiementsPage` → Écoute l'événement + hook
- ✅ `CaisseInscriptionsPage` → Écoute l'événement
- ✅ `ParticipantsFinalisesPage` → Utilise le hook

### Ajouter un nouveau composant synchronisé

**Option 1 : Utiliser le hook (recommandé)**
```typescript
import { useDynamicInscriptions } from './hooks/useDynamicInscriptions';

export function MyComponent() {
  const { participants } = useDynamicInscriptions();
  
  // participants est automatiquement à jour
  const stats = {
    enAttente: participants.filter(p => p.statutInscription === 'non-finalisée').length,
    finalisés: participants.filter(p => p.statutInscription === 'finalisée').length,
  };
  
  return <div>{/* Votre UI */}</div>;
}
```

**Option 2 : Écouter l'événement manuellement**
```typescript
export function MyComponent() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const updateCount = () => {
      const stored = localStorage.getItem('finalisedParticipantsIds');
      const ids = stored ? JSON.parse(stored) : [];
      setCount(ids.length);
    };
    
    window.addEventListener('paymentFinalized', updateCount);
    return () => window.removeEventListener('paymentFinalized', updateCount);
  }, []);
  
  return <div>Paiements finalisés: {count}</div>;
}
```

### Déboguer

**Console du navigateur :**
```javascript
// Voir tous les participants finalisés
JSON.parse(localStorage.getItem('finalisedParticipantsIds'))

// Voir les détails des paiements
JSON.parse(localStorage.getItem('finalisedPayments'))

// Écouter tous les événements
window.addEventListener('paymentFinalized', console.log)

// Simuler un paiement finalisé
window.dispatchEvent(new CustomEvent('paymentFinalized', { 
  detail: { participantId: 'test-id' } 
}))
```

### Performance

**✅ Bonnes pratiques :**
- Utiliser le hook `useDynamicInscriptions` plutôt que d'accéder directement au localStorage
- Les calculs de stats doivent être dans des `useMemo` pour éviter les recalculs inutiles
- Ne pas faire de polling du localStorage

**❌ À éviter :**
```typescript
// ❌ Mauvais : polling coûteux
useEffect(() => {
  const interval = setInterval(() => {
    const data = localStorage.getItem('finalisedParticipantsIds');
    // ...
  }, 1000);
  return () => clearInterval(interval);
}, []);

// ✅ Bon : utiliser l'événement
useEffect(() => {
  const handleUpdate = () => {
    const data = localStorage.getItem('finalisedParticipantsIds');
    // ...
  };
  window.addEventListener('paymentFinalized', handleUpdate);
  return () => window.removeEventListener('paymentFinalized', handleUpdate);
}, []);
```

### Tests

**Test manuel rapide :**
1. Ouvrir DevTools (F12)
2. Coller dans la console :
```javascript
window.dispatchEvent(new CustomEvent('paymentFinalized', { 
  detail: { participantId: 'test-123' } 
}));
```
3. ✅ Les compteurs doivent se mettre à jour

**Vérifier que l'événement est bien dispatché :**
```javascript
const originalDispatch = window.dispatchEvent;
window.dispatchEvent = function(event) {
  if (event.type === 'paymentFinalized') {
    console.log('✅ Event dispatched:', event.detail);
  }
  return originalDispatch.call(this, event);
};
```

### Troubleshooting

**Problème : Les compteurs ne se mettent pas à jour**
1. Vérifier que le hook `useDynamicInscriptions` est appelé dans le composant
2. Vérifier que l'événement est bien dispatché (voir console)
3. Vérifier que le localStorage contient bien les données

**Problème : Décalage entre les compteurs**
1. Vérifier que tous les filtres utilisent la même logique
2. S'assurer que le hook applique bien `applyFinalisedStatus`

**Problème : Multi-onglets ne fonctionne pas**
1. L'événement `storage` ne se déclenche que dans les AUTRES onglets
2. Dans le même onglet, c'est l'événement `paymentFinalized` qui est utilisé

### Checklist de mise en production

- [ ] Tous les composants utilisent le hook `useDynamicInscriptions`
- [ ] L'événement `paymentFinalized` est dispatché après chaque finalisation
- [ ] Les données sont bien stockées dans localStorage
- [ ] Les tests manuels passent (voir TEST_SYNCHRONISATION.md)
- [ ] Pas de console.error en production
- [ ] Performance OK (pas de lag visible)

### Support

**Documentation complète :** 
- `/SYNCHRONISATION_PAIEMENTS.md` - Architecture détaillée
- `/TEST_SYNCHRONISATION.md` - Procédure de test
- `/RESUME_SYNCHRONISATION.md` - Résumé exécutif

**Fichiers modifiés :**
- `/components/hooks/useDynamicInscriptions.ts`
- `/components/CaissePaiementsPage.tsx`
- `/components/CaisseInscriptionsPage.tsx`

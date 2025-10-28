# 📊 Diagramme de Synchronisation des Paiements

## Vue d'ensemble du système

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    SYSTÈME DE SYNCHRONISATION PAIEMENTS                    ║
║                              Version 1.0.0                                 ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

## 1. Architecture globale

```
┌─────────────────────────────────────────────────────────────────────┐
│                          ARCHITECTURE                                │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────┐
    │   Caissier Utilisateur│
    │   (Profil Caisse)    │
    └──────────┬───────────┘
               │ Clique sur "Finaliser le paiement"
               ▼
    ┌──────────────────────────────────────┐
    │  CaissePaiementsPage.tsx             │
    │  ┌────────────────────────────────┐  │
    │  │ handleValiderPaiement()        │  │
    │  └────────────┬───────────────────┘  │
    └───────────────┼──────────────────────┘
                    │
                    ▼
    ┌───────────────────────────────────────┐
    │  localStorage                          │
    │  ┌─────────────────────────────────┐  │
    │  │ finalisedParticipantsIds: [...] │  │
    │  │ finalisedPayments: {...}        │  │
    │  └─────────────────────────────────┘  │
    └───────────────┬───────────────────────┘
                    │
                    ▼
    ┌───────────────────────────────────────┐
    │  window.dispatchEvent                  │
    │  ┌─────────────────────────────────┐  │
    │  │ CustomEvent('paymentFinalized') │  │
    │  └─────────────────────────────────┘  │
    └───────────────┬───────────────────────┘
                    │
                    ▼
    ┌───────────────────────────────────────┐
    │  useDynamicInscriptions (Hook)         │
    │  ┌─────────────────────────────────┐  │
    │  │ addEventListener('payment...')   │  │
    │  │ applyFinalisedStatus()           │  │
    │  │ setParticipants(updated)         │  │
    │  └─────────────────────────────────┘  │
    └───────────────┬───────────────────────┘
                    │
                    ▼
    ┌────────────────────────────────────────────────────────┐
    │            TOUS LES COMPOSANTS SONT MIS À JOUR          │
    │                                                          │
    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
    │  │ DashboardHome│  │   Sidebar    │  │  Paiements   │ │
    │  │   Stats ↻    │  │   Badges ↻   │  │   Stats ↻    │ │
    │  └──────────────┘  └──────────────┘  └──────────────┘ │
    │                                                          │
    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
    │  │ Inscriptions │  │ Participants │  │   Autres...  │ │
    │  │   Liste ↻    │  │   Liste ↻    │  │     ...      │ │
    │  └──────────────┘  └──────────────┘  └──────────────┘ │
    └────────────────────────────────────────────────────────┘
```

## 2. Flux détaillé de validation

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FLUX DE VALIDATION                            │
└─────────────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════════════╗
║  ÉTAPE 1 : L'utilisateur finalise un paiement                       ║
╚════════════════════════════════════════════════════════════════════╝

    [Utilisateur] → Clique "Finaliser le paiement"
           ↓
    [Dialog s'ouvre]
           ↓
    [Sélectionne mode paiement : Espèce]
           ↓
    [Clique "Valider le paiement"]
           ↓
    
╔════════════════════════════════════════════════════════════════════╗
║  ÉTAPE 2 : Traitement dans CaissePaiementsPage                      ║
╚════════════════════════════════════════════════════════════════════╝

    handleValiderPaiement() {
        ↓
    ┌─────────────────────────────────────┐
    │ 1. Marquer comme finalisé localement│
    │    newSet.add(participant.id)       │
    └─────────────┬───────────────────────┘
                  ↓
    ┌─────────────────────────────────────┐
    │ 2. Sauvegarder dans localStorage    │
    │    setItem('finalisedParticipants') │
    │    setItem('finalisedPayments')     │
    └─────────────┬───────────────────────┘
                  ↓
    ┌─────────────────────────────────────┐
    │ 3. Dispatcher l'événement           │
    │    dispatchEvent('paymentFinalized')│
    └─────────────┬───────────────────────┘
                  ↓
    ┌─────────────────────────────────────┐
    │ 4. Fermer le dialog                 │
    └─────────────┬───────────────────────┘
                  ↓
    ┌─────────────────────────────────────┐
    │ 5. Afficher le toast de succès      │
    └─────────────────────────────────────┘
    }

╔════════════════════════════════════════════════════════════════════╗
║  ÉTAPE 3 : Propagation via l'événement                              ║
╚════════════════════════════════════════════════════════════════════╝

    window.dispatchEvent('paymentFinalized')
           │
           ├──────────────────────┬──────────────────────┬────────────
           │                      │                      │
           ▼                      ▼                      ▼
    [Hook écoute]          [Page écoute]         [Autres écoutent]
           │                      │                      │
           ▼                      ▼                      ▼
    [Re-calcule data]      [Met à jour stats]    [Rafraîchissent]
           │                      │                      │
           └──────────────────────┴──────────────────────┘
                                  │
                                  ▼
╔════════════════════════════════════════════════════════════════════╗
║  ÉTAPE 4 : Tous les composants sont mis à jour                      ║
╚════════════════════════════════════════════════════════════════════╝

    React re-render cascade
           │
           ├─→ DashboardHome       [Paiements en attente: 15 → 14]
           ├─→ Sidebar             [Badge Paiement: 15 → 14]
           ├─→ CaissePaiementsPage [Stats mises à jour]
           ├─→ CaisseInscriptions  [Participant apparaît]
           └─→ Participants        [Participant visible]

╔════════════════════════════════════════════════════════════════════╗
║  ÉTAPE 5 : Résultat visible pour l'utilisateur                      ║
╚════════════════════════════════════════════════════════════════════╝

    ✓ Toast vert "Paiement finalisé"
    ✓ Compteur diminue instantanément
    ✓ Participant disparaît de la liste
    ✓ Badges de sidebar à jour
    ✓ Toutes les pages synchronisées
```

## 3. Synchronisation multi-onglets

```
┌─────────────────────────────────────────────────────────────────────┐
│                   SYNCHRONISATION MULTI-ONGLETS                      │
└─────────────────────────────────────────────────────────────────────┘

    ONGLET 1                           ONGLET 2
    ┌──────────────┐                   ┌──────────────┐
    │ Page Paiement│                   │ Dashboard    │
    │              │                   │              │
    │ [Finalise]   │                   │ Stats: 15    │
    └──────┬───────┘                   └──────────────┘
           │                                   │
           │ 1. Validation                     │
           │                                   │
           ▼                                   │
    ┌──────────────────┐                      │
    │  localStorage    │                      │
    │  Update          │                      │
    └──────┬───────────┘                      │
           │                                   │
           │ 2. storage event                 │
           │────────────────────────────────→ │
           │                                   ▼
           │                            ┌──────────────┐
           │                            │ Event détecté│
           │                            └──────┬───────┘
           │                                   │
           │                                   │ 3. Reload data
           │                                   ▼
           │                            ┌──────────────┐
           │                            │ Stats: 14 ✓  │
           │                            └──────────────┘
           │
           │ 4. customEvent aussi
           │────────────────────────────────→
                                               │
                                               ▼
                                        ┌──────────────┐
                                        │ Double check │
                                        │ Stats: 14 ✓  │
                                        └──────────────┘
```

## 4. Diagramme de classes (simplifié)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        STRUCTURE DES DONNÉES                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Participant                                          │
├──────────────────────────────────────────────────────┤
│ + id: string                                         │
│ + nom: string                                        │
│ + prenom: string                                     │
│ + statut: 'membre' | 'non-membre' | 'vip' | 'speaker'│
│ + statutInscription: 'finalisée' | 'non-finalisée'   │ ← MODIFIÉ
│ + organisation: string                               │
│ + email: string                                      │
│ + telephone: string                                  │
│ + dateInscription: string                            │
└──────────────────────────────────────────────────────┘
                           │
                           │ Transformé par
                           ▼
┌──────────────────────────────────────────────────────┐
│ applyFinalisedStatus()                               │
├──────────────────────────────────────────────────────┤
│ Input:  Participant[] + Set<string>                  │
│ Output: Participant[] (avec statuts mis à jour)      │
│                                                      │
│ Logic:                                               │
│   if (finalisedIds.has(p.id) &&                     │
│       p.statutInscription === 'non-finalisée') {    │
│     return { ...p, statutInscription: 'finalisée' } │
│   }                                                  │
└──────────────────────────────────────────────────────┘
                           │
                           │ Utilisé par
                           ▼
┌──────────────────────────────────────────────────────┐
│ useDynamicInscriptions() Hook                        │
├──────────────────────────────────────────────────────┤
│ State:                                               │
│ • finalisedParticipantsIds: Set<string>              │
│ • participants: Participant[]                        │
│                                                      │
│ Effects:                                             │
│ • Listen to 'paymentFinalized' event                 │
│ • Listen to data updates                             │
│                                                      │
│ Returns:                                             │
│ • participants (auto-updated)                        │
│ • organisations                                      │
│ • rendezVous                                         │
│ • reservations                                       │
└──────────────────────────────────────────────────────┘
```

## 5. États du système

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ÉTATS DU PARTICIPANT                          │
└─────────────────────────────────────────────────────────────────────┘

    ÉTAT INITIAL
    ┌──────────────────────────┐
    │ Participant              │
    │ ┌──────────────────────┐ │
    │ │ statutInscription:   │ │
    │ │ 'non-finalisée'      │ │
    │ └──────────────────────┘ │
    │                          │
    │ Visible dans:            │
    │ ✓ Page Paiements         │
    │ ✗ Page Participants      │
    └────────┬─────────────────┘
             │
             │ [Caissier finalise le paiement]
             │
             ▼
    ÉTAT TRANSITIONNEL (< 100ms)
    ┌──────────────────────────┐
    │ localStorage updated     │
    │ Event dispatched         │
    │ Hook processing...       │
    └────────┬─────────────────┘
             │
             ▼
    ÉTAT FINAL
    ┌──────────────────────────┐
    │ Participant              │
    │ ┌──────────────────────┐ │
    │ │ statutInscription:   │ │
    │ │ 'finalisée' ✓        │ │
    │ └──────────────────────┘ │
    │                          │
    │ Visible dans:            │
    │ ✗ Page Paiements         │
    │ ✓ Page Participants ✓    │
    │ ✓ Page Inscriptions ✓    │
    │ ✓ Documents générables ✓ │
    └──────────────────────────┘
```

## 6. Timeline de synchronisation

```
┌─────────────────────────────────────────────────────────────────────┐
│                          TIMELINE                                    │
└─────────────────────────────────────────────────────────────────────┘

T=0ms     │ [CLICK] Valider le paiement
          │
T=5ms     │ ▼ handleValiderPaiement() exécuté
          │ ├─ État local mis à jour
          │ └─ localStorage.setItem()
          │
T=10ms    │ ▼ window.dispatchEvent('paymentFinalized')
          │
T=15ms    │ ▼ Event propagation
          │ ├─→ Hook listener activé
          │ ├─→ Page listener activé
          │ └─→ Autres listeners activés
          │
T=20ms    │ ▼ Hook processing
          │ ├─ localStorage.getItem()
          │ ├─ applyFinalisedStatus()
          │ └─ setParticipants()
          │
T=30ms    │ ▼ React reconciliation
          │ ├─ Components compare old vs new state
          │ └─ Decide which components need re-render
          │
T=40ms    │ ▼ DOM updates
          │ ├─ Dashboard stats updated
          │ ├─ Sidebar badges updated
          │ ├─ Paiements list updated
          │ └─ Other components updated
          │
T=50ms    │ ▼ Browser paint
          │ └─ User sees the changes
          │
T=60ms    │ ✅ ALL DONE
          │ ✓ Dialog closed
          │ ✓ Toast displayed
          │ ✓ Counters updated
          │ ✓ Participant removed from list
          │ ✓ Badges updated
          │
          └─────────────────────────────────────

Total time: < 100ms 
User perception: INSTANTANEOUS ⚡
```

## 7. Graphe de dépendances

```
┌─────────────────────────────────────────────────────────────────────┐
│                     GRAPHE DE DÉPENDANCES                            │
└─────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │  localStorage    │
                    │  (Source Truth)  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  CustomEvent     │
                    │ paymentFinalized │
                    └────────┬─────────┘
                             │
                             ▼
            ┌────────────────────────────────┐
            │ useDynamicInscriptions (Hook)  │
            └────────┬───────────────────────┘
                     │
         ┌───────────┼───────────┬───────────┬───────────┐
         │           │           │           │           │
         ▼           ▼           ▼           ▼           ▼
    ┌────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
    │Dashboard│ │ Sidebar │ │Paiements│ │Inscrip. │ │Particip.│
    └────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
         │           │           │           │           │
         └───────────┴───────────┴───────────┴───────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  UI mis à jour  │
                        │  automatiquement│
                        └─────────────────┘
```

## Légende

```
┌─────────────────────────────────────────────────────────────────────┐
│                             LÉGENDE                                  │
└─────────────────────────────────────────────────────────────────────┘

→   Flux de données
▼   Étape suivante
├─  Branchement / Sous-étape
└─  Fin de branche
│   Continuation
✓   État validé
✗   État non validé
⚡   Opération rapide
↻   Mise à jour
[...] Composant ou action
{...} Données
```

---

**Ce diagramme illustre le fonctionnement complet du système de synchronisation.**  
Pour plus de détails, consultez les autres fichiers de documentation.

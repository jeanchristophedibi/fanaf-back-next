# Désactivation des Inscriptions Automatiques

## Date de mise à jour
27 octobre 2025

## Contexte
Le système FANAF 2026 incluait précédemment un mécanisme de simulation qui générait automatiquement de nouvelles inscriptions, organisations, et rendez-vous pour démontrer le fonctionnement dynamique de l'interface.

## Modification appliquée
**Toutes les nouvelles inscriptions automatiques ont été désactivées** dans le système.

## Détails techniques

### Fichier modifié
- **`/components/hooks/useDynamicInscriptions.ts`**

### Changement
```typescript
// AVANT
export function useDynamicInscriptions({ 
  enabled = true,  // ← Activé par défaut
  ...
}: UseDynamicDataOptions = {}) {

// APRÈS
export function useDynamicInscriptions({ 
  enabled = false,  // ← DÉSACTIVÉ par défaut
  ...
}: UseDynamicDataOptions = {}) {
```

### Impact
Ce changement désactive complètement l'ajout automatique de :
- ✓ Nouveaux participants
- ✓ Nouvelles organisations
- ✓ Nouveaux rendez-vous
- ✓ Nouvelles réservations de stand

### Composants affectés
Le hook `useDynamicInscriptions` est utilisé dans **18 composants** :
1. `DashboardHome.tsx`
2. `InscriptionsPage.tsx`
3. `ReservationsPage.tsx`
4. `OrganisationsPage.tsx`
5. `NetworkingPage.tsx`
6. `ListeInscriptionsPage.tsx`
7. `DashboardAnalytics.tsx`
8. `FinancePage.tsx`
9. `DynamicDataIndicator.tsx`
10. `HistoriqueDemandesPage.tsx`
11. `ListePaiementsPage.tsx`
12. `AgentFanafSidebar.tsx`
13. `PaiementsEnAttentePage.tsx`
14. `DocumentsParticipantsPage.tsx`
15. `ParticipantsFinalisesPage.tsx`
16. `PaiementsDashboardPage.tsx`
17. `CaisseInscriptionsPage.tsx`
18. `CaissePaiementsPage.tsx`

Tous ces composants bénéficient maintenant de données statiques sans ajout automatique.

## Données existantes
Les **150 participants initiaux** générés au démarrage de l'application restent disponibles :
- 45 membres finalisés (payés)
- 40 non-membres finalisés (payés)
- 10 VIP (exonérés)
- 5 speakers (exonérés)
- 30 membres en attente de paiement
- 20 non-membres en attente de paiement

Ces données sont suffisantes pour tester et utiliser toutes les fonctionnalités du système.

## Avantages de cette modification
1. **Données prévisibles** : Les statistiques et compteurs restent constants
2. **Performance améliorée** : Pas de re-rendu causé par l'ajout de nouvelles données
3. **Tests facilités** : Les tests sont reproductibles avec des données fixes
4. **Expérience utilisateur claire** : Pas de surprise avec de nouvelles inscriptions inattendues

## Réactivation (si nécessaire)
Pour réactiver le système d'inscriptions automatiques :

1. Ouvrir `/components/hooks/useDynamicInscriptions.ts`
2. Modifier la ligne 24 :
   ```typescript
   enabled = false  // Changer à true
   ```
3. Ou passer explicitement `enabled: true` lors de l'appel du hook dans un composant :
   ```typescript
   const { participants } = useDynamicInscriptions({ enabled: true });
   ```

## Intervalles de génération
Lorsque le système est activé, les nouvelles données sont générées selon ces intervalles :
- **Par défaut** : 120 000 ms (2 minutes)
- **Personnalisable** via le paramètre `interval`

## Notes importantes
- ✅ Le système de synchronisation des paiements continue de fonctionner normalement
- ✅ La finalisation manuelle des paiements par la caisse fonctionne toujours
- ✅ Tous les compteurs et statistiques se mettent à jour correctement
- ✅ Les événements personnalisés (localStorage) fonctionnent normalement
- ✅ Les filtres, recherches et exports restent opérationnels

## Historique
- **27 octobre 2025** : Désactivation complète des inscriptions automatiques
- **Versions précédentes** : Système activé avec génération toutes les 2 minutes

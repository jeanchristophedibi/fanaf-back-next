# Test de Synchronisation des Paiements

## Objectif
Vérifier que tous les compteurs visuels se mettent à jour automatiquement après la finalisation d'un paiement.

## Prérequis
- Ouvrir le profil Caisse
- S'assurer qu'il y a au moins 1 paiement en attente

## Procédure de test

### Test 1 : Finalisation d'un paiement

#### Étape 1 : État initial
1. Aller sur la page "Tableau de bord" (Home)
2. Noter les valeurs suivantes :
   - **Paiements en attente** : [valeur A]
   - **Paiements finalisés** : [valeur B]

3. Vérifier la sidebar :
   - **Badge "Paiement"** : [valeur C] (doit être égal à A)

#### Étape 2 : Aller sur la page Paiements
1. Cliquer sur "Paiement" dans la sidebar
2. Vérifier les statistiques en haut :
   - **Total en attente** : [doit être égal à A]
   - **Membres** : [noter la valeur]
   - **Non-membres** : [noter la valeur]
   - **Montant total** : [noter la valeur]

#### Étape 3 : Finaliser un paiement
1. Choisir un participant dans la liste
2. Cliquer sur "Finaliser le paiement"
3. Sélectionner un mode de paiement (ex: Espèce)
4. Cliquer sur "Valider le paiement"
5. ✅ Vérifier qu'un message de succès s'affiche

#### Étape 4 : Vérifications immédiates sur la page Paiements
Après la validation, **sans recharger la page**, vérifier :

1. **Statistiques en haut** :
   - ✅ **Total en attente** doit avoir diminué de 1 (A - 1)
   - ✅ **Membres** ou **Non-membres** doit avoir diminué de 1 (selon le type)
   - ✅ **Montant total** doit être recalculé automatiquement
   
2. **Liste des paiements** :
   - ✅ Le participant finalisé doit avoir **disparu de la liste**
   - ✅ Le compteur sous la barre de recherche doit être à jour

3. **Sidebar** :
   - ✅ Le badge "Paiement" doit afficher (A - 1)
   - ✅ Le badge "Participants" doit afficher (B + 1)
   - ✅ Le badge "Documents" doit afficher (B + 1)

#### Étape 5 : Vérification sur le Tableau de bord
1. Cliquer sur "Tableau de bord" dans la sidebar
2. Vérifier les statistiques :
   - ✅ **Paiements en attente** : (A - 1)
   - ✅ **Paiements finalisés** : (B + 1)
   - ✅ **Revenus collectés** : Doit être recalculé

#### Étape 6 : Vérification sur la page Inscriptions
1. Cliquer sur "Inscriptions" dans la sidebar
2. ✅ Le participant finalisé doit apparaître dans la liste avec un badge vert "Finalisé"

#### Étape 7 : Vérification sur la page Participants
1. Cliquer sur "Participants" dans la sidebar
2. ✅ Le participant doit être visible dans la liste
3. ✅ Les boutons "Documents", "Check-in" et "RDV" doivent être disponibles

### Test 2 : Finalisation de plusieurs paiements en succession

1. Retourner sur la page "Paiement"
2. Finaliser 3 paiements d'affilée
3. Vérifier après chaque finalisation :
   - ✅ Le compteur "Total en attente" diminue à chaque fois
   - ✅ Les participants disparaissent de la liste un par un
   - ✅ Les badges de la sidebar se mettent à jour progressivement

### Test 3 : Synchronisation multi-onglets (optionnel)

1. Ouvrir l'application dans 2 onglets différents
2. Dans l'onglet 1 : Aller sur "Paiement"
3. Dans l'onglet 2 : Rester sur "Tableau de bord"
4. Dans l'onglet 1 : Finaliser un paiement
5. Dans l'onglet 2 : 
   - ✅ Les statistiques doivent se mettre à jour automatiquement
   - ✅ Pas besoin de rafraîchir la page

## Checklist complète

### Éléments qui doivent se mettre à jour :

#### Dashboard Home
- [ ] Paiements en attente (-1)
- [ ] Paiements finalisés (+1)
- [ ] Badges générés (si le badge était déjà généré)
- [ ] Revenus collectés (recalculé)

#### Sidebar
- [ ] Badge "Paiement" (-1)
- [ ] Badge "Participants" (+1)
- [ ] Badge "Documents" (+1)

#### Page Paiements
- [ ] Total en attente (-1)
- [ ] Membres OU Non-membres (-1 selon le type)
- [ ] Montant total (recalculé)
- [ ] Disparition du participant de la liste
- [ ] Compteur de résultats sous la recherche

#### Page Inscriptions
- [ ] Apparition du participant avec statut "Finalisé"

#### Page Participants
- [ ] Apparition du participant dans la liste
- [ ] Disponibilité des boutons d'action

## Résultats attendus

### ✅ Succès
- Tous les compteurs se mettent à jour instantanément
- Aucun rechargement de page nécessaire
- Les transitions sont fluides
- Le toast de confirmation s'affiche
- Les données sont cohérentes partout

### ❌ Échec
Si l'un des éléments suivants se produit :
- Les compteurs ne se mettent pas à jour
- Il faut rafraîchir la page pour voir les changements
- Les chiffres sont incohérents entre les pages
- Le participant ne disparaît pas de la liste des paiements

## Cas limites à tester

### Cas 1 : Dernier paiement en attente
1. Finaliser le dernier paiement en attente
2. ✅ Le compteur doit passer à 0
3. ✅ Un message "Aucun paiement en attente" doit s'afficher
4. ✅ Une icône verte de succès doit apparaître

### Cas 2 : Paiement avec filtre actif
1. Appliquer un filtre de recherche
2. Finaliser un paiement visible dans les résultats filtrés
3. ✅ Le paiement doit disparaître de la liste filtrée
4. ✅ Les compteurs globaux doivent se mettre à jour (pas seulement les compteurs filtrés)

### Cas 3 : Retour en arrière
1. Finaliser un paiement
2. Naviguer vers d'autres pages
3. Revenir sur la page Paiements
4. ✅ L'état doit être conservé
5. ✅ Le participant ne doit pas réapparaître

## Débogage

### Si les compteurs ne se mettent pas à jour :

1. Ouvrir la console du navigateur (F12)
2. Vérifier qu'aucune erreur n'est affichée
3. Taper dans la console :
   ```javascript
   localStorage.getItem('finalisedParticipantsIds')
   ```
   - ✅ Doit retourner un array d'IDs

4. Vérifier que l'événement est bien dispatché :
   ```javascript
   window.addEventListener('paymentFinalized', (e) => {
     console.log('Payment finalized event received:', e.detail);
   });
   ```

5. Vérifier le localStorage :
   ```javascript
   console.log('Finalised participants:', 
     JSON.parse(localStorage.getItem('finalisedParticipantsIds') || '[]')
   );
   ```

## Performance

### Métriques à surveiller :
- ⚡ Temps de mise à jour : < 100ms
- ⚡ Pas de lag visible lors de la mise à jour
- ⚡ Pas de clignotement des compteurs
- ⚡ Animations fluides

## Conclusion

Ce système de synchronisation garantit une expérience utilisateur fluide et réactive. Tous les compteurs visuels doivent se mettre à jour instantanément sans nécessiter de rechargement de page, offrant ainsi une interface moderne et professionnelle pour les utilisateurs du profil Caisse.

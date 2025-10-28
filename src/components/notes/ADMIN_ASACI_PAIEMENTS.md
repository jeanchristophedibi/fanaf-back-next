# Guide Administrateur ASACI - Gestion des Paiements

## Vue d'ensemble

Le profil **Administrateur ASACI** est un profil distinct créé spécifiquement pour la gestion des inscriptions et des paiements de l'événement FANAF 2026.

**⚠️ Note importante** : Ce profil est différent du profil "Administration FANAF" qui a un accès en lecture seule sur toutes les données.

## Mode Démonstration

La page **Paiements en attente** affiche actuellement **6 paiements échantillon** pour illustrer le fonctionnement :

- **2 paiements Cash** (Espèces)
- **2 paiements par Virement bancaire**
- **2 paiements par Chèque**

Un bouton **"Réinitialiser"** permet de restaurer les 6 paiements après validation pour tester à nouveau.

Le profil **Administrateur ASACI** dispose de trois rubriques principales :

1. **Liste des inscriptions** - Consultation de toutes les inscriptions
2. **Paiements** - Gestion des encaissements (2 sous-rubriques)
3. **Organisations** - Gestion des organisations participantes
4. **Networking** - Suivi des rendez-vous

## Structure du Menu

### 📋 Rubrique 1 : Liste des Inscriptions

**Navigation** : Menu principal → "Liste des inscriptions"

**Fonctionnalités** :
- Affichage de toutes les inscriptions (tous statuts confondus)
- Informations clés : nom, prénom, organisation, date d'inscription, statut, mode de paiement
- Filtres avancés par :
  - Statut participant (membre, non-membre, VIP, speaker)
  - Statut inscription (finalisée, non-finalisée)
  - Organisation
  - Pays
  - Période d'inscription
- Recherche par mot-clé
- Export CSV de toutes les données affichées

### 💳 Rubrique 2 : Paiements

#### 2.1 Paiements en Attente

**Navigation** : Menu principal → "Paiements" → "Paiements en attente"

**🎯 Mode Démonstration** :
- Affichage de **6 paiements échantillon** (2 Cash, 2 Virement, 2 Chèque)
- Bouton **"Réinitialiser"** pour restaurer les données après tests
- Les données sont sauvegardées dans localStorage

**Description** :
Cette page affiche **uniquement** les paiements en attente dont le mode de paiement est :
- 💵 **Cash** (Espèces)
- 🏦 **Virement bancaire**
- 📝 **Chèque**

Les autres modes de paiement (Mobile Money, Carte bancaire, etc.) ne sont PAS affichés ici car ils sont gérés automatiquement.

**📋 Colonnes du tableau** :
Chaque ligne affiche :
1. **Référence** (ex: FANAF-2026-001)
2. **Participant** : Nom, Prénom, Email
3. **Organisation**
4. **Statut** : Badge coloré (Membre / Non-Membre)
5. **Mode Paiement** : Badge coloré (Cash vert / Virement bleu / Chèque violet)
6. **Montant** : 350 000 FCFA (membres) ou 400 000 FCFA (non-membres)
7. **Date d'enregistrement**
8. **Action** : Bouton vert **"Finaliser le paiement"**

**📊 Statistiques affichées** :
- Total des paiements en attente (badge orange)
- Nombre de paiements Cash (icône verte)
- Nombre de virements bancaires (icône bleue)
- Nombre de chèques (icône violette)

**⚙️ Fonctionnalités** :
1. **Filtrage** :
   - Par mode de paiement (Cash, Virement, Chèque)
   - Par statut participant (Membre, Non-membre)
   - Recherche par nom, prénom, référence, email, organisation
   - Bouton "Réinitialiser tous les filtres"

2. **Finalisation de paiement** :
   - Bouton **"Finaliser le paiement"** sur chaque ligne
   - Popup de confirmation obligatoire : **"Confirmez-vous avoir encaissé ce paiement ?"**
   - Récapitulatif détaillé dans le popup :
     ```
     Participant : Amadou Diallo
     Référence : FANAF-2026-001
     Mode de paiement : Chèque
     Montant : 350 000 FCFA
     Organisation : Assurance du Bénin
     
     ⚠️ Cette action marquera le paiement comme "Encaissé" (validé). 
        Le participant disparaîtra de cette liste.
     ```
   - Deux options :
     - ✅ **"Oui, confirmer l'encaissement"** (bouton vert)
     - ❌ **"Annuler"** (bouton gris)

3. **Mise à jour automatique** :
   - Après confirmation : statut paiement → **"Encaissé"**
   - Le participant disparaît de la liste des paiements en attente
   - Notification de succès : *"Paiement encaissé avec succès - [Nom] - [Mode paiement]"*
   - Animation fluide de disparition

4. **Export CSV** :
   - Colonnes : Référence, Nom, Prénom, Email, Organisation, Statut, Mode Paiement, Tarif, Date Inscription

#### 2.2 Liste des Paiements

**Navigation** : Menu principal → "Paiements" → "Liste des paiements"

**Description** :
Affichage de **TOUS** les paiements enregistrés, quel que soit leur mode ou statut.

**Colonnes affichées** :
- Type de paiement (membre, non-membre, VIP, speaker)
- Référence participant
- Nom et prénom
- Organisation
- Montant (avec mention "Exonéré" pour VIP et speakers)
- Mode de paiement (icône + libellé)
- Canal d'encaissement (EXTERNE ou ASAPAY)
- Date d'inscription
- Date de paiement
- Pays

**Statistiques** :
- Total des paiements + montant total
- Paiements canal EXTERNE + montant
- Paiements canal ASAPAY + montant

**Fonctionnalités** :
- Filtres par :
  - Statut de paiement (payé, non-payé)
  - Mode de paiement (espèce, virement, chèque, carte, mobile money, etc.)
  - Canal d'encaissement (externe, ASAPAY)
- Recherche par référence, nom, email, organisation
- Pagination (10 paiements par page)
- Export CSV de tous les paiements

## Règles de Gestion

### Tarification
- **Membre** : 350 000 FCFA
- **Non-membre** : 400 000 FCFA
- **VIP** : Exonéré (0 FCFA)
- **Speaker** : Exonéré (0 FCFA)

### Modes de Paiement Acceptés

**Paiements manuels** (nécessitent confirmation Admin ASACI) :
- Cash (Espèces)
- Virement bancaire
- Chèque

**Paiements automatiques** (ne nécessitent PAS de confirmation) :
- Carte bancaire
- Orange Money
- Wave
- Mobile Money
- Autres moyens électroniques

### Workflow de Validation

```
1. Participant s'inscrit → Statut inscription : "non-finalisée"
   ↓
2. Participant indique son mode de paiement souhaité
   ↓
3a. Si Cash/Virement/Chèque → Apparaît dans "Paiements en attente"
   ↓
   Admin ASACI confirme l'encaissement
   ↓
   Statut inscription : "finalisée"
   
3b. Si paiement électronique → Traitement automatique
   ↓
   Statut inscription : "finalisée" (automatique)
```

### Droits et Permissions

Le profil **Administrateur ASACI/FANAF** dispose des droits suivants :
- ✅ Consultation de toutes les rubriques
- ✅ Validation des paiements Cash/Virement/Chèque
- ✅ Export des données (CSV)
- ✅ Filtrage et recherche avancés
- ❌ Modification des inscriptions (lecture seule)
- ❌ Suppression de participants

## Stockage des Données

### localStorage - Modes de Paiement Déclarés
Clé : `modesPaiementDeclares`

Format :
```json
{
  "participant-id-1": "Cash",
  "participant-id-2": "Virement bancaire",
  "participant-id-3": "Chèque",
  "participant-id-4": "Carte bancaire"
}
```

**Note** : Seuls les participants avec mode "Cash", "Virement bancaire" ou "Chèque" apparaissent dans la page "Paiements en attente".

## Notifications et Confirmations

### Messages de Succès
- **Encaissement confirmé** : 
  ```
  ✅ Paiement encaissé avec succès
  Jean Dupont - Cash
  ```

### Messages d'Export
- **Export CSV réussi** :
  ```
  ✅ Export CSV téléchargé avec succès
  ```

## Navigation Rapide

| Page | Chemin de navigation |
|------|---------------------|
| Accueil | Menu → Accueil |
| Liste inscriptions | Menu → Liste des inscriptions |
| Paiements en attente | Menu → Paiements → Paiements en attente |
| Liste paiements | Menu → Paiements → Liste des paiements |
| Organisations | Menu → Organisations → [sous-rubrique] |
| Networking | Menu → Networking → [sous-rubrique] |
| Check-in | Menu → Check-in |

## Points Importants

⚠️ **ATTENTION** :
1. La confirmation d'encaissement est **IRRÉVERSIBLE**
2. Vérifiez toujours les informations avant de confirmer
3. Seuls les paiements Cash/Virement/Chèque nécessitent une validation manuelle
4. Les paiements électroniques sont gérés automatiquement

💡 **CONSEILS** :
- Utilisez les filtres pour cibler rapidement les paiements à traiter
- Exportez régulièrement les données pour vos rapports
- Vérifiez les statistiques pour un suivi en temps réel

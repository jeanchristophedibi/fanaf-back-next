# Liste Officielle des 150 Participants FANAF 2026

## 📋 Vue d'ensemble

La liste des participants a été **fixée et unifiée** pour garantir que **tous les profils** voient exactement les **mêmes 150 participants**.

### ✅ Changements appliqués

1. **Liste fixe de 150 participants** : Remplace la génération aléatoire par une liste officielle validée
2. **Données identiques pour tous les profils** : Admin Agence, Admin FANAF, Admin ASACI, Opérateur Badge, Opérateur Caisse, Agent d'Inscription
3. **Suppression des participants fictifs** : Plus de génération aléatoire de nouveaux participants
4. **Désactivation des inscriptions automatiques** : Les fonctions `addRandomParticipant()` et `createParticipantGroup()` sont désactivées

---

## 👥 Répartition des 150 Participants

### Participants Finalisés (110 total)

#### Membres Finalisés : 55
- **9 paiements par Espèce** (Canal: EXTERNE)
- **9 paiements par Carte bancaire** (Canal: ASAPAY)
- **9 paiements par Orange Money** (Canal: ASAPAY)
- **9 paiements par Wave** (Canal: ASAPAY)
- **9 paiements par Virement** (Canal: EXTERNE)
- **10 paiements par Chèque** (Canal: EXTERNE)
- **Dont 2 Référents** (ID 45 et 46 pour Sanlam et Saham)

#### Non-Membres Finalisés : 40
- **8 paiements par Espèce** (Canal: EXTERNE)
- **8 paiements par Carte bancaire** (Canal: ASAPAY)
- **8 paiements par Orange Money** (Canal: ASAPAY)
- **8 paiements par Wave** (Canal: ASAPAY)
- **8 paiements par Virement** (Canal: EXTERNE)

#### VIP Finalisés : 10
- **Exonérés de paiement** (statut spécial)
- Incluent Commissaires, Présidents, Ministres, Directeurs Généraux

#### Speakers Finalisés : 5
- **Exonérés de paiement** (statut spécial)
- Experts internationaux invités

### Participants Non-Finalisés (40 total)

#### Membres en Attente : 20
- Inscriptions en attente de paiement

#### Non-Membres en Attente : 20
- Inscriptions en attente de paiement

---

## 🔐 Garanties de Cohérence

### 1. Identités Fixes et Uniques
Chaque participant a une identité complète et cohérente :
- **ID fixe** : de '1' à '150'
- **Référence unique** : FANAF-2026-001 à FANAF-2026-150
- **Nom et Prénom** : Combinaisons uniques, pas de doublons
- **Email unique** : prenom.nom@example.com ou email professionnel
- **Téléphone unique** : Numéros fixes pour chaque participant
- **Pays** : Distribution réaliste (Côte d'Ivoire, Sénégal, Mali, Burkina Faso, Gabon, Maroc, etc.)
- **Fonction** : Postes professionnels cohérents
- **Organisation** : Affiliations fixes (org1 à org10)

### 2. Données de Paiement Cohérentes
Pour les participants finalisés :
- **Mode de paiement** : Espèce, Carte, Orange Money, Wave, Virement, Chèque
- **Canal d'encaissement** : 
  - EXTERNE pour Espèce, Virement, Chèque
  - ASAPAY pour Carte bancaire, Orange Money, Wave
- **Date d'inscription** : Entre janvier 2025 et février 2025
- **Date de paiement** : 1 à 5 jours après l'inscription

### 3. Statuts Validés
- **Statut participant** : membre, non-membre, vip, speaker, referent
- **Statut inscription** : finalisée, non-finalisée
- **Conformité organisation** : Le statut du participant correspond au statut de son organisation

---

## 🔒 Sécurité et Intégrité

### Désactivation des Ajouts Dynamiques

```typescript
// AVANT : Génération aléatoire
let dynamicParticipants: Participant[] = generateParticipants();

// APRÈS : Liste officielle fixe
let dynamicParticipants: Participant[] = getOfficialParticipants();
```

### Fonctions Désactivées

1. **`addRandomParticipant()`**
   - Retourne maintenant le dernier participant (pas d'ajout réel)
   - Console warning : "❌ Ajout de participants désactivé"

2. **`createParticipantGroup()`**
   - Retourne un tableau vide (pas de création réelle)
   - Console warning : "❌ Création de groupes désactivée"

3. **`useDynamicInscriptions` hook**
   - `enabled = false` par défaut
   - Plus de génération automatique d'inscriptions

---

## 📊 Exemples de Participants Officiels

### Membre Finalisé (ID: 1)
```json
{
  "id": "1",
  "nom": "Diallo",
  "prenom": "Amadou",
  "reference": "FANAF-2026-001",
  "email": "amadou.diallo@example.com",
  "telephone": "+225 0701234501",
  "pays": "Côte d'Ivoire",
  "fonction": "Directeur Général",
  "organisationId": "org1",
  "statut": "membre",
  "statutInscription": "finalisée",
  "dateInscription": "2025-01-15",
  "modePaiement": "espèce",
  "canalEncaissement": "externe",
  "datePaiement": "2025-01-18"
}
```

### VIP Finalisé (ID: 96)
```json
{
  "id": "96",
  "nom": "N'Guessan",
  "prenom": "Alassane",
  "reference": "FANAF-2026-096",
  "email": "alassane.nguessan@example.com",
  "telephone": "+225 0701234596",
  "pays": "Côte d'Ivoire",
  "fonction": "Commissaire Général FANAF",
  "organisationId": "org1",
  "statut": "vip",
  "statutInscription": "finalisée",
  "dateInscription": "2025-01-20"
}
```

### Membre en Attente (ID: 111)
```json
{
  "id": "111",
  "nom": "Koné",
  "prenom": "Yaya",
  "reference": "FANAF-2026-111",
  "email": "yaya.kone@example.com",
  "telephone": "+225 0701234611",
  "pays": "Côte d'Ivoire",
  "fonction": "Responsable Actuariat",
  "organisationId": "org1",
  "statut": "membre",
  "statutInscription": "non-finalisée",
  "dateInscription": "2025-01-20"
}
```

---

## 🎯 Profils et Accès

### Tous les profils voient les mêmes 150 participants

| Profil | Accès Données | Permissions |
|--------|---------------|-------------|
| **Admin Agence de Communication** | ✅ Tous les 150 participants | Consultation, Modification, Validation |
| **Administrateur FANAF** | ✅ Tous les 150 participants | Consultation, Modification, Validation |
| **Administrateur ASACI** | ✅ Tous les 150 participants | Validation paiements, Consultation |
| **Opérateur Badge** | ✅ Tous les 150 participants | Génération badges, Check-in |
| **Opérateur Caisse** | ✅ Tous les 150 participants | Encaissement, Validation paiements |
| **Agent d'Inscription** | ✅ Tous les 150 participants | Consultation, Création inscriptions |

**Note** : Les permissions et droits d'action restent différenciés selon le rôle, mais **les données visibles sont identiques**.

---

## 🔄 Impact sur le Système

### Fichiers Modifiés

1. **`/components/data/mockData.ts`**
   - Création de `getOfficialParticipants()` : Liste fixe de 150 participants
   - Remplacement de `generateParticipants()` par `getOfficialParticipants()`
   - Désactivation de `addRandomParticipant()`
   - Désactivation de `createParticipantGroup()`

### Fichiers Inchangés

- **`/components/hooks/useDynamicInscriptions.ts`** : Déjà désactivé (`enabled = false`)
- **Tous les composants profils** : Continuent à utiliser `getCurrentParticipants()`

---

## ✅ Validation

### Test de Cohérence
Pour vérifier que tous les profils voient les mêmes participants :

1. Se connecter avec **Admin Agence** → Noter le nombre total de participants
2. Se connecter avec **Admin ASACI** → Vérifier le même nombre
3. Se connecter avec **Opérateur Badge** → Vérifier le même nombre
4. Comparer les références FANAF-2026-001 à FANAF-2026-150 dans chaque profil

**Résultat attendu** : Exactement 150 participants identiques dans tous les profils.

### Test de Non-Ajout
Pour vérifier qu'aucun nouveau participant ne peut être ajouté :

1. Ouvrir la console du navigateur
2. Exécuter manuellement `addRandomParticipant()`
3. Vérifier le warning : "❌ Ajout de participants désactivé"
4. Confirmer que le compteur reste à 150

---

## 📝 Notes Importantes

1. **Pas de génération automatique** : La liste de 150 participants est fixe et ne change pas
2. **Modifications manuelles possibles** : Les administrateurs peuvent toujours modifier les données des participants existants (statuts, paiements, etc.)
3. **Synchronisation localStorage** : Les finalisations de paiement sont toujours synchronisées via localStorage
4. **Cohérence garantie** : Tous les profils accèdent à la même source de données (`mockParticipants`)

---

## 🎓 Pour les Développeurs

### Ajouter de Nouveaux Participants (si nécessaire)

Si vous devez ajouter un nouveau participant officiel, modifiez directement le tableau dans `getOfficialParticipants()` :

```typescript
// Dans /components/data/mockData.ts
const getOfficialParticipants = (): Participant[] => {
  const participants: Participant[] = [
    // ... les 150 participants existants
    
    // Nouveau participant (ID: 151)
    { 
      id: '151', 
      nom: 'Nouveau', 
      prenom: 'Participant',
      reference: 'FANAF-2026-151',
      // ... autres champs obligatoires
    },
  ];
  
  return participants;
};
```

**⚠️ IMPORTANT** : Assurez-vous que tous les champs requis sont remplis et que l'ID est unique.

---

## 📅 Date de Mise à Jour

**Dernière modification** : 28 octobre 2025

**Version** : 1.0

**Auteur** : Équipe Technique FANAF 2026

---

## 🔗 Documents Connexes

- `/DESACTIVATION_INSCRIPTIONS_AUTOMATIQUES.md`
- `/SYNCHRONISATION_PAIEMENTS.md`
- `/SPECIFICATIONS_TECHNIQUES_PROFILS.md`

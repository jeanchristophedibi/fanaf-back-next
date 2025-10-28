# Profil Administrateur ASACI - Documentation Technique

## Vue d'ensemble

Le profil **Administrateur ASACI** est un nouveau profil distinct créé spécifiquement pour la gestion opérationnelle des inscriptions et des paiements de FANAF 2026.

### Distinction avec Administration FANAF

| Caractéristique | Administration FANAF | Administrateur ASACI |
|----------------|---------------------|---------------------|
| **Objectif** | Consultation et statistiques | Gestion opérationnelle des paiements |
| **Accès données** | Lecture seule sur toutes les rubriques | Lecture et écriture sur paiements |
| **Rubriques** | Inscriptions, Organisations, Networking, Check-in, Encaissement | Inscriptions (lecture), Paiements (gestion) |
| **Actions** | Consultation, export, check-in | Validation paiements Cash/Virement/Chèque |
| **Icône** | 👥 Users (bleu) | 🛡️ ShieldCheck (indigo) |

## Architecture des Fichiers

### Fichiers créés

```
/components/
├── AdminAsaciDashboard.tsx       # Dashboard principal du profil
├── AdminAsaciSidebar.tsx         # Menu de navigation latéral
└── AdminAsaciPaiementsEnAttentePage.tsx  # Page de gestion des paiements en attente
```

### Intégration dans App.tsx

```typescript
// Nouveau type de profil ajouté
type UserProfile = 'agence' | 'fanaf' | 'asaci' | 'agent' | 'operateur' | 'badge' | 'inscription';

// Rendu conditionnel
{userProfile === 'asaci' && (
  <AdminAsaciDashboard onSwitchProfile={() => setUserProfile(null)} />
)}
```

## Structure des Rubriques

### 1. Accueil
- Dashboard avec statistiques générales
- Vue d'ensemble de l'activité

### 2. Liste des Inscriptions
- **Mode** : Lecture seule
- **Composant** : `<ListeInscriptionsPage readOnly userProfile="asaci" />`
- **Fonctionnalités** :
  - Consultation de toutes les inscriptions
  - Filtres avancés
  - Recherche
  - Export CSV

### 3. Paiements (Menu déroulant)

#### 3.1 Paiements en Attente
- **Mode** : Lecture et écriture
- **Composant** : `<AdminAsaciPaiementsEnAttentePage />`
- **Fonctionnalités** :
  - Affichage des paiements Cash/Virement/Chèque uniquement
  - Validation manuelle des encaissements
  - Popup de confirmation obligatoire
  - Mise à jour du statut inscription après validation

#### 3.2 Liste des Paiements
- **Mode** : Lecture seule
- **Composant** : `<ListePaiementsPage />`
- **Fonctionnalités** :
  - Consultation de tous les paiements
  - Statistiques par canal (EXTERNE/ASAPAY)
  - Filtres et recherche
  - Export CSV

## Types et Interfaces

### NavItem (AdminAsaciDashboard.tsx)

```typescript
export type NavItem =
  | 'home'
  | 'inscriptions-liste'
  | 'paiements-attente'
  | 'paiements-liste';
```

### PaiementEnAttente Interface

```typescript
interface PaiementEnAttente extends Participant {
  modePaiementDeclare?: 'Cash' | 'Virement bancaire' | 'Chèque';
}
```

## Fonctionnalités Clés

### 1. Filtrage des Paiements en Attente

**Logique de filtrage** :
```typescript
// Récupération du mode de paiement déclaré depuis localStorage
const modesPaiement = JSON.parse(localStorage.getItem('modesPaiementDeclares') || '{}');

// Filtrage strict : uniquement Cash, Virement, Chèque
const paiementsEnAttente = participants.filter(p => {
  // Paiement non finalisé
  if (p.statutInscription === 'finalisée') return false;
  
  // Uniquement membre et non-membre
  if (p.statut !== 'membre' && p.statut !== 'non-membre') return false;
  
  // Mode de paiement autorisé
  const modeDeclare = modesPaiement[p.id];
  return modeDeclare === 'Cash' || 
         modeDeclare === 'Virement bancaire' || 
         modeDeclare === 'Chèque';
});
```

### 2. Validation d'Encaissement

**Workflow** :
1. Utilisateur clique sur "Confirmer encaissement"
2. Popup de confirmation s'affiche avec récapitulatif
3. Utilisateur confirme ou annule
4. Si confirmé :
   - Statut inscription → `finalisée`
   - Mode paiement enregistré
   - Date paiement enregistrée
   - Notification de succès
   - Participant disparaît de la liste

**Code de validation** :
```typescript
const handleValidatePayment = () => {
  updateParticipant(selectedParticipant.id, {
    statutInscription: 'finalisée',
    modePaiement: selectedParticipant.modePaiementDeclare,
    datePaiement: new Date().toISOString()
  });

  toast.success('Paiement encaissé avec succès', {
    description: `${selectedParticipant.prenom} ${selectedParticipant.nom} - ${selectedParticipant.modePaiementDeclare}`,
  });
};
```

### 3. Statistiques en Temps Réel

Calcul automatique des statistiques par mode de paiement :
```typescript
const statsParMode = useMemo(() => ({
  cash: paiementsEnAttente.filter(p => p.modePaiementDeclare === 'Cash').length,
  virement: paiementsEnAttente.filter(p => p.modePaiementDeclare === 'Virement bancaire').length,
  cheque: paiementsEnAttente.filter(p => p.modePaiementDeclare === 'Chèque').length,
  total: paiementsEnAttente.length
}), [paiementsEnAttente]);
```

## Hooks Utilisés

### useDynamicInscriptions
- Gestion de l'état des participants
- Fonction `updateParticipant()` pour mise à jour
- Synchronisation temps réel avec localStorage

## Design et UX

### Couleurs Principales
- **Primaire** : Indigo (#6366F1)
- **Secondaire** : Orange (#F97316)
- **Succès** : Vert (#10B981)
- **Attention** : Orange (#F59E0B)

### Cartes Statistiques
```typescript
// Total en attente - Orange
bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200

// Cash - Vert
bg-green-600 (icône)

// Virement - Bleu
bg-blue-600 (icône)

// Chèque - Violet
bg-purple-600 (icône)
```

### Badges Mode Paiement
- **Cash** : `border-green-300 text-green-700 bg-green-50`
- **Virement** : `border-blue-300 text-blue-700 bg-blue-50`
- **Chèque** : `border-purple-300 text-purple-700 bg-purple-50`

## Sécurité et Validation

### Contrôles de Sécurité
1. ✅ Confirmation obligatoire avant validation
2. ✅ Vérification des champs obligatoires
3. ✅ Validation du mode de paiement
4. ✅ Vérification du statut participant
5. ✅ Action irréversible clairement indiquée

### Messages d'Avertissement
```
⚠️ Cette action marquera le paiement comme encaissé et finalisera l'inscription.
```

## Export CSV

### Colonnes exportées
1. Référence
2. Nom
3. Prénom
4. Email
5. Organisation
6. Statut (membre/non-membre)
7. Mode Paiement
8. Tarif (FCFA)
9. Date Inscription

### Format de fichier
```
paiements_en_attente_YYYY-MM-DD.csv
```

## Permissions et Droits

### Actions Autorisées
- ✅ Consultation de toutes les inscriptions
- ✅ Validation paiements Cash/Virement/Chèque
- ✅ Export CSV
- ✅ Filtrage et recherche

### Actions Interdites
- ❌ Modification des inscriptions
- ❌ Suppression de participants
- ❌ Accès aux autres rubriques (Organisations, Networking)
- ❌ Check-in participants

## Navigation

### Structure du Menu

```
📊 Accueil
📋 Liste des inscriptions
💳 Paiements
   ├─ 📝 Paiements en attente
   └─ 📄 Liste des paiements
```

### État du Menu
- Menu "Paiements" ouvert par défaut
- Indicateur visuel sur l'item actif
- Couleur orange pour les items actifs

## Différences avec Opérateur Caisse

| Fonctionnalité | Opérateur Caisse | Administrateur ASACI |
|----------------|------------------|---------------------|
| **Accès inscriptions** | Toutes les pages | Lecture seule uniquement |
| **Validation paiements** | Tous modes | Cash/Virement/Chèque uniquement |
| **Génération badges** | Non | Non |
| **Popup confirmation** | Oui | Oui (obligatoire) |
| **Export** | Oui | Oui |

## Tests Recommandés

### Scénarios de Test

1. **Test de filtrage**
   - Vérifier que seuls Cash/Virement/Chèque apparaissent
   - Vérifier exclusion VIP et speakers
   - Vérifier exclusion paiements finalisés

2. **Test de validation**
   - Confirmer encaissement → statut finalisé
   - Annuler encaissement → aucun changement
   - Vérifier disparition de la liste après validation

3. **Test d'export**
   - Export avec filtres actifs
   - Export liste vide
   - Vérification des colonnes CSV

4. **Test de navigation**
   - Changement de rubriques
   - État du menu préservé
   - Changer de profil

## Maintenance

### Points de Vigilance

1. **localStorage** : Le système utilise `modesPaiementDeclares` pour stocker les modes déclarés
2. **Synchronisation** : S'assurer que `useDynamicInscriptions` est à jour
3. **Validation** : Toujours vérifier la cohérence des données avant validation

### Évolutions Futures Possibles

- [ ] Ajout d'un historique des validations
- [ ] Notification push lors de nouveaux paiements en attente
- [ ] Statistiques avancées par période
- [ ] Export PDF des reçus de paiement
- [ ] Gestion des remboursements

## Support et Contact

Pour toute question ou problème concernant ce profil :
- Consulter `/ADMIN_ASACI_PAIEMENTS.md` pour le guide utilisateur
- Vérifier les logs dans la console navigateur
- Tester dans l'environnement de développement

## Changelog

### Version 1.0.0 (28 octobre 2025)
- ✅ Création du profil Administrateur ASACI
- ✅ Implémentation de la gestion des paiements en attente
- ✅ Intégration dans App.tsx
- ✅ Documentation complète

# 📝 PROFIL : AGENT D'INSCRIPTION

## 📋 Vue d'ensemble

Le profil **Agent d'inscription** est dédié à la création et la gestion des inscriptions pour l'événement FANAF 2026. Il permet de créer de nouvelles inscriptions via un processus guidé en plusieurs étapes et de suivre les inscriptions en attente de paiement.

---

## 🎯 Fonctionnalités principales

### 1. Nouvelle inscription (processus guidé)
Formulaire en 4 étapes avec validation et génération automatique de facture proforma :

#### **Étape 1 : Informations personnelles du participant**
- Civilité (M., Mme, Mlle)
- Nom et prénom
- Email (avec vérification unicité)
- Téléphone
- Pays d'origine
- Poste/Fonction
- Type d'identité (Passeport ou CNI)
- Numéro d'identité (avec vérification unicité)

**Validations** :
- ✅ Tous les champs obligatoires remplis
- ✅ Format email valide
- ✅ Email unique (vérification dans la base)
- ✅ Numéro d'identité unique (simulation)

#### **Étape 2 : Sélection du type de participant**
Trois options disponibles :
- **Membre FANAF** : 350 000 FCFA
- **Non-membre** : 400 000 FCFA
- **VIP** : Exonéré

#### **Étape 3 : Détails de l'inscription**

**Pour les Non-membres** :
- Choix du type d'inscription :
  - **Individuel** : Un seul participant
  - **Groupé** : Plusieurs participants de la même organisation
  
- Si **inscription groupée** :
  - Ajout dynamique d'autres participants
  - Pour chaque participant : civilité, nom, prénom, email, téléphone
  - Tous les participants du groupe partagent la même organisation

**Pour tous les types** :
- Informations de l'organisation :
  - Nom de l'organisation (obligatoire)
  - Contact téléphonique
  - Email (obligatoire)
  - Pays (obligatoire)
  - Ville
  - Adresse complète

#### **Étape 4 : Confirmation et finalisation**
- Récapitulatif de toutes les informations saisies
- Vérification finale
- Bouton de finalisation

**Après finalisation** :
- ✅ Inscription créée avec statut **"en attente de paiement"**
- ✅ Génération automatique d'une **facture proforma**
- ✅ Attribution d'une référence unique (format : `REF-YYYY-XXXXX`)
- ✅ Attribution d'un numéro de facture proforma (format : `PRO-YYYY-XXXXX`)
- ✅ Possibilité de télécharger la facture proforma (format PNG)
- ✅ Sauvegarde dans localStorage
- ✅ Déclenchement d'événement pour synchronisation

### 2. Inscriptions en cours
Liste et gestion des inscriptions en attente de paiement :

**Fonctionnalités** :
- 📊 Statistiques en temps réel :
  - Total des inscriptions en attente
  - Nombre de membres en attente
  - Nombre de non-membres en attente
  
- 🔍 Recherche multi-critères :
  - Par nom
  - Par prénom
  - Par email
  - Par référence

- 📋 Table détaillée avec :
  - Référence participant
  - Nom complet
  - Email et téléphone
  - Organisation
  - Statut (membre/non-membre/VIP)
  - Montant à payer
  - Date d'inscription

- ⚙️ Actions disponibles :
  - 👁️ Voir la facture proforma
  - 📥 Télécharger la facture proforma
  - 📊 Exporter la liste en CSV

---

## 🎨 Interface et design

### Palette de couleurs
- **Couleur principale** : Amber/Jaune doré (`#d97706`, `#f59e0b`)
- **Boutons** : `bg-amber-600 hover:bg-amber-700`
- **Accents** : Orange chaud pour cohérence avec l'identité FANAF

### Indicateur de progression
Barre de progression visuelle avec 4 étapes :
- ✅ Étapes complétées : fond vert avec icône checkmark
- 🔵 Étape active : fond amber avec icône blanche
- ⚪ Étapes à venir : fond gris avec icône grise

### Animations
- Transitions fluides entre les étapes (motion/react)
- Effets de hover sur les boutons
- Animations des statistiques (AnimatedStat)

---

## 📊 Structure des données

### Participant créé
```typescript
{
  id: string;                    // "part-{timestamp}"
  reference: string;             // "REF-YYYY-XXXXX"
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  pays: string;
  fonction: string;              // Poste/Fonction
  organisationId: string;
  statut: 'membre' | 'non-membre' | 'vip';
  statutInscription: 'non-finalisée';  // En attente de paiement
  dateInscription: string;       // ISO 8601
  groupeId?: string;             // Si inscription groupée
  nomGroupe?: string;            // Nom du groupe
}
```

### Organisation créée
```typescript
{
  id: string;                    // "org-{timestamp}"
  nom: string;
  contact: string;
  email: string;
  pays: string;
  ville: string;
  adresse: string;
  dateCreation: string;          // ISO 8601
  statut: 'membre' | 'non-membre';
}
```

### Facture proforma
```typescript
{
  numeroFacture: string;         // "PRO-YYYY-XXXXX"
  participant: Participant;
  organisation: Organisation;
  montant: number;               // Calculé selon statut
  dateEmission: Date;
}
```

---

## 🔄 Workflow complet

```
1. Agent ouvre "Nouvelle inscription"
   ↓
2. Remplit informations personnelles
   ↓ (validation unicité email et numéro identité)
3. Sélectionne type de participant
   ↓
4. Remplit détails inscription
   ↓ (si groupé : ajoute autres participants)
5. Saisit informations organisation
   ↓
6. Confirme et finalise
   ↓
7. Système crée :
   - Participant(s) avec statut "en attente de paiement"
   - Organisation
   - Facture proforma
   ↓
8. Agent télécharge la facture proforma
   ↓
9. Inscription visible dans "Inscriptions en cours"
   ↓
10. L'Opérateur Caisse peut maintenant finaliser le paiement
```

---

## 🔗 Intégration avec les autres profils

### Avec Opérateur Caisse
- Les inscriptions créées avec statut **"en attente de paiement"** (`statutInscription: 'non-finalisée'`) apparaissent dans la liste des paiements à finaliser de l'Opérateur Caisse
- L'Opérateur Caisse peut alors :
  - Voir les détails de l'inscription
  - Finaliser le paiement
  - Changer le statut à `'finalisée'`
  - Générer les documents officiels (badge, lettre, reçu)

### Avec Opérateur Badge
- Une fois le paiement finalisé par l'Opérateur Caisse, le participant devient visible dans la liste de l'Opérateur Badge
- L'Opérateur Badge peut alors générer :
  - Badge participant
  - Lettre d'invitation
  - Reçu de paiement (si applicable)

---

## 🗂️ Fichiers du profil

### Composants principaux
```
📁 components/
  ├── AgentInscriptionMain.tsx           # Point d'entrée principal
  ├── AgentInscriptionSidebar.tsx        # Navigation latérale
  ├── AgentInscriptionDashboard.tsx      # Tableau de bord avec stats
  ├── NouvelleInscriptionPage.tsx        # Formulaire multi-étapes
  ├── InscriptionsEnCoursPage.tsx        # Liste inscriptions en attente
  └── ProformaInvoiceGenerator.tsx       # Générateur facture proforma
```

### Navigation
```typescript
const routes = [
  { id: 'accueil', label: 'Accueil', icon: Home },
  { id: 'nouvelle', label: 'Nouvelle inscription', icon: UserPlus },
  { id: 'en-cours', label: 'Inscriptions en cours', icon: Clock },
];
```

---

## 📈 Statistiques du dashboard

### Indicateurs clés
1. **En attente de paiement** : Nombre total d'inscriptions non finalisées
2. **Inscriptions finalisées** : Nombre d'inscriptions avec paiement validé
3. **Inscriptions groupées** : Nombre de groupes + nombre de participants
4. **Dernières 24h** : Inscriptions créées dans les dernières 24 heures

### Répartition par type
- **Membres** : Nombre en attente + barre de progression
- **Non-membres** : Nombre en attente + barre de progression
- **VIP** : Nombre en attente + barre de progression

### Tarification affichée
- Membre FANAF : 350 000 FCFA
- Non-membre : 400 000 FCFA
- VIP / Speaker : Exonéré

---

## 🛡️ Sécurité et validations

### Vérifications obligatoires
1. **Unicité de l'email** :
   ```typescript
   const emailExists = participants.some(p => 
     p.email.toLowerCase() === formData.email.toLowerCase()
   );
   ```

2. **Unicité du numéro d'identité** :
   - Actuellement simulée
   - À implémenter avec base de données réelle

3. **Format email** :
   ```typescript
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   ```

4. **Validation des champs** :
   - Tous les champs marqués (*) sont obligatoires
   - Vérification avant passage à l'étape suivante

---

## 💾 Persistance des données

### localStorage
Les données sont stockées dans :
```javascript
// Participants
localStorage.setItem('dynamicParticipants', JSON.stringify(participants));

// Organisations
localStorage.setItem('mockOrganisations', JSON.stringify(organisations));
```

### Événements
Déclenchement d'événement après sauvegarde :
```javascript
window.dispatchEvent(new Event('storage'));
```

Cela permet la synchronisation en temps réel avec les autres profils.

---

## 📱 Responsive design

L'interface s'adapte automatiquement :
- **Desktop** : Grilles multi-colonnes, formulaires côte à côte
- **Tablet** : Grilles 2 colonnes
- **Mobile** : Grilles 1 colonne, navigation adaptée

---

## 🎯 Cas d'usage

### Cas 1 : Inscription individuelle membre
1. Agent remplit infos personnelles
2. Sélectionne "Membre FANAF"
3. Saisit infos organisation
4. Finalise → Facture proforma 350 000 FCFA générée

### Cas 2 : Inscription groupée non-membre
1. Agent remplit infos participant principal
2. Sélectionne "Non-membre"
3. Choisit "Inscription groupée"
4. Ajoute 3 autres participants
5. Saisit infos organisation
6. Finalise → 4 participants créés avec même `groupeId`
7. 4 factures proforma générées (400 000 FCFA chacune)

### Cas 3 : Inscription VIP
1. Agent remplit infos personnelles
2. Sélectionne "VIP"
3. Saisit infos organisation
4. Finalise → Facture proforma "Exonéré" générée

---

## 📄 Facture proforma

### Contenu
- **En-tête** : Logo FANAF 2026, dates événement
- **Numéro** : Format PRO-YYYY-XXXXX
- **Facturé à** : Participant + Organisation
- **Détails** : 
  - Description : "Inscription FANAF 2026 - [Type]"
  - Quantité : 1
  - Prix unitaire : Selon statut
  - Montant total
- **Modalités de paiement** :
  - Modes acceptés
  - Validité : 30 jours
  - Note importante
- **Conditions générales**
- **Pied de page** : Coordonnées FANAF

### Génération
- Utilise `html2canvas` pour conversion HTML → Image
- Format de sortie : PNG
- Nom du fichier : `facture-proforma-{référence}.png`

---

## 🔧 Configuration App.tsx

```typescript
type UserProfile = 'agence' | 'fanaf' | 'agent' | 'operateur' | 'badge' | 'inscription';

// Carte de sélection
<Button 
  onClick={() => setUserProfile('inscription')}
  className="bg-amber-600 hover:bg-amber-700"
>
  Accéder
</Button>

// Rendu
{userProfile === 'inscription' && (
  <AgentInscriptionMain />
)}
```

---

## 🚀 Prochaines améliorations

### Phase 1 : Backend
- [ ] Connexion à Supabase pour persistance réelle
- [ ] Vérification unicité email via API
- [ ] Vérification unicité numéro identité via API
- [ ] Stockage des factures proforma dans Supabase Storage

### Phase 2 : Fonctionnalités avancées
- [ ] Modification d'une inscription en cours
- [ ] Annulation d'une inscription
- [ ] Envoi automatique de la facture par email
- [ ] Notifications en temps réel

### Phase 3 : Rapports
- [ ] Export PDF de la facture proforma
- [ ] Statistiques avancées par période
- [ ] Rapport journalier des inscriptions créées

---

## 📊 Métriques à suivre

- **Nombre d'inscriptions créées** par jour/semaine/mois
- **Taux de conversion** (inscriptions créées → paiements finalisés)
- **Temps moyen** pour créer une inscription
- **Nombre d'inscriptions groupées** vs individuelles
- **Répartition** membres/non-membres/VIP

---

## ✅ Checklist de validation

Avant de considérer une inscription comme valide :
- [x] Email unique vérifié
- [x] Numéro d'identité unique vérifié (simulé)
- [x] Tous les champs obligatoires remplis
- [x] Format email valide
- [x] Organisation créée
- [x] Référence unique générée
- [x] Statut "en attente de paiement" défini
- [x] Facture proforma générée
- [x] Données sauvegardées dans localStorage
- [x] Événement de synchronisation déclenché

---

**Date de création** : 28 octobre 2025  
**Version** : 1.0  
**Auteur** : Équipe FANAF 2026  
**Profil** : Agent d'inscription

# 📦 EXPORT CODE SOURCE - PROFILS UTILISATEURS FANAF 2026

## 📋 Vue d'ensemble

Ce document répertorie tous les fichiers sources associés à chaque profil utilisateur du système de gestion FANAF 2026. Il permet aux développeurs de localiser rapidement les composants à modifier ou à finaliser pour chaque profil.

---

## 🎯 PROFILS DISPONIBLES

Le système comprend **5 profils utilisateurs distincts** :

1. **Admin Agence de Communication** - Gestion complète avec accès Sponsors
2. **Administrateur FANAF** - Consultation + module Encaissement
3. **Caisse** - Finalisation inscriptions + génération documents
4. **Opérateur Caisse** - Gestion paiements uniquement
5. **Opérateur Badge** - Gestion documents et badges uniquement

---

## 🏢 1. PROFIL : Admin Agence de Communication

### Description
Accès complet à toutes les fonctionnalités du système. Peut gérer les inscriptions, organisations, networking, comité d'organisation et sponsors.

### Fichiers principaux
```
📁 components/
  ├── Dashboard.tsx                      # Point d'entrée principal
  ├── Sidebar.tsx                        # Navigation latérale
  └── DashboardHome.tsx                  # Page d'accueil avec statistiques

📁 Pages fonctionnelles/
  ├── InscriptionsPage.tsx               # Gestion des inscriptions
  ├── OrganisationsPage.tsx              # Gestion des organisations
  ├── NetworkingPage.tsx                 # Gestion du networking
  ├── ComiteOrganisationPage.tsx         # Gestion du comité
  ├── ReservationsPage.tsx               # Gestion des sponsors (sous-menu)
  
📁 Pages de support/
  ├── DashboardAnalytics.tsx             # Analyses et statistiques
  ├── FinancePage.tsx                    # Page financière
  ├── CalendarView.tsx                   # Vue calendrier
  ├── HistoriqueDemandesPage.tsx         # Historique des demandes
  ├── CheckInScanner.tsx                 # Scanner check-in
  └── NotificationCenter.tsx             # Centre de notifications
```

### Composants UI réutilisables
```
📁 components/
  ├── AnimatedStat.tsx                   # Statistiques animées
  ├── InscriptionsEvolutionChart.tsx     # Graphique évolution inscriptions
  ├── DynamicDataIndicator.tsx           # Indicateur données dynamiques
  └── NotificationPush.tsx               # Notifications push
```

### Générateurs de documents
```
📁 components/
  ├── BadgeGenerator.tsx                 # Génération badges participants
  ├── BadgeReferentGenerator.tsx         # Génération badges référents
  ├── InvitationLetterGenerator.tsx      # Lettres d'invitation
  ├── ReceiptGenerator.tsx               # Reçus de paiement
  ├── InvoiceGenerator.tsx               # Factures
  └── GroupDocumentsGenerator.tsx        # Documents groupés
```

### Couleur principale
🟠 **Orange** (`#ea580c`, `#f97316`)

---

## 👤 2. PROFIL : Administrateur FANAF

### Description
Accès en consultation seule à toutes les données + module complet de gestion des encaissements (trésorerie).

### Fichiers principaux
```
📁 components/
  ├── AdminFanafDashboard.tsx            # Point d'entrée principal
  ├── AdminFanafSidebar.tsx              # Navigation latérale
  
📁 Pages accessibles (lecture seule)/
  ├── InscriptionsPage.tsx               # Vue inscriptions (lecture)
  ├── OrganisationsPage.tsx              # Vue organisations (lecture)
  ├── NetworkingPage.tsx                 # Vue networking (lecture)
  ├── ComiteOrganisationPage.tsx         # Vue comité (lecture)
  
📁 Module Encaissement (accès complet)/
  ├── PaiementsDashboardPage.tsx         # Tableau de bord paiements
  ├── ListePaiementsPage.tsx             # Liste complète des paiements
  ├── ListeInscriptionsPage.tsx          # Liste inscriptions avec paiements
  ├── PaiementsEnAttentePage.tsx         # Paiements en attente
  ├── PaiementsGroupesPage.tsx           # Paiements par groupes
  ├── TousPaiementsPage.tsx              # Vue consolidée tous paiements
  └── ParticipantsFinalisesPage.tsx      # Participants avec paiement finalisé
```

### Particularités
- Mode **lecture seule** pour les sections principales (pas de boutons d'ajout/modification/suppression)
- Accès **complet** au module Encaissement avec toutes les fonctionnalités de trésorerie
- Visualisation des statistiques en temps réel

### Couleur principale
🔵 **Bleu** (`#2563eb`, `#3b82f6`)

---

## 💳 3. PROFIL : Caisse (Agent FANAF)

### Description
Finalise les inscriptions en attente et génère les documents (badges, lettres, reçus). Accès limité aux inscriptions avec paiement en attente.

### Fichiers principaux
```
📁 components/
  ├── AgentFanafDashboard.tsx            # Point d'entrée principal
  ├── AgentFanafSidebar.tsx              # Navigation latérale
  └── CaisseInscriptionsPage.tsx         # Page principale de finalisation
```

### Fonctionnalités clés
1. **Finalisation des paiements** :
   - Validation du mode de paiement
   - Saisie du montant perçu
   - Gestion du rendu monnaie
   - Enregistrement de la date de paiement

2. **Génération de documents** :
   - Badge participant (après finalisation)
   - Lettre d'invitation (après finalisation)
   - Reçu de paiement (après finalisation, sauf VIP/Speaker)

3. **Filtres avancés** :
   - Par statut (membre, non-membre, VIP, speaker)
   - Par organisation
   - Par recherche (nom, prénom, email, référence)

### Composants utilisés
```
📁 Générateurs/
  ├── BadgeGenerator.tsx                 # Génération badges
  ├── InvitationLetterGenerator.tsx      # Lettres d'invitation
  └── ReceiptGenerator.tsx               # Reçus de paiement
```

### Règles métier spécifiques
- **Tarifs** :
  - Non-membres : 400 000 FCFA
  - Membres : 350 000 FCFA
  - VIP : Exonéré
  - Speaker : Exonéré

- **Modes de paiement** :
  - Espèce (avec gestion du rendu)
  - Carte bancaire
  - Orange Money
  - Wave
  - Virement
  - Chèque

- **Génération des documents** :
  - Documents générés uniquement après finalisation du paiement
  - Badge et lettre disponibles pour tous
  - Reçu disponible uniquement pour membres et non-membres (pas pour VIP/Speaker)

### Couleur principale
🟢 **Vert** (`#16a34a`, `#22c55e`)

---

## 💰 4. PROFIL : Opérateur Caisse (Paiements)

### Description
Accès dédié uniquement à la gestion des paiements avec un tableau de bord spécialisé. Vue consolidée de tous les flux financiers.

### Fichiers principaux
```
📁 components/
  ├── OperateurCaisseMain.tsx            # Point d'entrée principal
  ├── OperateurCaisseSidebar.tsx         # Navigation latérale
  ├── OperateurCaisseDashboard.tsx       # Tableau de bord spécialisé
  
📁 Pages paiements/
  ├── PaiementsDashboardPage.tsx         # Vue d'ensemble paiements
  ├── ListePaiementsPage.tsx             # Liste détaillée
  ├── ListeInscriptionsPage.tsx          # Inscriptions avec paiements
  ├── PaiementsEnAttentePage.tsx         # Paiements à traiter
  ├── PaiementsGroupesPage.tsx           # Analyse par groupes
  ├── TousPaiementsPage.tsx              # Vue consolidée
  └── ParticipantsFinalisesPage.tsx      # Paiements finalisés
```

### Statistiques du tableau de bord
- **Total des paiements** reçus
- **Paiements en attente** de validation
- **Répartition par mode de paiement** (graphique)
- **Évolution temporelle** des encaissements
- **Taux de finalisation**

### Fonctionnalités
- Visualisation des paiements en temps réel
- Filtrage par mode de paiement, organisation, période
- Export CSV des données
- Synchronisation automatique avec localStorage
- Graphiques et analyses financières

### Couleur principale
🟣 **Violet** (`#7c3aed`, `#8b5cf6`)

---

## 🎫 5. PROFIL : Opérateur Badge

### Description
Profil spécialisé uniquement dans la gestion des documents et badges. Permet de télécharger et générer les badges, lettres d'invitation et reçus pour les participants avec paiement finalisé.

### Fichiers principaux
```
📁 components/
  ├── OperateurBadgeMain.tsx             # Point d'entrée principal
  ├── OperateurBadgeSidebar.tsx          # Navigation latérale
  ├── OperateurBadgeDashboard.tsx        # Tableau de bord statistiques documents
  └── DocumentsParticipantsPage.tsx      # Page principale de gestion
```

### Statistiques du tableau de bord
- **Total participants finalisés** (avec paiement validé)
- **Badges disponibles** à générer
- **Lettres d'invitation** disponibles
- **Reçus disponibles** (membres et non-membres uniquement)
- **Répartition par statut** (graphique)

### Fonctionnalités
1. **Recherche et filtres** :
   - Recherche par nom, prénom, email, référence, organisation
   - Filtre par mode de paiement
   - Filtre par organisation
   - **Filtre par période de paiement** :
     - 7 derniers jours
     - 30 derniers jours
     - 90 derniers jours
     - **Intervalle personnalisé** (date début - date fin)

2. **Génération de documents** :
   - Badge participant individuel
   - Lettre d'invitation individuelle
   - Reçu de paiement (si applicable)
   - Téléchargement groupé de tous les badges (ZIP)

3. **Visualisation** :
   - Aperçu du badge en modal
   - Aperçu du reçu en modal
   - QR code sur chaque badge

4. **Export** :
   - Export CSV de la liste des participants
   - Téléchargement ZIP de tous les badges

### Composants utilisés
```
📁 Générateurs/
  ├── BadgeGenerator.tsx                 # Génération badges individuels
  ├── InvitationLetterGenerator.tsx      # Lettres d'invitation
  └── ReceiptGenerator.tsx               # Reçus de paiement

📁 Bibliothèques externes/
  ├── jszip                              # Création archives ZIP
  ├── html2canvas                        # Conversion HTML → Image
  └── react-qr-code                      # Génération QR codes
```

### Règles d'affichage
- **Badge** : Disponible pour tous (membre, non-membre, VIP, speaker)
- **Lettre d'invitation** : Disponible pour tous
- **Reçu de paiement** : Uniquement pour membres et non-membres (pas VIP/Speaker car exonérés)

### Couleur principale
🔷 **Teal/Cyan** (`#0891b2`, `#06b6d4`)

---

## 📊 FICHIERS COMMUNS À TOUS LES PROFILS

### Données et Hooks
```
📁 components/data/
  └── mockData.ts                        # Données mockées (participants, organisations, etc.)

📁 components/hooks/
  └── useDynamicInscriptions.ts          # Hook pour gestion dynamique des inscriptions
```

### Utilitaires Supabase
```
📁 utils/supabase/
  └── info.tsx                           # Configuration Supabase (projectId, publicAnonKey)

📁 supabase/functions/server/
  ├── index.tsx                          # Serveur Hono
  └── kv_store.tsx                       # Store clé-valeur (PROTÉGÉ)
```

### Composants UI (ShadCN)
```
📁 components/ui/
  ├── accordion.tsx
  ├── alert-dialog.tsx
  ├── alert.tsx
  ├── avatar.tsx
  ├── badge.tsx
  ├── button.tsx
  ├── calendar.tsx
  ├── card.tsx
  ├── chart.tsx
  ├── checkbox.tsx
  ├── dialog.tsx
  ├── dropdown-menu.tsx
  ├── form.tsx
  ├── input.tsx
  ├── label.tsx
  ├── pagination.tsx
  ├── popover.tsx
  ├── select.tsx
  ├── sheet.tsx
  ├── table.tsx
  ├── tabs.tsx
  ├── textarea.tsx
  ├── tooltip.tsx
  └── ... (autres composants UI)
```

### Configuration globale
```
📁 Root/
  ├── App.tsx                            # Point d'entrée, sélection profil
  
📁 styles/
  └── globals.css                        # Styles globaux + tokens Tailwind
```

---

## 🔐 GESTION DES DONNÉES ET SYNCHRONISATION

### LocalStorage - Clés utilisées

Tous les profils utilisent les mêmes clés de localStorage pour assurer la synchronisation :

```javascript
// Participants et inscriptions
'dynamicParticipants'              // Liste complète des participants
'finalisedParticipantsIds'         // IDs des participants avec paiement finalisé
'finalisedPayments'                // Détails des paiements finalisés

// Trésorerie et encaissement
'paiements'                        // Liste de tous les paiements enregistrés
'lastPaiementId'                   // Dernier ID de paiement généré

// Organisations et données
'mockOrganisations'                // Liste des organisations (si modifiable)
```

### Événements personnalisés

Le système utilise des événements personnalisés pour la synchronisation en temps réel :

```javascript
// Événement déclenché après finalisation d'un paiement
window.dispatchEvent(new Event('paymentFinalized'));

// Événement standard de modification du localStorage
window.addEventListener('storage', handleStorageChange);
```

### Workflow de finalisation d'un paiement

1. **Caisse (Agent FANAF)** finalise le paiement :
   - Enregistre dans `finalisedParticipantsIds`
   - Enregistre les détails dans `finalisedPayments`
   - Déclenche l'événement `paymentFinalized`

2. **Opérateur Badge** reçoit la mise à jour :
   - Écoute l'événement `paymentFinalized`
   - Recharge les données depuis localStorage
   - Affiche le nouveau participant dans la liste

3. **Opérateur Caisse** voit les statistiques :
   - Synchronisation automatique via événement
   - Mise à jour des graphiques et totaux

---

## 🎨 PALETTE DE COULEURS PAR PROFIL

| Profil | Couleur principale | Code Hex | Utilisation |
|--------|-------------------|----------|-------------|
| Admin Agence | 🟠 Orange | `#ea580c`, `#f97316` | Boutons, accents, badges |
| Admin FANAF | 🔵 Bleu | `#2563eb`, `#3b82f6` | Boutons, navigation |
| Caisse | 🟢 Vert | `#16a34a`, `#22c55e` | Boutons, indicateurs succès |
| Opérateur Caisse | 🟣 Violet | `#7c3aed`, `#8b5cf6` | Graphiques, stats |
| Opérateur Badge | 🔷 Teal/Cyan | `#0891b2`, `#06b6d4` | Interface, boutons |

---

## 📦 DÉPENDANCES PRINCIPALES

### Bibliothèques React
```json
{
  "react": "^18.x",
  "motion/react": "Animations (Framer Motion)",
  "lucide-react": "Icônes",
  "recharts": "Graphiques et charts",
  "react-qr-code": "Génération QR codes"
}
```

### Utilitaires
```json
{
  "jszip": "Création d'archives ZIP",
  "html2canvas": "Conversion HTML vers canvas/image",
  "sonner@2.0.3": "Notifications toast",
  "tailwindcss": "^4.0"
}
```

### Backend
```json
{
  "supabase": "Base de données et authentification",
  "hono": "Serveur edge functions"
}
```

---

## 🚀 PROCHAINES ÉTAPES POUR LES DÉVELOPPEURS

### 1. Backend et persistance
- [ ] Implémenter les appels API réels vers Supabase
- [ ] Remplacer les données mock par des requêtes DB
- [ ] Configurer les routes serveur pour chaque opération
- [ ] Implémenter l'authentification par profil

### 2. Gestion des fichiers
- [ ] Configurer Supabase Storage pour les documents
- [ ] Implémenter l'upload/download de badges
- [ ] Gérer le stockage des reçus et lettres
- [ ] Optimiser la génération de ZIP

### 3. Sécurité
- [ ] Implémenter les permissions par profil
- [ ] Ajouter la validation des données côté serveur
- [ ] Sécuriser les routes sensibles
- [ ] Audit de sécurité complet

### 4. Optimisations
- [ ] Implémenter la pagination côté serveur
- [ ] Optimiser les requêtes de filtrage
- [ ] Ajouter le cache pour les données fréquentes
- [ ] Optimiser le rendu des listes longues

### 5. Tests
- [ ] Tests unitaires pour chaque composant
- [ ] Tests d'intégration pour les workflows
- [ ] Tests de performance
- [ ] Tests de synchronisation localStorage

### 6. Documentation
- [ ] Documentation API complète
- [ ] Guide d'installation et déploiement
- [ ] Documentation des composants
- [ ] Guide utilisateur final

---

## 📞 SUPPORT ET CONTACT

Pour toute question sur le code ou l'architecture :
- Consulter les fichiers de documentation dans `/guidelines/`
- Vérifier les fichiers `ARCHITECTURE_TECHNIQUE.md` et autres MD à la racine
- Analyser les composants existants comme référence

---

## 📝 NOTES IMPORTANTES

### Fichiers protégés (NE PAS MODIFIER)
```
⛔ /supabase/functions/server/kv_store.tsx
⛔ /utils/supabase/info.tsx
⛔ /components/figma/ImageWithFallback.tsx
```

### Convention de nommage
- **Profil Admin Agence** : `Dashboard.tsx`, `Sidebar.tsx`
- **Profil Admin FANAF** : `AdminFanaf*.tsx`
- **Profil Agent/Caisse** : `AgentFanaf*.tsx`, `Caisse*.tsx`
- **Profil Opérateur Caisse** : `OperateurCaisse*.tsx`
- **Profil Opérateur Badge** : `OperateurBadge*.tsx`

### Structure de navigation
Chaque profil suit la structure :
1. **Main/Dashboard** : Point d'entrée avec layout
2. **Sidebar** : Navigation latérale
3. **Pages** : Composants de contenu spécifiques

---

**Date de création** : 27 octobre 2025  
**Version** : 1.0  
**Auteur** : Équipe FANAF 2026

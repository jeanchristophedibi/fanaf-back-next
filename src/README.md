# 🎯 FANAF 2026 - Back Office

Interface d'administration pour la gestion de l'événement FANAF 2026 (9-11 février 2026).

---

## ✅ Version Actuelle : Mock Data

L'application fonctionne avec **des données fictives en mémoire** (pas de base de données).

---

## 🚀 Démarrage Rapide

```bash
# Installer les dépendances
npm install

# Lancer l'application
npm run dev
```

L'application s'ouvre sur un écran de sélection de profil.

---

## 👥 Profils Disponibles

### 1. Admin Agence de Communication
**Accès** : Gestion complète
- ✅ Créer/Modifier/Supprimer des inscriptions
- ✅ Gérer les organisations
- ✅ Réserver des stands
- ✅ Créer des sponsors et référents
- ✅ Gérer le comité d'organisation
- ❌ Pas d'accès au module Finance

### 2. Admin FANAF
**Accès** : Consultation + Finance
- ✅ Consulter toutes les données (lecture seule)
- ✅ Accès complet au module Finance
- ✅ Statistiques et exports
- ❌ Pas de modification des données

---

## 📊 Fonctionnalités

### Tableau de Bord
- Statistiques en temps réel
- Graphiques d'évolution
- Analytics avancé (KPIs)

### Inscriptions
- Liste complète (150 participants)
- Filtres multi-critères
- Export CSV/PDF
- Génération de badges
- Plans de vol

### Réservations de Stand
- 60 stands disponibles (9m² et 12m²)
- Réservation/Libération
- Vue par allée

### Organisations
- 8 organisations (membres, non-membres, sponsors)
- Gestion des référents sponsor
- Export et statistiques

### Networking
- Rendez-vous participants
- Rendez-vous sponsors
- Calendrier interactif

### Comité d'Organisation
- Caissiers
- Agents de scan
- Gestion des accès

### Check-in
- Scanner de badges QR Code
- Suivi en temps réel
- Remontée des incidents

### Finance (Admin FANAF uniquement)
**3 Trésoreries distinctes** :
1. **Trésorerie Générale** 🟠 - Compilation FANAF + ASAPAY
2. **Trésorerie FANAF** 🔵 - Espèce & Virement
3. **Trésorerie ASAPAY** 🟣 - Paiements électroniques

**Fonctionnalités** :
- Suivi des paiements par canal
- Transactions multi-méthodes avec icônes
- Statistiques financières détaillées
- Export comptable par trésorerie
- Bloc "À Encaisser" (uniquement Trésorerie Générale)

---

## 📦 Données Mock Disponibles

### 🎯 Liste Officielle de 150 Participants (NOUVEAU)

**Tous les profils voient exactement les mêmes 150 participants** ✅

| Type                  | Quantité          | Statut |
|-----------------------|-------------------|--------|
| **Participants**      | **150 FIXES**     | ✅ Liste Officielle |
| - Membres finalisés   | 55                | Paiements enregistrés |
| - Non-membres finalisés | 40              | Paiements enregistrés |
| - VIP finalisés       | 10                | Exonérés |
| - Speakers finalisés  | 5                 | Exonérés |
| - Membres en attente  | 20                | Non finalisés |
| - Non-membres en attente | 20             | Non finalisés |
| **Organisations**     | 10                | Fixes |
| **Réservations**      | Variable          | Gérables |
| **Rendez-vous**       | Variable          | Gérables |
| **Comité**            | Variable          | Gérable |

> **🆕 Mise à jour importante** : La liste des participants est maintenant **fixe et unifiée**. Plus de génération aléatoire, plus de participants fictifs. Voir [`README_PARTICIPANTS.md`](/README_PARTICIPANTS.md)

---

## 💻 Stack Technique

- **Framework** : React + TypeScript
- **UI** : Tailwind CSS + shadcn/ui
- **Charts** : Recharts
- **Icons** : Lucide React
- **Data** : Mock data (fichier local)
- **Notifications** : Sonner

---

## 📁 Structure du Projet

```
├── App.tsx                       # Point d'entrée
├── components/
│   ├── Dashboard.tsx             # Layout Admin Agence
│   ├── AdminFanafDashboard.tsx   # Layout Admin FANAF
│   ├── DashboardHome.tsx         # Tableau de bord
│   ├── ListeInscriptionsPage.tsx # Gestion inscriptions
│   ├── ReservationsPage.tsx      # Gestion stands
│   ├── OrganisationsPage.tsx     # Gestion organisations
│   ├── NetworkingPage.tsx        # Networking & RDV
│   ├── ComiteOrganisationPage.tsx# Comité
│   ├── FinancePage.tsx           # Module Finance
│   ├── CheckInScanner.tsx        # Scanner check-in
│   ├── data/
│   │   └── mockData.ts           # ⭐ Source unique de données
│   └── ui/                       # Composants shadcn
└── styles/
    └── globals.css               # Styles globaux
```

---

## 🎨 Thème

- **Couleur principale** : Orange (#f97316)
- **Couleur secondaire** : Bleu (#3b82f6)
- **Animations** : Transitions fluides
- **Responsive** : Desktop & Mobile

---

## 🔐 Tarification Intégrée

- **Membres** : 350 000 FCFA
- **Non-membres** : 400 000 FCFA
- **VIP** : Exonéré
- **Speakers** : Exonéré

### Modes de Paiement (Répartis par Canal)

**Canal FANAF** (60% des encaissements)
- 🪙 Espèces
- 🏦 Virement bancaire

**Canal ASAPAY** (40% des encaissements - Fintech ASACI Technologies)
- 💳 Carte bancaire
- 📱 Orange Money
- 🌊 Wave

> **Nouveauté v2.0** : Séparation automatique des encaissements par canal pour une traçabilité optimale

---

## 📄 Exports Disponibles

- **CSV** : Listes de participants, organisations, stands
- **PDF** : Rapports détaillés
- **Badges** : Génération individuelle ou en masse (ZIP)
- **Lettres d'invitation** : Pour les participants

---

## ⚠️ Limitations Version Mock

Cette version utilise des **données en mémoire** :

❌ **Pas de persistance** : Les modifications sont perdues au rechargement  
❌ **Données fixes** : Impossible d'ajouter de vraies données  
❌ **Mono-utilisateur** : Pas de synchronisation multi-utilisateurs

✅ **Avantages** :
- Démarrage immédiat
- Pas de configuration
- Fonctionne offline
- Performance maximale

---

## 🔄 Rollback Effectué

Un **rollback complet** a été effectué pour revenir à la version mock.

Tous les fichiers Supabase ont été supprimés (21 fichiers).

Voir `/ROLLBACK_COMPLETE.md` pour les détails.

---

## 📚 Documentation

### 🆕 Documentation Liste Officielle des Participants
- **[README_PARTICIPANTS.md](/README_PARTICIPANTS.md)** - 📋 **START HERE** - Vue d'ensemble
- **[QUICK_REFERENCE_PARTICIPANTS.md](/QUICK_REFERENCE_PARTICIPANTS.md)** - 📖 Guide rapide utilisateur
- **[INDEX_PARTICIPANTS.md](/INDEX_PARTICIPANTS.md)** - 🗺️ Navigation complète
- **[LISTE_OFFICIELLE_150_PARTICIPANTS.md](/LISTE_OFFICIELLE_150_PARTICIPANTS.md)** - 📄 Documentation détaillée
- **[CHANGELOG_LISTE_OFFICIELLE.md](/CHANGELOG_LISTE_OFFICIELLE.md)** - 🔧 Historique technique
- **[TEST_LISTE_OFFICIELLE.md](/TEST_LISTE_OFFICIELLE.md)** - 🧪 Tests de validation
- **[GUIDE_UTILISATION_DOCUMENTATION.md](/GUIDE_UTILISATION_DOCUMENTATION.md)** - 📖 Guide d'utilisation

### Documentation Générale
- **ROLLBACK_COMPLETE.md** - Détails du rollback Supabase
- **AMELIORATIONS_APPLIQUEES.md** - Historique des améliorations
- **ARCHITECTURE_TECHNIQUE.md** - Architecture de l'app
- **MAQUETTE_ADMIN_AGENCE.md** - Spécifications admin agence
- **ROADMAP_IMPLEMENTATION.md** - Roadmap de développement

### Documentation Trésorerie (Module Finance) 💰
- **TRESORERIE_REGLES_METIER.md** - Règles métier des 3 trésoreries
- **TRESORERIE_CANAUX_SEPARATION.md** - Guide séparation FANAF/ASAPAY
- **TRESORERIE_FLUX_VISUEL.md** - Flux et architecture visuelle
- **CHANGELOG_TRESORERIE.md** - Historique des modifications v2.0

---

## 🎯 Événement FANAF 2026

**Dates** : 9-11 février 2026  
**Lieu** : Abidjan, Côte d'Ivoire  
**Secteur** : Assurance et Réassurance en Afrique

---

## 🆘 Support

Pour toute question ou problème :
1. Consultez `/ROLLBACK_COMPLETE.md`
2. Vérifiez que les données mock sont bien chargées
3. Rafraîchissez la page (Ctrl+R)

---

## ✅ Checklist de Fonctionnement

- [x] App démarre sans erreur
- [x] Sélection de profil OK
- [x] Dashboard affiche les stats
- [x] 150 participants visibles
- [x] Filtres fonctionnent
- [x] Exports CSV/PDF OK
- [x] Génération badges OK
- [x] Check-in fonctionne
- [x] Module Finance accessible (Admin FANAF)

---

**Version** : 2.1.0 (Mock Data + Trésorerie Multi-Canal + Liste Officielle)  
**Dernière mise à jour** : 28 Octobre 2025  
**Status** : ✅ Production Ready (avec données mock)

### 🆕 Nouveautés v2.1
- ✅ **Liste officielle de 150 participants fixes** (plus de génération aléatoire)
- ✅ **Cohérence garantie** entre tous les profils
- ✅ **Identités uniques** pour chaque participant (FANAF-2026-001 à 150)
- ✅ **Documentation complète** (7 fichiers de référence)
- ✅ **Tests de validation** pour garantir l'intégrité

### 🆕 Nouveautés v2.0
- ✅ Séparation FANAF/ASAPAY (Espèce+Virement vs Électronique)
- ✅ 3 trésoreries distinctes avec badges
- ✅ Icônes colorées par mode de paiement
- ✅ Bloc "À Encaisser" dans Trésorerie Générale uniquement
- ✅ Documentation complète module Finance

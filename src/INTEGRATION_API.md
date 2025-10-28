# 🔌 Documentation - Intégration API

## 📋 Vue d'ensemble

L'application intègre désormais les APIs Supabase pour charger les données depuis la base de données. Le système utilise un mécanisme de fallback automatique : si l'API n'est pas disponible, les données mockées sont utilisées.

## 🗂️ Structure des fichiers

### 1. Client Supabase (`src/utils/supabase/client.ts`)
- Configure le client Supabase avec les identifiants du projet
- Gère l'authentification et la persistance de session
- URL par défaut : `https://clyzgrxohdduaetvbyxq.supabase.co`

### 2. Service API (`src/services/api.ts`)
Service centralisé pour appeler les endpoints du serveur Hono (Supabase Edge Functions).

**Endpoints disponibles :**
- `GET /stats/dashboard` - Statistiques du dashboard
- `GET /paiements/all` - Liste tous les paiements
- `GET /paiements/:id/transactions` - Transactions d'un paiement
- `GET /finance/stats` - Statistiques financières
- `POST /participants/generate-reference` - Générer référence participant
- `POST /paiements/create` - Créer un paiement
- `POST /paiements/add-transaction` - Ajouter une transaction

### 3. Hook `useApi` (`src/hooks/useApi.ts`)
Hook React qui récupère les données depuis Supabase et l'API.

**Retourne :**
- `participants` - Liste des participants
- `organisations` - Liste des organisations
- `paiements` - Liste des paiements
- `dashboardStats` - Statistiques du dashboard
- `loading` - État de chargement
- `error` - Erreurs éventuelles
- `refetch` - Fonctions pour recharger les données

**Fonctionnalités :**
- Chargement automatique au montage
- Écoute des changements en temps réel (PostgreSQL changes)
- Gestion des erreurs
- Fallback automatique sur données mockées si API indisponible

## 🚀 Utilisation

### Dans un composant

```typescript
import { useApi } from '../hooks/useApi';

function MonComposant() {
  const { participants, organisations, loading, error } = useApi();

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <h2>Participants: {participants.length}</h2>
      <h2>Organisations: {organisations.length}</h2>
    </div>
  );
}
```

### Utilisation dans DashboardHome

Le dashboard utilise maintenant :
1. Les données de l'API en priorité (si disponibles)
2. Les données mockées en fallback (si l'API échoue)

Un indicateur visuel affiche la source des données en cours d'utilisation.

## ⚙️ Configuration

### URL de l'API

L'URL de base est définie dans `src/services/api.ts` :

```typescript
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const envApiUrl = (window as any).__ENV__?.V continualTE_API_URL;
    if (envApiUrl) return envApiUrl;
  }
  return 'https://clyzgrxohdduaetvbyxq.supabase.co/functions/v1/make-server-c3e5f95c';
};
```

Pour changer l'URL en production, définissez la variable `VITE_API_URL`.

### Changer l'URL en production

1. Ajoutez un fichier `.env` à la racine du projet :
```env
VITE_API_URL=https://votre-domaine.com/api
```

2. Redéployez l'application

## 🔄 Synchronisation en temps réel

Le hook `useApi` écoute les changements en temps réel via Supabase Realtime :

- **Participants** : Toute modification est synchronisée automatiquement
- **Organisations** : Changements synchronisés en temps réel
- **Paiements** : Mis à jour automatiquement

## 🛠️ Développement

### Mode développement

En développement local avec des données mockées :
1. Les données mockées sont automatiquement utilisées
2. Un avertissement s'affiche : "Données mockées (API non disponible)"
3. L'application fonctionne normalement

### Mode production avec API

1. Configurez localmente les variables d'environnement
2. Les données Supabase sont chargées automatiquement
3. L'indicateur affiche "Chargement des données depuis Supabase..."

## 📝 Notes importantes

- Les données mockées sont encore utilisées pour les rendez-vous (`rendezVous`) car pas encore migrées vers l'API
- Le système de réservations de stands a été retiré et n'est plus chargé
- Les statistiques du dashboard peuvent être calculées depuis l'API ou localement depuis les données chargées

## 🔍 Dépannage

### L'API ne se connecte pas

Vérifiez :
1. Que l'URL de l'API est correcte
2. Que les services Supabase Edge Functions sont déployés
3. Que CORS est bien configuré côté serveur
4. La console du navigateur pour les erreurs détaillées

### Les données ne se mettent pas à jour

1. Vérifiez la connexion WebSocket vers Supabase
2. Assurez-vous que les Realtime subscriptions sont actives
3. Vérifiez que les changements dans la base sont bien enregistrés

### Fallback sur données mockées

Si les données mockées sont utilisées :
- L'API n'est pas accessible ou Oh pace lent
- La base de données Supabase n'est pas configurée
- Les tables n'existent pas encore
- Un indicateur visuel affiche le statut

## 🚧 Améliorations futures

- [ ] Ajouter la récupération des rendez-vous via l'API
- [ ] Implémenter la gestion des réservations si nécessaire
- [ ] Ajouter la mise en cache des données
- [ ] Optimiser les requêtes pour réduire la latence
- [ ] Ajouter des tests unitaires pour le service API


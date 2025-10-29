# 🔌 Documentation - Intégration API FANAF 2026

## 📋 Vue d'ensemble

L'application intègre maintenant les endpoints de l'API FANAF 2026 pour charger et gérer les données depuis le serveur.

**Base URL**: `https://core-f26.asacitechnologies.com`

## 🗂️ Structure des fichiers

### 1. Service API (`src/services/fanafApi.ts`)

Service centralisé pour appeler tous les endpoints de l'API FANAF.

**Fonctionnalités principales:**
- Gestion automatique du token d'authentification
- Stockage du token dans localStorage
- Headers avec authentification Bearer
- Gestion d'erreurs centralisée

### 2. Hook React (`src/hooks/useFanafApi.ts`)

Hook React pour utiliser facilement l'API dans les composants.

**Retourne:**
- `participants` - Liste des participants
- `associations` - Liste des associations/organisations
- `networkingRequests` - Demandes de rendez-vous
- `registrations` - Inscriptions
- `flightPlans` - Plans de vol
- `badgeScansCounters` - Compteurs de scans de badges
- `flightPlansStats` - Statistiques des plans de vol
- `loading` - État de chargement
- `error` - Erreurs éventuelles
- Fonctions de fetch individuelles
- Accès direct à l'API via `api`

## 📡 Endpoints disponibles

### Authentification

#### `POST /api/v1/admin-auth/password-login`
Connexion avec email/password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Utilisation:**
```typescript
import { fanafApi } from '../services/fanafApi';

const response = await fanafApi.passwordLogin(email, password);
// Le token est automatiquement sauvegardé
```

### Déconnexion

#### `logout()`
Déconnexion de l'utilisateur. Supprime le token du localStorage.

**Utilisation:**
```typescript
import { fanafApi } from '../services/fanafApi';

fanafApi.logout();
// Le token est supprimé, l'utilisateur est déconnecté
```

### Vérification de l'authentification

#### `isAuthenticated(): boolean`
Vérifie si l'utilisateur est actuellement connecté.

**Utilisation:**
```typescript
import { fanafApi } from '../services/fanafApi';

if (fanafApi.isAuthenticated()) {
  // L'utilisateur est connecté
} else {
  // Rediriger vers la page de login
}
```

### Participants

#### `GET /api/v1/admin/participants`
Récupérer tous les participants.

**Query Parameters:**
- `page` (number, optional) - Numéro de page
- `per_page` (number, optional) - Nombre d'éléments par page
- `category` (string, optional) - Filtre par catégorie

**Example:**
```typescript
const response = await fanafApi.getParticipants({
  page: 1,
  per_page: 20,
  category: 'member'
});
```

### Associations/Organisations

#### `GET /api/v1/admin/associations`
Récupérer toutes les associations/organisations.

**Query Parameters:**
- `page` (number, optional) - Numéro de page
- `per_page` (number, optional) - Nombre d'éléments par page

**Example:**
```typescript
const response = await fanafApi.getAssociations({
  page: 1,
  per_page: 20
});
```

### Networking

#### `GET /api/v1/admin/networking/requests`
Récupérer les demandes de rendez-vous.

**Query Parameters:**
- `page` (number, optional) - Numéro de page
- `per_page` (number, optional) - Nombre d'éléments par page
- `type` (string, optional) - 'participant' | 'sponsor'
- `status` (string, optional) - Filtre par statut

**Example:**
```typescript
const response = await fanafApi.getNetworkingRequests({
  page: 1,
  per_page: 20,
  type: 'sponsor',
  status: 'pending'
});
```

#### `POST /api/v1/admin/networking/requests/{id}/accept`
Accepter une demande de rendez-vous.

#### `POST /api/v1/admin/networking/requests/{id}/refuse`
Refuser une demande de rendez-vous.

### Inscriptions

#### `GET /api/v1/admin/registrations`
Récupérer les inscriptions.

**Query Parameters:**
- `category` (string, optional) - 'member' | 'not_member' | 'vip'
- `per_page` (number, optional) - Nombre d'éléments par page
- `page` (number, optional) - Numéro de page

**Example:**
```typescript
const response = await fanafApi.getRegistrations({
  category: 'member',
  per_page: 20
});
```

### Plans de vol

#### `GET /api/v1/admin/flight-plans/stats`
Récupérer les statistiques des plans de vol.

**Example:**
```typescript
const stats = await fanafApi.getFlightPlansStats();
```

#### `GET /api/v1/admin/flight-plans`
Récupérer tous les plans de vol.

**Query Parameters:**
- `page` (number, optional) - Numéro de page
- `per_page` (number, optional) - Nombre d'éléments par page

**Example:**
```typescript
const response = await fanafApi.getFlightPlans({
  page: 1,
  per_page: 20
});
```

### Dashboard

#### `GET /api/v1/admin/dashboard/badge-scans/counters`
Récupérer les compteurs de scans de badges par statut.

**Example:**
```typescript
const counters = await fanafApi.getBadgeScansCounters();
```

## 🚀 Utilisation

### Connexion

```typescript
import { fanafApi } from '../services/fanafApi';

// Dans votre composant de connexion
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await fanafApi.passwordLogin(email, password);
    // Le token est automatiquement stocké dans localStorage
    // Vous pouvez maintenant utiliser les autres endpoints
  } catch (error) {
    console.error('Erreur de connexion:', error);
  }
};
```

### Utiliser le hook dans un composant

```typescript
import { useFanafApi } from '../hooks/useFanafApi';

function MonComposant() {
  const { 
    participants, 
    associations, 
    loading, 
    error,
    fetchParticipants,
    fetchAssociations 
  } = useFanafApi({ autoFetch: true });

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <h2>Participants: {participants.length}</h2>
      <h2>Associations: {associations.length}</h2>
    </div>
  );
}
```

### Fetch manuel

```typescript
import { useFanafApi } from '../hooks/useFanafApi';

function MonComposant() {
  const { fetchParticipants, participants } = useFanafApi();

  useEffect(() => {
    // Fetch avec filtres
    fetchParticipants({ 
      category: 'member',
      per_page: 50 
    });
  }, []);

  return <div>Participants: {participants.length}</div>;
}
```

### Utilisation directe de l'API

```typescript
import { fanafApi } from '../services/fanafApi';

// Récupérer des participants
const response = await fanafApi.getParticipants({ category: 'vip' });

// Accepter une demande de rendez-vous
await fanafApi.acceptNetworkingRequest('request-id');

// Récupérer les stats des plans de vol
const stats = await fanafApi.getFlightPlansStats();
```

## 🔐 Authentification

Le service gère automatiquement l'authentification :

1. Lors de la connexion, le token est automatiquement stocké
2. Chaque requête inclut le header `Authorization: Bearer {token}`
3. Le token est récupéré depuis localStorage à chaque requête

Pour déconnecter un utilisateur, vous pouvez appeler :
```typescript
localStorage.removeItem('fanaf_token');
```

## ⚙️ Configuration

### URL de base

L'URL de base est définie dans `src/services/fanafApi.ts` :

```typescript
const API_BASE_URL = 'https://core-f26.asacitechnologies.com';
```

Pour changer l'URL (développement local, staging, etc.), modifiez cette constante ou utilisez une variable d'environnement.

### Variables d'environnement (optionnel)

Vous pouvez créer un fichier `.env.local` :

```env
NEXT_PUBLIC_FANAF_API_URL=https://core-f26.asacitechnologies.com
```

Et modifier le service pour lire cette variable :
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_FANAF_API_URL || 'https://core-f26.asacitechnologies.com';
```

## 📝 Notes

- Tous les endpoints retournent des réponses paginées avec la structure `{ data: [], meta?: {...} }`
- Les erreurs sont capturées et gérées automatiquement
- Le token est persisté dans localStorage pour maintenir la session
- Le hook peut être configuré avec `autoFetch: true` pour charger automatiquement les données au montage

## 🔄 Migration depuis mockData

Pour migrer un composant qui utilise `mockData` vers l'API :

1. Remplacer `useDynamicInscriptions` par `useFanafApi` si nécessaire
2. Appeler les fonctions de fetch appropriées
3. Adapter le format des données si la structure de l'API diffère de mockData
4. Gérer les états de chargement et d'erreur

**Example:**
```typescript
// Avant (mockData)
const { participants } = useDynamicInscriptions();

// Après (API)
const { participants, loading, error, fetchParticipants } = useFanafApi({ autoFetch: true });
```


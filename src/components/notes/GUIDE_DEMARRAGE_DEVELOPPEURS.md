# 🚀 GUIDE DE DÉMARRAGE RAPIDE - DÉVELOPPEURS

## 📋 Introduction

Ce guide permet aux développeurs de démarrer rapidement sur le projet FANAF 2026 en identifiant les fichiers clés et les prochaines étapes de développement.

---

## 📦 Installation et setup

### Prérequis
```bash
Node.js >= 18.x
npm >= 9.x
Git
```

### Installation
```bash
# Cloner le projet
git clone <repository-url>
cd fanaf-2026

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

### Configuration Supabase
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Renseigner les variables
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

---

## 🗺️ Navigation rapide du code

### 1️⃣ Je veux comprendre l'architecture
**Lire en premier :**
- `/EXPORT_CODE_PROFILS.md` - Vue d'ensemble des profils et fichiers
- `/SPECIFICATIONS_TECHNIQUES_PROFILS.md` - Détails techniques
- `/ARCHITECTURE_TECHNIQUE.md` - Architecture globale

### 2️⃣ Je veux travailler sur un profil spécifique

#### Admin Agence de Communication
```bash
📍 Point d'entrée : /components/Dashboard.tsx
📍 Navigation : /components/Sidebar.tsx
📍 Pages principales :
   - /components/InscriptionsPage.tsx
   - /components/OrganisationsPage.tsx
   - /components/NetworkingPage.tsx
   - /components/ComiteOrganisationPage.tsx
```

#### Administrateur FANAF
```bash
📍 Point d'entrée : /components/AdminFanafDashboard.tsx
📍 Navigation : /components/AdminFanafSidebar.tsx
📍 Module Encaissement :
   - /components/PaiementsDashboardPage.tsx
   - /components/ListePaiementsPage.tsx
   - /components/ListeInscriptionsPage.tsx
```

#### Caisse (Agent FANAF)
```bash
📍 Point d'entrée : /components/AgentFanafDashboard.tsx
📍 Navigation : /components/AgentFanafSidebar.tsx
📍 Page principale :
   - /components/CaisseInscriptionsPage.tsx (Finalisation paiements)
```

#### Opérateur Caisse
```bash
📍 Point d'entrée : /components/OperateurCaisseMain.tsx
📍 Navigation : /components/OperateurCaisseSidebar.tsx
📍 Dashboard : /components/OperateurCaisseDashboard.tsx
📍 Pages :
   - /components/PaiementsDashboardPage.tsx
   - /components/TousPaiementsPage.tsx
```

#### Opérateur Badge
```bash
📍 Point d'entrée : /components/OperateurBadgeMain.tsx
📍 Navigation : /components/OperateurBadgeSidebar.tsx
📍 Dashboard : /components/OperateurBadgeDashboard.tsx
📍 Page principale :
   - /components/DocumentsParticipantsPage.tsx
```

### 3️⃣ Je veux modifier les données mockées
```bash
📍 Fichier unique : /components/data/mockData.ts

Contient :
- participants : Participant[]
- mockOrganisations : Organisation[]
- Fonctions helpers (getOrganisationById, etc.)
```

### 4️⃣ Je veux ajouter/modifier un composant UI
```bash
📍 Dossier : /components/ui/

ShadCN components disponibles :
- button.tsx, input.tsx, select.tsx
- dialog.tsx, card.tsx, badge.tsx
- table.tsx, tabs.tsx, chart.tsx
- etc. (voir EXPORT_CODE_PROFILS.md pour liste complète)
```

### 5️⃣ Je veux travailler sur les générateurs de documents
```bash
📍 Dossier : /components/

Générateurs :
- BadgeGenerator.tsx → Badges participants
- BadgeReferentGenerator.tsx → Badges référents
- InvitationLetterGenerator.tsx → Lettres d'invitation
- ReceiptGenerator.tsx → Reçus de paiement
- InvoiceGenerator.tsx → Factures
- GroupDocumentsGenerator.tsx → Documents groupés
```

---

## 🎯 Tâches prioritaires pour les développeurs

### Phase 1 : Migration vers Supabase (Backend)

#### Tâche 1.1 : Créer les tables de base de données
**Fichier à créer** : `/supabase/migrations/001_initial_schema.sql`

```sql
-- Voir le schéma complet dans SPECIFICATIONS_TECHNIQUES_PROFILS.md
-- Créer les tables :
-- - participants
-- - organisations
-- - paiements
-- - users
```

**Commandes** :
```bash
# Appliquer la migration
supabase db push

# Vérifier
supabase db status
```

#### Tâche 1.2 : Remplacer les données mock par des requêtes Supabase
**Fichiers à modifier** :

1. **Créer un client Supabase** : `/utils/supabase/client.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

2. **Créer les hooks de données** : `/components/hooks/useParticipants.ts`
```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Participant } from '@/components/data/mockData';

export const useParticipants = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const { data, error } = await supabase
          .from('participants')
          .select(`
            *,
            organisation:organisations(*)
          `);
        
        if (error) throw error;
        setParticipants(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();

    // Écouter les changements en temps réel
    const subscription = supabase
      .channel('participants-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'participants' },
        fetchParticipants
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { participants, loading, error };
};
```

3. **Mettre à jour les composants** :
```typescript
// Avant (mock)
import { mockParticipants } from './data/mockData';

// Après (Supabase)
import { useParticipants } from './hooks/useParticipants';

function InscriptionsPage() {
  const { participants, loading, error } = useParticipants();
  
  if (loading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  // ... reste du code
}
```

#### Tâche 1.3 : Implémenter les opérations CRUD
**Fichiers à créer** : `/utils/supabase/operations.ts`

```typescript
import { supabase } from './client';
import { Participant, Organisation, Paiement } from '@/components/data/mockData';

// PARTICIPANTS
export const createParticipant = async (data: Omit<Participant, 'id'>) => {
  const { data: participant, error } = await supabase
    .from('participants')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return participant;
};

export const updateParticipant = async (id: string, data: Partial<Participant>) => {
  const { error } = await supabase
    .from('participants')
    .update(data)
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteParticipant = async (id: string) => {
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// PAIEMENTS
export const finalizePaiement = async (participantId: string, paiementData: any) => {
  const { data: paiement, error } = await supabase
    .from('paiements')
    .insert({
      participant_id: participantId,
      statut: 'finalisé',
      date_paiement: new Date().toISOString(),
      ...paiementData
    })
    .select()
    .single();
  
  if (error) throw error;

  // Mettre à jour le participant
  await supabase
    .from('participants')
    .update({ 
      statut_inscription: 'finalisée',
      date_paiement: new Date().toISOString(),
      mode_paiement: paiementData.mode_paiement
    })
    .eq('id', participantId);
  
  return paiement;
};

// ... autres opérations
```

**Checklist Tâche 1** :
- [ ] Migrations SQL créées et appliquées
- [ ] Client Supabase configuré
- [ ] Hook `useParticipants` créé et testé
- [ ] Hook `useOrganisations` créé et testé
- [ ] Hook `usePaiements` créé et testé
- [ ] Opérations CRUD implémentées
- [ ] Composants mis à jour pour utiliser les hooks
- [ ] Tests de synchronisation en temps réel

---

### Phase 2 : Authentification et permissions

#### Tâche 2.1 : Configurer Supabase Auth
**Fichier à créer** : `/utils/supabase/auth.ts`

```typescript
import { supabase } from './client';
import { UserProfile } from '@/App';

export const signUp = async (email: string, password: string, profile: UserProfile) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        profile,
      }
    }
  });
  
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};
```

#### Tâche 2.2 : Créer le contexte d'authentification
**Fichier à créer** : `/contexts/AuthContext.tsx`

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase/client';
import { UserProfile } from '@/App';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier la session au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setProfile(session?.user?.user_metadata?.profile ?? null);
      setLoading(false);
    });

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setProfile(session?.user?.user_metadata?.profile ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    loading,
    signIn: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      setUser(data.user);
      setProfile(data.user.user_metadata.profile);
    },
    signOut: async () => {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

#### Tâche 2.3 : Protéger les routes
**Fichier à modifier** : `/App.tsx`

```typescript
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginPage />;
  }

  // Rendre le dashboard selon le profil
  switch (profile) {
    case 'agence':
      return <Dashboard />;
    case 'fanaf':
      return <AdminFanafDashboard />;
    // ... etc
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
```

**Checklist Tâche 2** :
- [ ] Supabase Auth configuré
- [ ] Contexte d'authentification créé
- [ ] Page de login créée
- [ ] Routes protégées
- [ ] Gestion des permissions par profil
- [ ] Tests d'authentification

---

### Phase 3 : Stockage des documents (Supabase Storage)

#### Tâche 3.1 : Configurer les buckets
**Fichier serveur à modifier** : `/supabase/functions/server/index.tsx`

```typescript
import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Créer les buckets au démarrage
const initStorage = async () => {
  const buckets = ['badges', 'lettres', 'recus'];
  
  for (const bucketName of buckets) {
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    const exists = existingBuckets?.some(b => b.name === bucketName);
    
    if (!exists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880 // 5 MB
      });
    }
  }
};

initStorage();

// ... routes
```

#### Tâche 3.2 : Upload de documents
**Fichier à créer** : `/utils/supabase/storage.ts`

```typescript
import { supabase } from './client';

export const uploadBadge = async (
  participantId: string, 
  file: Blob
): Promise<string> => {
  const fileName = `badge-${participantId}-${Date.now()}.png`;
  
  const { data, error } = await supabase.storage
    .from('badges')
    .upload(fileName, file);
  
  if (error) throw error;
  
  // Obtenir l'URL signée (valide 1 an)
  const { data: signedData } = await supabase.storage
    .from('badges')
    .createSignedUrl(fileName, 31536000);
  
  return signedData.signedUrl;
};

export const downloadBadge = async (participantId: string): Promise<Blob> => {
  // Trouver le fichier le plus récent pour ce participant
  const { data: files } = await supabase.storage
    .from('badges')
    .list('', {
      search: `badge-${participantId}`
    });
  
  if (!files || files.length === 0) {
    throw new Error('Badge non trouvé');
  }
  
  const latestFile = files.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];
  
  const { data, error } = await supabase.storage
    .from('badges')
    .download(latestFile.name);
  
  if (error) throw error;
  return data;
};
```

**Checklist Tâche 3** :
- [ ] Buckets Supabase Storage créés
- [ ] Fonctions upload/download implémentées
- [ ] Intégration dans BadgeGenerator
- [ ] Intégration dans ReceiptGenerator
- [ ] Intégration dans InvitationLetterGenerator
- [ ] Tests de génération et stockage

---

### Phase 4 : Optimisations et performances

#### Tâche 4.1 : Pagination côté serveur
```typescript
// Hook avec pagination
export const useParticipantsPaginated = (page: number, pageSize: number) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true);
      
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await supabase
        .from('participants')
        .select('*', { count: 'exact' })
        .range(from, to);
      
      if (error) throw error;
      
      setParticipants(data);
      setTotal(count || 0);
      setLoading(false);
    };

    fetchParticipants();
  }, [page, pageSize]);

  return { participants, total, loading };
};
```

#### Tâche 4.2 : Cache avec React Query
```bash
npm install @tanstack/react-query
```

```typescript
import { useQuery } from '@tanstack/react-query';

export const useParticipants = () => {
  return useQuery({
    queryKey: ['participants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*');
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

**Checklist Tâche 4** :
- [ ] Pagination implémentée
- [ ] React Query configuré
- [ ] Cache optimisé
- [ ] Lazy loading des images
- [ ] Optimisation des rendus

---

## 🧪 Tests

### Configuration Jest
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

**Fichier** : `/jest.config.js`
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

### Exemples de tests
```typescript
// __tests__/hooks/useParticipants.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useParticipants } from '@/components/hooks/useParticipants';

describe('useParticipants', () => {
  it('should fetch participants', async () => {
    const { result } = renderHook(() => useParticipants());
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    expect(result.current.participants).toBeDefined();
    expect(result.current.error).toBeNull();
  });
});
```

---

## 📚 Ressources utiles

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [ShadCN UI](https://ui.shadcn.com/)

### Fichiers de référence du projet
- `EXPORT_CODE_PROFILS.md` - Vue d'ensemble
- `SPECIFICATIONS_TECHNIQUES_PROFILS.md` - Spécifications détaillées
- `ARCHITECTURE_TECHNIQUE.md` - Architecture
- Tous les autres fichiers `.md` à la racine

---

## 🆘 Support

### Problèmes courants

**Problème : Les données mock ne s'affichent pas**
```typescript
// Vérifier que le hook est bien utilisé
const { participants } = useDynamicInscriptions();
console.log(participants); // Debug
```

**Problème : Supabase connexion échoue**
```bash
# Vérifier les variables d'environnement
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Tester la connexion
supabase status
```

**Problème : Les styles Tailwind ne s'appliquent pas**
```bash
# Vérifier que globals.css est importé
# dans App.tsx ou index.tsx
import './styles/globals.css';
```

---

## ✅ Checklist finale avant production

### Code
- [ ] Toutes les données mock remplacées par Supabase
- [ ] Authentification implémentée et testée
- [ ] Permissions par profil vérifiées
- [ ] Documents stockés dans Supabase Storage
- [ ] Cache et optimisations en place

### Tests
- [ ] Tests unitaires écrits et passants
- [ ] Tests d'intégration pour workflows critiques
- [ ] Tests de performance effectués
- [ ] Tests de sécurité (injections, XSS, etc.)

### Documentation
- [ ] README mis à jour
- [ ] Documentation API complète
- [ ] Guide utilisateur créé
- [ ] Variables d'environnement documentées

### Déploiement
- [ ] Build de production testé
- [ ] Variables d'environnement de prod configurées
- [ ] Domaine configuré
- [ ] SSL/HTTPS activé
- [ ] Monitoring en place

---

**Bonne chance ! 🚀**

Pour toute question, consultez les fichiers de documentation ou créez une issue sur le repository.

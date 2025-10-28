# 🗺️ ROADMAP D'IMPLÉMENTATION - FANAF 2026 BACK-OFFICE

## 📅 PLANNING PAR PHASES

---

## 🔴 PHASE 1 : BACKEND & BASE DE DONNÉES (Priorité CRITIQUE)
**Durée estimée : 3-5 jours**

### Objectif : Remplacer les données mock par Supabase

#### Étape 1.1 : Configuration Supabase
- [ ] Créer un projet Supabase
- [ ] Configurer les variables d'environnement
- [ ] Installer les dépendances : `@supabase/supabase-js`

#### Étape 1.2 : Schéma de base de données
```sql
-- Table participants
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telephone TEXT,
  organisation_id UUID REFERENCES organisations(id),
  statut TEXT CHECK (statut IN ('membre', 'non-membre', 'vip', 'speaker')),
  statut_inscription TEXT CHECK (statut_inscription IN ('en-attente', 'finalisée')),
  mode_paiement TEXT,
  montant_paye INTEGER,
  date_inscription TIMESTAMP DEFAULT NOW(),
  qr_code TEXT,
  check_in_status BOOLEAN DEFAULT FALSE,
  check_in_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table organisations
CREATE TABLE organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  type TEXT CHECK (type IN ('membre', 'non-membre', 'sponsor')),
  pays TEXT,
  ville TEXT,
  contact_principal TEXT,
  email TEXT,
  telephone TEXT,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table reservations_stands
CREATE TABLE reservations_stands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id),
  taille TEXT CHECK (taille IN ('9m2', '12m2')),
  numero_stand TEXT,
  statut TEXT CHECK (statut IN ('reservé', 'confirmé', 'annulé')),
  montant INTEGER,
  date_reservation TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table rendez_vous
CREATE TABLE rendez_vous (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('participant', 'sponsor')),
  demandeur_id UUID,
  destinataire_id UUID,
  date_rdv TIMESTAMP,
  lieu TEXT,
  statut TEXT CHECK (statut IN ('en-attente', 'confirmé', 'refusé', 'terminé')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table sponsors (pour les référents)
CREATE TABLE referents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES organisations(id),
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  fonction TEXT,
  qr_code TEXT,
  badge_genere BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table comite_organisation
CREATE TABLE comite_organisation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  fonction TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table check_ins
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id),
  date_check_in TIMESTAMP DEFAULT NOW(),
  lieu TEXT,
  agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table users (admins)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  profile_type TEXT CHECK (profile_type IN ('agence', 'fanaf')),
  nom TEXT,
  prenom TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Étape 1.3 : Row Level Security (RLS)
```sql
-- Admin FANAF : lecture seule sauf Finance
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin FANAF read only"
ON participants FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.profile_type = 'fanaf'
  )
);

CREATE POLICY "Admin Agence full access"
ON participants FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.profile_type = 'agence'
  )
);

-- Répéter pour toutes les tables...
```

#### Étape 1.4 : Migration des données
- [ ] Script de migration `mockData.ts` → Supabase
- [ ] Vérification de l'intégrité des données
- [ ] Tests de lecture/écriture

**Livrables :**
- ✅ Base de données Supabase configurée
- ✅ Toutes les tables créées avec RLS
- ✅ Données migrées

---

## 🟠 PHASE 2 : AUTHENTIFICATION & SÉCURITÉ (Priorité HAUTE)
**Durée estimée : 2-3 jours**

### Objectif : Remplacer le switch de profil par une vraie auth

#### Étape 2.1 : Supabase Auth
- [ ] Configurer Supabase Auth
- [ ] Créer les comptes admin initiaux
- [ ] Implémenter le login/logout

#### Étape 2.2 : Composants d'authentification
```
Fichiers à créer :
├── components/LoginPage.tsx
├── components/ProtectedRoute.tsx
└── hooks/useAuth.ts
```

#### Étape 2.3 : Gestion des sessions
- [ ] Context Provider pour l'authentification
- [ ] Redirection si non authentifié
- [ ] Refresh token automatique

**Livrables :**
- ✅ Page de login fonctionnelle
- ✅ Sessions sécurisées
- ✅ Logout propre

---

## 🟡 PHASE 3 : INTÉGRATION SUPABASE DANS L'APP (Priorité HAUTE)
**Durée estimée : 4-6 jours**

### Objectif : Remplacer tous les appels mockData par Supabase

#### Étape 3.1 : Service Layer
```
Fichiers à créer :
├── services/supabase.ts (client Supabase)
├── services/participantsService.ts
├── services/organisationsService.ts
├── services/reservationsService.ts
├── services/networkingService.ts
├── services/financeService.ts
└── services/checkInService.ts
```

#### Étape 3.2 : Hooks personnalisés
```typescript
// hooks/useParticipants.ts
export function useParticipants(filter?) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('statut', filter);
      
      if (!error) setData(data);
      setLoading(false);
    };
    
    fetchData();
  }, [filter]);
  
  return { data, loading };
}
```

#### Étape 3.3 : Mise à jour des composants
- [ ] DashboardHome.tsx → utiliser useParticipants, useOrganisations, etc.
- [ ] InscriptionsPage.tsx → CRUD réel avec Supabase
- [ ] ReservationsPage.tsx → CRUD réel
- [ ] OrganisationsPage.tsx → CRUD réel
- [ ] NetworkingPage.tsx → CRUD réel
- [ ] FinancePage.tsx → Calculs depuis Supabase

**Livrables :**
- ✅ Toutes les pages connectées à Supabase
- ✅ CRUD fonctionnel (Create, Read, Update, Delete)
- ✅ Gestion des erreurs

---

## 🟢 PHASE 4 : REAL-TIME & NOTIFICATIONS (Priorité MOYENNE)
**Durée estimée : 2-3 jours**

### Objectif : Notifications en temps réel

#### Étape 4.1 : Supabase Realtime
```typescript
// Dans NotificationPush.tsx
useEffect(() => {
  const channel = supabase
    .channel('db-changes')
    .on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'participants' 
      },
      (payload) => {
        // Afficher notification
        toast.success('Nouvelle inscription !');
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
```

#### Étape 4.2 : Synchronisation multi-utilisateurs
- [ ] Mise à jour automatique des stats
- [ ] Refresh automatique des listes

**Livrables :**
- ✅ Notifications temps réel
- ✅ Dashboard mis à jour automatiquement

---

## 🔵 PHASE 5 : FEATURES AVANCÉES (Priorité MOYENNE)
**Durée estimée : 3-4 jours**

### Étape 5.1 : Génération de badges côté serveur
```typescript
// Edge Function Supabase
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  const { participantId } = await req.json();
  
  // Générer badge PDF avec jsPDF ou Puppeteer
  const pdf = await generateBadgePDF(participant);
  
  // Stocker dans Supabase Storage
  const { data, error } = await supabase.storage
    .from('badges')
    .upload(`${participantId}.pdf`, pdf);
  
  return new Response(JSON.stringify({ url: data.path }));
});
```

### Étape 5.2 : Export PDF rapports financiers
- [ ] Créer Edge Function pour PDF professionnel
- [ ] Utiliser react-pdf ou pdfmake
- [ ] Inclure logo, graphiques, tableaux

### Étape 5.3 : Envoi d'emails automatiques
- [ ] Intégrer Resend ou SendGrid
- [ ] Email de confirmation inscription
- [ ] Email de rappel check-in
- [ ] Email récapitulatif badge

**Livrables :**
- ✅ Badges PDF générés automatiquement
- ✅ Rapports financiers professionnels
- ✅ Emails automatiques

---

## 🟣 PHASE 6 : OPTIMISATION & PERFORMANCE (Priorité BASSE)
**Durée estimée : 2-3 jours**

### Étape 6.1 : Code splitting
```typescript
// App.tsx
const Dashboard = lazy(() => import('./components/Dashboard'));
const AdminFanafDashboard = lazy(() => import('./components/AdminFanafDashboard'));

<Suspense fallback={<LoadingSpinner />}>
  {userProfile === 'agence' ? <Dashboard /> : <AdminFanafDashboard />}
</Suspense>
```

### Étape 6.2 : Virtualisation des listes
```typescript
// InscriptionsPage.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: participants.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 60,
});
```

### Étape 6.3 : Cache et optimisation
- [ ] React Query pour le cache
- [ ] Debounce sur les recherches
- [ ] Lazy loading des images

**Livrables :**
- ✅ Application plus rapide
- ✅ Listes virtualisées
- ✅ Cache intelligent

---

## 🧪 PHASE 7 : TESTS & QUALITÉ (Priorité BASSE)
**Durée estimée : 3-4 jours**

### Étape 7.1 : Tests unitaires
```bash
npm install --save-dev vitest @testing-library/react
```

```typescript
// __tests__/accueil/DashboardHome.test.tsx
describe('DashboardHome', () => {
  it('affiche les stats correctement', () => {
    render(<DashboardHome />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});
```

### Étape 7.2 : Tests E2E
```bash
npm install --save-dev @playwright/test
```

**Livrables :**
- ✅ 50%+ de couverture de tests
- ✅ Tests E2E critiques

---

## 📊 RÉSUMÉ DU PLANNING

| Phase | Priorité | Durée | Dépendances |
|-------|----------|-------|-------------|
| 1. Backend & BDD | 🔴 CRITIQUE | 3-5j | Aucune |
| 2. Authentification | 🟠 HAUTE | 2-3j | Phase 1 |
| 3. Intégration Supabase | 🟠 HAUTE | 4-6j | Phase 1, 2 |
| 4. Real-time | 🟡 MOYENNE | 2-3j | Phase 3 |
| 5. Features avancées | 🟡 MOYENNE | 3-4j | Phase 3 |
| 6. Optimisation | 🟢 BASSE | 2-3j | Phase 3 |
| 7. Tests | 🟢 BASSE | 3-4j | Phase 3 |

**DURÉE TOTALE ESTIMÉE : 19-28 jours** (environ 1 mois)

---

## 🎯 QUICK START : PAR OÙ COMMENCER ?

### AUJOURD'HUI (Jour 1) :
1. ✅ Créer un compte Supabase (gratuit)
2. ✅ Créer un nouveau projet
3. ✅ Copier les clés API (anon key + service key)
4. ✅ Installer `npm install @supabase/supabase-js`

### DEMAIN (Jour 2) :
1. ✅ Créer les tables dans Supabase SQL Editor
2. ✅ Activer RLS
3. ✅ Migrer quelques données de test

### APRÈS-DEMAIN (Jour 3) :
1. ✅ Créer `services/supabase.ts`
2. ✅ Tester une requête simple
3. ✅ Connecter une page (ex: InscriptionsPage)

---

## 💡 CONSEIL : APPROCHE ITÉRATIVE

Ne faites PAS tout d'un coup ! Procédez ainsi :

1. **Commencez petit** : Une seule table (participants)
2. **Testez** : Vérifiez que ça marche
3. **Étendez** : Ajoutez les autres tables
4. **Itérez** : Améliorez au fur et à mesure

---

## 🆘 BESOIN D'AIDE ?

Si vous voulez que je vous aide à implémenter une phase spécifique, demandez-moi et je fournirai le code complet !

Exemple : "Aide-moi avec Phase 1 - Étape 1.2" et je génèrerai tout le SQL + code TypeScript nécessaire.

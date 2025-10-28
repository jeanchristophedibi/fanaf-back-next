# 🏗️ ARCHITECTURE TECHNIQUE - FANAF 2026

## 📐 SCHÉMA D'ARCHITECTURE ACTUELLE vs FUTURE

### ⚠️ ARCHITECTURE ACTUELLE (Mock Data)
```
┌─────────────────────────────────────────┐
│          FRONTEND REACT                 │
│                                         │
│  ┌──────────┐      ┌──────────────┐    │
│  │Dashboard │──────│ mockData.ts  │    │
│  └──────────┘      └──────────────┘    │
│                                         │
│  Données en mémoire (volatiles)         │
│  Pas de persistance                     │
│  Pas d'authentification réelle          │
└─────────────────────────────────────────┘
```

### ✅ ARCHITECTURE FUTURE (Avec Supabase)
```
┌───────────────────────────────────────────────────────────┐
│                    FRONTEND REACT                         │
│                                                           │
│  ┌──────────┐   ┌─────────────┐   ┌──────────────┐      │
│  │Dashboard │───│  Services   │───│  Supabase    │      │
│  └──────────┘   │             │   │  Client      │      │
│                 │ - Participants│   └──────────────┘      │
│  ┌──────────┐   │ - Organisations│        │              │
│  │Auth Page │───│ - Finance   │            │              │
│  └──────────┘   │ - Networking│            ▼              │
│                 └─────────────┘   ┌──────────────────┐   │
│                                   │   SUPABASE       │   │
└───────────────────────────────────│   (Backend)      │───┘
                                    │                  │
                                    │ ┌──────────────┐ │
                                    │ │ PostgreSQL   │ │
                                    │ │ (Database)   │ │
                                    │ └──────────────┘ │
                                    │                  │
                                    │ ┌──────────────┐ │
                                    │ │ Auth System  │ │
                                    │ │ (JWT Tokens) │ │
                                    │ └──────────────┘ │
                                    │                  │
                                    │ ┌──────────────┐ │
                                    │ │   Storage    │ │
                                    │ │  (Badges)    │ │
                                    │ └──────────────┘ │
                                    │                  │
                                    │ ┌──────────────┐ │
                                    │ │  Realtime    │ │
                                    │ │(Notifications│ │
                                    │ └──────────────┘ │
                                    │                  │
                                    │ ┌──────────────┐ │
                                    │ │Edge Functions│ │
                                    │ │(PDF, Emails) │ │
                                    │ └──────────────┘ │
                                    └──────────────────┘
```

---

## 🔐 FLUX D'AUTHENTIFICATION

```
┌─────────┐         ┌──────────┐         ┌──────────┐
│  User   │────1───▶│LoginPage │────2───▶│ Supabase │
└─────────┘         └──────────┘         │   Auth   │
     ▲                                    └──────────┘
     │                                         │
     │                  ┌──────────────────────┘
     │                  │ 3. JWT Token
     │                  ▼
     │            ┌──────────┐
     │            │ Session  │
     │            │ Storage  │
     │            └──────────┘
     │                  │
     │                  │ 4. Redirect
     │                  ▼
     │            ┌──────────┐
     └────────────│Dashboard │
        5. App    └──────────┘
```

**Étapes :**
1. User entre email/password
2. LoginPage envoie à Supabase Auth
3. Supabase retourne JWT Token
4. Token stocké dans localStorage
5. Redirect vers Dashboard avec session active

---

## 📊 FLUX DE DONNÉES (Exemple : Inscriptions)

```
┌────────────────┐
│InscriptionsPage│
└────────┬───────┘
         │
         │ 1. useParticipants()
         ▼
┌────────────────────┐
│participantsService │
└────────┬───────────┘
         │
         │ 2. supabase.from('participants').select()
         ▼
┌────────────────────┐
│  Supabase Client   │
└────────┬───────────┘
         │
         │ 3. HTTP Request (REST API)
         ▼
┌────────────────────┐
│  Supabase Backend  │
│   (PostgreSQL)     │
└────────┬───────────┘
         │
         │ 4. Check RLS Policies
         │    - User authenticated?
         │    - Profile type = 'agence'?
         ▼
┌────────────────────┐
│   Return Data      │
│ + RLS filtering    │
└────────┬───────────┘
         │
         │ 5. JSON Response
         ▼
┌────────────────────┐
│  React Component   │
│  (Display data)    │
└────────────────────┘
```

---

## 🛡️ ROW LEVEL SECURITY (RLS) - EXEMPLE CONCRET

### Scénario : Admin FANAF ne peut PAS modifier les inscriptions

```sql
-- Politique 1 : Admin FANAF peut LIRE
CREATE POLICY "fanaf_read_only"
ON participants
FOR SELECT
TO authenticated
USING (
  (SELECT profile_type FROM admin_users WHERE id = auth.uid()) = 'fanaf'
);

-- Politique 2 : Admin FANAF NE PEUT PAS modifier
CREATE POLICY "fanaf_no_update"
ON participants
FOR UPDATE
TO authenticated
USING (
  (SELECT profile_type FROM admin_users WHERE id = auth.uid()) != 'fanaf'
);

-- Politique 3 : Admin Agence peut TOUT faire
CREATE POLICY "agence_full_access"
ON participants
FOR ALL
TO authenticated
USING (
  (SELECT profile_type FROM admin_users WHERE id = auth.uid()) = 'agence'
);
```

**Résultat :**
- ✅ Admin Agence : Peut créer, lire, modifier, supprimer
- ✅ Admin FANAF : Peut seulement lire
- ❌ Admin FANAF : Ne peut pas modifier (boutons désactivés + backend bloque)

---

## 🚀 STRUCTURE DES SERVICES

### `/services/supabase.ts` (Client Supabase)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types TypeScript générés depuis Supabase
export type Database = {
  public: {
    Tables: {
      participants: {
        Row: {
          id: string;
          nom: string;
          prenom: string;
          email: string;
          statut: 'membre' | 'non-membre' | 'vip' | 'speaker';
          // ...
        };
        Insert: { /* ... */ };
        Update: { /* ... */ };
      };
      // Autres tables...
    };
  };
};
```

### `/services/participantsService.ts`
```typescript
import { supabase } from './supabase';
import type { Database } from './supabase';

type Participant = Database['public']['Tables']['participants']['Row'];

export const participantsService = {
  // Récupérer tous les participants
  async getAll(filter?: { statut?: string }) {
    let query = supabase.from('participants').select('*');
    
    if (filter?.statut) {
      query = query.eq('statut', filter.statut);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Créer un participant
  async create(participant: Omit<Participant, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('participants')
      .insert(participant)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Mettre à jour
  async update(id: string, updates: Partial<Participant>) {
    const { data, error } = await supabase
      .from('participants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Supprimer
  async delete(id: string) {
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Recherche
  async search(query: string) {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .or(`nom.ilike.%${query}%,prenom.ilike.%${query}%,email.ilike.%${query}%`);
    
    if (error) throw error;
    return data;
  },

  // Check-in
  async checkIn(id: string) {
    const { data, error } = await supabase
      .from('participants')
      .update({ 
        check_in_status: true,
        check_in_date: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Enregistrer dans table check_ins
    await supabase.from('check_ins').insert({
      participant_id: id,
      date_check_in: new Date().toISOString()
    });
    
    return data;
  }
};
```

---

## 🎣 HOOKS PERSONNALISÉS

### `/hooks/useParticipants.ts`
```typescript
import { useState, useEffect } from 'react';
import { participantsService } from '../services/participantsService';
import { supabase } from '../services/supabase';

export function useParticipants(filter?: { statut?: string }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Chargement initial
    const fetchData = async () => {
      try {
        const participants = await participantsService.getAll(filter);
        setData(participants);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Real-time subscription
    const channel = supabase
      .channel('participants-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'participants',
          filter: filter?.statut ? `statut=eq.${filter.statut}` : undefined
        },
        (payload) => {
          // Mise à jour optimiste
          if (payload.eventType === 'INSERT') {
            setData(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => prev.map(p => 
              p.id === payload.new.id ? payload.new : p
            ));
          } else if (payload.eventType === 'DELETE') {
            setData(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter?.statut]);

  return { data, loading, error, refetch: () => fetchData() };
}
```

### Utilisation dans un composant
```typescript
function InscriptionsPage({ filter }) {
  const { data: participants, loading } = useParticipants({ statut: filter });

  if (loading) return <Spinner />;

  return (
    <Table>
      {participants.map(p => (
        <TableRow key={p.id}>
          <TableCell>{p.nom}</TableCell>
          <TableCell>{p.prenom}</TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
```

---

## 🔔 REAL-TIME NOTIFICATIONS

### `/hooks/useRealtimeNotifications.ts`
```typescript
import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { toast } from 'sonner@2.0.3';

export function useRealtimeNotifications() {
  useEffect(() => {
    // Écouter nouvelles inscriptions
    const inscriptionsChannel = supabase
      .channel('inscriptions-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'participants' },
        (payload) => {
          const participant = payload.new;
          toast.success('Nouvelle inscription', {
            description: `${participant.prenom} ${participant.nom} (${participant.statut})`
          });
        }
      )
      .subscribe();

    // Écouter paiements
    const paiementsChannel = supabase
      .channel('paiements-notifications')
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'participants',
          filter: 'statut_inscription=eq.finalisée'
        },
        (payload) => {
          const participant = payload.new;
          toast.success('Paiement reçu', {
            description: `${participant.montant_paye} FCFA via ${participant.mode_paiement}`
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(inscriptionsChannel);
      supabase.removeChannel(paiementsChannel);
    };
  }, []);
}
```

---

## 📁 SUPABASE STORAGE (Badges PDF)

### Génération et stockage de badges
```typescript
// services/badgeService.ts
import { supabase } from './supabase';
import jsPDF from 'jspdf';

export async function generateAndStoreBadge(participantId: string) {
  // 1. Récupérer les données du participant
  const { data: participant } = await supabase
    .from('participants')
    .select('*')
    .eq('id', participantId)
    .single();

  // 2. Générer le PDF
  const doc = new jsPDF();
  doc.text(`${participant.prenom} ${participant.nom}`, 50, 50);
  doc.text(participant.statut.toUpperCase(), 50, 60);
  // Ajouter QR code, logo, etc.

  const pdfBlob = doc.output('blob');

  // 3. Upload vers Supabase Storage
  const { data, error } = await supabase.storage
    .from('badges')
    .upload(`${participantId}.pdf`, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) throw error;

  // 4. Obtenir l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('badges')
    .getPublicUrl(`${participantId}.pdf`);

  return publicUrl;
}
```

---

## 🔄 MIGRATION DES DONNÉES EXISTANTES

### Script de migration
```typescript
// scripts/migrate-to-supabase.ts
import { supabase } from '../services/supabase';
import { mockParticipants, mockOrganisations } from '../components/data/mockData';

async function migrate() {
  console.log('🚀 Début de la migration...');

  // Migrer les organisations d'abord (foreign key)
  console.log('📦 Migration des organisations...');
  for (const org of mockOrganisations) {
    const { error } = await supabase
      .from('organisations')
      .insert({
        id: org.id,
        nom: org.nom,
        type: org.type,
        pays: org.pays,
        ville: org.ville,
        email: org.email,
        telephone: org.telephone
      });
    
    if (error) console.error(`❌ Erreur org ${org.nom}:`, error);
    else console.log(`✅ ${org.nom} migré`);
  }

  // Migrer les participants
  console.log('👥 Migration des participants...');
  for (const participant of mockParticipants) {
    const { error } = await supabase
      .from('participants')
      .insert({
        nom: participant.nom,
        prenom: participant.prenom,
        email: participant.email,
        telephone: participant.telephone,
        organisation_id: participant.organisationId,
        statut: participant.statut,
        statut_inscription: participant.statutInscription,
        mode_paiement: participant.modePaiement,
        montant_paye: participant.statut === 'membre' ? 350000 : 
                      participant.statut === 'non-membre' ? 400000 : 0
      });
    
    if (error) console.error(`❌ Erreur ${participant.nom}:`, error);
    else console.log(`✅ ${participant.prenom} ${participant.nom} migré`);
  }

  console.log('✨ Migration terminée !');
}

migrate();
```

---

## 🎯 PROCHAINES ÉTAPES

1. **Créer le projet Supabase** (5 min)
2. **Copier le SQL des tables** depuis ROADMAP_IMPLEMENTATION.md
3. **Créer `services/supabase.ts`**
4. **Tester avec une table** (participants)
5. **Étendre progressivement**

Voulez-vous que je vous aide avec une étape spécifique ? 🚀

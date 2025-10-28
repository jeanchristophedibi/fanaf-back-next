# 📊 Structures de données API - FANAF 2026

Ce dossier contient les spécifications exactes des structures de données que vous devez implémenter dans Supabase pour l'API.

## 📁 Fichiers

### Structures principales
- ✅ `participants.json` - Participants (150 au total)
- ✅ `organisations.json` - Organisations (membres, non-membres, sponsors)
- ✅ `rendez-vous.json` - Rendez-vous entre participants et sponsors
- ✅ `plans-vol.json` - Plans de vol des participants
- ✅ `check-ins.json` - Historique des check-ins
- ✅ `notifications.json` - Notifications système
- ✅ `membres-comite.json` - Membres du comité (caissiers, agents scan)
- ⚠️ `reservations.json` - Réservations de stands (rubrique retirée)

## 🗄️ Tables Supabase à créer

### Table `participants`
```sql
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR NOT NULL,
  prenom VARCHAR NOT NULL,
  reference VARCHAR UNIQUE NOT NULL,
  email VARCHAR NOT NULL,
  telephone VARCHAR NOT NULL,
  pays VARCHAR NOT NULL,
  fonction VARCHAR,
  organisation_id UUID REFERENCES organisations(id),
  statut VARCHAR CHECK (statut IN ('membre', 'non-membre', 'vip', 'speaker', 'referent')),
  statut_inscription VARCHAR CHECK (statut_inscription IN ('finalisée', 'non-finalisée')),
  date_inscription TIMESTAMP NOT NULL,
  date_paiement TIMESTAMP,
  mode_paiement VARCHAR CHECK (mode_paiement IN ('espèce', 'carte bancaire', 'orange money', 'wave', 'virement', 'chèque')),
  canal_encaissement VARCHAR CHECK (canal_encaissement IN ('externe', 'asapay')),
  caissier VARCHAR,
  badge_genere BOOLEAN DEFAULT false,
  check_in BOOLEAN DEFAULT false,
  check_in_date TIMESTAMP,
  groupe_id UUID,
  nom_groupe VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table `organisations`
```sql
CREATE TABLE organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR NOT NULL,
  contact VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  pays VARCHAR NOT NULL,
  date_creation DATE NOT NULL,
  statut VARCHAR CHECK (statut IN ('membre', 'non-membre', 'sponsor')),
  secteur_activite VARCHAR,
  referent_nom VARCHAR,
  referent_prenom VARCHAR,
  referent_email VARCHAR,
  referent_telephone VARCHAR,
  referent_fonction VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table `rendez_vous`
```sql
CREATE TABLE rendez_vous (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demandeur_id UUID REFERENCES participants(id),
  recepteur_id UUID,
  type VARCHAR CHECK (type IN ('participant', 'sponsor')),
  date DATE NOT NULL,
  heure TIME NOT NULL,
  statut VARCHAR CHECK (statut IN ('acceptée', 'occupée', 'en-attente', 'annulée')),
  commentaire TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table `plans_vol`
```sql
CREATE TABLE plans_vol (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id),
  numero_vol VARCHAR NOT NULL,
  date DATE NOT NULL,
  heure TIME NOT NULL,
  aeroport VARCHAR NOT NULL,
  aeroport_origine VARCHAR,
  aeroport_destination VARCHAR,
  type VARCHAR CHECK (type IN ('depart', 'arrivee')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table `check_ins`
```sql
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id),
  date_check_in DATE NOT NULL,
  heure_check_in TIME NOT NULL,
  scan_par UUID REFERENCES membres_comite(id),
  autorise BOOLEAN NOT NULL,
  raison_refus VARCHAR,
  nombre_scans INTEGER DEFAULT 1,
  statut_remontee VARCHAR CHECK (statut_remontee IN ('signale', 'normal')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table `notifications`
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destinataire VARCHAR NOT NULL,
  type VARCHAR CHECK (type IN ('ins卫生cription', 'rendez-vous', 'vol', 'alerte')),
  priorite VARCHAR CHECK (priorite IN ('haute', 'moyenne', 'basse')),
  titre VARCHAR NOT NULL,
  message TEXT NOT NULL,
  lien_action VARCHAR,
  lu BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table `membres_comite`
```sql
CREATE TABLE membres_comite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR NOT NULL,
  prenom VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  telephone VARCHAR NOT NULL,
  profil VARCHAR CHECK (profil IN ('caissier', 'agent-scan')),
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 Mapping snake_case ↔ camelCase

Les champs de votre API Supabase utilisent `snake_case`, mais l'application frontend utilise `camelCase`. Vous devez mapper dans `useApi.ts` :

```typescript
// Exemple de mapping à ajouter dans useApi.ts
const mapParticipantFromApi = (apiParticipant: any): Participant => ({
  ...apiParticipant,
  organisationId: apiParticipant.organisation_id,
  statutInscription: apiParticipant.statut_inscription,
  dateInscription: apiParticipant.date_inscription,
  datePaiement: apiParticipant.date_paiement,
  modePaiement: apiParticipant.mode_paiement,
  canalEncaissement: apiParticipant.canal_encaissement,
  badgeGenere: apiParticipant.badge_genere,
  checkIn: apiParticipant.check_in,
  checkInDate: apiParticipant.check_in_date,
  groupeId: apiParticipant.groupe_id,
  nomGroupe: apiParticipant.nom_groupe,
});
```

## 📊 Statistiques attendues

### Dashboard Stats (`GET /stats/dashboard`)
```json
{
  "stats": {
    "participants": {
      "total": 150,
      "membres": 85,
      "non_membres": 50,
      "vip": 10,
      "speakers": 5,
      "en_attente": 12
    },
    "organisations": {
      "total": 25,
      "membres": 15,
      "non_membres": 8,
      "sponsors": 2
    },
    "rendez_vous": {
      "total": 45,
      "rdv_sponsors": 20,
      "rdv_participants": 25
    },
    "paiements": {
      "total_attendu": 50000000,
      "total_encaisse": 42000000,
      "total_restant": 8000000,
      "paiements_complets": 138,
      "paiements_partiels": 5,
      "paiements_en_attente": 12
    }
  }
}
```

## 🚀 Prochaines étapes

1. Créer les tables dans Supabase
2. Configurer les RLS (Row Level Security)
3. Créer les Edge Functions pour les endpoints API
4. Tester les requêtes depuis `useApi.ts`
5. Mapper les données snake_case → camelCase


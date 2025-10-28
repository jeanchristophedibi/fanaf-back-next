# 🧪 Tests de Validation - Liste Officielle des Participants

## 📋 Checklist de Validation

Utilisez cette checklist pour vérifier que la liste officielle fonctionne correctement.

---

## Test 1 : Nombre Total de Participants

### Procédure
1. Ouvrir la console du navigateur (F12)
2. Exécuter :
```javascript
import { getCurrentParticipants } from './components/data/mockData';
console.log('Total participants:', getCurrentParticipants().length);
```

### Résultat Attendu
```
Total participants: 150
```

### Statut : [ ]

---

## Test 2 : Unicité des Références

### Procédure
1. Dans la console :
```javascript
import { getCurrentParticipants } from './components/data/mockData';
const participants = getCurrentParticipants();
const references = participants.map(p => p.reference);
const uniqueRefs = new Set(references);
console.log('Références uniques:', uniqueRefs.size === 150);
```

### Résultat Attendu
```
Références uniques: true
```

### Statut : [ ]

---

## Test 3 : Plage d'IDs

### Procédure
1. Vérifier que les IDs vont de 1 à 150 :
```javascript
import { getCurrentParticipants } from './components/data/mockData';
const participants = getCurrentParticipants();
const ids = participants.map(p => parseInt(p.id)).sort((a, b) => a - b);
console.log('Premier ID:', ids[0], '| Dernier ID:', ids[ids.length - 1]);
```

### Résultat Attendu
```
Premier ID: 1 | Dernier ID: 150
```

### Statut : [ ]

---

## Test 4 : Répartition par Statut

### Procédure
1. Compter les participants par statut :
```javascript
import { getCurrentParticipants } from './components/data/mockData';
const participants = getCurrentParticipants();

const finalisés = participants.filter(p => p.statutInscription === 'finalisée').length;
const enAttente = participants.filter(p => p.statutInscription === 'non-finalisée').length;

console.log('Finalisés:', finalisés, '| En attente:', enAttente);
```

### Résultat Attendu
```
Finalisés: 110 | En attente: 40
```

### Statut : [ ]

---

## Test 5 : Répartition Membres/Non-membres

### Procédure
1. Compter par type de participant :
```javascript
import { getCurrentParticipants } from './components/data/mockData';
const participants = getCurrentParticipants();

const membres = participants.filter(p => p.statut === 'membre').length;
const nonMembres = participants.filter(p => p.statut === 'non-membre').length;
const vip = participants.filter(p => p.statut === 'vip').length;
const speakers = participants.filter(p => p.statut === 'speaker').length;
const referents = participants.filter(p => p.statut === 'referent').length;

console.log({
  membres,
  nonMembres,
  vip,
  speakers,
  referents,
  total: membres + nonMembres + vip + speakers + referents
});
```

### Résultat Attendu
```javascript
{
  membres: 73,     // 55 finalisés + 20 en attente (moins 2 référents)
  nonMembres: 60,  // 40 finalisés + 20 en attente
  vip: 10,
  speakers: 5,
  referents: 2,
  total: 150
}
```

### Statut : [ ]

---

## Test 6 : Désactivation Ajout de Participants

### Procédure
1. Essayer d'ajouter un participant :
```javascript
import { addRandomParticipant, getCurrentParticipants } from './components/data/mockData';

const beforeCount = getCurrentParticipants().length;
console.log('Avant:', beforeCount);

addRandomParticipant(); // Devrait afficher un warning

const afterCount = getCurrentParticipants().length;
console.log('Après:', afterCount);
console.log('Liste inchangée:', beforeCount === afterCount);
```

### Résultat Attendu
```
Avant: 150
⚠️ Ajout de participants désactivé: La liste est fixée à 150 participants officiels
Après: 150
Liste inchangée: true
```

### Statut : [ ]

---

## Test 7 : Cohérence des Emails

### Procédure
1. Vérifier l'unicité des emails :
```javascript
import { getCurrentParticipants } from './components/data/mockData';
const participants = getCurrentParticipants();

const emails = participants.map(p => p.email);
const uniqueEmails = new Set(emails);

console.log('Emails uniques:', uniqueEmails.size === 150);
console.log('Total emails:', emails.length);
```

### Résultat Attendu
```
Emails uniques: true
Total emails: 150
```

### Statut : [ ]

---

## Test 8 : Cohérence Canal/Mode de Paiement

### Procédure
1. Vérifier que les canaux correspondent aux modes :
```javascript
import { getCurrentParticipants } from './components/data/mockData';
const participants = getCurrentParticipants();

const finalisés = participants.filter(p => 
  p.statutInscription === 'finalisée' && p.modePaiement
);

const erreurs = finalisés.filter(p => {
  const isExterne = ['espèce', 'virement', 'chèque'].includes(p.modePaiement);
  const isAsapay = ['carte bancaire', 'orange money', 'wave'].includes(p.modePaiement);
  
  if (isExterne && p.canalEncaissement !== 'externe') return true;
  if (isAsapay && p.canalEncaissement !== 'asapay') return true;
  
  return false;
});

console.log('Erreurs de cohérence:', erreurs.length);
console.log('Tous cohérents:', erreurs.length === 0);
```

### Résultat Attendu
```
Erreurs de cohérence: 0
Tous cohérents: true
```

### Statut : [ ]

---

## Test 9 : Cohérence des Dates

### Procédure
1. Vérifier que date paiement > date inscription :
```javascript
import { getCurrentParticipants } from './components/data/mockData';
const participants = getCurrentParticipants();

const avecPaiement = participants.filter(p => p.datePaiement);

const erreursDate = avecPaiement.filter(p => {
  const dateInscr = new Date(p.dateInscription);
  const datePaie = new Date(p.datePaiement);
  return datePaie < dateInscr;
});

console.log('Erreurs de dates:', erreursDate.length);
console.log('Toutes cohérentes:', erreursDate.length === 0);
```

### Résultat Attendu
```
Erreurs de dates: 0
Toutes cohérentes: true
```

### Statut : [ ]

---

## Test 10 : Cohérence entre Profils

### Procédure
1. Se connecter avec **Admin Agence**
2. Noter le nombre de participants et quelques références
3. Se déconnecter et se connecter avec **Admin ASACI**
4. Vérifier que les données sont identiques
5. Répéter avec **Opérateur Badge**

### Données à Comparer

| Profil | Total | Réf #1 | Réf #50 | Réf #100 | Réf #150 |
|--------|-------|--------|---------|----------|----------|
| Admin Agence | 150 | FANAF-2026-001 | FANAF-2026-050 | FANAF-2026-100 | FANAF-2026-150 |
| Admin ASACI | 150 | FANAF-2026-001 | FANAF-2026-050 | FANAF-2026-100 | FANAF-2026-150 |
| Opérateur Badge | 150 | FANAF-2026-001 | FANAF-2026-050 | FANAF-2026-100 | FANAF-2026-150 |

### Statut : [ ]

---

## Test 11 : Participants Spéciaux

### Procédure
1. Vérifier les participants spéciaux :
```javascript
import { getCurrentParticipants } from './components/data/mockData';
const participants = getCurrentParticipants();

// Référents
const ref1 = participants.find(p => p.id === '45');
const ref2 = participants.find(p => p.id === '46');

console.log('Référent 1:', ref1?.nom, ref1?.prenom, '- Org:', ref1?.organisationId);
console.log('Référent 2:', ref2?.nom, ref2?.prenom, '- Org:', ref2?.organisationId);

// VIP exemple
const vip = participants.find(p => p.id === '96');
console.log('VIP:', vip?.nom, vip?.prenom, '- Fonction:', vip?.fonction);
```

### Résultat Attendu
```
Référent 1: Diabaté Mariam - Org: org9
Référent 2: Benali Karim - Org: org10
VIP: N'Guessan Alassane - Fonction: Commissaire Général FANAF
```

### Statut : [ ]

---

## Test 12 : Export Données

### Procédure (Interface Utilisateur)
1. Se connecter avec n'importe quel profil
2. Accéder à la liste des inscriptions
3. Cliquer sur "Exporter CSV"
4. Ouvrir le fichier CSV
5. Vérifier le nombre de lignes (devrait être 151 : 1 header + 150 participants)

### Résultat Attendu
- Fichier CSV contient 151 lignes
- Toutes les références de FANAF-2026-001 à FANAF-2026-150 sont présentes

### Statut : [ ]

---

## 📊 Résumé des Tests

| # | Test | Statut | Notes |
|---|------|--------|-------|
| 1 | Nombre total (150) | [ ] | |
| 2 | Unicité références | [ ] | |
| 3 | Plage IDs (1-150) | [ ] | |
| 4 | Répartition statuts | [ ] | |
| 5 | Répartition types | [ ] | |
| 6 | Désactivation ajout | [ ] | |
| 7 | Unicité emails | [ ] | |
| 8 | Cohérence canal/mode | [ ] | |
| 9 | Cohérence dates | [ ] | |
| 10 | Cohérence profils | [ ] | |
| 11 | Participants spéciaux | [ ] | |
| 12 | Export données | [ ] | |

---

## ✅ Validation Globale

Tous les tests sont passés : [ ]

**Date de validation** : _______________

**Validé par** : _______________

**Signature** : _______________

---

## 🆘 En cas de Problème

Si un test échoue :

1. **Vérifier le fichier source** : `/components/data/mockData.ts`
2. **Consulter la documentation** : `/LISTE_OFFICIELLE_150_PARTICIPANTS.md`
3. **Vérifier le changelog** : `/CHANGELOG_LISTE_OFFICIELLE.md`
4. **Redémarrer l'application** pour recharger les données
5. **Vider le cache du navigateur** si nécessaire

---

## 📞 Support

Pour toute question ou anomalie détectée :
- Consulter `/QUICK_REFERENCE_PARTICIPANTS.md`
- Vérifier les logs console pour les warnings
- Documenter le problème avec screenshots

---

**Dernière mise à jour** : 28 Octobre 2025

// Script pour générer 150 participants
const noms = ['Diallo', 'Ndiaye', 'Kouassi', 'Touré', 'Kamara', 'Sissoko', 'Traoré', 'Ba', 'Keita', 'Sanogo', 'Cissé', 'Konaté', 'Ouattara', 'Sow', 'Fofana', 'Dembélé', 'Kouyaté', 'Sylla', 'Doumbia', 'Bamba', 'Coulibaly', 'Sawadogo', 'Ouédraogo', 'Mbaye', 'Fall', 'Gueye', 'Ndao', 'Thiam', 'Sarr', 'Sall'];
const prenoms = ['Amadou', 'Fatou', 'Jean-Baptiste', 'Aissata', 'Mohamed', 'Mariam', 'Ibrahim', 'Aminata', 'Seydou', 'Fatoumata', 'Oumar', 'Salimata', 'Mamadou', 'Aïcha', 'Abdoulaye', 'Khady', 'Moussa', 'Maimouna', 'Ousmane', 'Bintou', 'Boubacar', 'Awa', 'Ibrahima', 'Coumba', 'Souleymane', 'Mariama', 'Adama', 'Kadiatou', 'Moustapha', 'Ramata'];
const pays = ['Côte d\'Ivoire', 'Sénégal', 'Mali', 'Burkina Faso', 'Guinée', 'Niger', 'Bénin', 'Togo', 'Cameroun', 'Gabon'];
const orgs = ['org1', 'org2', 'org3', 'org4', 'org5', 'org6', 'org7', 'org8'];
const modesPaiement = ['espèce', 'carte bancaire', 'orange money', 'wave', 'virement'];

// Total: 150
// 100 finalisées: 45 membres + 40 non-membres + 10 VIP + 5 speakers
// 50 non-finalisées: 30 membres + 20 non-membres

const participants = [];
let id = 1;

// Fonction helper
function genParticipant(statut, statutInscription, modePaiement = null) {
  const nom = noms[Math.floor(Math.random() * noms.length)];
  const prenom = prenoms[Math.floor(Math.random() * prenoms.length)];
  const orgId = orgs[Math.floor(Math.random() * orgs.length)];
  const paysPart = pays[Math.floor(Math.random() * pays.length)];
  
  const participant = {
    id: String(id),
    nom,
    prenom,
    reference: `FANAF-2026-${String(id).padStart(3, '0')}`,
    email: `${prenom.toLowerCase()}.${nom.toLowerCase()}@example.com`,
    telephone: `+225 ${Math.floor(10000000 + Math.random() * 90000000)}`,
    pays: paysPart,
    organisationId: orgId,
    statut,
    statutInscription,
    dateInscription: `2025-${String(Math.floor(Math.random() * 2) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
  };
  
  if (modePaiement && statutInscription === 'finalisée') {
    participant.modePaiement = modePaiement;
  }
  
  id++;
  return participant;
}

// 45 membres finalisés (payés)
for (let i = 0; i < 45; i++) {
  const mode = modesPaiement[i % 5];
  participants.push(genParticipant('membre', 'finalisée', mode));
}

// 40 non-membres finalisés (payés)
for (let i = 0; i < 40; i++) {
  const mode = modesPaiement[i % 5];
  participants.push(genParticipant('non-membre', 'finalisée', mode));
}

// 10 VIP (exonérés)
for (let i = 0; i < 10; i++) {
  participants.push(genParticipant('vip', 'finalisée'));
}

// 5 speakers (exonérés)
for (let i = 0; i < 5; i++) {
  participants.push(genParticipant('speaker', 'finalisée'));
}

// 30 membres en attente
for (let i = 0; i < 30; i++) {
  participants.push(genParticipant('membre', 'non-finalisée'));
}

// 20 non-membres en attente
for (let i = 0; i < 20; i++) {
  participants.push(genParticipant('non-membre', 'non-finalisée'));
}

// Afficher le code TypeScript
console.log('export const mockParticipants: Participant[] = [');
participants.forEach((p, index) => {
  console.log('  {');
  console.log(`    id: '${p.id}',`);
  console.log(`    nom: '${p.nom}',`);
  console.log(`    prenom: '${p.prenom}',`);
  console.log(`    reference: '${p.reference}',`);
  console.log(`    email: '${p.email}',`);
  console.log(`    telephone: '${p.telephone}',`);
  console.log(`    pays: '${p.pays}',`);
  console.log(`    organisationId: '${p.organisationId}',`);
  console.log(`    statut: '${p.statut}',`);
  console.log(`    statutInscription: '${p.statutInscription}',`);
  console.log(`    dateInscription: '${p.dateInscription}',`);
  if (p.modePaiement) {
    console.log(`    modePaiement: '${p.modePaiement}',`);
  }
  console.log(`  }${index < participants.length - 1 ? ',' : ''}`);
});
console.log('];');

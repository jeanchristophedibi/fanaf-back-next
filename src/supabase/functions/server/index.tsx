import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Créer le client Supabase avec la clé service role
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-c3e5f95c/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== PARTICIPANTS ====================

// Générer une nouvelle référence participant
app.post("/make-server-c3e5f95c/participants/generate-reference", async (c) => {
  try {
    const { data, error } = await supabase.rpc('generer_reference_participant');
    
    if (error) {
      console.error('Erreur génération référence participant:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ reference: data });
  } catch (error) {
    console.error('Erreur serveur génération référence:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// ==================== PAIEMENTS (Admin FANAF uniquement) ====================

// Créer un nouveau paiement
app.post("/make-server-c3e5f95c/paiements/create", async (c) => {
  try {
    const body = await c.req.json();
    const { participant_id, statut_participant } = body;

    // Calculer le tarif selon le statut
    const { data: tarif, error: tarifError } = await supabase.rpc(
      'calculer_tarif',
      { statut_participant }
    );

    if (tarifError) {
      console.error('Erreur calcul tarif:', tarifError);
      return c.json({ error: tarifError.message }, 500);
    }

    // Générer une référence paiement
    const { data: reference, error: refError } = await supabase.rpc('generer_reference_paiement');

    if (refError) {
      console.error('Erreur génération référence paiement:', refError);
      return c.json({ error: refError.message }, 500);
    }

    // Déterminer le tarif appliqué
    let tarif_applique = 'non-membre';
    if (statut_participant === 'membre') tarif_applique = 'membre';
    if (statut_participant === 'vip' || statut_participant === 'speaker') tarif_applique = 'exonere';

    // Créer le paiement
    const { data: paiement, error: paiementError } = await supabase
      .from('paiements')
      .insert([{
        reference_paiement: reference,
        participant_id,
        montant_total: tarif,
        montant_paye: 0,
        montant_restant: tarif,
        tarif_applique,
        statut: tarif === 0 ? 'complet' : 'en_attente'
      }])
      .select()
      .single();

    if (paiementError) {
      console.error('Erreur création paiement:', paiementError);
      return c.json({ error: paiementError.message }, 500);
    }

    // Créer une notification pour l'Admin FANAF
    if (tarif > 0) {
      await supabase.from('notifications').insert([{
        destinataire: 'admin_fanaf',
        type: 'paiement',
        priorite: 'haute',
        titre: 'Nouveau paiement en attente',
        message: `Paiement de ${tarif.toLocaleString()} FCFA en attente pour ${reference}`,
        lien_action: `/finance?ref=${reference}`
      }]);
    }

    return c.json({ paiement });
  } catch (error) {
    console.error('Erreur serveur création paiement:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Enregistrer une transaction (versement)
app.post("/make-server-c3e5f95c/paiements/add-transaction", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      paiement_id, 
      montant, 
      mode_paiement,
      numero_transaction,
      numero_cheque,
      caissier_id,
      caissier_nom,
      notes
    } = body;

    // Récupérer le paiement actuel
    const { data: paiement, error: paiementError } = await supabase
      .from('paiements')
      .select('*')
      .eq('id', paiement_id)
      .single();

    if (paiementError) {
      console.error('Erreur récupération paiement:', paiementError);
      return c.json({ error: paiementError.message }, 500);
    }

    // Créer la transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        paiement_id,
        montant,
        mode_paiement,
        numero_transaction,
        numero_cheque,
        caissier_id,
        caissier_nom,
        notes
      }])
      .select()
      .single();

    if (transactionError) {
      console.error('Erreur création transaction:', transactionError);
      return c.json({ error: transactionError.message }, 500);
    }

    // Mettre à jour le paiement
    const nouveauMontantPaye = paiement.montant_paye + montant;
    const nouveauMontantRestant = paiement.montant_total - nouveauMontantPaye;
    
    let nouveauStatut = 'partiel';
    if (nouveauMontantRestant === 0) nouveauStatut = 'complet';
    if (nouveauMontantPaye === 0) nouveauStatut = 'en_attente';

    const { data: paiementMaj, error: majError } = await supabase
      .from('paiements')
      .update({
        montant_paye: nouveauMontantPaye,
        montant_restant: nouveauMontantRestant,
        statut: nouveauStatut,
        date_paiement: nouveauStatut === 'complet' ? new Date().toISOString() : paiement.date_paiement
      })
      .eq('id', paiement_id)
      .select()
      .single();

    if (majError) {
      console.error('Erreur mise à jour paiement:', majError);
      return c.json({ error: majError.message }, 500);
    }

    // Créer une notification
    await supabase.from('notifications').insert([{
      destinataire: 'admin_fanaf',
      type: 'paiement',
      priorite: 'haute',
      titre: 'Paiement reçu',
      message: `Versement de ${montant.toLocaleString()} FCFA reçu (${paiement.reference_paiement})`,
      lien_action: `/finance?ref=${paiement.reference_paiement}`
    }]);

    return c.json({ transaction, paiement: paiementMaj });
  } catch (error) {
    console.error('Erreur serveur ajout transaction:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Récupérer tous les paiements avec détails participant
app.get("/make-server-c3e5f95c/paiements/all", async (c) => {
  try {
    const { data, error } = await supabase
      .from('paiements')
      .select(`
        *,
        participant:participants(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération paiements:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ paiements: data });
  } catch (error) {
    console.error('Erreur serveur récupération paiements:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Récupérer les transactions d'un paiement
app.get("/make-server-c3e5f95c/paiements/:id/transactions", async (c) => {
  try {
    const paiementId = c.req.param('id');

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('paiement_id', paiementId)
      .order('date_transaction', { ascending: false });

    if (error) {
      console.error('Erreur récupération transactions:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ transactions: data });
  } catch (error) {
    console.error('Erreur serveur récupération transactions:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Récupérer les statistiques financières
app.get("/make-server-c3e5f95c/finance/stats", async (c) => {
  try {
    const { data: paiements, error } = await supabase
      .from('paiements')
      .select('*');

    if (error) {
      console.error('Erreur récupération stats finance:', error);
      return c.json({ error: error.message }, 500);
    }

    const stats = {
      total_attendu: paiements.reduce((sum, p) => sum + Number(p.montant_total), 0),
      total_encaisse: paiements.reduce((sum, p) => sum + Number(p.montant_paye), 0),
      total_restant: paiements.reduce((sum, p) => sum + Number(p.montant_restant), 0),
      paiements_complets: paiements.filter(p => p.statut === 'complet').length,
      paiements_partiels: paiements.filter(p => p.statut === 'partiel').length,
      paiements_en_attente: paiements.filter(p => p.statut === 'en_attente').length,
    };

    return c.json({ stats });
  } catch (error) {
    console.error('Erreur serveur stats finance:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// ==================== STATISTIQUES DASHBOARD ====================

app.get("/make-server-c3e5f95c/stats/dashboard", async (c) => {
  try {
    // Rafraîchir la vue matérialisée
    await supabase.rpc('refresh_stats_dashboard');

    // Récupérer les stats
    const { data, error } = await supabase
      .from('stats_dashboard')
      .select('*')
      .single();

    if (error) {
      console.error('Erreur récupération stats dashboard:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ stats: data });
  } catch (error) {
    console.error('Erreur serveur stats dashboard:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

Deno.serve(app.fetch);
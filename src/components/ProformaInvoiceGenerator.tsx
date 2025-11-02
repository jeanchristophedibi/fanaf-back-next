import React from 'react';
import { Participant, Organisation } from './data/types';

interface RegistrationType {
  id: string;
  name: string;
  slug: string;
  amount: string;
  amount_formatted: string;
  valid_from: string;
  valid_until: string;
}

interface ProformaInvoiceGeneratorProps {
  participant: Participant;
  organisation: Organisation;
  numeroFacture: string;
  registrationTypes?: RegistrationType[]; // Types d'inscription depuis l'API
  quantite?: number; // Nombre de participants (quantité à facturer), par défaut 1
}

export const ProformaInvoiceGenerator = ({ 
  participant, 
  organisation,
  numeroFacture,
  registrationTypes = [],
  quantite = 1 // Par défaut, quantité = 1 (inscription individuelle)
}: ProformaInvoiceGeneratorProps) => {
  const today = new Date();
  
  // Calculer le montant selon le statut en utilisant les vraies données de l'API
  const getMontant = (): number => {
    // VIP et speaker sont exonérés
    if (participant.statut === 'vip' || participant.statut === 'speaker') {
      return 0;
    }

    // Si pas de registrationTypes, fallback sur les prix par défaut
    if (!registrationTypes || registrationTypes.length === 0) {
      console.warn('[ProformaInvoiceGenerator] Aucun type d\'inscription disponible, utilisation des prix par défaut');
      switch (participant.statut) {
        case 'membre':
          return 350000;
        case 'non-membre':
          return 400000;
        default:
          return 0;
      }
    }

    // Mapper le statut vers le slug
    let slugToFind = '';
    if (participant.statut === 'membre') {
      slugToFind = 'membre-fanaf';
    } else if (participant.statut === 'non-membre') {
      slugToFind = 'non-membre';
    } else {
      return 0;
    }

    // Trouver le registration type correspondant
    const registrationType = registrationTypes.find((rt) => rt.slug === slugToFind);
    
    if (!registrationType || !registrationType.amount) {
      console.warn(`[ProformaInvoiceGenerator] Type d'inscription non trouvé pour slug: ${slugToFind}, utilisation du prix par défaut`);
      // Fallback sur les prix par défaut
      switch (participant.statut) {
        case 'membre':
          return 350000;
        case 'non-membre':
          return 400000;
        default:
          return 0;
      }
    }

    // Convertir le montant de string en number
    const montant = parseFloat(registrationType.amount);
    if (isNaN(montant)) {
      console.warn(`[ProformaInvoiceGenerator] Montant invalide pour ${slugToFind}: ${registrationType.amount}`);
      return 0;
    }

    return montant;
  };

  const montantUnitaire = getMontant();
  const quantiteFacturee = quantite || 1;
  const montantSousTotal = montantUnitaire * quantiteFacturee;
  const tva = 0; // Pas de TVA
  const total = montantSousTotal + tva;

  // Format de date simple sans dépendance externe
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div 
      id={`proforma-${participant.id}`}
      style={{ 
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#ffffff',
        padding: '48px',
        maxWidth: '896px',
        margin: '0 auto'
      }}
    >
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              background: 'linear-gradient(to bottom right, #ea580c, #f97316)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold' }}>F</span>
            </div>
            <div>
              <h1 style={{ fontSize: '24px', color: '#111827', margin: 0 }}>FANAF 2026</h1>
              <p style={{ fontSize: '14px', color: '#4b5563', margin: 0 }}>46ème Assemblée Générale</p>
            </div>
          </div>
          <div style={{ fontSize: '14px', color: '#4b5563' }}>
            <p style={{ margin: '4px 0' }}>9-11 Février 2026</p>
            <p style={{ margin: '4px 0' }}>Abidjan, Côte d'Ivoire</p>
            <p style={{ margin: '4px 0' }}>Email: contact@fanaf2026.org</p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '30px', color: '#111827', marginBottom: '8px' }}>FACTURE PROFORMA</h2>
          <div style={{ fontSize: '14px', color: '#4b5563' }}>
            <p style={{ margin: '4px 0' }}><span style={{ color: '#111827' }}>N°:</span> {numeroFacture}</p>
            <p style={{ margin: '4px 0' }}><span style={{ color: '#111827' }}>Date:</span> {formatDate(today)}</p>
            <p style={{ margin: '4px 0' }}><span style={{ color: '#111827' }}>Réf. Participant:</span> {participant.reference}</p>
          </div>
        </div>
      </div>

      {/* Informations client */}
      <div style={{ 
        marginBottom: '48px', 
        padding: '24px', 
        backgroundColor: '#f9fafb', 
        borderRadius: '8px' 
      }}>
        <h3 style={{ fontSize: '18px', color: '#111827', marginBottom: '16px' }}>Facturé à :</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <p style={{ fontSize: '14px', margin: '8px 0' }}>
              <span style={{ color: '#4b5563' }}>Organisation:</span>{' '}
              <span style={{ color: '#111827' }}>{organisation.nom}</span>
            </p>
            <p style={{ fontSize: '14px', margin: '8px 0' }}>
              <span style={{ color: '#4b5563' }}>Participant:</span>{' '}
              <span style={{ color: '#111827' }}>{participant.prenom} {participant.nom}</span>
            </p>
            <p style={{ fontSize: '14px', margin: '8px 0' }}>
              <span style={{ color: '#4b5563' }}>Email:</span>{' '}
              <span style={{ color: '#111827' }}>{participant.email}</span>
            </p>
          </div>
          <div>
            <p style={{ fontSize: '14px', margin: '8px 0' }}>
              <span style={{ color: '#4b5563' }}>Téléphone:</span>{' '}
              <span style={{ color: '#111827' }}>{participant.telephone}</span>
            </p>
            <p style={{ fontSize: '14px', margin: '8px 0' }}>
              <span style={{ color: '#4b5563' }}>Pays:</span>{' '}
              <span style={{ color: '#111827' }}>{participant.pays}</span>
            </p>
            <p style={{ fontSize: '14px', margin: '8px 0' }}>
              <span style={{ color: '#4b5563' }}>Fonction:</span>{' '}
              <span style={{ color: '#111827' }}>{participant.fonction || '-'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Détails de la facture */}
      <div style={{ marginBottom: '48px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #111827' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', color: '#111827' }}>Description</th>
              <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '14px', color: '#111827' }}>Quantité</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '14px', color: '#111827' }}>Prix Unitaire</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '14px', color: '#111827' }}>Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '16px' }}>
                <p style={{ fontSize: '14px', color: '#111827', margin: 0 }}>
                  Inscription FANAF 2026 - {participant.statut === 'membre' ? 'Membre' : 
                    participant.statut === 'non-membre' ? 'Non-Membre' : 
                    participant.statut === 'vip' ? 'VIP' : 'Speaker'}
                  {quantiteFacturee > 1 && ` (${quantiteFacturee} participants)`}
                </p>
                <p style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px' }}>
                  46ème Assemblée Générale - 9-11 Février 2026
                </p>
              </td>
              <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#111827' }}>{quantiteFacturee}</td>
              <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', color: '#111827' }}>
                {montantUnitaire.toLocaleString('fr-FR')} FCFA
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', color: '#111827' }}>
                {montantSousTotal.toLocaleString('fr-FR')} FCFA
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Totaux */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '48px' }}>
        <div style={{ width: '320px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Sous-total:</span>
            <span style={{ fontSize: '14px', color: '#111827' }}>{montantSousTotal.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>TVA:</span>
            <span style={{ fontSize: '14px', color: '#111827' }}>{tva.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '12px 16px', 
            backgroundColor: '#fff7ed', 
            borderRadius: '8px', 
            marginTop: '8px' 
          }}>
            <span style={{ color: '#111827', fontWeight: '500' }}>Total à payer:</span>
            <span style={{ fontSize: '20px', color: '#ea580c', fontWeight: '600' }}>{total.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>
      </div>

      {/* Informations de paiement */}
      <div style={{ 
        marginBottom: '48px', 
        padding: '24px', 
        backgroundColor: '#eff6ff', 
        borderRadius: '8px', 
        borderLeft: '4px solid #2563eb' 
      }}>
        <h3 style={{ color: '#111827', marginBottom: '12px', fontWeight: '600' }}>Modalités de paiement</h3>
        <div style={{ fontSize: '14px', color: '#374151' }}>
          <p style={{ margin: '8px 0' }}><strong>Modes acceptés:</strong> Espèce, Carte bancaire, Orange Money, Wave, Virement, Chèque</p>
          <p style={{ margin: '8px 0' }}><strong>Validité:</strong> Cette facture proforma est valable 30 jours</p>
          <p style={{ margin: '8px 0' }}><strong>Note:</strong> Le paiement devra être finalisé avant l'événement pour valider votre inscription</p>
        </div>
      </div>

      {/* Conditions */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
        <h3 style={{ fontSize: '14px', color: '#111827', marginBottom: '8px', fontWeight: '600' }}>Conditions générales</h3>
        <div style={{ fontSize: '12px', color: '#4b5563' }}>
          <p style={{ margin: '4px 0' }}>• Cette facture proforma n'est pas un document fiscal mais une estimation du montant à payer</p>
          <p style={{ margin: '4px 0' }}>• Un reçu officiel vous sera remis après finalisation du paiement</p>
          <p style={{ margin: '4px 0' }}>• L'inscription est confirmée uniquement après réception du paiement complet</p>
          <p style={{ margin: '4px 0' }}>• Aucun remboursement ne sera effectué après le 1er février 2026</p>
        </div>
      </div>

      {/* Pied de page */}
      <div style={{ 
        marginTop: '48px', 
        textAlign: 'center', 
        fontSize: '12px', 
        color: '#6b7280', 
        borderTop: '1px solid #e5e7eb', 
        paddingTop: '24px' 
      }}>
        <p style={{ margin: '4px 0' }}>FANAF 2026 - 46ème Assemblée Générale | Abidjan, Côte d'Ivoire</p>
        <p style={{ margin: '4px 0' }}>www.fanaf2026.org | contact@fanaf2026.org</p>
      </div>
    </div>
  );
};

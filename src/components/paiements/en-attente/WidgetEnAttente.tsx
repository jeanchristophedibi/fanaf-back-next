import { Card } from "../../ui/card";
import { Coins, Building2, TrendingUp } from "lucide-react";
import { useDynamicInscriptions } from "../../hooks/useDynamicInscriptions";

export function WidgetEnAttente() {
  const { participants } = useDynamicInscriptions();
  
  // Calculer les statistiques pour les paiements en attente
  const stats = participants.reduce((acc, participant) => {
    if (participant.statutInscription === 'non-finalisée') {
      acc.totalPaiements++;
      
      // Utiliser canalEncaissement si disponible, sinon deviner basé sur modePaiement
      const canal = participant.canalEncaissement || 
        (participant.modePaiement === 'virement' || participant.modePaiement === 'carte bancaire' 
          ? 'EXTERNE' 
          : 'ASAPAY');
      
      if (canal === 'EXTERNE') {
        acc.paiementsExterne++;
      } else {
        acc.paiementsAsapay++;
      }
    }
    return acc;
  }, {
    totalPaiements: 0,
    paiementsExterne: 0,
    paiementsAsapay: 0
  });

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-blue-700">Total paiements</p>
          <Coins className="w-5 h-5 text-blue-600" />
        </div>
        <p className="text-2xl text-blue-900">{stats.totalPaiements}</p>
        <p className="text-xs text-blue-600 mt-1">
          En attente de finalisation
        </p>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-blue-700">Canal Externe</p>
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <p className="text-2xl text-blue-900">{stats.paiementsExterne}</p>
        <p className="text-xs text-blue-600 mt-1">
          Virements et cartes bancaires
        </p>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-orange-700">Canal ASAPAY</p>
          <TrendingUp className="w-5 h-5 text-orange-600" />
        </div>
        <p className="text-2xl text-orange-900">{stats.paiementsAsapay}</p>
        <p className="text-xs text-orange-600 mt-1">
          Mobile Money et espèces
        </p>
      </Card>
    </div>
  );
}

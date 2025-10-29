import { Card, CardContent } from "../ui/card";
import { Plane } from "lucide-react";
import { TrendingUp } from "lucide-react";

export function WidgetPlanVol({ planVolStats }: { planVolStats: { total: number; arrivees: number; departs: number } }) {
  return (
    <div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
<Card className="border-t-4 border-t-orange-500">
  <CardContent className="p-6 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600 mb-1">Total Plans de Vol</p>
      <p className="text-3xl text-gray-900">{planVolStats.total}</p>
      <p className="text-xs text-gray-500 mt-1">Vols enregistrés</p>
    </div>
    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
      <Plane className="w-6 h-6 text-white" />
    </div>
  </CardContent>
</Card>
<Card className="border-t-4 border-t-green-500">
  <CardContent className="p-6 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600 mb-1">Total Arrivées</p>
      <p className="text-3xl text-gray-900">{planVolStats.arrivees}</p>
      <p className="text-xs text-gray-500 mt-1">Vols d'arrivée</p>
    </div>
    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
      <TrendingUp className="w-6 h-6 text-white rotate-[-45deg]" />
    </div>
  </CardContent>
</Card>
<Card className="border-t-4 border-t-blue-500">
  <CardContent className="p-6 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600 mb-1">Total Départs</p>
      <p className="text-3xl text-gray-900">{planVolStats.departs}</p>
      <p className="text-xs text-gray-500 mt-1">Vols de départ</p>
    </div>
    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
      <TrendingUp className="w-6 h-6 text-white rotate-[45deg]" />
    </div>
  </CardContent>
</Card>
</div>
</div>
  );
}
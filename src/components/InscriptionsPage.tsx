import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Search, Download, Eye, Plane, FileDown, User, Mail, Phone, Globe, Building, Calendar, FileText, Filter, X, AlertCircle, TrendingUp, History, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockOrganisations, getOrganisationById, getPlanVolByType, getParticipantById, getPlanVolByParticipant, type StatutParticipant, type Participant } from './data/mockData';
import { useDynamicInscriptions } from './hooks/useDynamicInscriptions';
import { toast } from 'sonner';
import { HistoriqueRendezVousDialog } from './HistoriqueRendezVousDialog';

export type InscriptionSubSection = 'membre' | 'non-membre' | 'vip' | 'speaker' | 'planvol';

const statutColors = {
  'membre': 'bg-purple-100 text-purple-800',
  'non-membre': 'bg-amber-100 text-amber-800',
  'vip': 'bg-cyan-100 text-cyan-800',
  'speaker': 'bg-yellow-100 text-yellow-800',
  'referent': 'bg-green-100 text-green-800',
};

const statutInscriptionColors = {
  'finalisée': 'bg-emerald-100 text-emerald-800',
  'non-finalisée': 'bg-red-100 text-red-800',
  'exonéré': 'bg-purple-100 text-purple-800',
};

// Fonction pour déterminer le libellé du statut de paiement
const getStatutPaiementLabel = (participant: any): 'finalisée' | 'non-finalisée' | 'exonéré' => {
  if (participant.statut === 'vip' || participant.statut === 'speaker') {
    return 'exonéré';
  }
  return participant.statutInscription;
};

const subSectionTitles = {
  'membre': 'Membres',
  'non-membre': 'Non-Membres',
  'vip': 'VIP',
  'speaker': 'Speakers',
  'planvol': 'Plan de vol',
};

interface InscriptionsPageProps {
  subSection?: InscriptionSubSection;
  filter?: 'membre' | 'non-membre' | 'vip' | 'speaker' | 'planvol';
  readOnly?: boolean;
}

export function InscriptionsPage({ subSection, filter, readOnly = false }: InscriptionsPageProps) {
  const { participants: mockParticipants, rendezVous } = useDynamicInscriptions({ includeRendezVous: true });
  const activeFilter = filter || subSection;
  const [searchTerm, setSearchTerm] = useState('');
  const [historiqueParticipantId, setHistoriqueParticipantId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // États pour les filtres multi-sélection (avant validation)
  const [tempStatutInscriptionFilters, setTempStatutInscriptionFilters] = useState<string[]>([]);
  const [tempOrganisationFilters, setTempOrganisationFilters] = useState<string[]>([]);
  const [tempPaysFilters, setTempPaysFilters] = useState<string[]>([]);
  const [tempTypeVolFilters, setTempTypeVolFilters] = useState<string[]>([]);
  const [tempDateDebut, setTempDateDebut] = useState<string>('');
  const [tempDateFin, setTempDateFin] = useState<string>('');
  const [tempPaysVolFilters, setTempPaysVolFilters] = useState<string[]>([]); // Filtre pays pour plan de vol
  
  // États pour les filtres appliqués (après validation)
  const [appliedStatutInscriptionFilters, setAppliedStatutInscriptionFilters] = useState<string[]>([]);
  const [appliedOrganisationFilters, setAppliedOrganisationFilters] = useState<string[]>([]);
  const [appliedPaysFilters, setAppliedPaysFilters] = useState<string[]>([]);
  const [appliedTypeVolFilters, setAppliedTypeVolFilters] = useState<string[]>([]);
  const [appliedDateDebut, setAppliedDateDebut] = useState<string>('');
  const [appliedDateFin, setAppliedDateFin] = useState<string>('');
  const [appliedPaysVolFilters, setAppliedPaysVolFilters] = useState<string[]>([]); // Filtre pays appliqué pour plan de vol
  
  const [showFilters, setShowFilters] = useState(false);
  
  // États pour les commentaires sur les plans de vol
  const [planVolComments, setPlanVolComments] = useState<{[key: string]: string}>({});
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedPlanVolId, setSelectedPlanVolId] = useState<string | null>(null);
  const [currentComment, setCurrentComment] = useState<string>('');

  const ParticipantDetailsDialog = ({ participant }: { participant: Participant }) => {
    const [isOpen, setIsOpen] = useState(false);
    const organisation = getOrganisationById(participant.organisationId);

    // Les badges ne peuvent être générés que si l'inscription est finalisée
    const canGenerateBadge = participant.statutInscription === 'finalisée';

    const handleDownloadBadge = () => {
      if (!canGenerateBadge) {
        toast.error('Le badge ne peut être généré que lorsque l\'inscription est finalisée');
        return;
      }
      toast.success(`Badge de ${participant.prenom} ${participant.nom} téléchargé`);
      // Simulation de téléchargement
      console.log('Téléchargement du badge pour:', participant.reference);
    };

    const handleDownloadInvitation = () => {
      toast.success(`Lettre d'invitation de ${participant.prenom} ${participant.nom} téléchargée`);
      // Simulation de téléchargement
      console.log('Téléchargement de la lettre d\'invitation pour:', participant.reference);
    };

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
            <Eye className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
                {participant.prenom[0]}{participant.nom[0]}
              </div>
              {participant.prenom} {participant.nom}
            </DialogTitle>
            <DialogDescription>
              Référence: {participant.reference}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 overflow-y-auto pr-2 flex-1">
            {/* Section identité avec fond coloré */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
              <h3 className="text-orange-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations personnelles
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-orange-600 mb-1">Nom</p>
                  <p className="text-gray-900">{participant.nom}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-orange-600 mb-1">Prénom</p>
                  <p className="text-gray-900">{participant.prenom}</p>
                </div>
                <div className="bg-white p-3 rounded-lg col-span-2">
                  <p className="text-xs text-orange-600 mb-1">Email</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-orange-500" />
                    {participant.email}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg col-span-2">
                  <p className="text-xs text-orange-600 mb-1">Téléphone</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-orange-500" />
                    {participant.telephone}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg col-span-2">
                  <p className="text-xs text-orange-600 mb-1">Pays</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-orange-500" />
                    {participant.pays}
                  </p>
                </div>
              </div>
            </div>

            {/* Section organisation */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <h3 className="text-blue-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Organisation
              </h3>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-gray-900">{organisation?.nom || 'N/A'}</p>
                <div className="flex gap-2 mt-3">
                  <Badge className={statutColors[participant.statut]}>
                    {participant.statut}
                  </Badge>
                  <Badge className={statutInscriptionColors[getStatutPaiementLabel(participant)]}>
                    {getStatutPaiementLabel(participant)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Section documents avec design amélioré */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <h3 className="text-purple-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents disponibles
              </h3>
              <div className="flex gap-3">
                <Button 
                  onClick={handleDownloadBadge}
                  className="bg-white hover:bg-purple-600 hover:text-white border-2 border-purple-300 text-purple-700 h-auto py-4 flex-1 justify-start button-press transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-purple-700"
                  variant="outline"
                  disabled={!canGenerateBadge}
                  title={!canGenerateBadge ? "Le badge ne peut être généré que lorsque l'inscription est finalisée (paiement effectué)" : ""}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FileDown className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Badge</p>
                      <p className="text-xs opacity-70">
                        {canGenerateBadge ? 'PDF' : 'Inscription non finalisée'}
                      </p>
                    </div>
                  </div>
                </Button>
                <Button 
                  onClick={handleDownloadInvitation}
                  className="bg-white hover:bg-purple-600 hover:text-white border-2 border-purple-300 text-purple-700 h-auto py-4 flex-1 justify-start button-press transition-all duration-200"
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FileDown className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium truncate">Invitation</p>
                      <p className="text-xs opacity-70">PDF</p>
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Section Historique Rendez-vous */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
              <h3 className="text-orange-900 mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                Historique des rendez-vous
              </h3>
              <Button 
                onClick={() => {
                  setHistoriqueParticipantId(participant.id);
                  setIsOpen(false);
                }}
                className="bg-white hover:bg-orange-600 hover:text-white border-2 border-orange-300 text-orange-700 h-auto py-4 w-full justify-start button-press transition-all duration-200"
                variant="outline"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <History className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Consulter l'historique</p>
                    <p className="text-xs opacity-70">Demandes envoyées et reçues</p>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Liste unique des pays pour le filtre
  const uniquePays = Array.from(new Set(mockParticipants.map(p => p.pays))).sort();
  
  // Liste unique des pays pour le filtre Plan de Vol
  const uniquePaysVol = useMemo(() => {
    const allPlansVol = [...getPlanVolByType('arrivee'), ...getPlanVolByType('depart')];
    const paysSet = new Set<string>();
    allPlansVol.forEach(pv => {
      const participant = getParticipantById(pv.participantId);
      if (participant) {
        paysSet.add(participant.pays);
      }
    });
    return Array.from(paysSet).sort();
  }, []);

  // Fonction pour obtenir les statuts d'inscription disponibles selon le sous-menu
  const getAvailableStatutsInscription = () => {
    if (activeFilter === 'vip' || activeFilter === 'speaker') {
      return ['exonéré'];
    }
    // Pour membres et non-membres, on ne montre que finalisée et non-finalisée
    return ['finalisée', 'non-finalisée'];
  };

  // Fonction pour appliquer les filtres
  const handleApplyFilters = () => {
    setAppliedStatutInscriptionFilters(tempStatutInscriptionFilters);
    setAppliedOrganisationFilters(tempOrganisationFilters);
    setAppliedPaysFilters(tempPaysFilters);
    setAppliedTypeVolFilters(tempTypeVolFilters);
    setAppliedDateDebut(tempDateDebut);
    setAppliedDateFin(tempDateFin);
    setAppliedPaysVolFilters(tempPaysVolFilters);
    setShowFilters(false);
    toast.success('Filtres appliqués');
  };

  // Fonction pour réinitialiser les filtres
  const handleResetFilters = () => {
    setTempStatutInscriptionFilters([]);
    setTempOrganisationFilters([]);
    setTempPaysFilters([]);
    setTempTypeVolFilters([]);
    setTempDateDebut('');
    setTempDateFin('');
    setTempPaysVolFilters([]);
    setAppliedStatutInscriptionFilters([]);
    setAppliedOrganisationFilters([]);
    setAppliedPaysFilters([]);
    setAppliedTypeVolFilters([]);
    setAppliedDateDebut('');
    setAppliedDateFin('');
    setAppliedPaysVolFilters([]);
    toast.success('Filtres réinitialisés');
  };

  // Compter les filtres actifs
  const activeFiltersCount = activeFilter === 'planvol' 
    ? appliedTypeVolFilters.length + appliedOrganisationFilters.length + (appliedDateDebut ? 1 : 0) + (appliedDateFin ? 1 : 0) + appliedPaysVolFilters.length
    : appliedStatutInscriptionFilters.length + appliedOrganisationFilters.length + appliedPaysFilters.length;

  const filteredParticipants = useMemo(() => {
    if (activeFilter === 'planvol') return [];

    let filtered = mockParticipants.filter(p => p.statut === activeFilter);

    // Filtre par recherche universelle
    if (searchTerm) {
      filtered = filtered.filter(p => {
        const organisation = getOrganisationById(p.organisationId);
        
        return (
          p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.telephone.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.pays.toLowerCase().includes(searchTerm.toLowerCase()) ||
          organisation?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.statutInscription.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Application des filtres multi-sélection
    if (appliedStatutInscriptionFilters.length > 0) {
      filtered = filtered.filter(p => appliedStatutInscriptionFilters.includes(getStatutPaiementLabel(p)));
    }

    if (appliedOrganisationFilters.length > 0) {
      filtered = filtered.filter(p => appliedOrganisationFilters.includes(p.organisationId));
    }

    if (appliedPaysFilters.length > 0) {
      filtered = filtered.filter(p => appliedPaysFilters.includes(p.pays));
    }

    return filtered;
  }, [subSection, searchTerm, appliedStatutInscriptionFilters, appliedOrganisationFilters, appliedPaysFilters]);

  // Regrouper les plans de vol par participant
  const groupedPlansVol = useMemo(() => {
    if (activeFilter !== 'planvol') return [];

    let allPlansVol = [...getPlanVolByType('arrivee'), ...getPlanVolByType('depart')];

    // Filtre par recherche universelle
    if (searchTerm) {
      allPlansVol = allPlansVol.filter(pv => {
        const participant = getParticipantById(pv.participantId);
        if (!participant) return false;

        const organisation = getOrganisationById(participant.organisationId);
        
        return (
          participant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          participant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pv.numeroVol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          organisation?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pv.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pv.aeroport.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Application des filtres multi-sélection
    if (appliedTypeVolFilters.length > 0) {
      allPlansVol = allPlansVol.filter(pv => appliedTypeVolFilters.includes(pv.type));
    }

    if (appliedOrganisationFilters.length > 0) {
      allPlansVol = allPlansVol.filter(pv => {
        const participant = getParticipantById(pv.participantId);
        return participant && appliedOrganisationFilters.includes(participant.organisationId);
      });
    }

    // Filtrage par pays
    if (appliedPaysVolFilters.length > 0) {
      allPlansVol = allPlansVol.filter(pv => {
        const participant = getParticipantById(pv.participantId);
        return participant && appliedPaysVolFilters.includes(participant.pays);
      });
    }

    // Filtrage par dates
    if (appliedDateDebut || appliedDateFin) {
      allPlansVol = allPlansVol.filter(pv => {
        const volDate = new Date(pv.date);
        volDate.setHours(0, 0, 0, 0);
        
        if (appliedDateDebut) {
          const dateDebut = new Date(appliedDateDebut);
          dateDebut.setHours(0, 0, 0, 0);
          if (volDate < dateDebut) return false;
        }
        
        if (appliedDateFin) {
          const dateFin = new Date(appliedDateFin);
          dateFin.setHours(0, 0, 0, 0);
          if (volDate > dateFin) return false;
        }
        
        return true;
      });
    }

    // Regrouper par participant
    const participantMap = new Map();
    
    allPlansVol.forEach(pv => {
      if (!participantMap.has(pv.participantId)) {
        participantMap.set(pv.participantId, {
          participantId: pv.participantId,
          arrivee: null,
          depart: null
        });
      }
      
      const entry = participantMap.get(pv.participantId);
      if (pv.type === 'arrivee') {
        entry.arrivee = pv;
      } else {
        entry.depart = pv;
      }
    });

    // Convertir en tableau et trier par date d'arrivée (ou de départ si pas d'arrivée)
    const grouped = Array.from(participantMap.values());
    grouped.sort((a, b) => {
      const dateA = a.arrivee?.date || a.depart?.date || '';
      const dateB = b.arrivee?.date || b.depart?.date || '';
      
      if (dateA && dateB) {
        const dateCompare = new Date(dateA).getTime() - new Date(dateB).getTime();
        if (dateCompare !== 0) return dateCompare;
        
        const heureA = a.arrivee?.heure || a.depart?.heure || '';
        const heureB = b.arrivee?.heure || b.depart?.heure || '';
        return heureA.localeCompare(heureB);
      }
      
      return 0;
    });

    return grouped;
  }, [activeFilter, searchTerm, appliedTypeVolFilters, appliedOrganisationFilters]);

  // Statistiques pour le tableau de bord Plan de vol
  const planVolStats = useMemo(() => {
    if (activeFilter !== 'planvol') return { total: 0, arrivees: 0, departs: 0 };
    
    const arrivees = getPlanVolByType('arrivee');
    const departs = getPlanVolByType('depart');
    
    return {
      total: arrivees.length + departs.length,
      arrivees: arrivees.length,
      departs: departs.length
    };
  }, [activeFilter]);

  // Fonction pour vérifier si une arrivée est pour demain
  const isArrivingTomorrow = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const arrivalDate = new Date(dateString);
    arrivalDate.setHours(0, 0, 0, 0);
    
    return arrivalDate.getTime() === tomorrow.getTime();
  };

  const exportToCSV = () => {
    if (subSection === 'planvol') {
      // Export pour plan de vol
      const headers = ['Nom', 'Prénom', 'Organisation', 'Vol Arrivée', 'Date Arrivée', 'Heure Arrivée', 'Vol Départ', 'Date Départ', 'Heure Départ'];
      const csvContent = [
        headers.join(','),
        ...groupedPlansVol.map(group => {
          const participant = getParticipantById(group.participantId);
          const organisation = participant ? getOrganisationById(participant.organisationId) : null;
          return [
            participant?.nom || '',
            participant?.prenom || '',
            organisation?.nom || '',
            group.arrivee?.numeroVol || 'N/A',
            group.arrivee ? new Date(group.arrivee.date).toLocaleDateString('fr-FR') : 'N/A',
            group.arrivee?.heure || 'N/A',
            group.depart?.numeroVol || 'N/A',
            group.depart ? new Date(group.depart.date).toLocaleDateString('fr-FR') : 'N/A',
            group.depart?.heure || 'N/A'
          ].join(',');
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plan-de-vol-fanaf.csv`;
      a.click();
    } else {
      // Export pour participants
      const headers = ['Nom', 'Prénom', 'Référence', 'Email', 'Contact', 'Organisation', 'Pays', 'Statut Participant', 'Statut Inscription', 'Mode de paiement', 'Date Inscription'];
      const csvContent = [
        headers.join(','),
        ...filteredParticipants.map(p => {
          const org = getOrganisationById(p.organisationId);
          return [
            p.nom,
            p.prenom,
            p.reference,
            p.email,
            p.telephone,
            org?.nom || '',
            p.pays,
            p.statut,
            getStatutPaiementLabel(p),
            getStatutPaiementLabel(p) === 'finalisée' && p.modePaiement ? p.modePaiement : 'N/A',
            new Date(p.dateInscription).toLocaleDateString('fr-FR')
          ].join(',');
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inscriptions-${activeFilter}-fanaf.csv`;
      a.click();
    }
  };

  return (
    <div className="p-8 animate-page-enter">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Inscriptions - {activeFilter ? subSectionTitles[activeFilter] : 'Toutes'}</h1>
        <p className="text-gray-600">
          {activeFilter === 'planvol' 
            ? 'Programme de l\'événement FANAF' 
            : `Gestion des participants ${activeFilter ? subSectionTitles[activeFilter].toLowerCase() : ''}`
          }
        </p>
      </div>

      {activeFilter !== 'planvol' ? (
        <>
          {/* Recherche et Filtres */}
          <Card className="mb-6 animate-fade-in shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Recherche et Filtres
                </div>
                <Button 
                  variant={showFilters ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-orange-600 text-white">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Champ de recherche */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, prénom, email, référence, téléphone, pays, organisation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Panneau de filtres multi-sélection */}
              {showFilters && (
                <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50 animate-slide-down">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Filtre Statut Inscription */}
                    <div>
                      <Label className="text-sm mb-3 block text-gray-900">Statut Inscription</Label>
                      <div className="space-y-2">
                        {getAvailableStatutsInscription().map((statut) => (
                          <div key={statut} className="flex items-center space-x-2">
                            <Checkbox
                              id={`statut-inscription-${statut}`}
                              checked={tempStatutInscriptionFilters.includes(statut)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTempStatutInscriptionFilters([...tempStatutInscriptionFilters, statut]);
                                } else {
                                  setTempStatutInscriptionFilters(tempStatutInscriptionFilters.filter(s => s !== statut));
                                }
                              }}
                            />
                            <label
                              htmlFor={`statut-inscription-${statut}`}
                              className="text-sm cursor-pointer capitalize"
                            >
                              {statut}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Filtre Organisation */}
                    <div>
                      <Label className="text-sm mb-3 block text-gray-900">Organisation</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {mockOrganisations.slice(0, 8).map((org) => (
                          <div key={org.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`org-${org.id}`}
                              checked={tempOrganisationFilters.includes(org.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTempOrganisationFilters([...tempOrganisationFilters, org.id]);
                                } else {
                                  setTempOrganisationFilters(tempOrganisationFilters.filter(o => o !== org.id));
                                }
                              }}
                            />
                            <label
                              htmlFor={`org-${org.id}`}
                              className="text-sm cursor-pointer truncate"
                            >
                              {org.nom}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Filtre Pays */}
                    <div>
                      <Label className="text-sm mb-3 block text-gray-900">Pays</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {uniquePays.slice(0, 8).map((pays) => (
                          <div key={pays} className="flex items-center space-x-2">
                            <Checkbox
                              id={`pays-${pays}`}
                              checked={tempPaysFilters.includes(pays)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTempPaysFilters([...tempPaysFilters, pays]);
                                } else {
                                  setTempPaysFilters(tempPaysFilters.filter(p => p !== pays));
                                }
                              }}
                            />
                            <label
                              htmlFor={`pays-${pays}`}
                              className="text-sm cursor-pointer"
                            >
                              {pays}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Boutons d'action */}
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleResetFilters}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Réinitialiser
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleApplyFilters}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Appliquer les filtres
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {filteredParticipants.length} participant(s) trouvé(s)
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 text-orange-600">
                      ({activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''})
                    </span>
                  )}
                </p>
                {filteredParticipants.length > 0 && (
                  <Button 
                    onClick={exportToCSV} 
                    variant="outline" 
                    className="button-press transition-all duration-200 hover:shadow-md"
                    disabled={readOnly}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter CSV
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tableau */}
          <Card className="animate-slide-up shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Prénom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Organisation</TableHead>
                      <TableHead>Pays</TableHead>
                      <TableHead>Statut Participant</TableHead>
                      <TableHead>Statut Inscription</TableHead>
                      <TableHead>Mode de paiement</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center text-gray-500 py-8">
                          Aucun participant trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredParticipants.map((participant) => {
                        const organisation = getOrganisationById(participant.organisationId);
                        const showModePaiement = getStatutPaiementLabel(participant) === 'finalisée';
                        return (
                          <TableRow key={participant.id}>
                            <TableCell className="text-gray-900">{participant.reference}</TableCell>
                            <TableCell>{participant.nom}</TableCell>
                            <TableCell>{participant.prenom}</TableCell>
                            <TableCell className="text-gray-600">{participant.email}</TableCell>
                            <TableCell className="text-gray-600">{participant.telephone}</TableCell>
                            <TableCell className="text-gray-600">{organisation?.nom || 'N/A'}</TableCell>
                            <TableCell>{participant.pays}</TableCell>
                            <TableCell>
                              <Badge className={statutColors[participant.statut]}>
                                {participant.statut}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={statutInscriptionColors[getStatutPaiementLabel(participant)]}>
                                {getStatutPaiementLabel(participant)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {showModePaiement && participant.modePaiement ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-900 capitalize">
                                    {participant.modePaiement}
                                  </span>
                                  {participant.modePaiement === 'chèque' && (
                                    <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                                      FANAF
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">N/A</span>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {new Date(participant.dateInscription).toLocaleDateString('fr-FR')}
                            </TableCell>
                            <TableCell>
                              <ParticipantDetailsDialog participant={participant} />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Plan de vol */
        <>
          {/* Tableau de bord des statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 animate-fade-in">
            {/* Total des plans de vol */}
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 border-t-4 border-t-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Plans de Vol</p>
                    <p className="text-3xl text-gray-900">{planVolStats.total}</p>
                    <p className="text-xs text-gray-500 mt-1">Vols enregistrés</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Plane className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total des arrivées */}
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 border-t-4 border-t-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Arrivées</p>
                    <p className="text-3xl text-gray-900">{planVolStats.arrivees}</p>
                    <p className="text-xs text-gray-500 mt-1">Vols d'arrivée</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white rotate-[-45deg]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total des départs */}
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 border-t-4 border-t-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Départs</p>
                    <p className="text-3xl text-gray-900">{planVolStats.departs}</p>
                    <p className="text-xs text-gray-500 mt-1">Vols de départ</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white rotate-[45deg]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Recherche et Filtres
                </div>
                <Button 
                  variant={showFilters ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-orange-600 text-white">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Champ de recherche */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, prénom, numéro de vol, organisation, aéroport..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Panneau de filtres multi-sélection */}
              {showFilters && (
                <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50 animate-slide-down">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Filtre Type de vol */}
                    <div>
                      <Label className="text-sm mb-3 block text-gray-900">Type de vol</Label>
                      <div className="space-y-2">
                        {['arrivee', 'depart'].map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-vol-${type}`}
                              checked={tempTypeVolFilters.includes(type)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTempTypeVolFilters([...tempTypeVolFilters, type]);
                                } else {
                                  setTempTypeVolFilters(tempTypeVolFilters.filter(t => t !== type));
                                }
                              }}
                            />
                            <label
                              htmlFor={`type-vol-${type}`}
                              className="text-sm cursor-pointer capitalize"
                            >
                              {type === 'arrivee' ? 'Arrivée' : 'Départ'}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Filtre Période */}
                    <div>
                      <Label className="text-sm mb-3 block text-gray-900">Période</Label>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">Date de début</Label>
                          <Input
                            type="date"
                            value={tempDateDebut}
                            onChange={(e) => setTempDateDebut(e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">Date de fin</Label>
                          <Input
                            type="date"
                            value={tempDateFin}
                            onChange={(e) => setTempDateFin(e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Filtre Pays */}
                    <div>
                      <Label className="text-sm mb-3 block text-gray-900">Pays</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {uniquePaysVol.map((pays) => (
                          <div key={pays} className="flex items-center space-x-2">
                            <Checkbox
                              id={`pays-vol-${pays}`}
                              checked={tempPaysVolFilters.includes(pays)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTempPaysVolFilters([...tempPaysVolFilters, pays]);
                                } else {
                                  setTempPaysVolFilters(tempPaysVolFilters.filter(p => p !== pays));
                                }
                              }}
                            />
                            <label
                              htmlFor={`pays-vol-${pays}`}
                              className="text-sm cursor-pointer"
                            >
                              {pays}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Filtre Organisation */}
                    <div>
                      <Label className="text-sm mb-3 block text-gray-900">Organisation</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {mockOrganisations.slice(0, 8).map((org) => (
                          <div key={org.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`org-planvol-${org.id}`}
                              checked={tempOrganisationFilters.includes(org.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTempOrganisationFilters([...tempOrganisationFilters, org.id]);
                                } else {
                                  setTempOrganisationFilters(tempOrganisationFilters.filter(o => o !== org.id));
                                }
                              }}
                            />
                            <label
                              htmlFor={`org-planvol-${org.id}`}
                              className="text-sm cursor-pointer truncate"
                            >
                              {org.nom}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Boutons d'action */}
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleResetFilters}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Réinitialiser
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleApplyFilters}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Appliquer les filtres
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {groupedPlansVol.length} participant(s) trouvé(s)
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 text-orange-600">
                      ({activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''})
                    </span>
                  )}
                </p>
                <Button onClick={exportToCSV} variant="outline" size="sm" disabled={groupedPlansVol.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Exporter CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan de vol par participant</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Prénom</TableHead>
                      <TableHead>Organisation</TableHead>
                      <TableHead>Pays</TableHead>
                      <TableHead>Fonction</TableHead>
                      <TableHead className="bg-green-50">Arrivée</TableHead>
                      <TableHead className="bg-blue-50">Départ</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedPlansVol.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                          Aucun participant trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      groupedPlansVol.map((group) => {
                        const participant = getParticipantById(group.participantId);
                        if (!participant) return null;
                        
                        const organisation = getOrganisationById(participant.organisationId);
                        const participantVols = getPlanVolByParticipant(group.participantId);
                        const isImminentArrival = group.arrivee && isArrivingTomorrow(group.arrivee.date);
                        
                        return (
                          <TableRow key={group.participantId}>
                            <TableCell className="text-gray-900">{participant.nom}</TableCell>
                            <TableCell className="text-gray-900">{participant.prenom}</TableCell>
                            <TableCell className="text-gray-600">{organisation?.nom || 'N/A'}</TableCell>
                            <TableCell className="text-gray-600">{participant.pays}</TableCell>
                            <TableCell className="text-gray-600 text-sm">{participant.fonction || 'N/A'}</TableCell>
                            
                            {/* Colonne Arrivée */}
                            <TableCell className="bg-green-50/50">
                              {group.arrivee ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-green-100 text-green-800 text-xs">
                                      {group.arrivee.numeroVol}
                                    </Badge>
                                    {isImminentArrival && (
                                      <Badge className="bg-red-500 text-white flex items-center gap-1 animate-pulse text-xs">
                                        <AlertCircle className="w-3 h-3" />
                                        Demain
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(group.arrivee.date).toLocaleDateString('fr-FR')}
                                    {isImminentArrival && (
                                      <AlertCircle className="w-3 h-3 text-red-500" />
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-600">🕐 {group.arrivee.heure}</div>
                                  <div className="text-xs text-gray-500">
                                    De: {group.arrivee.aeroportOrigine?.split(' - ')[1] || 'N/A'}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">Aucune arrivée</span>
                              )}
                            </TableCell>
                            
                            {/* Colonne Départ */}
                            <TableCell className="bg-blue-50/50">
                              {group.depart ? (
                                <div className="space-y-1">
                                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                                    {group.depart.numeroVol}
                                  </Badge>
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(group.depart.date).toLocaleDateString('fr-FR')}
                                  </div>
                                  <div className="text-xs text-gray-600">🕐 {group.depart.heure}</div>
                                  <div className="text-xs text-gray-500">
                                    Vers: {group.depart.aeroportDestination?.split(' - ')[1] || 'N/A'}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">Aucun départ</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <Plane className="w-5 h-5 text-orange-600" />
                                      Plan de vol - {participant.prenom} {participant.nom}
                                    </DialogTitle>
                                    <DialogDescription>
                                      Détails des vols d'arrivée et de départ du participant
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-5">
                                    {/* Informations participant - Design compact */}
                                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-orange-600">👤</span>
                                          <div>
                                            <p className="text-xs text-orange-600">Participant</p>
                                            <p className="text-sm text-gray-900">{participant.prenom} {participant.nom}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-orange-600">🏢</span>
                                          <div>
                                            <p className="text-xs text-orange-600">Organisation</p>
                                            <p className="text-sm text-gray-900">{organisation?.nom || 'N/A'}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-orange-600">✉️</span>
                                          <div>
                                            <p className="text-xs text-orange-600">Email</p>
                                            <p className="text-sm text-gray-900">{participant.email}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-orange-600">📞</span>
                                          <div>
                                            <p className="text-xs text-orange-600">Téléphone</p>
                                            <p className="text-sm text-gray-900">{participant.telephone}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Vols - Layout horizontal pour mieux utiliser l'espace */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* Vol d'arrivée */}
                                      {participantVols.filter(v => v.type === 'arrivee').length > 0 ? (
                                        <div className="space-y-3">
                                          <div className="flex items-center gap-2 pb-2 border-b border-green-200">
                                            <Badge className="bg-green-500 text-white">
                                              ✈️ Arrivée
                                            </Badge>
                                          </div>
                                          {participantVols.filter(v => v.type === 'arrivee').map((vol) => (
                                            <div key={vol.id} className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                                              <div className="flex items-center justify-between pb-2 border-b border-green-200">
                                                <span className="text-xs text-green-600">Numéro de vol</span>
                                                <span className="text-sm text-gray-900">{vol.numeroVol}</span>
                                              </div>
                                              <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                  <span className="text-xs text-green-600">📅 Date</span>
                                                  <span className="text-xs text-gray-900">
                                                    {new Date(vol.date).toLocaleDateString('fr-FR', {
                                                      day: 'numeric',
                                                      month: 'short',
                                                      year: 'numeric'
                                                    })}
                                                  </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                  <span className="text-xs text-green-600">🕐 Heure d'arrivée</span>
                                                  <span className="text-xs text-gray-900">{vol.heure}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                  <span className="text-xs text-green-600">🛬 Aéroport</span>
                                                  <span className="text-xs text-gray-900">{vol.aeroport}</span>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                                          <p className="text-sm text-gray-500">Aucun vol d'arrivée</p>
                                        </div>
                                      )}

                                      {/* Vol de départ */}
                                      {participantVols.filter(v => v.type === 'depart').length > 0 ? (
                                        <div className="space-y-3">
                                          <div className="flex items-center gap-2 pb-2 border-b border-blue-200">
                                            <Badge className="bg-blue-500 text-white">
                                              ✈️ Départ
                                            </Badge>
                                          </div>
                                          {participantVols.filter(v => v.type === 'depart').map((vol) => (
                                            <div key={vol.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                                              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                                                <span className="text-xs text-blue-600">Numéro de vol</span>
                                                <span className="text-sm text-gray-900">{vol.numeroVol}</span>
                                              </div>
                                              <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                  <span className="text-xs text-blue-600">📅 Date</span>
                                                  <span className="text-xs text-gray-900">
                                                    {new Date(vol.date).toLocaleDateString('fr-FR', {
                                                      day: 'numeric',
                                                      month: 'short',
                                                      year: 'numeric'
                                                    })}
                                                  </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                  <span className="text-xs text-blue-600">🕐 Heure de départ</span>
                                                  <span className="text-xs text-gray-900">{vol.heure}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                  <span className="text-xs text-blue-600">🛫 Départ</span>
                                                  <span className="text-xs text-gray-900">{vol.aeroport}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                  <span className="text-xs text-blue-600">🛬 Destination</span>
                                                  <span className="text-xs text-gray-900">{vol.aeroportDestination}</span>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                                          <p className="text-sm text-gray-500">Aucun vol de départ</p>
                                        </div>
                                      )}
                                    </div>

                                    {participantVols.length === 0 && (
                                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                                        <Plane className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-500">Aucune information de vol disponible</p>
                                      </div>
                                    )}

                                    {/* Commentaire administrateur */}
                                    {planVolComments[group.participantId] && (
                                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-start gap-2 mb-2">
                                          <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                                          <div className="flex-1">
                                            <p className="text-sm text-blue-900 mb-1">Commentaire administrateur</p>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{planVolComments[group.participantId]}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              {/* Bouton Commentaire */}
                              <div className="relative">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className={`h-8 w-8 p-0 ${
                                    planVolComments[group.participantId] 
                                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                                      : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                  }`}
                                  onClick={() => {
                                    setSelectedPlanVolId(group.participantId);
                                    setCurrentComment(planVolComments[group.participantId] || '');
                                    setCommentDialogOpen(true);
                                  }}
                                  disabled={readOnly}
                                >
                                  <MessageSquare className={`w-4 h-4 ${planVolComments[group.participantId] ? 'fill-blue-600' : ''}`} />
                                </Button>
                                {planVolComments[group.participantId] && (
                                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                                )}
                              </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Dialogue historique rendez-vous */}
      {historiqueParticipantId && (
        <HistoriqueRendezVousDialog
          isOpen={!!historiqueParticipantId}
          onClose={() => setHistoriqueParticipantId(null)}
          participantId={historiqueParticipantId}
          rendezVousList={rendezVous}
        />
      )}

      {/* Dialogue de commentaire pour plan de vol */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Commentaire administrateur
            </DialogTitle>
            <DialogDescription>
              Ajoutez un commentaire ou une note concernant le plan de vol de ce participant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="comment" className="text-sm mb-2 block">
                Votre commentaire
              </Label>
              <Textarea
                id="comment"
                placeholder="Ex: Prévoir accueil VIP à l'aéroport, véhicule avec chauffeur..."
                value={currentComment}
                onChange={(e) => setCurrentComment(e.target.value)}
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ce commentaire sera visible uniquement par les administrateurs
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCommentDialogOpen(false);
                  setCurrentComment('');
                  setSelectedPlanVolId(null);
                }}
              >
                Annuler
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (selectedPlanVolId) {
                    setPlanVolComments(prev => ({
                      ...prev,
                      [selectedPlanVolId]: currentComment
                    }));
                    toast.success('Commentaire enregistré avec succès');
                  }
                  setCommentDialogOpen(false);
                  setCurrentComment('');
                  setSelectedPlanVolId(null);
                }}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

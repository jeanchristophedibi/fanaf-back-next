import React, { useState } from 'react';
import { CheckCircle, Building2, Clock, Search, AlertTriangle, XCircle, Calendar, Download, Filter, Users, TrendingUp, ChevronDown, ChevronUp, MapPin, Briefcase, Hash } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  mockParticipants,
  mockCheckIns,
  getOrganisationById,
  getCheckInByParticipant,
  type Participant,
  type CheckIn,
} from './data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface CheckInScannerProps {
  readOnly?: boolean;
}

export function CheckInScanner({ readOnly = false }: CheckInScannerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>(mockCheckIns);
  const [lastScan, setLastScan] = useState<{ participant: Participant; success: boolean; reason?: string } | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterOrganisation, setFilterOrganisation] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showHistorique, setShowHistorique] = useState(false);
  const [activeStatFilter, setActiveStatFilter] = useState<'all' | 'presents' | 'authorises' | 'refuses'>('all');

  const handleCheckIn = (participant: Participant, forceAccess: boolean = false) => {
    const existingCheckIns = checkIns.filter((ci) => ci.participantId === participant.id);
    const hasAuthorizedCheckIn = existingCheckIns.some((ci) => ci.autorise);
    
    let autorise = true;
    let raisonRefus = '';
    
    if (!forceAccess) {
      // VIP et speakers sont exonérés et donc toujours autorisés
      if (participant.statut !== 'vip' && participant.statut !== 'speaker' && participant.statutInscription !== 'finalisée') {
        autorise = false;
        raisonRefus = 'Inscription non finalisée';
      }
    }

    const nombreScans = existingCheckIns.length + 1;

    const newCheckIn: CheckIn = {
      id: `ci-${Date.now()}`,
      participantId: participant.id,
      dateCheckIn: new Date().toISOString().split('T')[0],
      heureCheckIn: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      scanPar: 'mc2',
      autorise: autorise,
      raisonRefus: raisonRefus || undefined,
      nombreScans: nombreScans,
      statutRemontee: autorise ? 'normal' : 'signale',
    };

    setCheckIns([newCheckIn, ...checkIns]);
    setLastScan({ participant, success: autorise, reason: raisonRefus });
    setSelectedParticipant(null);
    setSearchTerm('');

    if (autorise) {
      if (nombreScans > 1) {
        toast.warning(`Badge scanné ${nombreScans} fois pour ${participant.prenom} ${participant.nom}`);
      } else {
        toast.success(`Check-in effectué pour ${participant.prenom} ${participant.nom}`);
      }
    } else {
      toast.error(`Accès refusé : ${raisonRefus}`);
    }

    setTimeout(() => setLastScan(null), 3000);
  };

  const filteredParticipants = mockParticipants.filter(
    (p) =>
      p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistiques globales
  const authorizedCheckIns = checkIns.filter((ci) => ci.autorise);
  const deniedCheckIns = checkIns.filter((ci) => !ci.autorise);
  
  // Total des présents (participants uniques qui ont fait au moins un check-in autorisé)
  const uniqueCheckedInParticipants = new Set(
    checkIns.filter(ci => ci.autorise).map(ci => ci.participantId)
  ).size;

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'vip':
        return 'bg-yellow-100 text-yellow-700';
      case 'speaker':
        return 'bg-purple-100 text-purple-700';
      case 'membre':
        return 'bg-orange-100 text-orange-700';
      case 'referent':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  // Fonction d'export Excel/CSV
  const exportCheckIns = (day: string = 'all') => {
    const checkInsToExport = day === 'all' 
      ? checkIns 
      : checkIns.filter(ci => ci.dateCheckIn === day);

    const csvHeader = 'Date,Heure,Nom,Prénom,Email,Organisation,Statut,Accès,Raison Refus,Nombre Scans\n';
    const csvRows = checkInsToExport.map(ci => {
      const participant = mockParticipants.find(p => p.id === ci.participantId);
      if (!participant) return '';
      
      const organisation = getOrganisationById(participant.organisationId);
      return [
        ci.dateCheckIn,
        ci.heureCheckIn,
        participant.nom,
        participant.prenom,
        participant.email,
        organisation?.nom || '',
        participant.statut,
        ci.autorise ? 'Autorisé' : 'Refusé',
        ci.raisonRefus || '',
        ci.nombreScans
      ].map(field => `"${field}"`).join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const fileName = day === 'all' 
      ? 'check-ins-tous-les-jours.csv'
      : `check-ins-${day}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Export réussi : ${checkInsToExport.length} check-ins exportés`);
  };

  // Fonction de filtrage
  const getFilteredCheckIns = (dayFilter: string) => {
    let filtered = dayFilter === 'all' 
      ? checkIns 
      : checkIns.filter(ci => ci.dateCheckIn === dayFilter);

    // Appliquer le filtre de statistiques actif
    if (activeStatFilter === 'authorises') {
      filtered = filtered.filter(ci => ci.autorise);
    } else if (activeStatFilter === 'refuses') {
      filtered = filtered.filter(ci => !ci.autorise);
    } else if (activeStatFilter === 'presents') {
      // Ne montrer que les check-ins autorisés (pour avoir les présents)
      filtered = filtered.filter(ci => ci.autorise);
    }

    if (filterStatut !== 'all') {
      filtered = filtered.filter(ci => 
        filterStatut === 'autorise' ? ci.autorise : !ci.autorise
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(ci => {
        const participant = mockParticipants.find(p => p.id === ci.participantId);
        return participant?.statut === filterType;
      });
    }

    if (filterOrganisation !== 'all') {
      filtered = filtered.filter(ci => {
        const participant = mockParticipants.find(p => p.id === ci.participantId);
        return participant?.organisationId === filterOrganisation;
      });
    }

    return filtered;
  };

  // Obtenir les organisations uniques des check-ins
  const uniqueOrganisations = Array.from(
    new Set(
      checkIns.map(ci => {
        const participant = mockParticipants.find(p => p.id === ci.participantId);
        return participant?.organisationId;
      }).filter(Boolean)
    )
  );

  // Statistiques par jour
  const getStatsForDay = (day: string) => {
    const dayCheckIns = day === 'all' ? checkIns : checkIns.filter(ci => ci.dateCheckIn === day);
    const filtered = getFilteredCheckIns(day);
    
    // Calculer les participants uniques pour ce jour
    const uniquePresents = new Set(
      dayCheckIns.filter(ci => ci.autorise).map(ci => ci.participantId)
    ).size;
    
    return {
      total: filtered.length,
      authorized: filtered.filter(ci => ci.autorise).length,
      denied: filtered.filter(ci => !ci.autorise).length,
      totalUnfiltered: dayCheckIns.length,
      uniquePresents: uniquePresents,
    };
  };

  const handleStatClick = (filter: 'all' | 'presents' | 'authorises' | 'refuses') => {
    setShowHistorique(true);
    setActiveStatFilter(filter);
    
    // Réinitialiser les autres filtres
    if (filter === 'presents') {
      setFilterStatut('all');
    } else if (filter === 'authorises') {
      setFilterStatut('all');
    } else if (filter === 'refuses') {
      setFilterStatut('all');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header avec guide d'utilisation */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 mb-2">Check-in Participants</h1>
          <p className="text-gray-600">Gestion en temps réel des entrées lors de l'événement FANAF 2026</p>
        </div>
      </div>

      {/* Carte d'introduction et guide */}
      {!showHistorique && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`p-6 bg-gradient-to-br ${readOnly ? 'from-blue-50 to-cyan-50 border-blue-200' : 'from-orange-50 to-amber-50 border-orange-200'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full ${readOnly ? 'bg-blue-500' : 'bg-orange-500'} flex items-center justify-center flex-shrink-0`}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 mb-2">
                  💡 Comment utiliser le check-in ?
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex items-start gap-2">
                    <span className={`${readOnly ? 'text-blue-600' : 'text-orange-600'} flex-shrink-0`}>1.</span>
                    <span><strong>Cliquez sur une statistique</strong> (Présents, Autorisés, Refusés) pour consulter l'historique détaillé des passages</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className={`${readOnly ? 'text-blue-600' : 'text-orange-600'} flex-shrink-0`}>2.</span>
                    <span><strong>Utilisez la recherche</strong> ci-dessous pour {readOnly ? 'consulter les détails d\'un participant' : 'trouver rapidement un participant et effectuer son check-in'}</span>
                  </p>
                  {!readOnly && (
                    <p className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">3.</span>
                      <span><strong>Scannez un QR code</strong> (fonctionnalité disponible avec un lecteur de code-barres)</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Notification de scan */}
      <AnimatePresence>
        {lastScan && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert className={lastScan.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
              <div className="flex items-center gap-2">
                {lastScan.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <AlertDescription
                  className={lastScan.success ? 'text-green-800' : 'text-red-800'}
                >
                  {lastScan.success
                    ? `✓ Check-in autorisé pour ${lastScan.participant.prenom} ${lastScan.participant.nom}`
                    : `✗ Accès refusé pour ${lastScan.participant.prenom} ${lastScan.participant.nom} - ${lastScan.reason}`}
                </AlertDescription>
              </div>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistiques globales */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-gray-900">Vue d'ensemble</h2>
          {!showHistorique && (
            <Badge className="bg-orange-100 text-orange-700 border-orange-300">
              👆 Cliquez sur une carte pour voir l'historique
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-5 gap-4">
          <div
            className={`p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-xl border cursor-pointer transition-all hover:scale-105 hover:shadow-lg group relative ${activeStatFilter === 'presents' && showHistorique ? 'ring-2 ring-blue-500 scale-105 shadow-lg' : ''}`}
            onClick={() => handleStatClick('presents')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center transition-transform group-hover:rotate-12">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-700 uppercase tracking-wide">Présents</p>
                <p className="text-2xl text-blue-900">{uniqueCheckedInParticipants}</p>
                <p className="text-xs text-blue-600">sur {mockParticipants.length}</p>
              </div>
            </div>
            {!showHistorique && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronDown className="w-4 h-4 text-blue-600" />
              </div>
            )}
          </div>

          <div
            className={`p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200 rounded-xl border cursor-pointer transition-all hover:scale-105 hover:shadow-lg group relative ${activeStatFilter === 'authorises' && showHistorique ? 'ring-2 ring-green-500 scale-105 shadow-lg' : ''}`}
            onClick={() => handleStatClick('authorises')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center transition-transform group-hover:rotate-12">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-green-700 uppercase tracking-wide">Autorisés</p>
                <p className="text-2xl text-green-900">{authorizedCheckIns.length}</p>
                <p className="text-xs text-green-600">passages</p>
              </div>
            </div>
            {!showHistorique && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronDown className="w-4 h-4 text-green-600" />
              </div>
            )}
          </div>

          <div
            className={`p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200 rounded-xl border cursor-pointer transition-all hover:scale-105 hover:shadow-lg group relative ${activeStatFilter === 'refuses' && showHistorique ? 'ring-2 ring-red-500 scale-105 shadow-lg' : ''}`}
            onClick={() => handleStatClick('refuses')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center transition-transform group-hover:rotate-12">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-red-700 uppercase tracking-wide">Refusés</p>
                <p className="text-2xl text-red-900">{deniedCheckIns.length}</p>
                <p className="text-xs text-red-600">tentatives</p>
              </div>
            </div>
            {!showHistorique && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronDown className="w-4 h-4 text-red-600" />
              </div>
            )}
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 rounded-xl border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-orange-700 uppercase tracking-wide">En attente</p>
                <p className="text-2xl text-orange-900">{mockParticipants.length - uniqueCheckedInParticipants}</p>
                <p className="text-xs text-orange-600">participants</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 rounded-xl border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-purple-700 uppercase tracking-wide">Taux</p>
                <p className="text-2xl text-purple-900">
                  {Math.round((uniqueCheckedInParticipants / mockParticipants.length) * 100)}%
                </p>
                <p className="text-xs text-purple-600">présence</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Historique (affichée conditionnellement) */}
      {showHistorique && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 border-2 border-orange-200">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-gray-900">Historique détaillé des passages</h3>
                    {activeStatFilter !== 'all' && (
                      <Badge className={
                        activeStatFilter === 'presents' ? 'bg-blue-600 text-white' :
                        activeStatFilter === 'authorises' ? 'bg-green-600 text-white' :
                        'bg-red-600 text-white'
                      }>
                        {activeStatFilter === 'presents' ? '👥 Présents uniquement' :
                         activeStatFilter === 'authorises' ? '✓ Autorisés uniquement' :
                         '✗ Refusés uniquement'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="gap-2"
                    >
                      <Filter className="w-4 h-4" />
                      Filtres avancés
                      {(filterStatut !== 'all' || filterType !== 'all' || filterOrganisation !== 'all') && (
                        <Badge className="bg-orange-600 text-white ml-1">
                          {[filterStatut, filterType, filterOrganisation].filter(f => f !== 'all').length}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowHistorique(false);
                        setActiveStatFilter('all');
                      }}
                      className="gap-2"
                    >
                      <ChevronUp className="w-4 h-4" />
                      Masquer
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 ml-10">
                  Consultez tous les passages effectués lors de l'événement FANAF 2026
                </p>
              </div>



              {/* Info sur le filtre actif */}
              {activeStatFilter !== 'all' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ℹ️ Vous consultez actuellement uniquement les <strong>
                      {activeStatFilter === 'presents' ? 'participants présents' :
                       activeStatFilter === 'authorises' ? 'check-ins autorisés' :
                       'tentatives refusées'}
                    </strong>. 
                    {activeStatFilter === 'presents' && ' Un même participant peut apparaître plusieurs fois s\'il a scanné son badge plusieurs jours.'}
                  </p>
                </div>
              )}

              {/* Panneau de filtres */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <Card className="p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Statut d'accès</label>
                          <select
                            value={filterStatut}
                            onChange={(e) => setFilterStatut(e.target.value)}
                            className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm"
                          >
                            <option value="all">Tous</option>
                            <option value="autorise">Autorisés</option>
                            <option value="refuse">Refusés</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Type de participant</label>
                          <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm"
                          >
                            <option value="all">Tous</option>
                            <option value="membre">Membre</option>
                            <option value="vip">VIP</option>
                            <option value="speaker">Speaker</option>
                            <option value="referent">Référent</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Organisation</label>
                          <select
                            value={filterOrganisation}
                            onChange={(e) => setFilterOrganisation(e.target.value)}
                            className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm"
                          >
                            <option value="all">Toutes</option>
                            {uniqueOrganisations.map((orgId) => {
                              const org = getOrganisationById(orgId as string);
                              return org ? (
                                <option key={orgId} value={orgId}>
                                  {org.nom}
                                </option>
                              ) : null;
                            })}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFilterStatut('all');
                            setFilterType('all');
                            setFilterOrganisation('all');
                          }}
                        >
                          Réinitialiser
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setSelectedDay(value)}>
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="all">
                      Tous
                      <Badge className="ml-2 bg-gray-200 text-gray-700">
                        {getStatsForDay('all').total}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="2026-02-09">
                      9 Fév
                      <Badge className="ml-2 bg-gray-200 text-gray-700">
                        {getStatsForDay('2026-02-09').total}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="2026-02-10">
                      10 Fév
                      <Badge className="ml-2 bg-gray-200 text-gray-700">
                        {getStatsForDay('2026-02-10').total}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="2026-02-11">
                      11 Fév
                      <Badge className="ml-2 bg-gray-200 text-gray-700">
                        {getStatsForDay('2026-02-11').total}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                  
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => exportCheckIns(selectedDay)}
                    className="gap-2 bg-orange-600 hover:bg-orange-700"
                    disabled={readOnly}
                  >
                    <Download className="w-4 h-4" />
                    Exporter
                  </Button>
                </div>

                {/* Statistiques par jour avec cartes visuelles */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-blue-700 uppercase tracking-wide mb-1">
                          {selectedDay === 'all' ? 'Total présents' : 'Présents ce jour'}
                        </p>
                        <p className="text-3xl text-blue-900">{getStatsForDay(selectedDay).uniquePresents}</p>
                      </div>
                      <Users className="w-10 h-10 text-blue-400" />
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-700 uppercase tracking-wide mb-1">
                          {selectedDay === 'all' ? 'Total autorisés' : 'Passages autorisés'}
                        </p>
                        <p className="text-3xl text-green-900">{getStatsForDay(selectedDay).authorized}</p>
                      </div>
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-red-700 uppercase tracking-wide mb-1">
                          {selectedDay === 'all' ? 'Total refusés' : 'Refusés'}
                        </p>
                        <p className="text-3xl text-red-900">{getStatsForDay(selectedDay).denied}</p>
                      </div>
                      <XCircle className="w-10 h-10 text-red-400" />
                    </div>
                  </Card>
                </div>

                {/* Contenu des onglets */}
                {['all', '2026-02-09', '2026-02-10', '2026-02-11'].map((day) => (
                  <TabsContent key={day} value={day} className="mt-0">
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {getStatsForDay(day).total} résultat(s)
                        {getStatsForDay(day).total !== getStatsForDay(day).totalUnfiltered && (
                          <span className="ml-1">sur {getStatsForDay(day).totalUnfiltered}</span>
                        )}
                      </span>
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1 text-blue-600">
                          <Users className="w-4 h-4" />
                          {getStatsForDay(day).uniquePresents} présents
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          {getStatsForDay(day).authorized} autorisé(s)
                        </span>
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle className="w-4 h-4" />
                          {getStatsForDay(day).denied} refusé(s)
                        </span>
                      </div>
                    </div>
                    <ScrollArea className="h-[450px]">
                      <div className="space-y-3">
                        {getFilteredCheckIns(day).length === 0 ? (
                          <div className="text-center py-12 text-gray-400">
                            <Search className="w-12 h-12 mx-auto mb-2" />
                            <p>Aucun check-in trouvé avec ces filtres</p>
                          </div>
                        ) : (
                          getFilteredCheckIns(day).map((checkIn) => {
                            const participant = mockParticipants.find((p) => p.id === checkIn.participantId);
                            if (!participant) return null;

                            const organisation = getOrganisationById(participant.organisationId);
                            const isAuthorized = checkIn.autorise;

                            return (
                              <motion.div
                                key={checkIn.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`p-4 rounded-lg border-l-4 ${
                                  isAuthorized 
                                    ? 'bg-white border-l-green-500 shadow-sm' 
                                    : 'bg-red-50 border-l-red-500'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      {isAuthorized ? (
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                      ) : (
                                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                      )}
                                      <p className="text-gray-900 truncate">
                                        {participant.prenom} {participant.nom}
                                      </p>
                                      <Badge className={getStatutColor(participant.statut)}>
                                        {participant.statut}
                                      </Badge>
                                    </div>
                                    
                                    <div className="space-y-1 mb-2">
                                      {organisation && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                          <Building2 className="w-3 h-3 flex-shrink-0" />
                                          <span className="truncate">{organisation.nom}</span>
                                        </p>
                                      )}
                                      
                                      <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3 flex-shrink-0" />
                                        <span>{participant.pays}</span>
                                      </p>
                                      
                                      {participant.fonction && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                          <Briefcase className="w-3 h-3 flex-shrink-0" />
                                          <span>{participant.fonction}</span>
                                        </p>
                                      )}
                                      
                                      <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Hash className="w-3 h-3 flex-shrink-0" />
                                        <span>{participant.reference}</span>
                                      </p>
                                    </div>
                                    
                                    {!isAuthorized && checkIn.raisonRefus && (
                                      <div className="flex items-center gap-1 mb-2 p-2 bg-red-100 rounded">
                                        <AlertTriangle className="w-3 h-3 text-red-600 flex-shrink-0" />
                                        <p className="text-xs text-red-700">{checkIn.raisonRefus}</p>
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {checkIn.dateCheckIn}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {checkIn.heureCheckIn}
                                      </span>
                                      {checkIn.nombreScans && checkIn.nombreScans > 1 && (
                                        <Badge className="bg-orange-100 text-orange-700">
                                          Scan #{checkIn.nombreScans}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            </Card>
          </motion.div>
        )}

      {/* Zone de recherche */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-orange-600" />
              <h3 className="text-gray-900">
                {showHistorique ? 'Effectuer un nouveau check-in' : 'Recherche et check-in de participant'}
              </h3>
            </div>
            {!showHistorique && (
              <Badge className="bg-blue-100 text-blue-700">
                Recherche en temps réel
              </Badge>
            )}
          </div>
          
          <div className="space-y-3">
            <Input
              placeholder="Rechercher par nom, prénom, référence ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />

            <ScrollArea className="h-64 border rounded-lg">
                {searchTerm && filteredParticipants.length > 0 ? (
                  <div className="divide-y">
                    {filteredParticipants.map((participant) => {
                      const participantCheckIns = checkIns.filter((ci) => ci.participantId === participant.id);
                      
                      // Calculer les passages par jour
                      const passagesByDay = {
                        '2026-02-09': participantCheckIns.filter(ci => ci.dateCheckIn === '2026-02-09' && ci.autorise).length,
                        '2026-02-10': participantCheckIns.filter(ci => ci.dateCheckIn === '2026-02-10' && ci.autorise).length,
                        '2026-02-11': participantCheckIns.filter(ci => ci.dateCheckIn === '2026-02-11' && ci.autorise).length,
                      };

                      const totalPassages = passagesByDay['2026-02-09'] + passagesByDay['2026-02-10'] + passagesByDay['2026-02-11'];

                      return (
                        <div
                          key={participant.id}
                          className="p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm text-gray-900">
                                  {participant.prenom} {participant.nom}
                                </p>
                                <Badge className={getStatutColor(participant.statut)}>
                                  {participant.statut}
                                </Badge>
                                {totalPassages > 0 && (
                                  <Badge className="bg-blue-100 text-blue-700">
                                    {totalPassages} passage{totalPassages > 1 ? 's' : ''} total
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {/* Passages par jour avec indicateurs visuels */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className={`p-2 rounded text-center ${passagesByDay['2026-02-09'] > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                                <div className={`text-xs ${passagesByDay['2026-02-09'] > 0 ? 'text-green-700' : 'text-gray-500'}`}>
                                  9 Février
                                </div>
                                <div className={`text-lg ${passagesByDay['2026-02-09'] > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                  {passagesByDay['2026-02-09']}
                                </div>
                              </div>
                              <div className={`p-2 rounded text-center ${passagesByDay['2026-02-10'] > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                                <div className={`text-xs ${passagesByDay['2026-02-10'] > 0 ? 'text-green-700' : 'text-gray-500'}`}>
                                  10 Février
                                </div>
                                <div className={`text-lg ${passagesByDay['2026-02-10'] > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                  {passagesByDay['2026-02-10']}
                                </div>
                              </div>
                              <div className={`p-2 rounded text-center ${passagesByDay['2026-02-11'] > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                                <div className={`text-xs ${passagesByDay['2026-02-11'] > 0 ? 'text-green-700' : 'text-gray-500'}`}>
                                  11 Février
                                </div>
                                <div className={`text-lg ${passagesByDay['2026-02-11'] > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                  {passagesByDay['2026-02-11']}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : searchTerm ? (
                  <div className="p-8 text-center text-gray-400">
                    <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun participant trouvé</p>
                    <p className="text-xs mt-1">Essayez avec un autre nom, email ou référence</p>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="max-w-md mx-auto">
                      <Search className="w-12 h-12 mx-auto mb-3 text-orange-400" />
                      <p className="text-gray-700 mb-2">Tapez pour rechercher un participant</p>
                      <p className="text-xs text-gray-500">
                        Recherche par nom, prénom, email ou numéro de référence
                      </p>
                      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-xs text-orange-700">
                          💡 <strong>Astuce :</strong> Vous pouvez aussi scanner le QR code du badge avec un lecteur externe
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </ScrollArea>
          </div>
        </div>
      </Card>
    </div>
  );
}

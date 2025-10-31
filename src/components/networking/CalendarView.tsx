"use client";

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, Filter, Users, Briefcase, X, Eye, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { getOrganisationById, getParticipantById, getReferentSponsor, updateRendezVous } from '../data/helpers';

// Types pour RendezVous (temporaires jusqu'à ce qu'ils soient définis dans types.ts)
export type StatutRendezVous = 'acceptée' | 'en-attente' | 'occupée' | 'annulée';

export interface RendezVous {
  id: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  demandeurId: string;
  recepteurId: string;
  type: 'participant' | 'sponsor';
  statut: StatutRendezVous;
  sujet?: string;
  notes?: string;
}

interface CalendarViewProps {
  rendezVous: RendezVous[];
  readOnly?: boolean;
  activeFilter?: 'participant' | 'sponsor' | 'all' | 'liste' | 'historique';
}

export function CalendarView({ rendezVous, readOnly = false, activeFilter }: CalendarViewProps) {
  // Dates de l'événement FANAF 2026 (9-11 février 2026)
  const eventStartDate = new Date(2026, 1, 9); // 9 février 2026
  const eventEndDate = new Date(2026, 1, 11); // 11 février 2026
  
  const [currentDate, setCurrentDate] = useState(eventStartDate);
  const [view, setView] = useState<'week' | 'day'>('week');
  const [showFilters, setShowFilters] = useState(false);
  
  // États de filtres
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterHeureDebut, setFilterHeureDebut] = useState<string>('');
  const [filterHeureFin, setFilterHeureFin] = useState<string>('');
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [filterStatuts, setFilterStatuts] = useState<string[]>([]);
  
  // Fonction pour filtrer les rendez-vous
  const filteredRendezVous = useMemo(() => {
    let filtered = [...rendezVous];
    
    // Filtre par date
    if (filterDate) {
      filtered = filtered.filter(rdv => rdv.date === filterDate);
    }
    
    // Filtre par heure de début
    if (filterHeureDebut) {
      filtered = filtered.filter(rdv => rdv.heure >= filterHeureDebut);
    }
    
    // Filtre par heure de fin
    if (filterHeureFin) {
      filtered = filtered.filter(rdv => rdv.heure <= filterHeureFin);
    }
    
    // Filtre par type
    if (filterTypes.length > 0) {
      filtered = filtered.filter(rdv => filterTypes.includes(rdv.type));
    }
    
    // Filtre par statut
    if (filterStatuts.length > 0) {
      filtered = filtered.filter(rdv => filterStatuts.includes(rdv.statut));
    }
    
    return filtered;
  }, [rendezVous, filterDate, filterHeureDebut, filterHeureFin, filterTypes, filterStatuts]);
  
  // Compter les filtres actifs
  const activeFiltersCount = (filterDate ? 1 : 0) + (filterHeureDebut ? 1 : 0) + (filterHeureFin ? 1 : 0) + filterTypes.length + filterStatuts.length;
  
  const resetFilters = () => {
    setFilterDate('');
    setFilterHeureDebut('');
    setFilterHeureFin('');
    setFilterTypes([]);
    setFilterStatuts([]);
  };

  // Générer les 3 jours de l'événement FANAF
  const getEventDays = () => {
    return [
      new Date(2026, 1, 9),  // Dimanche 9 février
      new Date(2026, 1, 10), // Lundi 10 février
      new Date(2026, 1, 11), // Mardi 11 février
    ];
  };

  const weekDays = view === 'week' ? getEventDays() : [currentDate];

  // Heures de la journée (8h - 20h)
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  // Filtrer les rendez-vous par date
  const getRendezVousForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredRendezVous.filter((rdv) => rdv.date === dateStr);
  };

  // Calculer la position du rendez-vous dans le calendrier
  const getRendezVousPosition = (heure: string) => {
    const [h, m] = heure.split(':').map(Number);
    const hourIndex = h - 8;
    const minuteOffset = (m / 60) * 100;
    return hourIndex * 100 + minuteOffset;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    // Dans la vue semaine, on affiche toujours les 3 jours de l'événement
    // Donc on ne fait rien
    return;
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    
    // Limiter la navigation aux 3 jours de l'événement
    if (newDate >= eventStartDate && newDate <= eventEndDate) {
      setCurrentDate(newDate);
    }
  };

  const goToToday = () => {
    setCurrentDate(eventStartDate); // Retourner au premier jour de l'événement
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'acceptée':
        return 'bg-green-500 border-green-600';
      case 'en-attente':
        return 'bg-orange-500 border-orange-600';
      case 'occupée':
        return 'bg-red-500 border-red-600';
      case 'annulée':
        return 'bg-gray-500 border-gray-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const formatDateHeader = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // Dialog de détails avec actions pour les sponsors
  const RendezVousDialog = ({ rdv }: { rdv: RendezVous }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [commentaire, setCommentaire] = useState(rdv.commentaire || '');
    const demandeur = getParticipantById(rdv.demandeurId);
    const demandeurOrganisation = demandeur ? getOrganisationById(demandeur.organisationId) : undefined;
    const recepteur = rdv.type === 'participant' ? getParticipantById(rdv.recepteurId) : undefined;
    const recepteurOrganisation = recepteur ? getOrganisationById(recepteur.organisationId) : undefined;
    const referentSponsor = rdv.type === 'sponsor' ? getReferentSponsor(rdv.recepteurId) : undefined;

    if (!demandeur) return null;
    if (rdv.type === 'participant' && !recepteur) return null;
    if (rdv.type === 'sponsor' && !referentSponsor) return null;

    const handleAction = (newStatut: StatutRendezVous) => {
      updateRendezVous(rdv.id, {
        statut: newStatut,
        commentaire: commentaire || undefined,
      });
      setIsOpen(false);
      
      const messages: Record<string, string> = {
        'acceptée': 'Rendez-vous accepté',
        'occupée': 'Rendez-vous refusé (occupé)',
        'en-attente': 'Rendez-vous mis en attente',
        'annulée': 'Rendez-vous annulé',
      };
      
      toast.success(messages[newStatut] || 'Statut mis à jour');
    };

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.div
            className="absolute left-1 right-1 top-1 bottom-1 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          />
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la demande de rendez-vous</DialogTitle>
            <DialogDescription>
              Informations complètes sur la demande de rendez-vous
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label className="text-gray-700">Type de rendez-vous</Label>
              <p className="mt-1 text-gray-900">
                <Badge className={rdv.type === 'participant' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                  {rdv.type === 'participant' ? 'Participant' : 'Sponsor'}
                </Badge>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700">Demandeur</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-gray-900">{demandeur.prenom} {demandeur.nom}</p>
                  <p className="text-sm text-gray-600 mt-1">{demandeur.email}</p>
                  <p className="text-sm text-gray-600">{demandeur.telephone}</p>
                  {demandeurOrganisation && (
                    <p className="text-sm text-gray-600 mt-1">Organisation: {demandeurOrganisation.nom}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-gray-700 flex items-center gap-2">
                  {rdv.type === 'sponsor' ? (
                    <>
                      <User className="w-4 h-4 text-orange-600" />
                      Référent Sponsor
                    </>
                  ) : (
                    'Récepteur'
                  )}
                </Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                  {rdv.type === 'sponsor' && referentSponsor ? (
                    <>
                      <p className="text-gray-900">{referentSponsor.prenom} {referentSponsor.nom}</p>
                      <p className="text-sm text-orange-600">{referentSponsor.fonction}</p>
                      <p className="text-sm text-gray-600">{referentSponsor.email}</p>
                      <p className="text-sm text-gray-600">{referentSponsor.telephone}</p>
                      <p className="text-sm text-gray-600 mt-1">Organisation: {referentSponsor.organisationNom}</p>
                    </>
                  ) : recepteur ? (
                    <>
                      <p className="text-gray-900">{recepteur.prenom} {recepteur.nom}</p>
                      <p className="text-sm text-gray-600">{recepteur.email}</p>
                      <p className="text-sm text-gray-600">{recepteur.telephone}</p>
                      {recepteurOrganisation && (
                        <p className="text-sm text-gray-600 mt-1">Organisation: {recepteurOrganisation.nom}</p>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700">Date</Label>
                <p className="mt-1 text-gray-900">
                  {new Date(rdv.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <Label className="text-gray-700">Heure</Label>
                <p className="mt-1 text-gray-900">{rdv.heure}</p>
              </div>
            </div>

            <div>
              <Label className="text-gray-700">Statut</Label>
              <div className="mt-1">
                <Badge className={getStatutColor(rdv.statut)}>
                  {rdv.statut}
                </Badge>
              </div>
            </div>

            <div>
              <Label className="text-gray-700">Commentaire</Label>
              {(activeFilter === 'sponsor' || rdv.type === 'sponsor') && !readOnly ? (
                <Textarea
                  placeholder="Ajouter un commentaire (optionnel)..."
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              ) : (
                <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-gray-900">{rdv.commentaire || 'Aucun commentaire'}</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            {!readOnly && (activeFilter === 'sponsor' || rdv.type === 'sponsor') ? (
              <>
                <Button
                  onClick={() => handleAction('occupée')}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <X className="w-4 h-4" />
                  Refuser (Occupé)
                </Button>
                <Button
                  onClick={() => handleAction('acceptée')}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4" />
                  Accepter
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsOpen(false)} variant="outline">
                Fermer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">Filtres</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-orange-600 text-white">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-7 text-xs"
            >
              {showFilters ? <X className="w-3 h-3" /> : <Filter className="w-3 h-3" />}
              {showFilters ? 'Masquer' : 'Afficher'}
            </Button>
            {activeFiltersCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetFilters}
                className="h-7 text-xs"
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </div>
        
        {showFilters && (
          <div className="space-y-3 pt-3 border-t">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs mb-2 block">Date</Label>
                <Input 
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="h-8 text-xs"
                  min="2026-02-09"
                  max="2026-02-11"
                />
              </div>
              <div>
                <Label className="text-xs mb-2 block">Heure début</Label>
                <Input 
                  type="time"
                  value={filterHeureDebut}
                  onChange={(e) => setFilterHeureDebut(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs mb-2 block">Heure fin</Label>
                <Input 
                  type="time"
                  value={filterHeureFin}
                  onChange={(e) => setFilterHeureFin(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs mb-2 block">Type</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="type-participant"
                      checked={filterTypes.includes('participant')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilterTypes([...filterTypes, 'participant']);
                        } else {
                          setFilterTypes(filterTypes.filter(t => t !== 'participant'));
                        }
                      }}
                      className="h-3 w-3"
                    />
                    <label htmlFor="type-participant" className="text-xs cursor-pointer flex items-center gap-1">
                      <Users className="w-3 h-3 text-blue-600" />
                      Participant
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="type-sponsor"
                      checked={filterTypes.includes('sponsor')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilterTypes([...filterTypes, 'sponsor']);
                        } else {
                          setFilterTypes(filterTypes.filter(t => t !== 'sponsor'));
                        }
                      }}
                      className="h-3 w-3"
                    />
                    <label htmlFor="type-sponsor" className="text-xs cursor-pointer flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-orange-600" />
                      Sponsor
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs mb-2 block">Statut</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="statut-acceptee"
                      checked={filterStatuts.includes('acceptée')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilterStatuts([...filterStatuts, 'acceptée']);
                        } else {
                          setFilterStatuts(filterStatuts.filter(s => s !== 'acceptée'));
                        }
                      }}
                      className="h-3 w-3"
                    />
                    <label htmlFor="statut-acceptee" className="text-xs cursor-pointer flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded bg-green-500" />
                      Accepté
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="statut-attente"
                      checked={filterStatuts.includes('en-attente')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilterStatuts([...filterStatuts, 'en-attente']);
                        } else {
                          setFilterStatuts(filterStatuts.filter(s => s !== 'en-attente'));
                        }
                      }}
                      className="h-3 w-3"
                    />
                    <label htmlFor="statut-attente" className="text-xs cursor-pointer flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded bg-orange-500" />
                      En attente
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="statut-refuse"
                      checked={filterStatuts.includes('occupée')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilterStatuts([...filterStatuts, 'occupée']);
                        } else {
                          setFilterStatuts(filterStatuts.filter(s => s !== 'occupée'));
                        }
                      }}
                      className="h-3 w-3"
                    />
                    <label htmlFor="statut-refuse" className="text-xs cursor-pointer flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded bg-red-500" />
                      Refusé
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="statut-annulee"
                      checked={filterStatuts.includes('annulée')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilterStatuts([...filterStatuts, 'annulée']);
                        } else {
                          setFilterStatuts(filterStatuts.filter(s => s !== 'annulée'));
                        }
                      }}
                      className="h-3 w-3"
                    />
                    <label htmlFor="statut-annulee" className="text-xs cursor-pointer flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded bg-gray-500" />
                      Annulé
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => (view === 'week' ? navigateWeek('prev') : navigateDay('prev'))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={goToToday}>
            {view === 'week' ? '9-11 février' : currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => (view === 'week' ? navigateWeek('next') : navigateDay('next'))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <h2 className="text-xl text-gray-900">
            FANAF 2026 
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            onClick={() => setView('week')}
            className={view === 'week' ? 'bg-orange-600 hover:bg-orange-700' : ''}
          >
            3 jours
          </Button>
          <Button
            variant={view === 'day' ? 'default' : 'outline'}
            onClick={() => setView('day')}
            className={view === 'day' ? 'bg-orange-600 hover:bg-orange-700' : ''}
          >
            Jour
          </Button>
        </div>
      </div>

      {/* Légende */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg flex-wrap">
          <span className="text-sm text-gray-600">Statuts:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-xs text-gray-700">Accepté</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span className="text-xs text-gray-700">En attente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-xs text-gray-700">Refusé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-500" />
            <span className="text-xs text-gray-700">Annulé</span>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Types:</span>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-700">RDV Participant</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-orange-600" />
            <span className="text-xs text-gray-700">RDV Sponsor</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header - Days */}
            <div className="grid border-b bg-gray-50 sticky top-0 z-10" style={{ gridTemplateColumns: `80px repeat(${weekDays.length}, 1fr)` }}>
              <div className="p-3 border-r">
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              {weekDays.map((day, idx) => {
                const isFirstDay = day.toDateString() === eventStartDate.toDateString();
                return (
                  <div
                    key={idx}
                    className={`p-3 text-center border-r ${isFirstDay ? 'bg-orange-50' : ''}`}
                  >
                    <p className={`text-sm ${isFirstDay ? 'text-orange-600' : 'text-gray-900'}`}>
                      {formatDateHeader(day)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Time Slots */}
            <div className="relative">
              {hours.map((hour, hourIdx) => (
                <div
                  key={hour}
                  className="grid border-b"
                  style={{ gridTemplateColumns: `80px repeat(${weekDays.length}, 1fr)`, height: '120px' }}
                >
                  {/* Hour Label */}
                  <div className="p-3 border-r bg-gray-50 flex items-start justify-end">
                    <span className="text-sm text-gray-600">{hour}:00</span>
                  </div>

                  {/* Day Columns */}
                  {weekDays.map((day, dayIdx) => {
                    const dayRendezVous = getRendezVousForDate(day);
                    const hourRendezVous = dayRendezVous.filter((rdv) => {
                      const rdvHour = parseInt(rdv.heure.split(':')[0]);
                      return rdvHour === hour;
                    });

                    return (
                      <div key={dayIdx} className="border-r relative bg-white hover:bg-gray-50">
                        {hourRendezVous.map((rdv) => {
                          const demandeur = getParticipantById(rdv.demandeurId);
                          const recepteur =
                            rdv.type === 'sponsor'
                              ? getReferentSponsor(rdv.recepteurId)
                              : getParticipantById(rdv.recepteurId);

                          if (!demandeur || !recepteur) return null;

                          const demandeurOrg = getOrganisationById(demandeur.organisationId);
                          const recepteurOrg = rdv.type === 'participant' && 'organisationId' in recepteur 
                            ? getOrganisationById(recepteur.organisationId) 
                            : null;
                          
                          return (
                            <motion.div
                              key={rdv.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`absolute left-1 right-1 top-1 p-1.5 rounded border-l-4 ${getStatutColor(
                                rdv.statut
                              )} bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer z-10 relative ${
                                rdv.type === 'sponsor' ? 'border-t-2 border-t-orange-400' : 'border-t-2 border-t-blue-400'
                              } ${rdv.statut === 'annulée' ? 'opacity-60' : ''}`}
                              style={{ height: '110px' }}
                            >
                              <RendezVousDialog rdv={rdv} />
                              <div className="flex items-center justify-between mb-0.5">
                                {rdv.type === 'sponsor' ? (
                                  <Badge className="bg-orange-100 text-orange-700 text-xs h-4 px-1">
                                    <Briefcase className="w-2.5 h-2.5 mr-0.5" />
                                    Sponsor
                                  </Badge>
                                ) : (
                                  <Badge className="bg-blue-100 text-blue-700 text-xs h-4 px-1">
                                    <Users className="w-2.5 h-2.5 mr-0.5" />
                                    Participant
                                  </Badge>
                                )}
                                <div className="flex items-center gap-0.5">
                                  {!readOnly && (activeFilter === 'sponsor' || rdv.type === 'sponsor') && (
                                    <div className="flex items-center gap-0.5 mr-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-4 w-4 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateRendezVous(rdv.id, { statut: 'acceptée' });
                                          toast.success('Rendez-vous accepté');
                                        }}
                                        title="Accepter"
                                      >
                                        <Check className="w-2.5 h-2.5" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-4 w-4 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateRendezVous(rdv.id, { statut: 'occupée' });
                                          toast.success('Rendez-vous refusé');
                                        }}
                                        title="Refuser"
                                      >
                                        <X className="w-2.5 h-2.5" />
                                      </Button>
                                    </div>
                                  )}
                                  <Clock className="w-2.5 h-2.5 text-gray-500" />
                                  <span className="text-xs text-gray-900">{rdv.heure}</span>
                                </div>
                              </div>
                              
                              {/* Affichage compact avec les deux personnes */}
                              <div className="text-xs space-y-0.5 overflow-hidden">
                                {/* Demandeur */}
                                <div className="bg-blue-50 px-1 py-0.5 rounded">
                                  <div className="flex items-center gap-0.5">
                                    <User className="w-2.5 h-2.5 text-blue-600 flex-shrink-0" />
                                    <span className="text-blue-900 truncate font-medium text-xs">
                                      {demandeur.prenom} {demandeur.nom}
                                    </span>
                                  </div>
                                  <div className="text-xs text-blue-700 truncate pl-3">
                                    {demandeur.fonction || 'N/A'} • {demandeurOrg?.nom || 'N/A'}
                                  </div>
                                </div>
                                
                                {/* Séparateur avec flèche */}
                                <div className="text-center text-gray-400 text-xs">↓</div>
                                
                                {/* Récepteur */}
                                {rdv.type === 'sponsor' && 'organisationNom' in recepteur ? (
                                  <div className="bg-orange-50 px-1 py-0.5 rounded">
                                    <div className="flex items-center gap-0.5">
                                      <Briefcase className="w-2.5 h-2.5 text-orange-600 flex-shrink-0" />
                                      <span className="text-orange-900 truncate font-medium text-xs">
                                        {recepteur.prenom} {recepteur.nom}
                                      </span>
                                    </div>
                                    <div className="text-xs text-orange-700 truncate pl-3">
                                      Sponsor • {recepteur.organisationNom}
                                    </div>
                                  </div>
                                ) : 'prenom' in recepteur && (
                                  <div className="bg-gray-50 px-1 py-0.5 rounded">
                                    <div className="flex items-center gap-0.5">
                                      <User className="w-2.5 h-2.5 text-gray-600 flex-shrink-0" />
                                      <span className="text-gray-900 truncate font-medium text-xs">
                                        {recepteur.prenom} {recepteur.nom}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-700 truncate pl-3">
                                      {recepteur.fonction || 'N/A'} • {recepteurOrg?.nom || 'N/A'}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>


    </div>
  );
}

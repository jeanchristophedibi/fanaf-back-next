import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Search, Filter, Eye, Download, Building2, UserPlus, User, QrCode, Package, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { getParticipantsByOrganisation, getParticipantById } from './data/types';
import { getOrganisationById, getParticipantById, getReferentSponsor, getParticipantsByOrganisation } from './data/helpers';

import { useDynamicInscriptions } from './hooks/useDynamicInscriptions';
import type { OrganisationSubSection } from '../app/dashboard/agence/types';
import { getOrganisationById, getParticipantById, getReferentSponsor, getParticipantsByOrganisation } from './data/helpers';

import { BadgeReferentGenerator } from './BadgeReferentGenerator';
import { AnimatedStat } from './AnimatedStat';
import { HistoriqueRendezVousDialog } from './HistoriqueRendezVousDialog';
import { toast } from 'sonner';
import JSZip from 'jszip';

const statutOrgColors = {
  'membre': 'bg-teal-100 text-teal-800',
  'non-membre': 'bg-gray-100 text-gray-800',
  'sponsor': 'bg-amber-100 text-amber-800',
};

const statutOrgLabels = {
  'membre': 'Association membre',
  'non-membre': 'Entreprise',
  'sponsor': 'Sponsor',
};

interface OrganisationsPageProps {
  subSection?: OrganisationSubSection;
  filter?: 'all' | 'membre' | 'non-membre' | 'sponsor';
  readOnly?: boolean;
}

export function OrganisationsPage({ subSection, filter, readOnly = false }: OrganisationsPageProps) {
  const { organisations, rendezVous } = useDynamicInscriptions({ includeOrganisations: true, includeRendezVous: true });
  const activeFilter = filter || subSection;
  const [searchTerm, setSearchTerm] = useState('');
  const [paysFilter, setPaysFilter] = useState<string>('tous');
  const [isCreateSponsorOpen, setIsCreateSponsorOpen] = useState(false);
  const [isDownloadingAllBadges, setIsDownloadingAllBadges] = useState(false);
  const [historiqueParticipantId, setHistoriqueParticipantId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // État du formulaire de création de sponsor
  const [formData, setFormData] = useState({
    nomOrganisation: '',
    contactOrganisation: '',
    emailOrganisation: '',
    paysOrganisation: '',
    nomReferent: '',
    prenomReferent: '',
    emailReferent: '',
    telephoneReferent: '',
    fonctionReferent: '',
  });

  const filteredOrganisations = useMemo(() => {
    let filtered = [...organisations];

    // Filtre par sous-section (statut)
    if (activeFilter && activeFilter !== 'all' && activeFilter !== 'liste') {
      filtered = filtered.filter(o => o.statut === activeFilter);
    }

    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(o =>
        o.nom.toLowerCase().includes(searchLower) ||
        o.email.toLowerCase().includes(searchLower) ||
        o.pays.toLowerCase().includes(searchLower) ||
        o.contact.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par pays
    if (paysFilter !== 'tous') {
      filtered = filtered.filter(o => o.pays === paysFilter);
    }

    return filtered;
  }, [organisations, searchTerm, paysFilter, activeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOrganisations.length / itemsPerPage);
  const paginatedOrganisations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrganisations.slice(startIndex, endIndex);
  }, [filteredOrganisations, currentPage]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, paysFilter, activeFilter]);

  const getTitle = () => {
    const section = subSection || filter;
    switch (section) {
      case 'liste':
      case 'all':
        return 'Liste des organisations';
      case 'membre':
        return 'Associations membre';
      case 'non-membre':
        return 'Entreprise';
      case 'sponsor':
        return 'Sponsors';
    }
  };

  const getTotalOrganisations = () => {
    const section = subSection || filter;
    if (section === 'liste' || section === 'all') {
      return organisations.length;
    }
    return organisations.filter(o => o.statut === section).length;
  };

  // Récupérer la liste unique des pays
  const paysList = useMemo(() => {
    const pays = new Set(organisations.map(o => o.pays));
    return Array.from(pays).sort();
  }, [organisations]);

  // Statistiques pour la vue "liste"
  const stats = useMemo(() => {
    const membre = organisations.filter(o => o.statut === 'membre').length;
    const nonMembre = organisations.filter(o => o.statut === 'non-membre').length;
    const sponsor = organisations.filter(o => o.statut === 'sponsor').length;
    
    return { membre, nonMembre, sponsor, total: organisations.length };
  }, [organisations]);

  const handleCreateSponsor = () => {
    console.log('Création du sponsor:', formData);
    // Ici vous ajouteriez la logique pour créer le sponsor dans la base de données
    setIsCreateSponsorOpen(false);
    // Réinitialiser le formulaire
    setFormData({
      nomOrganisation: '',
      contactOrganisation: '',
      emailOrganisation: '',
      paysOrganisation: '',
      nomReferent: '',
      prenomReferent: '',
      emailReferent: '',
      telephoneReferent: '',
      fonctionReferent: '',
    });
  };

  const isFormValid = () => {
    return (
      formData.nomOrganisation &&
      formData.contactOrganisation &&
      formData.emailOrganisation &&
      formData.paysOrganisation &&
      formData.nomReferent &&
      formData.prenomReferent &&
      formData.emailReferent &&
      formData.telephoneReferent &&
      formData.fonctionReferent
    );
  };

  // Composant pour afficher la section référent avec badge
  const ReferentSection = ({ 
    referent, 
    organisationNom, 
    organisationId 
  }: { 
    referent: typeof organisations[0]['referent'], 
    organisationNom: string,
    organisationId: string
  }) => {
    const [isBadgeOpen, setIsBadgeOpen] = useState(false);

    if (!referent) return null;

    // Trouver le participant correspondant au référent pour avoir son ID
    const referentParticipant = getParticipantsByOrganisation(organisationId).find(
      p => p.statut === 'referent'
    );

    return (
      <>
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-orange-600" />
              <h3 className="text-gray-900">Référent (contact pour les rendez-vous)</h3>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsBadgeOpen(true)}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Badge référent
              </Button>
              {referentParticipant && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setHistoriqueParticipantId(referentParticipant.id)}
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                >
                  <History className="w-4 h-4 mr-2" />
                  Historique RDV
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 bg-orange-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Nom complet</p>
              <p className="text-gray-900">{referent.prenom} {referent.nom}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fonction</p>
              <p className="text-gray-900">{referent.fonction}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{referent.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Téléphone</p>
              <p className="text-gray-900">{referent.telephone}</p>
            </div>
          </div>
        </div>
        <BadgeReferentGenerator
          referent={referent}
          organisationNom={organisationNom}
          organisationId={organisationId}
          isOpen={isBadgeOpen}
          onClose={() => setIsBadgeOpen(false)}
        />
      </>
    );
  };

  const exportToCSV = () => {
    const headers = ['Nom', 'Email', 'Contact', 'Pays', 'Statut', 'Nombre de Participants'];
    const csvContent = [
      headers.join(','),
      ...filteredOrganisations.map(org => {
        const participants = getParticipantsByOrganisation(org.id);
        return [
          org.nom,
          org.email,
          org.contact,
          org.pays,
          org.statut,
          participants.length
        ].join(',');
      })
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `organisations-${subSection}-fanaf.csv`;
    a.click();
  };

  const downloadAllReferentBadges = async () => {
    // Filtrer les sponsors qui ont un référent
    const sponsorsWithReferent = organisations.filter(
      org => org.statut === 'sponsor' && org.referent
    );

    if (sponsorsWithReferent.length === 0) {
      toast.error('Aucun référent trouvé');
      return;
    }

    setIsDownloadingAllBadges(true);
    toast.info(`Génération de ${sponsorsWithReferent.length} badge(s) en cours...`);

    try {
      const zip = new JSZip();
      const badgesFolder = zip.folder('badges-referents');

      for (const org of sponsorsWithReferent) {
        if (!org.referent || !badgesFolder) continue;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        const width = 800;
        const height = 1100;
        canvas.width = width;
        canvas.height = height;

        // Fond blanc
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Header avec gradient vert
        const gradient = ctx.createLinearGradient(0, 0, width, 150);
        gradient.addColorStop(0, '#22c55e');
        gradient.addColorStop(1, '#15803d');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, 150);

        // Logo FANAF
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('FANAF 2026', width / 2, 60);
        
        ctx.font = '18px Arial';
        ctx.fillText('26-29 Octobre 2025 • Abidjan', width / 2, 100);

        // Badge statut
        ctx.fillStyle = '#22c55e';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        const badgeY = 150;
        const badgeHeight = 50;
        ctx.beginPath();
        ctx.roundRect(width / 2 - 200, badgeY - 25, 400, badgeHeight, 25);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('RÉFÉRENT SPONSOR', width / 2, badgeY + 8);

        // Photo placeholder
        const photoY = 230;
        ctx.fillStyle = '#e5e7eb';
        ctx.beginPath();
        ctx.arc(width / 2, photoY, 100, 0, Math.PI * 2);
        ctx.fill();

        // Icône utilisateur
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(width / 2, photoY - 20, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(width / 2, photoY + 40, 50, 0, Math.PI, true);
        ctx.stroke();

        // Nom et prénom
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${org.referent.prenom} ${org.referent.nom}`, width / 2, 400);

        // Fonction
        ctx.fillStyle = '#ea580c';
        ctx.font = '22px Arial';
        ctx.fillText(org.referent.fonction, width / 2, 440);

        // Organisation
        ctx.fillStyle = '#4b5563';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(org.nom, width / 2, 490);

        // Zone QR Code (placeholder)
        const qrSize = 250;
        const qrX = (width - qrSize) / 2;
        const qrY = 540;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 4;
        ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR CODE', width / 2, qrY + qrSize / 2);

        // Email et téléphone
        ctx.fillStyle = '#6b7280';
        ctx.font = '18px Arial';
        ctx.fillText(org.referent.email, width / 2, 850);
        ctx.fillText(org.referent.telephone, width / 2, 880);

        // Footer
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, height - 80, width, 80);

        ctx.fillStyle = '#6b7280';
        ctx.font = '16px Arial';
        ctx.fillText('Veuillez présenter ce badge à l\'entrée', width / 2, height - 35);

        // Ajouter au ZIP
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, 'image/png');
        });

        badgesFolder.file(
          `badge-${org.referent.nom}-${org.referent.prenom}.png`,
          blob
        );
      }

      // Générer et télécharger le ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `badges-referents-fanaf-${new Date().toISOString().split('T')[0]}.zip`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`${sponsorsWithReferent.length} badge(s) téléchargé(s) avec succès !`);
    } catch (error) {
      console.error('Erreur lors de la génération des badges:', error);
      toast.error('Erreur lors de la génération des badges');
    } finally {
      setIsDownloadingAllBadges(false);
    }
  };

  return (
    <div className="p-8 animate-page-enter">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">{getTitle()}</h1>
          <p className="text-gray-600">
            {filteredOrganisations.length} organisation(s) sur {getTotalOrganisations()}
          </p>
        </div>
        
        {/* Boutons pour la sous-section sponsor */}
        {(subSection === 'sponsor' || filter === 'sponsor') && (
          <div className="flex items-center gap-3">
            <Button
              onClick={downloadAllReferentBadges}
              disabled={isDownloadingAllBadges || readOnly}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              {isDownloadingAllBadges ? (
                <>
                  <Package className="w-4 h-4 mr-2 animate-pulse" />
                  Génération...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Tous les badges référents
                </>
              )}
            </Button>
            
            {!readOnly && (
              <Dialog open={isCreateSponsorOpen} onOpenChange={setIsCreateSponsorOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer un sponsor
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouveau sponsor</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau sponsor et son référent qui recevra les demandes de rendez-vous
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Informations de l'organisation */}
                <div>
                  <h3 className="text-gray-900 mb-4">Informations de l'organisation</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomOrganisation">Nom de l'organisation *</Label>
                      <Input
                        id="nomOrganisation"
                        placeholder="Ex: Tech Insurance Corp"
                        value={formData.nomOrganisation}
                        onChange={(e) => setFormData({ ...formData, nomOrganisation: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="paysOrganisation">Pays *</Label>
                      <Input
                        id="paysOrganisation"
                        placeholder="Ex: Côte d'Ivoire"
                        value={formData.paysOrganisation}
                        onChange={(e) => setFormData({ ...formData, paysOrganisation: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emailOrganisation">Email *</Label>
                      <Input
                        id="emailOrganisation"
                        type="email"
                        placeholder="contact@organisation.com"
                        value={formData.emailOrganisation}
                        onChange={(e) => setFormData({ ...formData, emailOrganisation: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactOrganisation">Contact *</Label>
                      <Input
                        id="contactOrganisation"
                        placeholder="+225 XX XX XX XX XX"
                        value={formData.contactOrganisation}
                        onChange={(e) => setFormData({ ...formData, contactOrganisation: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Informations du référent */}
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-orange-600" />
                    <h3 className="text-gray-900">Référent (contact pour les rendez-vous sponsor)</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prenomReferent">Prénom du référent *</Label>
                      <Input
                        id="prenomReferent"
                        placeholder="Ex: Marie"
                        value={formData.prenomReferent}
                        onChange={(e) => setFormData({ ...formData, prenomReferent: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nomReferent">Nom du référent *</Label>
                      <Input
                        id="nomReferent"
                        placeholder="Ex: Dupont"
                        value={formData.nomReferent}
                        onChange={(e) => setFormData({ ...formData, nomReferent: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emailReferent">Email du référent *</Label>
                      <Input
                        id="emailReferent"
                        type="email"
                        placeholder="marie.dupont@organisation.com"
                        value={formData.emailReferent}
                        onChange={(e) => setFormData({ ...formData, emailReferent: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="telephoneReferent">Téléphone du référent *</Label>
                      <Input
                        id="telephoneReferent"
                        placeholder="+225 XX XX XX XX XX"
                        value={formData.telephoneReferent}
                        onChange={(e) => setFormData({ ...formData, telephoneReferent: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fonctionReferent">Fonction du référent *</Label>
                      <Input
                        id="fonctionReferent"
                        placeholder="Ex: Directeur Commercial"
                        value={formData.fonctionReferent}
                        onChange={(e) => setFormData({ ...formData, fonctionReferent: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button variant="outline" onClick={() => setIsCreateSponsorOpen(false)}>
                    Annuler
                  </Button>
                  <Button 
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={handleCreateSponsor}
                    disabled={!isFormValid()}
                  >
                    Créer le sponsor
                  </Button>
                </div>
              </div>
            </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </div>

      {/* Tableau de bord pour la vue liste */}
      {(subSection === 'liste' || filter === 'all') && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 mb-1">Total organisations</p>
                  <p className="text-3xl text-purple-900">{stats.total}</p>
                </div>
                <Building2 className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-teal-700 mb-1">Associations membre</p>
                  <p className="text-3xl text-teal-900">{stats.membre}</p>
                </div>
                <Building2 className="w-10 h-10 text-teal-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 mb-1">Entreprise</p>
                  <p className="text-3xl text-gray-900">{stats.nonMembre}</p>
                </div>
                <Building2 className="w-10 h-10 text-gray-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700 mb-1">Sponsors</p>
                  <p className="text-3xl text-amber-900">{stats.sponsor}</p>
                </div>
                <Building2 className="w-10 h-10 text-amber-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email, pays ou contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={paysFilter} onValueChange={setPaysFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les pays</SelectItem>
                {paysList.map(pays => (
                  <SelectItem key={pays} value={pays}>{pays}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredOrganisations.length} organisation(s) trouvée(s)
            </p>
            <Button 
              onClick={exportToCSV} 
              variant="outline" 
              size="sm" 
              disabled={filteredOrganisations.length === 0 || readOnly}
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom de l'organisation</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Pays</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Statut</TableHead>
                  {(subSection === 'sponsor' || filter === 'sponsor') && <TableHead>Référent</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganisations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={(subSection === 'sponsor' || filter === 'sponsor') ? 8 : 7} className="text-center text-gray-500 py-8">
                      Aucune organisation trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrganisations.map((organisation) => {
                    const participants = getParticipantsByOrganisation(organisation.id);
                    
                    return (
                      <TableRow key={organisation.id}>
                        <TableCell className="text-gray-900">{organisation.nom}</TableCell>
                        <TableCell className="text-gray-600">{organisation.contact}</TableCell>
                        <TableCell className="text-gray-600">{organisation.email}</TableCell>
                        <TableCell>{organisation.pays}</TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(organisation.dateCreation).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Badge className={statutOrgColors[organisation.statut]}>
                            {statutOrgLabels[organisation.statut]}
                          </Badge>
                        </TableCell>
                        {(subSection === 'sponsor' || filter === 'sponsor') && (
                          <TableCell>
                            {organisation.referent ? (
                              <div className="text-sm">
                                <p className="text-gray-900">{organisation.referent.prenom} {organisation.referent.nom}</p>
                                <p className="text-xs text-orange-600">{organisation.referent.fonction}</p>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Aucun référent</span>
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{organisation.nom}</DialogTitle>
                                <DialogDescription>
                                  Informations détaillées sur l'organisation et ses participants
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Contact</p>
                                    <p className="text-gray-900">{organisation.contact}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-gray-900">{organisation.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Pays</p>
                                    <p className="text-gray-900">{organisation.pays}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Statut</p>
                                    <Badge className={`${statutOrgColors[organisation.statut]} mt-1`}>
                                      {statutOrgLabels[organisation.statut]}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Informations du référent pour les sponsors */}
                                {organisation.statut === 'sponsor' && organisation.referent && (
                                  <ReferentSection 
                                    referent={organisation.referent}
                                    organisationNom={organisation.nom}
                                    organisationId={organisation.id}
                                  />
                                )}

                                <div className="border-t pt-4">
                                  <h3 className="text-gray-900 mb-4">
                                    Participants de cette organisation ({participants.length})
                                  </h3>
                                  {participants.length === 0 ? (
                                    <p className="text-sm text-gray-500">Aucun participant inscrit</p>
                                  ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                      {participants.map(participant => (
                                        <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                          <div>
                                            <p className="text-sm text-gray-900">
                                              {participant.prenom} {participant.nom}
                                            </p>
                                            <p className="text-xs text-gray-500">{participant.email}</p>
                                          </div>
                                          <Badge className="text-xs">
                                            {participant.statut}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
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

      {/* Pagination */}
      {filteredOrganisations.length > 0 && totalPages > 1 && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages} ({filteredOrganisations.length} résultat{filteredOrganisations.length > 1 ? 's' : ''})
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? "bg-orange-600 hover:bg-orange-700" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
    </div>
  );
}

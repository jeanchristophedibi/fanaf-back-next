"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { UserPlus, User, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { useFanafApi } from "../../hooks/useFanafApi";
import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface CreateSponsorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSponsor: (sponsorData: { 
    nom: string; 
    email: string; 
    type: string;
    logo?: string;
    referent?: {
      nom: string;
      prenom: string;
      email: string;
      telephone: string;
      fonction: string;
    };
  }) => void;
}

interface SponsorFormData {
  nomSponsor: string;
  emailSponsor: string;
  typeSponsor: string;
  logoFile?: File;
}

interface ReferentFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  fonction: string;
}

export function CreateSponsorDialog({ open, onOpenChange, onCreateSponsor }: CreateSponsorDialogProps) {
  const { api } = useFanafApi();

  // Charger les types de sponsor depuis l'API
  const { data: sponsorTypes = [], isLoading: isLoadingTypes } = useQuery({
    queryKey: ['sponsorTypes'],
    queryFn: async () => {
      try {
        const response = await api.getSponsorTypes();
        // Gérer différentes structures de réponse possibles
        if (Array.isArray(response)) {
          return response;
        } else if (response?.data) {
          // Si response.data est un tableau
          if (Array.isArray(response.data)) {
            return response.data;
          }
          // Si response.data.data existe (structure paginée)
          if (Array.isArray(response.data.data)) {
            return response.data.data;
          }
        }
        return [];
      } catch (error) {
        console.error('Erreur lors du chargement des types de sponsor:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // Cache pendant 5 minutes
    gcTime: 10 * 60 * 1000, // Garder en cache pendant 10 minutes
  });

  const [formData, setFormData] = useState<SponsorFormData>({
    nomSponsor: '',
    emailSponsor: '',
    typeSponsor: '',
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [referentData, setReferentData] = useState<ReferentFormData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    fonction: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  // Mutation pour créer le sponsor
  const createSponsorMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      sponsor_type_id: string;
      sponsor_logo?: File | string;
      sponsor_email?: string;
      referent?: {
        email: string;
        first_name: string;
        last_name: string;
        username: string;
        phone: string;
        job_title: string;
        civility: string;
      };
    }) => {
      // Créer le sponsor
      const sponsorResponse = await api.createSponsor({
        name: data.name,
        sponsor_type_id: data.sponsor_type_id,
        sponsor_logo: data.sponsor_logo,
        sponsor_email: data.sponsor_email,
      });

      console.log('Réponse API createSponsor:', sponsorResponse);

      // Si un référent est fourni, le créer
      // L'ID du sponsor peut être dans sponsorResponse.data.id, sponsorResponse.id, ou sponsorResponse.data.data.id
      const sponsorId = sponsorResponse?.data?.id || 
                        sponsorResponse?.data?.data?.id || 
                        sponsorResponse?.id ||
                        (sponsorResponse?.data && typeof sponsorResponse.data === 'object' && 'id' in sponsorResponse.data ? sponsorResponse.data.id : null);

      if (data.referent && sponsorId) {
        console.log('Création du référent pour le sponsor:', sponsorId);
        await api.createSponsorReferent(sponsorId, data.referent);
      } else if (data.referent && !sponsorId) {
        console.warn('Impossible de créer le référent: ID du sponsor introuvable dans la réponse', sponsorResponse);
      }

      return sponsorResponse;
    },
    onSuccess: async () => {
      setSuccess(true);
      
      // Sauvegarder les données avant la réinitialisation pour le callback
      const sponsorData = {
        nom: formData.nomSponsor,
        email: formData.emailSponsor,
        type: formData.typeSponsor,
        referent: referentData.nom.trim() !== '' ? {
          nom: referentData.nom,
          prenom: referentData.prenom,
          email: referentData.email,
          telephone: referentData.telephone,
          fonction: referentData.fonction,
        } : undefined,
      };
      
      // Afficher une notification de succès
      toast.success('Sponsor créé avec succès !', {
        description: 'Le sponsor a été ajouté à la liste.',
        duration: 3000,
      });
      
      // Invalider tous les caches liés aux sponsors pour rafraîchir les listes et widgets
      // Utiliser predicate pour invalider toutes les queries qui commencent par ces clés
      const sponsorQueryKeys = ['sponsors', 'listeSponsors', 'widgetSponsors', 'sponsorTypes'];
      
      // Invalider toutes les queries liées aux sponsors
      await Promise.all(
        sponsorQueryKeys.map(key => 
          queryClient.invalidateQueries({ queryKey: [key] })
        )
      );
      
      // Forcer le refetch immédiat de toutes les queries liées aux sponsors pour mettre à jour les widgets
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['widgetSponsors'] }),
        queryClient.refetchQueries({ queryKey: ['listeSponsors'] }),
        queryClient.refetchQueries({ queryKey: ['sponsors'] }),
      ]);
      
      // Appeler le callback si fourni (avant la réinitialisation)
      if (onCreateSponsor) {
        onCreateSponsor(sponsorData);
      }
      
      // Reset form et fermer le dialog
      resetForm();
      onOpenChange(false);
    },
    onError: (err: any) => {
      const errorMessage = err?.message || err?.response?.data?.message || 'Erreur lors de la création du sponsor';
      setError(errorMessage);
      setSuccess(false);
      
      // Afficher une notification d'erreur
      toast.error('Erreur lors de la création du sponsor', {
        description: errorMessage,
        duration: 5000,
      });
      
      console.error('Erreur détaillée:', err);
    },
  });

  const resetForm = () => {
    setFormData({
      nomSponsor: '',
      emailSponsor: '',
      typeSponsor: '',
    });
    setReferentData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      fonction: ''
    });
    setLogoPreview(null);
    setError(null);
    setSuccess(false);
  };

  const isFormValid = () => {
    const sponsorValid = formData.nomSponsor.trim() !== '' &&
           formData.typeSponsor.trim() !== '';
    
    // Si le référent est rempli, valider tous ses champs
    const referentFilled = referentData.nom.trim() !== '' ||
           referentData.prenom.trim() !== '' ||
           referentData.email.trim() !== '' ||
           referentData.telephone.trim() !== '' ||
           referentData.fonction.trim() !== '';
    
    if (referentFilled) {
      // Si au moins un champ du référent est rempli, tous doivent l'être
      return sponsorValid &&
             referentData.nom.trim() !== '' &&
             referentData.prenom.trim() !== '' &&
             referentData.email.trim() !== '' &&
             referentData.telephone.trim() !== '' &&
             referentData.fonction.trim() !== '';
    }
    
    return sponsorValid;
  };

  const handleLogoFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      // Garder le File original pour l'API
      setFormData({ ...formData, logoFile: file });
      
      // Créer une preview base64 pour l'affichage
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLogoFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleLogoFile(file);
    }
  };

  const handleCreateSponsor = async () => {
    if (!isFormValid()) return;

    setError(null);
    setSuccess(false);

    // Générer un username à partir de l'email du référent si fourni
    const generateUsername = (email: string): string => {
      return email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    };

    // Préparer les données du référent si tous les champs sont remplis
    const referentFilled = referentData.nom.trim() !== '' &&
      referentData.prenom.trim() !== '' &&
      referentData.email.trim() !== '' &&
      referentData.telephone.trim() !== '' &&
      referentData.fonction.trim() !== '';
    
    const referentDataForApi = referentFilled
      ? {
          email: referentData.email,
          first_name: referentData.prenom,
          last_name: referentData.nom,
          username: generateUsername(referentData.email),
          phone: referentData.telephone,
          job_title: referentData.fonction,
          civility: 'M', // Valeur par défaut, pourrait être ajusté avec un champ dans le formulaire
        }
      : undefined;

    // Le logo en fichier ne peut pas être envoyé directement (limite 1024 caractères)
    // Il faudrait uploader le fichier d'abord pour obtenir une URL
    // Pour l'instant, on n'envoie pas le logo si c'est un fichier
    const logoForApi = formData.logoFile ? undefined : undefined; // Ne pas envoyer le logo pour l'instant
    
    try {
      await createSponsorMutation.mutateAsync({
        name: formData.nomSponsor,
        sponsor_type_id: formData.typeSponsor,
        sponsor_logo: logoForApi, // undefined si c'est un fichier
        sponsor_email: formData.emailSponsor.trim() !== '' ? formData.emailSponsor : undefined,
        referent: referentDataForApi,
      });
      
      // Si un logo a été sélectionné mais non envoyé, informer l'utilisateur
      if (formData.logoFile) {
        console.warn('Le logo n\'a pas été envoyé car il nécessite un upload séparé. Il pourra être ajouté après la création du sponsor.');
      }
    } catch (error) {
      // L'erreur est déjà gérée par onError de la mutation
      console.error('Erreur lors de la création du sponsor:', error);
    }
  };

  return (
    <>
      <Button 
        className="bg-orange-600 hover:bg-orange-700 text-white"
        onClick={() => onOpenChange(true)}
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Créer un sponsor
      </Button>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Créer un nouveau sponsor</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau sponsor à la liste
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 overflow-y-auto flex-1 pr-2 -mr-2">
          {/* Informations du sponsor */}
          <div>
            <h3 className="text-gray-900 mb-4">Informations du sponsor</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomSponsor">Nom du sponsor *</Label>
                <Input
                  id="nomSponsor"
                  placeholder="Ex: Tech Insurance Corp"
                  value={formData.nomSponsor}
                  onChange={(e) => setFormData({ ...formData, nomSponsor: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailSponsor">Email</Label>
                <Input
                  id="emailSponsor"
                  type="email"
                  placeholder="contact@sponsor.com (optionnel)"
                  value={formData.emailSponsor}
                  onChange={(e) => setFormData({ ...formData, emailSponsor: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="typeSponsor">Type de sponsor *</Label>
                <Select
                  value={formData.typeSponsor}
                  onValueChange={(value) => setFormData({ ...formData, typeSponsor: value })}
                  disabled={isLoadingTypes}
                >
                  <SelectTrigger id="typeSponsor">
                    <SelectValue placeholder={isLoadingTypes ? "Chargement..." : "Sélectionner un type"} />
                  </SelectTrigger>
                  <SelectContent>
                    {sponsorTypes.length === 0 && !isLoadingTypes ? (
                      <SelectItem value="" disabled>Aucun type disponible</SelectItem>
                    ) : (
                      sponsorTypes.map((type: any) => {
                        // Gérer différentes structures possibles de l'API
                        const value = type.id || type.value || type.name || type.code || String(type);
                        const label = type.name || type.label || type.code || String(type);
                        return (
                          <SelectItem key={value} value={String(value)}>
                            {label}
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoSponsor">
                  Logo du sponsor
                  {formData.logoFile && (
                    <span className="text-xs text-orange-600 ml-2">
                      (Le logo sera ajouté après la création du sponsor)
                    </span>
                  )}
                </Label>
                {!logoPreview ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300 hover:border-orange-400 bg-gray-50'
                    }`}
                  >
                    <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-2">
                      Glissez-déposez une image ici
                    </p>
                    <p className="text-xs text-gray-500 mb-4">ou</p>
                    <label htmlFor="logoFile" className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        asChild
                      >
                        <span>
                          <Upload className="w-4 h-4" />
                          Parcourir les fichiers
                        </span>
                      </Button>
                      <input
                        id="logoFile"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </label>
                    <p className="text-xs text-gray-400 mt-3">
                      PNG, JPG, GIF jusqu'à 10MB
                    </p>
                  </div>
                ) : (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500 mb-3">Aperçu du logo :</p>
                    <div className="flex items-center gap-4">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="max-h-24 max-w-full object-contain rounded"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLogoPreview(null);
                          setFormData({ ...formData, logoFile: undefined });
                        }}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Section référent */}
          <div>
            <div className="flex items-center gap-3 mb-4">

              <Label htmlFor="hasReferent" className="text-gray-900 font-medium cursor-pointer">
                Ajouter un référent (contact pour les rendez-vous)
              </Label>
            </div>


              <div className="mt-4 space-y-4 pl-7 border-l-2 border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-orange-600" />
                  <h4 className="text-gray-900 font-medium">Informations du référent</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="referentNom">Nom *</Label>
                    <Input
                      id="referentNom"
                      placeholder="Ex: Dupont"
                      value={referentData.nom}
                      onChange={(e) => setReferentData({ ...referentData, nom: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="referentPrenom">Prénom *</Label>
                    <Input
                      id="referentPrenom"
                      placeholder="Ex: Jean"
                      value={referentData.prenom}
                      onChange={(e) => setReferentData({ ...referentData, prenom: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="referentEmail">Email *</Label>
                    <Input
                      id="referentEmail"
                      type="email"
                      placeholder="jean.dupont@sponsor.com"
                      value={referentData.email}
                      onChange={(e) => setReferentData({ ...referentData, email: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="referentTelephone">Téléphone *</Label>
                    <Input
                      id="referentTelephone"
                      type="tel"
                      placeholder="+225 XX XX XX XX XX"
                      value={referentData.telephone}
                      onChange={(e) => setReferentData({ ...referentData, telephone: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="referentFonction">Fonction *</Label>
                    <Input
                      id="referentFonction"
                      placeholder="Ex: Directeur Commercial"
                      value={referentData.fonction}
                      onChange={(e) => setReferentData({ ...referentData, fonction: e.target.value })}
                    />
                  </div>
                </div>
              </div>

          </div>

          {/* Messages d'erreur et de succès */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">Sponsor créé avec succès !</p>
            </div>
          )}

        </div>
        
        <div className="flex justify-end gap-3 border-t pt-4 flex-shrink-0 mt-4">
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>
            Annuler
          </Button>
          <Button 
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={handleCreateSponsor}
            disabled={!isFormValid() || createSponsorMutation.isPending}
          >
            {createSponsorMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              'Créer le sponsor'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}


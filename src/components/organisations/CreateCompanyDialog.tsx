"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Building2, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useFanafApi } from "../../hooks/useFanafApi";
import { toast } from "sonner";

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface CompanyFormData {
  name: string;
  type: 'company' | 'association';
  country_id: string;
  sector: string;
  email: string;
  website: string;
  phone: string;
  address: string;
  description: string;
}

export function CreateCompanyDialog({ open, onOpenChange, onSuccess }: CreateCompanyDialogProps) {
  const { api } = useFanafApi();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    type: 'company',
    country_id: '',
    sector: '',
    email: '',
    website: '',
    phone: '',
    address: '',
    description: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Charger les pays depuis l'API
  const { data: countriesResponse, isLoading: isLoadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      try {
        const response = await api.getCountries();
        return response?.data || [];
      } catch (error) {
        console.error('Erreur lors du chargement des pays:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // Cache pendant 10 minutes
    gcTime: 30 * 60 * 1000, // Garder en cache pendant 30 minutes
  });

  const countries = countriesResponse || [];

  // Mutation pour créer la compagnie
  const createCompanyMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      // Préparer le payload selon le format attendu par l'API
      const payload: any = {
        name: data.name.trim(),
        type: data.type,
        country_id: data.country_id,
      };

      // Ajouter les champs optionnels seulement s'ils sont remplis
      if (data.sector && data.sector.trim() !== '') {
        payload.sector = data.sector.trim();
      }
      if (data.email && data.email.trim() !== '') {
        payload.email = data.email.trim();
      }
      if (data.website && data.website.trim() !== '') {
        payload.website = data.website.trim();
      }
      if (data.phone && data.phone.trim() !== '') {
        payload.phone = data.phone.trim();
      }
      if (data.address && data.address.trim() !== '') {
        payload.address = data.address.trim();
      }
      if (data.description && data.description.trim() !== '') {
        payload.description = data.description.trim();
      }

      console.log('Payload envoyé à l\'API:', payload);
      return await api.createCompany(payload);
    },
    onSuccess: async (response) => {
      console.log('Compagnie créée avec succès:', response);
      setSuccess(true);
      toast.success('Compagnie créée avec succès !');
      
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        type: 'company',
        country_id: '',
        sector: '',
        email: '',
        website: '',
        phone: '',
        address: '',
        description: '',
      });
      
      // Invalider et recharger la liste des compagnies
      await queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          if (!Array.isArray(key) || key.length === 0) return false;
          return key[0] === 'adminAsaciCompanies';
        },
        refetchType: 'active', // Recharger immédiatement les requêtes actives
      });

      // Forcer le refetch de toutes les requêtes liées aux compagnies
      await queryClient.refetchQueries({
        predicate: (query) => {
          const key = query.queryKey;
          if (!Array.isArray(key) || key.length === 0) return false;
          return key[0] === 'adminAsaciCompanies';
        },
      });

      console.log('[CreateCompanyDialog] Cache invalidé et données rechargées');

      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess();
      }

      // Fermer le dialogue après un court délai
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
      }, 1500);
    },
    onError: (error: any) => {
      console.error('Erreur lors de la création de la compagnie:', error);
      let errorMessage = 'Erreur lors de la création de la compagnie';
      
      // Extraire le message d'erreur depuis différentes structures
      if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errors = error.response.data.errors;
        const errorDetails = errors.map((err: any) => err.detail || err.title || err.message).filter(Boolean);
        if (errorDetails.length > 0) {
          errorMessage = errorDetails.join('. ');
        }
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Le nom de la compagnie est requis');
      return;
    }
    if (!formData.country_id) {
      setError('Le pays est requis');
      return;
    }

    createCompanyMutation.mutate(formData);
  };

  const handleClose = () => {
    if (!createCompanyMutation.isPending) {
      setError(null);
      setSuccess(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-600" />
            Nouvelle compagnie
          </DialogTitle>
          <DialogDescription>
            Créer une nouvelle entreprise ou association pour FANAF 2026
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6 pr-2 -mr-2">
          {/* Champ nom */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nom de la compagnie <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Assurance CI"
              required
              disabled={createCompanyMutation.isPending}
            />
          </div>

          {/* Champ type */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'company' | 'association') => setFormData({ ...formData, type: value })}
              disabled={createCompanyMutation.isPending}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company">Entreprise</SelectItem>
                <SelectItem value="association">Association</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Champ pays */}
          <div className="space-y-2">
            <Label htmlFor="country_id">
              Pays <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.country_id}
              onValueChange={(value) => setFormData({ ...formData, country_id: value })}
              disabled={createCompanyMutation.isPending || isLoadingCountries}
            >
              <SelectTrigger id="country_id">
                <SelectValue placeholder={isLoadingCountries ? "Chargement..." : "Sélectionner un pays"} />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country: any) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name} {country.flag_url && <span className="ml-2">{country.alpha2 || country.code}</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Champ secteur */}
          <div className="space-y-2">
            <Label htmlFor="sector">Secteur d'activité</Label>
            <Input
              id="sector"
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              placeholder="Ex: Assurance"
              disabled={createCompanyMutation.isPending}
            />
          </div>

          {/* Champ email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@example.com"
              disabled={createCompanyMutation.isPending}
            />
          </div>

          {/* Champ website */}
          <div className="space-y-2">
            <Label htmlFor="website">Site web</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://www.example.com"
              disabled={createCompanyMutation.isPending}
            />
          </div>

          {/* Champ téléphone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+225 01 23 45 67 89"
              disabled={createCompanyMutation.isPending}
            />
          </div>

          {/* Champ adresse */}
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Adresse complète"
              disabled={createCompanyMutation.isPending}
            />
          </div>

          {/* Champ description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description de la compagnie"
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              disabled={createCompanyMutation.isPending}
            />
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Message de succès */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-green-700">Compagnie créée avec succès !</p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createCompanyMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={createCompanyMutation.isPending}
            >
              {createCompanyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Créer la compagnie
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


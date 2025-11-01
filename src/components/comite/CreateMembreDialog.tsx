"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { UserPlus, Loader2 } from "lucide-react";
import { useFanafApi } from "../../hooks/useFanafApi";
import { toast } from "sonner";
import type { ProfilMembre } from "../data/types";

interface CreateMembreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface MembreFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  profil: ProfilMembre | '';
}

// Les profils sont maintenant directement les rôles API
// Pas besoin de mapping, on utilise directement les valeurs

export function CreateMembreDialog({ open, onOpenChange, onSuccess }: CreateMembreDialogProps) {
  const { api } = useFanafApi();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<MembreFormData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    profil: '',
  });

  const [error, setError] = useState<string | null>(null);

  // Mutation pour créer le membre
  const createMembreMutation = useMutation({
    mutationFn: async (data: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      role: 'cashier' | 'agent_registration' | 'badge_operator' | 'scan_agent';
    }) => {
      return await api.createUser(data);
    },
    onSuccess: async () => {
      // Afficher une notification de succès
      toast.success('Membre créé avec succès !', {
        description: 'Le membre a été ajouté au comité d\'organisation.',
        duration: 3000,
      });

      // Invalider le cache des membres pour rafraîchir la liste
      await queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          if (!Array.isArray(key) || key.length === 0) return false;
          return key[0] === 'comiteOrganisation';
        }
      });

      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        profil: '',
      });
      setError(null);

      // Fermer le dialog
      onOpenChange(false);

      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (err: any) => {
      const errorMessage = err?.message || 
                          err?.response?.data?.message || 
                          err?.data?.message ||
                          'Erreur lors de la création du membre';
      
      setError(errorMessage);
      
      toast.error('Erreur lors de la création du membre', {
        description: errorMessage,
        duration: 5000,
      });
    },
  });

  // Fonction pour nettoyer et valider le numéro de téléphone
  const cleanPhoneNumber = (phone: string): string => {
    if (!phone || phone.trim() === '') {
      throw new Error('Le numéro de téléphone est requis');
    }
    
    // Vérifier que ce n'est pas du texte de placeholder ou d'exemple
    const phoneLower = phone.toLowerCase().trim();
    const placeholderWords = ['exemple', 'example', 'test', 'lorem', 'ipsum', 'dolor', 'eveniet', 'earum', 'placeholder', 'xx', 'xxx', 'aaaa', 'bbbb'];
    const isPlaceholder = placeholderWords.some(word => phoneLower.includes(word));
    
    if (isPlaceholder) {
      throw new Error('Le champ téléphone contient du texte invalide. Veuillez saisir un numéro de téléphone valide (ex: +225 01 23 45 67 89)');
    }
    
    // Supprimer les espaces, tirets, parenthèses et autres caractères non numériques sauf +
    let cleaned = phone.replace(/[\s\-\(\)\.]/g, '').trim();
    
    // S'assurer qu'il commence par + (code pays)
    if (!cleaned.startsWith('+')) {
      cleaned = `+${cleaned}`;
    }
    
    // Vérifier que le numéro contient au moins 8 chiffres (code pays + numéro)
    const digitsOnly = cleaned.replace(/\D/g, '');
    if (digitsOnly.length < 8) {
      throw new Error(`Le numéro de téléphone n'est pas valide. Il doit contenir au moins 8 chiffres (ex: +225 01 23 45 67 89)`);
    }
    
    // Vérifier qu'il n'y a pas trop de caractères non numériques (signe d'un texte)
    const nonDigits = cleaned.replace(/\d/g, '').replace('+', '').length;
    if (nonDigits > 5) {
      throw new Error(`Le numéro de téléphone semble contenir du texte invalide. Veuillez saisir uniquement des chiffres avec le code pays (ex: +225 01 23 45 67 89)`);
    }
    
    return cleaned;
  };

  const handleCreateMembre = () => {
    // Validation
    if (!formData.nom.trim()) {
      setError('Le nom est requis');
      return;
    }
    if (!formData.prenom.trim()) {
      setError('Le prénom est requis');
      return;
    }
    if (!formData.email.trim()) {
      setError('L\'email est requis');
      return;
    }
    if (!formData.telephone.trim()) {
      setError('Le téléphone est requis');
      return;
    }
    if (!formData.profil || formData.profil === '') {
      setError('Le profil est requis');
      return;
    }

    setError(null);

    // Nettoyer et valider le numéro de téléphone
    let cleanedPhone: string;
    try {
      cleanedPhone = cleanPhoneNumber(formData.telephone);
    } catch (phoneError: any) {
      setError(phoneError.message || 'Le numéro de téléphone n\'est pas valide');
      return;
    }

    // Convertir les données du formulaire vers le format API
    // Les profils sont maintenant directement les rôles API
    const apiData = {
      first_name: formData.prenom.trim(),
      last_name: formData.nom.trim(),
      email: formData.email.trim(),
      phone: cleanedPhone,
      role: formData.profil as 'cashier' | 'agent_registration' | 'badge_operator' | 'scan_agent',
    };

    createMembreMutation.mutate(apiData);
  };

  const isFormValid = formData.nom.trim() !== '' && 
                     formData.prenom.trim() !== '' && 
                     formData.email.trim() !== '' && 
                     formData.telephone.trim() !== '' && 
                     formData.profil !== '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un nouveau membre</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau membre au comité d'organisation
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="nom">Nom</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => {
                setFormData({ ...formData, nom: e.target.value });
                setError(null);
              }}
              placeholder="Entrez le nom"
              disabled={createMembreMutation.isPending}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prenom">Prénom</Label>
            <Input
              id="prenom"
              value={formData.prenom}
              onChange={(e) => {
                setFormData({ ...formData, prenom: e.target.value });
                setError(null);
              }}
              placeholder="Entrez le prénom"
              disabled={createMembreMutation.isPending}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Adresse mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setError(null);
              }}
              placeholder="exemple@fanaf2026.com"
              disabled={createMembreMutation.isPending}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="telephone">Contact</Label>
            <Input
              id="telephone"
              value={formData.telephone}
              onChange={(e) => {
                setFormData({ ...formData, telephone: e.target.value });
                setError(null);
              }}
              placeholder="+225 XX XX XX XX XX"
              disabled={createMembreMutation.isPending}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="profil">Profil</Label>
            <Select
              value={formData.profil}
              onValueChange={(value) => {
                setFormData({ ...formData, profil: value as ProfilMembre });
                setError(null);
              }}
              disabled={createMembreMutation.isPending}
            >
              <SelectTrigger id="profil">
                <SelectValue placeholder="Sélectionnez un profil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cashier">Caissier</SelectItem>
                <SelectItem value="scan_agent">Agent de scan</SelectItem>
                <SelectItem value="agent_registration">Agent d'inscription</SelectItem>
                <SelectItem value="badge_operator">Agent de badge</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              onOpenChange(false);
              setError(null);
            }}
            disabled={createMembreMutation.isPending}
          >
            Annuler
          </Button>
          <Button 
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={handleCreateMembre}
            disabled={!isFormValid || createMembreMutation.isPending}
          >
            {createMembreMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              'Créer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


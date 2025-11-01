'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { User, Mail, Phone, Building2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fanafApi } from '../../services/fanafApi';

interface UserProfile {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  organization?: string;
  role?: string;
}

export function ProfilePage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');

  const queryClient = useQueryClient();

  // Récupérer les données utilisateur depuis localStorage ou API
  const { data: userData, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => {
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('fanaf_user') : null;
        if (raw) {
          const parsed = JSON.parse(raw);
          return parsed as UserProfile;
        }
        return null;
      } catch {
        return null;
      }
    },
    staleTime: 0,
  });

  // Initialiser les champs avec les données utilisateur
  useEffect(() => {
    if (userData) {
      setFirstName(userData.first_name || '');
      setLastName(userData.last_name || '');
      setEmail(userData.email || '');
      setPhone(userData.phone || '');
      setOrganization(userData.organization || '');
    }
  }, [userData]);

  // Mutation pour sauvegarder le profil
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      // TODO: Implémenter l'appel API pour mettre à jour le profil
      // await fanafApi.updateProfile(profileData);
      
      // Pour l'instant, on met à jour localStorage
      const currentUser = JSON.parse(localStorage.getItem('fanaf_user') || '{}');
      const updatedUser = { ...currentUser, ...profileData };
      localStorage.setItem('fanaf_user', JSON.stringify(updatedUser));
      
      return updatedUser;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['userProfile'], data);
      toast.success('Profil mis à jour avec succès');
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    },
  });

  const handleSave = () => {
    const profileData = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      organization,
    };
    updateProfileMutation.mutate(profileData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6 mt-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Mon profil</h2>
        <p className="text-sm text-gray-600">
          Gérez vos informations personnelles et professionnelles
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            Informations personnelles
          </CardTitle>
          <CardDescription>
            Mettez à jour vos informations personnelles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm text-gray-700">
                Prénom
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Votre prénom"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm text-gray-700">
                Nom
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Votre nom"
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@domain.com"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Téléphone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+221 XX XXX XX XX"
              className="h-10"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="organization" className="text-sm text-gray-700 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Organisation
            </Label>
            <Input
              id="organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Votre organisation"
              className="h-10"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


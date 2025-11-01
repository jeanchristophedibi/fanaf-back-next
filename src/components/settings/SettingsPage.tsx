'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Globe, Moon, Sun, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserSettings {
  preferences: {
    theme: string;
    timezone: string;
  };
}

const DEFAULT_SETTINGS: UserSettings = {
  preferences: {
    theme: 'light',
    timezone: 'Africa/Dakar',
  },
};

export function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Récupérer les paramètres depuis localStorage
  const { data: savedSettings, isLoading } = useQuery({
    queryKey: ['userSettings'],
    queryFn: () => {
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('fanaf_settings') : null;
        if (raw) {
          return JSON.parse(raw) as UserSettings;
        }
        return DEFAULT_SETTINGS;
      } catch {
        return DEFAULT_SETTINGS;
      }
    },
    staleTime: 0,
  });

  // Initialiser les paramètres
  useEffect(() => {
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, [savedSettings]);

  // Mutation pour sauvegarder les paramètres
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: UserSettings) => {
      // TODO: Implémenter l'appel API pour sauvegarder les paramètres
      localStorage.setItem('fanaf_settings', JSON.stringify(newSettings));
      return newSettings;
    },
    onSuccess: () => {
      toast.success('Paramètres enregistrés avec succès');
    },
    onError: (error) => {
      console.error('Erreur lors de l\'enregistrement des paramètres:', error);
      toast.error('Erreur lors de l\'enregistrement des paramètres');
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  const updatePreference = (key: keyof UserSettings['preferences'], value: string) => {
    setSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
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
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Paramètres</h2>
        <p className="text-sm text-gray-600">
          Gérez vos préférences et paramètres de compte
        </p>
      </div>

      {/* Préférences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Préférences
          </CardTitle>
          <CardDescription>
            Personnalisez votre expérience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme" className="text-sm text-gray-700">
              Thème
            </Label>
            <Select
              value={settings.preferences.theme}
              onValueChange={(value) => updatePreference('theme', value)}
            >
              <SelectTrigger id="theme" className="h-10">
                <SelectValue placeholder="Sélectionner un thème" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Clair
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Sombre
                  </div>
                </SelectItem>
                <SelectItem value="system">Système</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone" className="text-sm text-gray-700">
              Fuseau horaire
            </Label>
            <Select
              value={settings.preferences.timezone}
              onValueChange={(value) => updatePreference('timezone', value)}
            >
              <SelectTrigger id="timezone" className="h-10">
                <SelectValue placeholder="Sélectionner un fuseau horaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Africa/Dakar">Afrique/Dakar (GMT+0)</SelectItem>
                <SelectItem value="Africa/Abidjan">Afrique/Abidjan (GMT+0)</SelectItem>
                <SelectItem value="Africa/Nairobi">Afrique/Nairobi (GMT+3)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
          className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]"
        >
          {updateSettingsMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer les paramètres
            </>
          )}
        </Button>
      </div>
    </div>
  );
}


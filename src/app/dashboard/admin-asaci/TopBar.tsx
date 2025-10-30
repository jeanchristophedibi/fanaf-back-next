'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';
import { Button } from '../../../components/ui/button';
import { fanafApi } from '../../../services/fanafApi';
import { toast } from 'sonner';

interface TopBarProps {
  userEmail?: string;
}

export function TopBar({ userEmail }: TopBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    if (userEmail) {
      setEmail(userEmail);
      return;
    }
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('fanaf_user') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.email) setEmail(parsed.email);
      }
    } catch (_) {}
  }, [userEmail]);

  const handleProfile = () => {
    console.log('Profile clicked');
    // TODO: Navigate to profile page
  };

  const handleSettings = () => {
    console.log('Settings clicked');
    // TODO: Navigate to settings page
  };

  const handleLogout = () => {
    try {
      // Déconnecter via l'API
      fanafApi.logout();
      
      // Afficher un message de confirmation
      toast.success('Déconnexion réussie');
      
      // Rediriger vers la page de login
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
      </div>
      
      <div className="flex items-center gap-4">
        {isMounted ? (
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 h-10 px-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-sm text-gray-700">{email || 'Utilisateur'}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" className="gap-2 h-10 px-3" disabled>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-700">{email || 'Utilisateur'}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </Button>
        )}
      </div>
    </div>
  );
}


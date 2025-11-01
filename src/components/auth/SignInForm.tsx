'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Eye, EyeOff, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { fanafApi } from '../../services/fanafApi';
import { toast } from 'sonner';
import loginImage from '../../assets/images/img-1.jpg';

function SignInFormContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    if (fanafApi.isAuthenticated()) {
      // Déterminer la route selon le rôle si déjà connecté
      const user = fanafApi.getCurrentUser() as any;
      const role = user?.role || (typeof window !== 'undefined' ? localStorage.getItem('fanaf_role') : null);
      const roleToPath = (r: string | null | undefined) => {
        switch (r) {
          case 'admin_agency': return '/dashboard/agence';
          case 'admin_fanaf': return '/dashboard/admin-fanaf';
          case 'admin_platform': return '/dashboard/admin-asaci';
          case 'agent_fanaf': return '/dashboard/agent-inscription';
          case 'cashier': return '/dashboard/operateur-caisse';
          case 'operateur_badge': return '/dashboard/operateur-badge';
          default: return '/no-access';
        }
      };
      const redirect = searchParams?.get('redirect') || roleToPath(role);
      console.log('[SignInForm] Redirection après authentification vers:', redirect);
      router.push(redirect);
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* --- Image à gauche --- */}
      <div className="relative hidden lg:flex lg:w-1/2 min-h-screen">
        {loginImage ? (
          <>
            <Image
              src={loginImage}
              alt="FANAF 2026"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-orange-600 via-orange-500 to-orange-700">
            <Lock className="w-16 h-16 text-white mb-6" />
            <h2 className="text-4xl font-bold text-white mb-2">FANAF 2026</h2>
            <p className="text-lg text-orange-100">Back Office Administration</p>
          </div>
        )}
      </div>

      {/* --- Formulaire à droite --- */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-50 dark:bg-gray-900 px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Connexion</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Accédez à votre compte</p>
          </div>

          {/* --- Formulaire --- */}
          <form 
            className="space-y-5" 
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              
              // Validation du mot de passe (minimum 6 caractères)
              if (password.length < 6) {
                const errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
                setError(errorMessage);
                toast.error(errorMessage);
                return;
              }
              
              setLoading(true);

              try {
                const response = await fanafApi.passwordLogin(email, password);
                toast.success('Connexion réussie !');
                // Déterminer la redirection selon le rôle utilisateur
                const user = (response as any)?.user || (response as any)?.data?.user;
                const role = user?.role;
                const roleToPath = (r: string | null | undefined) => {
                  switch (r) {
                    case 'admin_agency': return '/dashboard/agence';
                    case 'admin_fanaf': return '/dashboard/admin-fanaf';
                    case 'admin_platform': return '/dashboard/admin-asaci';
                    case 'agent_fanaf': return '/dashboard/agent-inscription';
                    case 'cashier': return '/dashboard/operateur-caisse';
                    case 'operateur_badge': return '/dashboard/operateur-badge';
                    default: return '/no-access';
                  }
                };
                const defaultRedirect = roleToPath(role);
                // Rediriger vers la page demandée (si présente) sinon selon le rôle
                const redirect = searchParams?.get('redirect') || defaultRedirect;
                console.log('[SignInForm] Redirection après connexion vers:', redirect, 'role:', role);
                if (!role) {
                  // Déconnecter si aucun rôle reconnu
                  try { fanafApi.logout(); } catch (_) {}
                  toast.error("Votre profil n'a pas accès au dashboard");
                }
                router.push(redirect);
              } catch (err: any) {
                // Extraire le message d'erreur de manière user-friendly
                let errorMessage = err.message || 'Erreur de connexion. Vérifiez vos identifiants.';
                
                // Gérer les erreurs réseau différemment
                if (err.name === 'NetworkError' || 
                    errorMessage.includes('Impossible de joindre') ||
                    errorMessage.includes('connexion réseau') ||
                    errorMessage.includes('Failed to fetch')) {
                  // Le message d'erreur réseau est déjà clair et user-friendly
                  errorMessage = errorMessage;
                } else if (errorMessage.toLowerCase().includes('identifiants invalides') || 
                    errorMessage.toLowerCase().includes('invalid credentials') ||
                    errorMessage.toLowerCase().includes('email ou mot de passe incorrect') ||
                    errorMessage.toLowerCase().includes('unauthorized') ||
                    errorMessage.toLowerCase().includes('forbidden')) {
                  // Normaliser les messages d'erreur d'authentification
                  errorMessage = 'Les identifiants saisis sont incorrects. Veuillez vérifier votre email et votre mot de passe.';
                }
                
                // Ne pas logger les erreurs de connexion et réseau dans la console (erreurs attendues)
                // Seulement logger pour les autres types d'erreurs
                if (err.name !== 'LoginError' && err.name !== 'NetworkError') {
                  console.error('Erreur de connexion détaillée:', err);
                }
                
                setError(errorMessage);
                toast.error(errorMessage);
              } finally {
                setLoading(false);
              }
            }}
          >
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Entrez votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {password.length > 0 && password.length < 6 && (
                <p className="text-sm text-amber-600 mt-1">
                  Le mot de passe doit contenir au moins 6 caractères.
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading || password.length > 0 && password.length < 6}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          {/* Overlay de chargement pendant la connexion */}
          {loading && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center space-y-4">
                <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
                <p className="text-gray-900 font-medium">Connexion en cours...</p>
                <p className="text-sm text-gray-500">Veuillez patienter</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignInForm() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement de la page de connexion...</p>
        </div>
      </div>
    }>
      <SignInFormContent />
    </Suspense>
  );
}

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
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
      // Rediriger vers la page demandée (qui contient le bon chemin de dashboard)
      // ou le dashboard admin-fanaf par défaut
      const redirect = searchParams?.get('redirect') || '/dashboard/admin-fanaf';
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
              setLoading(true);

              try {
                const response = await fanafApi.passwordLogin(email, password);
                toast.success('Connexion réussie !');
                // Rediriger vers la page demandée (qui contient le bon chemin de dashboard)
                // ou le dashboard admin-fanaf par défaut
                const redirect = searchParams?.get('redirect') || '/dashboard/admin-fanaf';
                console.log('[SignInForm] Redirection après connexion vers:', redirect);
                router.push(redirect);
              } catch (err: any) {
                console.error('Erreur de connexion détaillée:', err);
                const errorMessage = err.message || 'Erreur de connexion. Vérifiez vos identifiants.';
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
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default function SignInForm() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <SignInFormContent />
    </Suspense>
  );
}

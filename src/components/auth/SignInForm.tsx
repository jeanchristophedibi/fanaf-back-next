'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Eye, EyeOff, Lock, AlertCircle, Loader2, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { fanafApi } from '../../services/fanafApi';
import { toast } from 'sonner';
import { Logo } from '../ui/Logo';
import logoImage from '../../assets/logo.png';

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
          case 'badge_operator': return '/dashboard/operateur-badge';
          default: return '/no-access';
        }
      };
      const redirect = searchParams?.get('redirect') || roleToPath(role);
      console.log('[SignInForm] Redirection après authentification vers:', redirect);
      router.push(redirect);
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* --- Logo à gauche --- */}
      <div className="relative w-full lg:w-1/2 h-screen overflow-hidden order-2 lg:order-1 flex items-center justify-center bg-gradient-to-br from-green-500 via-amber-400 to-green-600">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center p-12 w-full"
        >
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white text-4xl font-bold mb-2"
          >
            FANAF 2026
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-white text-sm"
          >
            9-11 février 2026
          </motion.p>
        </motion.div>
      </div>

      {/* --- Formulaire à droite --- */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 lg:py-20 order-1 lg:order-2">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Card avec ombre et bordure */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 lg:p-10 space-y-8">
            {/* En-tête */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="relative h-20 w-auto">
                  <Image
                    src={logoImage}
                    alt="FANAF Logo"
                    width={200}
                    height={80}
                    className="h-20 w-auto object-contain"
                    priority
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Connexion</h1>
                <p className="text-gray-600">Accédez à votre espace d'administration</p>
              </div>
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
                    case 'badge_operator': return '/dashboard/operateur-badge';
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
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700"
              >
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium text-sm">
                  Adresse email
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="exemple@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-12 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium text-sm">
                  Mot de passe
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-500" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    className="pl-12 pr-12 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1.5 rounded-md hover:bg-gray-100 z-10"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {password.length > 0 && password.length < 6 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-amber-600 mt-1 flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Le mot de passe doit contenir au moins 6 caractères.
                  </motion.p>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              disabled={loading || (password.length > 0 && password.length < 6)}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion en cours...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  Se connecter
                </span>
              )}
            </Button>
          </form>
            </div>
          </motion.div>
        </div>

        {/* Overlay de chargement pendant la connexion */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-10 shadow-2xl flex flex-col items-center space-y-4 max-w-sm mx-4"
            >
              <div className="relative">
                <Loader2 className="w-16 h-16 text-orange-600 animate-spin" />
                <div className="absolute inset-0 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-900 font-semibold text-lg">Connexion en cours...</p>
              <p className="text-sm text-gray-500 text-center">Veuillez patienter quelques instants</p>
            </motion.div>
          </motion.div>
        )}
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

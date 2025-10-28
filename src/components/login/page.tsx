'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { supabase } from '../../utils/supabase/client';
import { AlertCircle, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import loginImage from '../../assets/images/img-3.jpg';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Image de fond */}
        <Image
          src={loginImage}
          alt="FANAF 2026"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl shadow-2xl mb-8">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4">FANAF 2026</h1>
            <p className="text-2xl text-orange-50 mb-2">Festival de l'Assurance en Afrique</p>
            <p className="text-xl text-orange-100">9-11 février 2026</p>
          </div>
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
              <h3 className="text-xl font-semibold mb-3">Bienvenue sur le Back Office</h3>
              <p className="text-orange-50 leading-relaxed">
                Gestion complète de l'événement FANAF 2026 : inscriptions, paiements, networking et check-in en temps réel.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-3xl font-bold mb-1">150+</div>
                <div className="text-sm text-orange-100">Participants</div>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-3xl font-bold mb-1">10+</div>
                <div className="text-sm text-orange-100">Organisations</div>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-3xl font-bold mb-1">3</div>
                <div className="text-sm text-orange-100">Jours</div>
              </div>
            </div>
          </div>
          <div className="text-sm text-orange-100">
            <p>© 2026 FANAF - Accès réservé aux administrateurs autorisés</p>
          </div>
        </div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl"></div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl shadow-lg mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">FANAF 2026</h1>
            <p className="text-gray-600">Back Office Administration</p>
          </div>
          <Card className="shadow-2xl border-gray-200">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Connexion</CardTitle>
              <CardDescription className="text-center">
                Entrez vos identifiants pour accéder à votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Adresse email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@fanaf2026.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="transition-all duration-200 focus:shadow-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pr-10 transition-all duration-200 focus:shadow-md"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg transition-all duration-200 h-11 text-base font-semibold" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>
                <div className="text-center">
                  <a href="#" className="text-sm text-orange-600 hover:text-orange-700 hover:underline transition-colors" onClick={(e) => e.preventDefault()}>
                    Mot de passe oublié ?
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="lg:hidden mt-8 text-center text-sm text-gray-500">
            <p>© 2026 FANAF - Festival de l'Assurance en Afrique</p>
            <p className="mt-1">Accès réservé aux administrateurs autorisés</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

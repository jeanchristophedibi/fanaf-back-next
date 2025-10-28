'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Eye, EyeOff, Lock } from 'lucide-react';
import loginImage from '../../assets/images/img-1.jpg';

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);

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

          {/* --- Boutons externes --- */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
            <Button variant="outline" className="w-full">
              Se connecter avec Google
            </Button>
            <Button variant="outline" className="w-full">
              Se connecter avec X
            </Button>
          </div>

          {/* --- Séparateur --- */}
          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 dark:bg-gray-900 px-4 text-gray-500">Ou</span>
            </div>
          </div>

          {/* --- Formulaire --- */}
          <form className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Entrez votre email" />
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Entrez votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
              Se connecter
            </Button>
          </form>

          <p className="text-sm text-center text-gray-700 dark:text-gray-400 mt-5">
            Vous n'avez pas de compte ?{' '}
            <Link
              href="/signup"
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

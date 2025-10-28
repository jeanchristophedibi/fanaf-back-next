'use client';
import React, { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { StaticImageData } from 'next/image';
import Image from 'next/image';

interface AuthLayoutProps {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  imageLeft?: string | StaticImageData;
}

export default function AuthLayout({ 
  children, 
  title = "FANAF 2026",
  subtitle = "Back Office Administration",
  imageLeft 
}: AuthLayoutProps) {
  
  console.log('AuthLayout image:', imageLeft);
  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900">
      <div className="relative flex lg:flex-row w-full min-h-screen flex-col">
        {/* Section gauche - Image */}
        <div className="hidden lg:flex lg:w-1/2 min-h-screen relative overflow-hidden">
          {imageLeft ? (
            <div className="relative w-full h-full">
              {typeof imageLeft === 'string' ? (
                <img 
                  src={imageLeft} 
                  alt="FANAF 2026" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image 
                  src={imageLeft} 
                  alt="FANAF 2026" 
                  fill
                  className="object-cover"
                  priority
                  sizes="50vw"
                />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-orange-600 via-orange-500 to-orange-700">
              <div className="text-center p-12">
                <Lock className="w-16 h-16 text-white mx-auto mb-6" />
                <h2 className="text-4xl font-bold text-white mb-4">{title}</h2>
                <p className="text-xl text-orange-100">{subtitle}</p>
              </div>
            </div>
          )}
        </div>

        {/* Section droite - Formulaire */}
        <div className="lg:w-1/2 w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}


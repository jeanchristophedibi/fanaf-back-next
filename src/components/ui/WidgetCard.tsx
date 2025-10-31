'use client';

import React from 'react';
import { Card } from './card';

type WidgetVariant = 'green' | 'orange' | 'blue' | 'purple' | 'indigo' | 'cyan';

const variantClasses: Record<WidgetVariant, string> = {
  green: 'bg-gradient-to-br from-green-500 to-green-600 text-white',
  orange: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white',
  blue: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
  purple: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white',
  indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white',
  cyan: 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white',
};

interface WidgetCardProps {
  variant: WidgetVariant;
  children: React.ReactNode;
  className?: string;
}

export function WidgetCard({ variant, children, className = '' }: WidgetCardProps) {
  return (
    <Card className={`p-6 ${variantClasses[variant]} hover:shadow-xl transition-shadow ${className}`}>
      {children}
    </Card>
  );
}



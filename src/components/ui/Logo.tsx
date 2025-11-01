import React from 'react';
import logo from '../../assets/logo.png';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
}

type LogoType = 'asaci' | 'fanaf';

interface LogoComponentProps extends LogoProps {
  type?: LogoType;
}

export function Logo({ className = '', alt, type = 'asaci', width = 500, height = 500 }: LogoComponentProps) {
  const defaultAlt = type === 'fanaf' ? 'FANAF' : 'ASACI Technologies';
  
  // Si className contient déjà width/height, utiliser ces valeurs
  const hasSizeClasses = className.includes('w-') || className.includes('h-');
  const finalClassName = hasSizeClasses ? className : `${className} h-16 w-auto`.trim();
  
  return (
    <Image 
      src={logo} 
      alt={alt || defaultAlt} 
      width={width}
      height={height}
      className={finalClassName}
    />
  );
}
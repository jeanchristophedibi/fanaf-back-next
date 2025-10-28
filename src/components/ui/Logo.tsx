import React from 'react';
import logo from '../../assets/logo.png';
import logoFanaf from '../../assets/ee980bb8f1bd4693c85a97fcc9a93a7e05a3326d.png';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  alt?: string;
}

type LogoType = 'asaci' | 'fanaf';

interface LogoComponentProps extends LogoProps {
  type?: LogoType;
}

export function Logo({ className = '', alt, type = 'asaci' }: LogoComponentProps) {
  const logoSource = type === 'fanaf' ? logo : logoFanaf;
  const defaultAlt = type === 'fanaf' ? 'FANAF' : 'ASACI Technologies';
  
  return <Image src={logoSource} alt={alt || defaultAlt} className={className} />;
}
import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ 
  className = "", 
  size = 40, 
}: LogoProps) {
  return (
    <Image
      src="/logo.svg" 
      alt="Katachi Logo"
      width={size}
      height={size}
      className={className}
      style={{ display: 'block' }}
    />
  );
}

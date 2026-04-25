'use client';

import { useEffect } from 'react';

interface DynamicStatusBarProps {
  color: string;
}

export default function DynamicStatusBar({ color }: DynamicStatusBarProps) {
  useEffect(() => {
    // Update the meta tag dynamically
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    const previousColor = meta.getAttribute('content');
    meta.setAttribute('content', color);

    return () => {
      if (previousColor) {
        meta?.setAttribute('content', previousColor);
      }
    };
  }, [color]);

  return null;
}

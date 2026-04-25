'use client';

import React, { useEffect, useState } from 'react';
import Logo from '@/components/Logo';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    // Check if splash has been shown in this session
    const hasShown = sessionStorage.getItem('splash-shown');
    
    if (!hasShown) {
      setIsRendered(true);
      // Small delay to trigger entry animation
      const entryTimer = setTimeout(() => {
        setIsVisible(true);
      }, 50);

      // Total duration of splash screen
      const exitTimer = setTimeout(() => {
        setIsVisible(false);
        // Remove from DOM after exit animation
        const removeTimer = setTimeout(() => {
          setIsRendered(false);
          sessionStorage.setItem('splash-shown', 'true');
        }, 500);
        return () => clearTimeout(removeTimer);
      }, 2000);

      return () => {
        clearTimeout(entryTimer);
        clearTimeout(exitTimer);
      };
    }
  }, []);

  if (!isRendered) return null;

  return (
    <div 
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#f4f4ea] transition-opacity duration-500 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className={`relative transition-all duration-700 ease-out transform ${
        isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
      }`}>
        <div className="flex items-center justify-center">
          <Logo size={120} />
        </div>
        <div className="mt-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#1f2937]">
            Katachi <span className="text-[#ff6b6b]">✦</span> 形
          </h1>
          <p className="mt-1 text-sm font-medium text-[#627081] uppercase tracking-[0.2em]">
            REPS ➔ REFLEX
          </p>
        </div>
      </div>
      
      {/* Decorative blobs to match global theme */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-200/30 rounded-full blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-200/30 rounded-full blur-[80px]" />
    </div>
  );
}

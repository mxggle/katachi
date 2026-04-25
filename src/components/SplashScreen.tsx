"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    const hasShown = sessionStorage.getItem("splash-shown");

    if (!hasShown) {
      let removeTimer: ReturnType<typeof setTimeout> | undefined;
      const renderTimer = setTimeout(() => {
        setIsRendered(true);
      }, 0);
      const entryTimer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      const exitTimer = setTimeout(() => {
        setIsVisible(false);
        removeTimer = setTimeout(() => {
          setIsRendered(false);
          sessionStorage.setItem("splash-shown", "true");
        }, 500);
      }, 2000);

      return () => {
        clearTimeout(renderTimer);
        clearTimeout(entryTimer);
        clearTimeout(exitTimer);
        if (removeTimer) {
          clearTimeout(removeTimer);
        }
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

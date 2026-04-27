"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import Logo from "./Logo";

interface IOSNavigator extends Navigator {
  standalone?: boolean;
}

interface IOSWindow extends Window {
  MSStream?: unknown;
}

export interface IOSInstallPromptEnvironment {
  userAgent: string;
  hasMSStream: boolean;
  isStandalone: boolean;
  standaloneNavigator: boolean;
  viewportWidth: number;
}

export function shouldShowIOSInstallPrompt({
  userAgent,
  hasMSStream,
  isStandalone,
  standaloneNavigator,
  viewportWidth,
}: IOSInstallPromptEnvironment) {
  const isIOSPhone = /iPhone|iPod/.test(userAgent);
  const isNarrowIPad = /iPad/.test(userAgent) && viewportWidth < 768;

  return (isIOSPhone || isNarrowIPad) && !hasMSStream && !isStandalone && !standaloneNavigator;
}

export default function IOSInstallPrompt() {
  const { language } = useStore();
  const { t } = useTranslation(language);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const iosWindow = window as IOSWindow;
    const iosNavigator = window.navigator as IOSNavigator;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || Boolean(iosNavigator.standalone);

    if (shouldShowIOSInstallPrompt({
      userAgent: navigator.userAgent,
      hasMSStream: Boolean(iosWindow.MSStream),
      isStandalone,
      standaloneNavigator: Boolean(iosNavigator.standalone),
      viewportWidth: window.innerWidth,
    })) {
      const dismissed = sessionStorage.getItem("ios-prompt-dismissed");
      if (!dismissed) {
        const showTimer = window.setTimeout(() => setShow(true), 0);
        return () => window.clearTimeout(showTimer);
      }
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("ios-prompt-dismissed", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] animate-banner-enter">
      <div className="bg-white border-[3px] border-[color:var(--ink)] rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.15),8px_8px_0px_0px_var(--ink)] p-4 flex items-center gap-4">
        <div className="bg-zinc-100 p-2 rounded-xl">
          <Logo size={32} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 leading-tight">
            {t('pwaInstallPrompt')}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-semibold">
            {t('pwaInstallInstructions')}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            {t('dismiss')}
          </button>
        </div>
      </div>
    </div>
  );
}

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (string | PrecacheEntry)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.setCatchHandler(async ({ request }) => {
  if (request.mode === 'navigate') {
    const fallback = await serwist.matchPrecache('/');
    if (fallback) return fallback;
    const indexFallback = await serwist.matchPrecache('index.html');
    if (indexFallback) return indexFallback;
  }
  return Response.error();
});

serwist.addEventListeners();

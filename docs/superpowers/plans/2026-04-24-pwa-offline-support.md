# PWA Implementation Plan: Katachi

## Objective
Convert Katachi into a fully offline-capable Progressive Web App (PWA) using Serwist, featuring an iOS installation guide, custom icons, and an animated splash screen.

## Implementation Steps

### 1. Serwist Setup for Full Offline Support
1. Install `@serwist/next` and `serwist`.
2. Update `next.config.ts` to use `withSerwist` and configure it to pre-cache `public/` assets and build files.
3. Create `src/app/sw.ts` with Serwist's default caching strategies.

### 2. Icons & Manifest
1. Provide instructions to the user to generate `icon-192x192.png` and `icon-512x512.png` from `public/icon.svg`.
2. Create `public/manifest.json` with standalone display, theme colors, and icon paths.
3. Update `src/app/layout.tsx` metadata to include the manifest and Apple-specific meta tags.

### 3. iOS Install Indicator & Guide
1. Create a new component `src/components/IOSInstallPrompt.tsx`.
2. Display a dismissible banner/toast at the top of the screen: "Install Katachi on your home screen for offline practice."

### 4. Animated Splash Screen
1. Create a `src/components/SplashScreen.tsx` component.
2. Render a full-screen overlay with `mascot.png` fading in smoothly.

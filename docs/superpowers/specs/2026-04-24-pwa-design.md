# PWA Design Spec: Katachi

## Visual Design
- **iOS Install Banner:** A top-positioned, dismissible banner with the Katachi logo and a "Add" button, guiding Safari users to use the Share -> Add to Home Screen flow.
- **Splash Screen:** A smooth fade-in animation of `mascot.png` on a theme-aware background.
- **Icons:** Unified icon strategy using solid background PNGs (192, 512) and a transparent Apple Touch icon.

## Technical Architecture
- **Framework:** Serwist (@serwist/next) for Service Worker management.
- **Caching Strategy:** 
  - Pre-cache all `public/` assets (dictionaries, icons, fonts).
  - Cache core Next.js chunks.
  - Runtime caching for dynamic UI updates.
- **Offline Support:** Ensure the local-first Zustand store and dictionary loader function without an active network connection.

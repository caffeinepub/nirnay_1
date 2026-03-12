# Nirnay — Advanced Futuristic Rebuild

## Current State
All 5 screens are implemented: SOS (countdown + cancel), Emergency Contacts, Evidence Records, Legal Rights, and Settings with PIN. The backend is complete with auth, SOS, contacts, evidence, and legal article APIs.

Known bugs:
- `useLegalArticles` calls `seedDefaultLegalArticles()` on the backend but users lack admin permission — this silently fails, leaving the Legal tab empty.

## Requested Changes (Diff)

### Add
- Futuristic cyberpunk/neon aesthetic: deep dark background with cyan/teal neon accents for UI (keep crimson for SOS/emergency)
- Glowing grid/mesh background pattern (CSS-only) on login and SOS screens
- Animated scan-line / HUD overlay effect on the SOS button area
- Hardcoded rich legal content in frontend (complete Indian law articles) as primary source
- Status indicators and holographic shimmer on cards

### Modify
- `index.css`: Add neon cyan accent, grid/scanline keyframes, shimmer animation
- `LoginScreen`: Animated grid background, neon shield icon, futuristic CTA
- `SOSScreen`: Concentric rings HUD around SOS button, neon status indicators
- `BottomNav`: Neon glow on active tab
- `LegalScreen`: Fix seeding bug, show rich hardcoded Indian law content, add category tab filter
- All screens: Upgrade card styling with neon borders on hover

### Remove
- The `seedDefaultLegalArticles()` call from `useLegalArticles` hook (causes auth failure for regular users)

## Implementation Plan
1. Update `index.css` with neon design tokens, grid/scanline animations
2. Fix `useQueries.ts` — remove `seedDefaultLegalArticles()` call, use static hardcoded articles
3. Redesign `LoginScreen` with animated grid background, glowing logo
4. Redesign `SOSScreen` with concentric ring HUD
5. Redesign `BottomNav` with neon active indicator
6. Upgrade `LegalScreen` with rich Indian law content + category tabs
7. Upgrade `ContactsScreen`, `EvidenceScreen`, `SettingsScreen` cards

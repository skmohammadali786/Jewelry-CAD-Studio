# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Artifacts

### Amirul Jewelry CAD Studio (`artifacts/jewelry-portfolio`)
- **Type**: React + Vite, frontend-only portfolio website
- **Preview path**: `/` (root)
- **Purpose**: Luxury jewelry CAD portfolio with design gallery, WhatsApp ordering, and GSAP animations
- **Phone**: +91 80166 54314
- **Address**: Newtown, Kolkata, West Bengal, India — 700135
- **Key features**:
  - Loading screen with animated logo
  - Full-screen hero with Three.js particles (CSS fallback when WebGL unavailable)
  - Gallery with 7 designs (AJ-001 to AJ-007) with hover effects
  - Design modal with WhatsApp deep-link ordering
  - GSAP ScrollTrigger animations
  - Custom gold cursor
  - Fixed transparent-to-solid navbar
  - Contact section with WhatsApp + email buttons
  - Fully responsive (mobile-first)
- **Images**: `/public/assets/images/AJ-001.jpg` through `AJ-007.jpg`
- **Logo**: `/public/assets/logo.png`
- **Dependencies added**: `three`, `gsap`, `@types/three`

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

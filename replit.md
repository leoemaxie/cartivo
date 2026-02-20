# Cartivo

## Overview
Cartivo is a React-based frontend application for an AI-powered shopping experience. Built with Vite, React 18, Tailwind CSS v4, and a component library using Radix UI and shadcn/ui patterns.

## Project Architecture
- **Framework**: React 18 with Vite 6
- **Styling**: Tailwind CSS v4 with custom theme variables
- **UI Components**: Radix UI primitives + shadcn/ui patterns in `src/app/components/ui/`
- **Routing**: React Router v7 (`src/app/routes.ts`)
- **Pages**: Landing, Dashboard, Chat, ARView, ProductDetail, Profile (`src/app/pages/`)

## Directory Structure
```
src/
  app/
    components/    # UI components (Radix/shadcn)
    pages/         # Route page components
    routes.ts      # Router configuration
    App.tsx        # Root app component
  styles/          # CSS (fonts, tailwind, theme)
  main.tsx         # Entry point
```

## Running
- Dev: `npm run dev` (Vite dev server on port 5000)
- Build: `npm run build` (outputs to `dist/`)
- Deploy: Static deployment from `dist/`

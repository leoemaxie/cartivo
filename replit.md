# Cartivo

## Overview
Cartivo is a React-based frontend application for an AI-powered shopping experience. Built with Vite, React 18, Tailwind CSS v4, and a component library using Radix UI and shadcn/ui patterns. Features Replit authentication and PostgreSQL database for dynamic product data.

## Project Architecture
- **Framework**: React 18 with Vite 6
- **Styling**: Tailwind CSS v4 with custom theme variables
- **UI Components**: Radix UI primitives + shadcn/ui patterns in `src/app/components/ui/`
- **Routing**: React Router v7 (`src/app/routes.ts`)
- **Pages**: Landing, Dashboard, Chat, ARView, ProductDetail, Profile (`src/app/pages/`)
- **Backend**: Express server on port 3001 with Replit Auth (OpenID Connect)
- **Database**: PostgreSQL with Drizzle ORM (users, sessions, products tables)
- **Auth**: Replit Auth via OpenID Connect (`/api/login`, `/api/logout`, `/api/callback`, `/api/auth/user`)

## Directory Structure
```
src/
  app/
    components/    # UI components (Radix/shadcn)
    pages/         # Route page components
    routes.ts      # Router configuration
    App.tsx        # Root app component
  hooks/
    use-auth.ts    # Authentication hook
  styles/          # CSS (fonts, tailwind, theme)
  main.tsx         # Entry point
server/
  index.ts         # Express server entry
  routes.ts        # API routes (auth + products)
  db.ts            # Drizzle database connection
  seed.ts          # Product seed data
shared/
  schema.ts        # Drizzle database schema
```

## Running
- Dev: `npm run dev` (Vite on port 5000 + Express on port 3001 via concurrently)
- Build: `npm run build && npm run build:server`
- Start: `npm run start` (production mode)

## Key Features
- Dynamic dashboard that fetches products from PostgreSQL database
- Falls back to hardcoded product data if database is empty
- Replit Auth for user authentication (no custom forms)
- Product seeding on server startup (4 default products)

## User Preferences
- Uses Replit Auth (not custom auth forms)
- Dashboard should be dynamic with DB fallback to hardcoded data

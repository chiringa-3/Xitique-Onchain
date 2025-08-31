# Overview

XITIQUE OnChain is a Web3 application that modernizes traditional Rotating Savings and Credit Associations (ROSCA) using Hedera blockchain technology. The project serves as a single-page landing site that introduces users to the concept of digitizing community savings with smart contracts, providing transparency, automation, and global accessibility to traditional saving circles. Built for the Hedera Africa Hackathon 2025, it combines modern web technologies with blockchain innovation to create a trustworthy and user-friendly experience.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Component-based UI built with functional components and hooks
- **Single Page Application (SPA)**: Landing page with smooth scrolling navigation between sections
- **Responsive Design**: Mobile-first approach using Tailwind CSS with custom color scheme inspired by African textile tones
- **Component Library**: Radix UI primitives with shadcn/ui styling for consistent, accessible components
- **State Management**: React Query for server state management and local React state for UI interactions
- **Routing**: Wouter for lightweight client-side routing (currently single page with 404 fallback)

## Backend Architecture
- **Express.js Server**: Minimal API server with TypeScript support
- **Development Setup**: Vite integration for hot module replacement and development tooling
- **Middleware Pattern**: Request logging, JSON parsing, and error handling middleware
- **Storage Interface**: Abstracted storage layer with in-memory implementation (ready for database integration)
- **Static Serving**: Production build serving with Vite development server proxy

## Database Layer
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **Schema Definition**: User authentication schema with username/password fields
- **Migration System**: Drizzle Kit for database migrations and schema management
- **Environment Configuration**: Database URL configuration for deployment flexibility

## Styling and Design System
- **Tailwind CSS**: Utility-first styling with custom theme configuration
- **CSS Variables**: Design token system for colors, spacing, and typography
- **Custom Brand Colors**: Emerald/teal primary, warm gold accent, charcoal text on neutral base
- **Typography**: Inter font family for clean, modern typography
- **Animation**: CSS-based micro-animations for fade-in, slide-up, and floating effects

## Build and Deployment
- **Vite Build System**: Fast development server and optimized production builds
- **ESBuild**: Server-side bundling for production deployment
- **TypeScript Compilation**: Strict type checking across client, server, and shared code
- **Path Aliases**: Clean import paths for better code organization
- **Development Tools**: Runtime error overlay and hot reloading for development
- **Static Deployment**: Custom build script (`build-for-deployment.sh`) to restructure files for Replit static deployment
- **Deployment Configuration**: Configured for static deployment with files served from `dist/` directory

# External Dependencies

## Blockchain Integration
- **Hedera Network**: Target blockchain for smart contract deployment (referenced in design)
- **Neon Database**: PostgreSQL-compatible serverless database (@neondatabase/serverless)

## UI Framework and Components
- **Radix UI**: Accessible component primitives for complex UI interactions
- **React Hook Form**: Form handling with validation (@hookform/resolvers)
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variant management

## Development and Build Tools
- **Vite**: Build tool and development server
- **Replit Integration**: Development environment plugins and runtime error handling
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## External Services Referenced
- **Discord Community**: https://discord.gg/NHjRZzYC for community engagement
- **Notion Documentation**: Whitepaper/litepaper hosting
- **X/Twitter**: @xitiqueonchain for social media presence
- **Unsplash**: Stock photography for team member placeholders

## Fonts and Assets
- **Google Fonts**: Inter font family for typography
- **Local Assets**: XITIQUE logo and brand imagery stored in attached_assets directory

# Recent Changes

## Deployment Configuration Fix (August 14, 2025)
**Issue**: Static deployment was failing because build output structure didn't match deployment expectations
- Build process created files in `dist/public/` but deployment looked for files in `dist/`
- Core configuration files (.replit, vite.config.ts, package.json) cannot be modified

**Solution**: Created custom build script `build-for-deployment.sh`
- Runs normal build process then restructures files
- Copies static files from `dist/public/*` to `dist/`
- Results in correct structure for static deployment
- Documented in DEPLOYMENT.md for future reference
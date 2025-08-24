# Copilot Instructions for funac-system Monorepo

## Architecture Overview

**Monorepo Structure**: Turborepo + pnpm workspaces with automated release management via Changesets.

### Core Applications
- **`apps/api`**: NestJS backend with JWT auth, MongoDB/Mongoose, role-based access control
- **`apps/web`**: Next.js 14+ frontend with shadcn/ui, authentication flows, dashboard
- **`apps/docs`**: Next.js documentation site

### Shared Packages
- **`packages/ui`**: React components with Tailwind CSS (using ui- prefix)
- **`packages/*-config`**: Centralized ESLint, TypeScript, and Tailwind configurations

## Authentication Flow

**Backend Pattern**: JWT tokens via `/auth/login`, protected routes use `@UseGuards(JwtAuthGuard)`
```typescript
// API endpoint protection
@UseGuards(JwtAuthGuard)
@Roles('admin') // Optional role restriction
@Get('admin')
getAdminResource() { ... }
```

**Frontend Pattern**: Token stored in localStorage, automatic redirect on 401
```typescript
// Standard auth check in pages
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/auth/signin');
    return;
  }
  // Make authenticated request
}, []);
```

## Development Workflows

### Essential Commands
```bash
pnpm install                    # Install all dependencies
pnpm --filter web dev          # Run frontend dev server
pnpm --filter api start:dev    # Run backend with hot reload
pnpm lint                      # Lint entire monorepo
pnpm commit                    # Interactive conventional commits
pnpm clear                     # Clean node_modules, temp, dist
pnpm changeset-report          # Generate automated changeset reports
```

### Testing Strategy
- **API**: Unit tests (`*.spec.ts`) + E2E tests (`test/*.e2e-spec.ts`)
- **Run tests**: `pnpm --filter api test` or `pnpm --filter api test:e2e`

## Project-Specific Patterns

### NestJS API Structure
- **Services**: Business logic with Mongoose models
- **Controllers**: Route handlers with validation decorators
- **Guards**: JWT auth + role-based access (`JwtAuthGuard`, `RolesGuard`)
- **Schemas**: Mongoose schemas in `*.schema.ts` files

### UI Components (shadcn/ui)
- **Base components**: `apps/web/components/ui/*` (Button, Card, Alert, etc.)
- **App components**: `apps/web/components/app-*.tsx` (AppSidebar, etc.)
- **Styling**: Tailwind with CSS variables, aliases in `components.json`

### Commit Automation
- **Trigger**: `"faça o relatorio de commit"` → runs automated commit analysis
- **Conventional Commits**: Enforced via Husky + lint-staged
- **Changesets**: Automated version bumping based on commit types

## Configuration Patterns

### Environment Variables
- **API**: `JWT_SECRET`, `JWT_EXPIRES_IN`, MongoDB connection in `.env`
- **Web**: `NEXT_PUBLIC_API_URL` for API integration

### Turborepo Tasks
- Tasks run with dependency graph: `build`, `lint`, `check-types`
- `dev` tasks are persistent and uncached

## AI Agent Guidelines

1. **File Classification**: Always group changes by workspace (`apps/api`, `apps/web`, `packages/*`, `root`)
2. **Conventional Commits**: Use type priority: `fix` > `feat` > `perf` > `refactor` > `docs` > `test` > `build` > `ci` > `style` > `chore`
3. **API Changes**: Follow NestJS controller/service/module pattern with proper decorators
4. **UI Changes**: Use shadcn/ui composition patterns with Tailwind
5. **Breaking Changes**: Mark when changing public APIs, exports, or route signatures

### Key Reference Files
- **Auth Flow**: `apps/api/src/auth/auth.service.ts`, `apps/web/app/auth/signin/page.tsx`
- **API Structure**: `apps/api/src/user/user.controller.ts`
- **UI Patterns**: `apps/web/components/app-sidebar.tsx`
- **Automation**: `scripts/changeset-report.ts`, `.github/instructions/commit.instructions.md`

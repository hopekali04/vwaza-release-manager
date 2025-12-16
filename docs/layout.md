# Project Layout & Architecture

This document defines the file structure for the Release Manager. We follow a pragmatic **Clean Architecture** approach, ensuring separation of concerns and adherence to **SOLID** principles without unnecessary complexity.

**See [main README](../README.md) for quick start, commands, and links to all documentation.**

## High-Level Structure

The project is structured as a monorepo containing the server, client, and shared code.

```
/
├── backend/         # Node.js (Fastify) API - Clean Architecture
├── frontend/        # React (Vite) Application - Feature-based routing
├── shared/          # TypeScript types, Zod schemas, enums (API contract)
├── docs/            # Comprehensive project documentation
└── README.md        # Landing page with project overview
```

## Quick Navigation

- **[Database Schema](./database-schema.md)** - PostgreSQL design, enums, indexes
- **[Backend README](../backend/README.md)** - Quick start and available commands
- **[Frontend README](../frontend/README.md)** - React Router setup and development
- **[Background Workers](./workers.md)** - Upload and Processing worker architecture
- **[Data Model](./data-model.md)** - Domain entities and relationships
- **[Setup & Configuration](./setup-auth-db.md)** - Environment and database setup
- **[Resilience & Error Handling](./resilience.md)** - Fault tolerance patterns

## Shared Structure (`/shared`)

To avoid duplication and ensure type safety across the stack, we define the "Contract" between frontend and backend here. The shared package is published as ES Modules (ESM).

```
shared/
├── src/
│   ├── index.ts         # Main export (schemas, types, enums)
│   ├── schemas/         # Zod validation schemas (auth, release, track)
│   ├── enums/           # TypeScript enums (UserRole, ReleaseStatus, etc.)
│   └── types/           # TypeScript interfaces inferred from Zod schemas
├── dist/                # Compiled ESM output
├── package.json         # ESM module (type: "module")
└── tsconfig.json        # Configured for ES2022 target
```

### Usage

**Backend**: Imports schemas and types from `@vwaza/shared`
```typescript
import { UserRole, SignUpRequestDto } from '@vwaza/shared';
```

**Frontend**: Imports types and enums from `@vwaza/shared`
```typescript
import { ReleaseStatus, UserRole, type Release } from '@vwaza/shared';
```

**Important**: Always run `pnpm build` in `/shared` after schema changes, before rebuilding backend/frontend.

## Backend Structure (`/backend`)

The backend follows **Clean Architecture** principles with ES Module support. Dependencies point inwards: Domain has no external dependencies → Application depends on Domain → Infrastructure depends on both.

### Module Setup

- **Type**: `"type": "module"` in `package.json` (ES Modules)
- **Output**: TypeScript compiles to ES2022 modules (all imports include `.js` extensions at runtime)
- **Node.js version**: 20+ required for native ES module support

### Directory Tree

```
backend/
├── src/
│   ├── config/              # Environment variables loader
│   │
│   ├── domain/              # THE "WHAT" - Pure Business Logic (no framework deps)
│   │   ├── entities/        # Core objects: User, Release, Track
│   │   └── repositories/    # Repository interfaces: IUserRepository, IReleaseRepository
│   │
│   ├── application/         # THE "HOW" - Use Cases (business orchestration)
│   │   ├── use-cases/       # SignUpUseCase, CreateReleaseUseCase, etc.
│   │   └── errors/          # Application-level custom errors
│   │
│   ├── infrastructure/      # THE "REALITY" - External tools & frameworks
│   │   ├── http/            # Fastify server, routes, controllers
│   │   │   ├── server.ts    # Entry point, plugin setup
│   │   │   ├── routes/      # Route groups (authRoutes, releaseRoutes)
│   │   │   └── middleware/  # JWT auth middleware
│   │   ├── database/        # PostgreSQL connection management
│   │   ├── repositories/    # SQL implementations of domain interfaces
│   │   ├── storage/         # Cloud storage service (S3 simulation)
│   │   ├── auth/            # JWT token generation, password hashing
│   │   ├── workers/         # Background jobs (upload, processing)
│   │   └── cli/             # Database migration runner
│   │
│   └── shared/              # Cross-cutting utilities
│       └── logger.ts        # Pino logger instance
│
├── migrations/              # SQL migration files
│   ├── 001_initial_schema.sql
│   └── seeds/               # Test data
│       └── 001_seed_users.sql
│
├── tests/                   # Unit & integration tests
├── logs/                    # Application logs (gitignored)
├── dist/                    # Compiled output (ESM)
├── package.json             # Dependencies, scripts
├── tsconfig.json            # TS → ES2022 modules
├── vite.config.ts          # Vitest configuration
└── README.md                # Backend quick start
```

### Execution Flow

```
HTTP Request
    ↓
Fastify Router (routes/*)
    ↓
Middleware (JWT, validation with Zod)
    ↓
Controller (infrastructure/http/controllers)
    ↓
Use Case (application/use-cases/*)
    ↓
Repository Interface (domain/repositories/*)
    ↓
Repository Implementation (infrastructure/repositories/*)
    ↓
Database Query (PostgreSQL)
```

### Key Architectural Decisions

1. **Domain Independence**: Domain layer has zero external dependencies. It contains only pure TypeScript entities and repository interfaces. This makes business logic testable without mocking frameworks.

2. **Shared Types**: API request/response DTOs are defined in `/shared` using Zod schemas. This ensures:
   - Type safety: Frontend build fails if backend changes API contract
   - Single source of truth: Both backend and frontend validate against same schema
   - Runtime validation: Zod provides both TypeScript types and runtime checks

3. **Repository Pattern**: 
   - **Domain**: `IUserRepository` interface (what we need)
   - **Infrastructure**: `UserRepository` implementation (how we do it)
   - Benefit: Business logic doesn't care which database we use

4. **Use Cases**: All business logic lives in use cases (`application/use-cases/`), not in controllers. This enables:
   - Testability without HTTP framework
   - Reusability across different transports
   - Clear separation: controller is just HTTP adapter

5. **Dependency Injection**: Manual injection (not a DI container) keeps dependencies explicit and graph small.

6. **ES Modules**: All imports include `.js` extensions for Node.js ESM compatibility.

## Frontend Structure (`/frontend`)

The frontend uses a **Feature-based Hybrid** architecture combining React Router v7 Framework Mode with feature modules. Routes are thin wrappers that compose feature components.

### Directory Tree

```
frontend/app/
├── features/             # Feature-based modules (PRIMARY CODE LOCATION)
│   ├── auth/             # Authentication feature
│   │   ├── components/   # LoginForm, SignupForm
│   │   ├── hooks/        # useAuth.tsx (AuthProvider + context)
│   │   ├── services/     # auth.service.ts (API calls)
│   │   ├── types/        # Type definitions directory
│   │   └── index.ts      # Public API (export { LoginForm, useAuth })
│   ├── artist/           # Artist dashboard feature
│   │   ├── components/   # DashboardStats, ReleaseCard, etc.
│   │   └── index.ts
│   └── admin/            # Admin feature
│       ├── components/   # AdminOverview, ApprovalQueue, etc.
│       └── index.ts
│
├── routes/              # React Router v7 route files (THIN wrappers)
│   ├── login.tsx        # Just composition, imports from features/auth
│   ├── signup.tsx       # Just composition, imports from features/auth
│   └── _dashboard.*.tsx # Dashboard routes (import from features)
│
├── components/          # Shared/Global UI components
│   ├── ui.tsx           # Button, Input, Card, Badge, Alert
│   ├── Sidebar.tsx      # Navigation sidebar
│   ├── AuthLayout.tsx   # Split-screen auth layout
│   └── FeaturePanels.tsx # Auth page feature panels
│
├── components/          # Shared/Global UI components
│   ├── ui.tsx           # Button, Input, Card, Badge, Alert, Modal
│   ├── Sidebar.tsx      # Navigation sidebar
│   ├── AuthLayout.tsx   # Split-screen auth layout
│   ├── ToastProvider.tsx # Toast notification provider
│   ├── ConfirmDialog.tsx # Reusable confirmation dialog
│   └── Modal.tsx        # Reusable modal wrapper
│
├── lib/                 # Utility libraries
│   ├── api.ts           # HTTP client with JWT/auth interceptor
│   └── toast.ts         # Toast notification helpers
│
├── root.tsx             # App root (wraps with AuthProvider, ToastProvider)
├── routes.ts            # React Router route configuration
└── app.css              # Global styles and Tailwind imports
```

### Execution Flow

```
HTTP Request to Backend
    ↓
API Service (lib/api.ts or features/*/services/)
    ↓
Response with JWT in Authorization header
    ↓
AuthContext updates (features/auth/hooks/useAuth)
    ↓
Component re-renders with new auth state
    ↓
UI reflects user role (Artist vs Admin dashboard)
```

### Key Architectural Decisions

1. **Feature-Based Modules**: All feature code lives in `features/`. Each feature is self-contained with components, hooks, services, and types.

2. **Public APIs**: Each feature exports a public API via `index.ts`. This enforces encapsulation:
   ```typescript
   // ✅ GOOD: Import from feature public API
   import { LoginForm, useAuth } from '~/features/auth';
   
   // ❌ BAD: Deep imports violate encapsulation
   import { LoginForm } from '~/features/auth/components/LoginForm';
   ```

3. **Thin Routes**: Route files are 10-25 lines of composition, not logic:
   ```tsx
   // app/routes/login.tsx
   import { useAuth, LoginForm } from '~/features/auth';
   
   export default function LoginPage() {
     const { login, isLoading, error } = useAuth();
     return <LoginForm onSubmit={login} isLoading={isLoading} error={error} />;
   }
   ```

4. **Services Layer**: API calls abstracted in `features/*/services/`. Components import from services, not making fetch calls directly. This enables:
   - Easy request/response transformation
   - Centralized error handling
   - Simple testing (mock service instead of fetch)

5. **HTTP Client**: `lib/api.ts` is a shared HTTP client with:
   - JWT token management (reads from AuthContext)
   - Error handling (transforms API errors to user-friendly messages)
   - Base URL configuration from `.env`

6. **Type Safety**: All API responses validated against `@vwaza/shared` types. If backend changes response shape, TypeScript build fails.

---

**See [Frontend README](../frontend/README.md) and [Frontend Implementation](./frontend-implementation-summary.md) for development details.**

This architecture ensures the codebase remains organized, testable, and easy to refactor as features grow.

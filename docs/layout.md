# Project Layout & Architecture

This document defines the file structure for the Release Manager. We follow a pragmatic **Clean Architecture** approach, ensuring separation of concerns and adherence to **SOLID** principles without unnecessary complexity.

## High-Level Structure

The project is structured as a monorepo containing the server, client, and shared code.

```
/
├── backend/         # Node.js (Fastify) API
├── frontend/        # React (Vite) Application
├── shared/          # Shared Types (DTOs), Enums, and Constants
├── docs/            # Project documentation
└── README.md        # Entry point
```

## Shared Structure (`/shared`)

To avoid duplication and ensure type safety across the stack, we define the "Contract" between frontend and backend here.

```
shared/
├── src/
│   ├── dtos/        # Data Transfer Objects (API Request/Response shapes)
│   ├── enums/       # Shared enums (e.g., ReleaseStatus, UserRole)
│   └── types/       # Shared interfaces (e.g., IErrorResponse)
├── package.json     # Defined as a workspace or simple package
└── tsconfig.json
```

## Backend Structure (`/backend`)

The backend follows **Clean Architecture** principles. Dependencies point inwards. The core business logic (Domain) depends on nothing. The Application layer depends on the Domain. The Infrastructure layer (Database, Web Framework) depends on everything.

### Directory Tree

```
backend/
├── src/
│   ├── config/              # Environment variables (e.g., DB_URL, AWS_KEYS)
│   │
│   ├── domain/              # THE "WHAT" (Pure Business Logic)
│   │   ├── entities/        # Core Business Objects (e.g., User, Release). Pure TS.
│   │   └── repositories/    # Interfaces/Contracts (e.g., IUserRepository). "I need a way to save a user."
│   │
│   ├── application/         # THE "HOW" (Orchestration)
│   │   ├── use-cases/       # User Actions (e.g., SignUpUser, CreateRelease). The "Manager" of the request.
│   │   └── services/        # Interfaces for external tools (e.g., IStorageService). "I need to upload a file."
│   │
│   ├── infrastructure/      # THE "REALITY" (External Tools & Frameworks)
│   │   ├── database/        # Database connection setup
│   │   ├── repositories/    # SQL Implementations (e.g., PostgresUserRepository). "Here is the SQL to save a user."
│   │   ├── storage/         # Real Cloud Code (e.g., S3StorageService). "Here is the AWS SDK code."
│   │   └── http/            # The Web Framework (Fastify)
│   │       ├── server.ts    # App entry point
│   │       ├── routes/      # URL definitions (e.g., POST /auth/signup)
│   │       └── controllers/ # The "Receptionist". Receives request -> Calls Use Case -> Returns Response.
│   │
│   └── shared/              # Utilities used across the backend
│
├── tests/                   # Integration and E2E tests
├── package.json
└── tsconfig.json
```

### Key Architectural Decisions

1.  **Shared Types (DTOs)**: We extract API request/response definitions to `/shared`. This ensures that if the Backend changes an API response, the Frontend build will fail immediately, providing end-to-end type safety.
2.  **Repositories Split**:
    *   **Domain (`domain/repositories`)**: Defines the *Interface* (The Contract). E.g., `save(user: User): Promise<void>`.
    *   **Infrastructure (`infrastructure/repositories`)**: Defines the *Implementation* (The Code). E.g., `INSERT INTO users...`.
    *   *Why?* This allows us to write business logic that doesn't care which database we use.
3.  **Use Cases**: Business logic (like the "Ingestion Pipeline" state changes) lives in `application/use-cases`, not in controllers. This makes logic testable and independent of Fastify.
4.  **Dependency Injection**: We will manually inject dependencies (Repositories into Use Cases, Use Cases into Controllers) to maintain loose coupling.

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
├── lib/                 # Utility libraries
│   └── api.ts           # HTTP client with JWT handling
│
├── root.tsx             # App root (wraps with AuthProvider)
├── routes.ts            # Route configuration
└── app.css              # Global styles
```

### Key Architectural Decisions

1.  **Feature-Based Hybrid**: Code lives in `features/` modules. Routes in `app/routes/` are thin wrappers (10-25 lines) that compose feature components. This combines React Router v7 Framework Mode with feature isolation.
2.  **Public APIs**: Each feature exports a public API via `index.ts`. Import from `~/features/auth`, never from deep paths like `~/features/auth/components/LoginForm`.
3.  **Type Directories**: Types organized as directories (`types/index.ts`), not single files, for better organization as features grow.
4.  **Thin Routes**: Route files just compose feature components:
    ```tsx
    // app/routes/login.tsx - 18 lines
    import { useAuth, LoginForm } from '~/features/auth';
    export default function LoginPage() {
      const { login, isLoading, error } = useAuth();
      return <LoginForm onSubmit={login} isLoading={isLoading} error={error} />;
    }
    ```
5.  **Services Layer**: API calls abstracted in `features/*/services/`, keeping components clean of `fetch` calls.

---

This layout ensures that as the application grows, the code remains organized, testable, and easy to refactor.

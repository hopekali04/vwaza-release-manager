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

The frontend uses a **Feature-based** architecture. This keeps related components, hooks, and state logic together, making the codebase scalable and easier to navigate.

### Directory Tree

```
frontend/
├── src/
│   ├── assets/              # Static assets (images, fonts)
│   ├── components/          # Shared/Generic UI components (Buttons, Inputs)
│   ├── config/              # App configuration (API URLs, constants)
│   ├── context/             # Global state (AuthContext, ThemeContext)
│   ├── hooks/               # Shared custom hooks
│   ├── layouts/             # Page layouts (DashboardLayout, AuthLayout)
│   ├── lib/                 # Third-party library configurations (axios, etc.)
│   ├── pages/               # Route components (Page level only)
│   ├── services/            # API client definitions
│   ├── types/               # Shared TypeScript interfaces
│   │
│   ├── features/            # Feature-specific modules
│   │   ├── auth/            # Authentication feature
│   │   ├── artist/          # Artist dashboard features
│   │   ├── admin/           # Admin dashboard features
│   │   └── release/         # Release management (Wizard, Status)
│   │       ├── components/  # Feature-specific components
│   │       ├── hooks/       # Feature-specific logic
│   │       └── types/       # Feature-specific types
│   │
│   ├── App.tsx              # Root component
│   └── main.tsx             # Entry point
│
├── public/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Key Architectural Decisions

1.  **Features Directory**: Most code lives in `features/`. If a component is only used for the "Release Wizard", it belongs in `features/release/components`, not the global `components` folder.
2.  **Smart vs. Dumb Components**:
    *   **Pages/Containers** (Smart): Handle data fetching and state, pass data down.
    *   **Components** (Dumb): Focus on UI rendering based on props.
3.  **Services Layer**: API calls are abstracted in `services/` or `features/*/api`, keeping components clean of `fetch` calls.

---

This layout ensures that as the application grows, the code remains organized, testable, and easy to refactor.

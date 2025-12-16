# Vwaza Release Manager

A comprehensive music release management platform built with Clean Architecture principles. Artists submit releases with metadata and cover art; admins review and approve for distribution.

## Quick Start

```bash
# Install dependencies
pnpm install

# Backend setup
cd backend
cp .env.example .env  # Edit with your PostgreSQL credentials
pnpm db:setup         # Create database, run migrations, seed test data
pnpm dev              # Start backend (port 4000) with hot reload

# Frontend setup (in new terminal)
cd frontend
pnpm dev              # Start frontend (port 5173)
```

**Test Credentials:**
- Admin: `admin@vwaza.com` / `Admin@123`
- Artist: `artist@vwaza.com` / `Artist@123`

## Documentation

### Project Overview
- **[Project Layout & Architecture](./docs/layout.md)** - Clean Architecture structure, directory organization, and design principles
- **[Data Model](./docs/data-model.md)** - Domain entities and relationships

### Backend (Fastify + PostgreSQL)
- **[Backend README](./backend/README.md)** - Quick start and available commands
- **[Database Schema](./docs/database-schema.md)** - PostgreSQL schema, enums, constraints, and indexes
- **[Setup & Database](./docs/setup-auth-db.md)** - Detailed environment setup and database configuration
- **[Background Workers](./docs/workers.md)** - Upload and Processing worker architecture
- **[Resilience & Error Handling](./docs/resilience.md)** - Fault tolerance, retries, and error recovery patterns

### Frontend (React Router v7 + Vite)
- **[Frontend README](./frontend/README.md)** - Quick start and build commands
- **[Frontend Implementation](./docs/frontend-implementation-summary.md)** - Feature structure, authentication flow, and component patterns
- **[Frontend Testing](./docs/frontend-testing.md)** - Testing strategies and best practices

### API Documentation
- **Swagger UI**: Available at `http://localhost:4000/docs` when backend is running

## Project Structure

```
vwaza-release-manager/
├── backend/              # Fastify API (Clean Architecture)
│   ├── src/
│   │   ├── domain/       # Entities & repository interfaces
│   │   ├── application/  # Use cases
│   │   ├── infrastructure/ # Fastify, PostgreSQL, workers, auth
│   │   ├── config/       # Environment loading
│   │   └── shared/       # Logger
│   ├── migrations/       # Database migrations
│   └── tests/            # Unit & integration tests
│
├── frontend/             # React Router v7 + Vite
│   ├── app/
│   │   ├── routes/       # Page components (file-based routing)
│   │   ├── features/     # Self-contained feature modules
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React Context (auth)
│   │   └── services/     # API clients
│   └── public/           # Static assets
│
├── shared/               # TypeScript types & Zod schemas
│   ├── src/
│   │   ├── schemas/      # Zod validation schemas
│   │   ├── enums/        # Shared enums (UserRole, ReleaseStatus)
│   │   └── types/        # TypeScript interfaces
│
└── docs/                 # Comprehensive documentation
```

## Available Commands

### Root (Monorepo)
```bash
pnpm install              # Install all dependencies
pnpm build                # Build all packages
```

### Backend (`cd backend`)
```bash
pnpm dev                  # Start dev server with hot reload
pnpm build                # Compile TypeScript
pnpm start                # Run production build
pnpm db:setup             # Migrate + seed database
pnpm db:migrate           # Run pending migrations
pnpm db:seed              # Seed test data
pnpm test                 # Run Vitest unit tests
pnpm test:coverage        # Generate coverage report
pnpm lint                 # ESLint check
pnpm format               # Prettier format
```

### Frontend (`cd frontend`)
```bash
pnpm dev                  # Start dev server
pnpm build                # Production build
pnpm lint                 # ESLint check
pnpm format               # Prettier format
```

### Shared (`cd shared`)
```bash
pnpm build                # Compile TypeScript (always run after schema changes)
pnpm watch                # Watch for changes
```

## Architecture Highlights

### Clean Architecture
- **Domain**: Pure business logic (entities, repository interfaces)
- **Application**: Use cases orchestrating business operations
- **Infrastructure**: Framework integration (Fastify, PostgreSQL, S3 simulation)
- **Dependencies point inward** - no domain code depends on infrastructure

### Type Safety
- TypeScript strict mode across all packages
- Zod runtime validation for API requests
- Shared types via `@vwaza/shared` workspace package
- No `any` types allowed

### Authentication & Authorization
- JWT-based authentication with Fastify middleware
- Role-based access control (ARTIST, ADMIN)
- Password hashing with bcrypt

### Database
- PostgreSQL with native enums for type safety
- UUID primary keys
- Foreign key constraints with cascading deletes
- Migrations in `backend/migrations/`
- Test seed in `backend/migrations/seeds/`

### Background Workers
- **Upload Worker**: Processes file uploads, simulates S3 upload (5s polling)
- **Processing Worker**: Transitions releases through workflow states (10s polling)
- Auto-start/stop with server lifecycle

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- pnpm 8+

## Environment Setup

### Backend `.env`
```
NODE_ENV=development
PORT=4000
HOST=0.0.0.0
CORS_ORIGIN=http://localhost:5173

DATABASE_URL=postgresql://user:password@localhost:5432/vwaza_release_manager
# OR individual settings:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vwaza_release_manager
DB_USER=postgres
DB_PASSWORD=password

JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:4000
```

## Testing

```bash
# Backend unit tests
cd backend && pnpm test

# Coverage report
cd backend && pnpm test:coverage
```

## Key Dependencies

### Backend
- **fastify**: HTTP framework with plugin ecosystem
- **pg**: PostgreSQL client
- **@fastify/jwt**: JWT authentication
- **zod**: Runtime validation + TypeScript inference
- **bcrypt**: Password hashing
- **pino**: Structured logging

### Frontend
- **react-router**: File-based routing (v7)
- **vite**: Next-gen build tool
- **typescript**: Type safety
- **shadcn/ui**: Component library (if used)

##  Deployment

### Backend
1. Run migrations: `pnpm db:migrate`
2. Build: `pnpm build`
3. Start: `pnpm start`
4. Workers auto-start on server initialization

### Frontend
1. Build: `pnpm build`
2. Serve `build/` directory with your hosting provider

##  Security

- All API endpoints protected by JWT middleware
- Role-based authorization checks in use cases
- CORS configured to frontend origin only (development)
- Rate limiting enabled on authentication endpoints
- Helmet middleware for security headers
- Zod schema validation on all inputs

## Deep Dives

For comprehensive documentation on specific topics:
- **[Layout & Architecture](./docs/layout.md)** - Detailed project structure and design patterns
- **[Database Schema](./docs/database-schema.md)** - SQL design, constraints, performance
- **[Workers](./docs/workers.md)** - Background job processing architecture
- **[Frontend Implementation](./docs/frontend-implementation-summary.md)** - React patterns and feature structure
- **[Resilience](./docs/resilience.md)** - Error handling and fault tolerance

## Troubleshooting

**Backend won't start?**
- Check PostgreSQL is running: `psql -U postgres`
- Verify database exists: `psql -l | grep vwaza`
- Check `.env` variables are set correctly
- View logs: `tail -f backend/logs/app.log`

**Frontend hot reload not working?**
- Clear `.next` or `dist/` folder
- Restart dev server: `pnpm dev`
- Check that backend is responding: `curl http://localhost:4000/health`

**Tests failing?**
- Clear node_modules: `pnpm install`
- Reset database: `pnpm db:setup`
- Check NODE_ENV is not `production`


# Vwaza Release Manager - Backend

Fastify backend following Clean Architecture principles.

## Quick Start

```bash
# Install dependencies (from project root)
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Create database
createdb vwaza_release_manager

# Run migrations and seed
pnpm db:setup

# Start development server
pnpm dev
```

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- pnpm 8+

## Available Commands

### Development

```bash
pnpm dev           # Run with hot reload (tsx watch)
pnpm build         # Compile TypeScript to dist/
pnpm start         # Run compiled production build
```

### Database

```bash
pnpm db:migrate    # Run pending migrations
pnpm db:seed       # Seed database with test data
pnpm db:setup      # First-time: migrate + seed
```

Test users created by seed:

- Admin: `admin@vwaza.com` / `Admin@123`
- Artist: `artist@vwaza.com` / `Artist@123`

### Testing & Code Quality

```bash
pnpm test          # Run Vitest unit tests
pnpm test:coverage # Generate coverage report
pnpm lint          # ESLint check
pnpm format        # Prettier format
```

### API Endpoints

### Health Check

- `GET /health` - Server and database status

### Authentication

- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Login

### API Documentation

- `GET /docs` - Interactive Swagger UI documentation

### Releases (Coming Soon)

- `GET /api/releases` - List releases
- `POST /api/releases` - Create draft release
- `POST /api/releases/:id/submit` - Submit for review

### Admin (Coming Soon)

- `POST /api/admin/releases/:id/approve` - Approve release
- `POST /api/admin/releases/:id/reject` - Reject release

## Architecture

This backend follows Clean Architecture with strict separation of concerns:

```
src/
├── domain/          # Pure business logic (entities + repository interfaces)
├── application/     # Use cases (orchestration)
├── infrastructure/  # Framework code (Fastify, PostgreSQL, AWS)
│   ├── auth/        # JWT + password hashing + middleware
│   ├── database/    # pg.Pool connection management
│   ├── workers/     # Background processing
│   ├── http/        # Fastify server, routes, controllers
│   └── cli/         # Database migration runner
├── config/          # Environment variable loading
└── shared/          # Cross-cutting (logger)
```

See `/docs/layout.md` for detailed architecture documentation.

## Background Workers

Two workers run automatically:

1. **Upload Worker** (5s): Processes upload jobs, uploads to S3
2. **Processing Worker** (10s): Moves releases through pipeline

See `docs/workers.md` for details.

## Logging

All requests, responses, and errors automatically logged with:

- Request ID (for distributed tracing)
- Endpoint + method + user
- Response time + status codes

Logs: `logs/app.log` + console (dev)

## Type Safety

- TypeScript strict mode enabled
- No `any` types allowed
- Shared types via `@vwaza/shared` workspace

## Links

- [Architecture Docs](../docs/layout.md)
- [Database Schema](../docs/database-schema.md)
- [Auth Setup](../docs/setup-auth-db.md)
- [Worker Patterns](../docs/workers.md)

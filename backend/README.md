# Backend API - Vwaza Release Manager

Fastify REST API with Clean Architecture, JWT authentication, and PostgreSQL database.

**See [main README](../README.md) for project overview and links to all documentation.**

## 🚀 Quick Start

```bash
# From project root
pnpm install

# Backend setup
cd backend
cp .env.example .env    # Edit with your database credentials
pnpm db:setup           # Create DB, run migrations, seed test data
pnpm dev                # Start dev server (hot reload)
```

**Test Credentials:**
```
Admin:  admin@vwaza.com / Admin@123
Artist: artist@vwaza.com / Artist@123
```

## 📍 Access Points

- **API**: `http://localhost:4000`
- **Swagger Docs**: `http://localhost:4000/docs`
- **Health Check**: `http://localhost:4000/health`

## ⚙️ Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start with hot reload |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run production build |
| `pnpm db:setup` | Create DB, migrate, seed (first-time) |
| `pnpm db:migrate` | Run pending migrations |
| `pnpm db:seed` | Seed test data |
| `pnpm test` | Run Vitest unit tests |
| `pnpm test:coverage` | Generate coverage report |
| `pnpm lint` | ESLint check |
| `pnpm format` | Prettier format |

## 🏗️ Architecture

Clean Architecture with dependencies pointing inward:

```
src/
├── domain/              # Entities & repository interfaces
├── application/         # Use cases (business logic orchestration)
├── infrastructure/
│   ├── http/            # Fastify server, routes, controllers
│   ├── database/        # PostgreSQL connection & queries
│   ├── auth/            # JWT & password hashing
│   ├── workers/         # Background jobs (upload, processing)
│   ├── storage/         # Cloud storage simulation (S3)
│   ├── repositories/    # Data access implementations
│   └── cli/             # Database migration runner
├── config/              # Environment variables
└── shared/              # Logger
```

**See [Layout & Architecture](../docs/layout.md) for detailed breakdown.**

## 🔑 Key Features

### Authentication & Authorization
- JWT-based with secure middleware
- Role-based access control (ARTIST, ADMIN)
- bcrypt password hashing with complexity validation
- Automatic token injection in secured endpoints

### Database
- PostgreSQL with native enums (type safety at DB level)
- UUID primary keys
- Foreign key constraints with cascading deletes
- Migrations tracked in `migrations/`
- Seed data in `migrations/seeds/`

**See [Database Schema](../docs/database-schema.md) for full schema details.**

### Background Workers
Two auto-starting workers process jobs asynchronously:
- **Upload Worker** (5s): Processes file uploads, simulates S3 storage
- **Processing Worker** (10s): Transitions releases through workflow states

**See [Workers](../docs/workers.md) for architecture & error handling.**

### Logging
- Structured JSON logs with Pino
- Request IDs for distributed tracing
- Automatic response time tracking
- Logs in `logs/app.log` + console (dev)

### API Documentation
- **Swagger UI** at `/docs` with interactive endpoint testing
- Full request/response schemas
- Authentication examples

## 📋 Environment Setup

Create `.env` file (copy from `.env.example`):

```env
# Server
NODE_ENV=development
PORT=4000
HOST=0.0.0.0
CORS_ORIGIN=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vwaza_release_manager
# OR individual settings:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vwaza_release_manager
DB_USER=postgres
DB_PASSWORD=password

# Security
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log
```

**See [Setup & Database](../docs/setup-auth-db.md) for detailed configuration.**

## 🧪 Testing

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test --watch

# Coverage report
pnpm test:coverage
```

Tests use Vitest with mocked dependencies. See `tests/` directory for examples.

## 📦 Key Dependencies

- **fastify** - HTTP framework with plugins
- **pg** - PostgreSQL client
- **@fastify/jwt** - JWT authentication
- **@fastify/rate-limit** - Rate limiting (v9 for Fastify v4)
- **zod** - Runtime validation + TypeScript inference
- **bcrypt** - Secure password hashing
- **pino** - Structured logging

## 🔒 Security

- JWT middleware protects all `/api/*` routes
- Authorization checks in use cases (principle of least privilege)
- CORS restricted to frontend origin
- Rate limiting on auth endpoints
- Helmet for security headers
- Input validation with Zod schemas
- Password validation: 8+ chars, mixed case, numbers, special chars

## 📚 Documentation Links

- **[Architecture & Layout](../docs/layout.md)** - Directory structure and design patterns
- **[Database Schema](../docs/database-schema.md)** - SQL schema, enums, indexes
- **[Workers](../docs/workers.md)** - Background job architecture
- **[Setup & Configuration](../docs/setup-auth-db.md)** - Detailed environment & database setup
- **[Data Model](../docs/data-model.md)** - Domain entities and relationships
- **[Resilience & Error Handling](../docs/resilience.md)** - Fault tolerance patterns

## 🐛 Troubleshooting

**Database connection error?**
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Create database if missing
createdb vwaza_release_manager

# Re-run migrations
pnpm db:setup
```

**Port already in use?**
```bash
# Change PORT in .env
# Or kill process on port 4000 (Linux/Mac):
lsof -ti:4000 | xargs kill -9
```

**Workers not starting?**
- Check logs: `tail -f logs/app.log`
- Ensure database is connected
- Verify user has permission to create tables

## 📞 Support

Check [main README](../README.md) for project-wide help and links to frontend/shared docs.

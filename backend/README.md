# Vwaza Release Manager - Backend

Fastify backend.

## Getting Started

### Prerequisites
- Node.js 20+ 
- PostgreSQL 15+
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Development

```bash
# Run in development mode with hot reload
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Lint code
pnpm lint

# Format code
pnpm format
```

### API Endpoints

- `GET /health` - Health check endpoint

## Architecture

This backend follows Clean Architecture with strict separation of concerns:

- **Domain Layer**: Pure business logic and entities
- **Application Layer**: Use cases and orchestration
- **Infrastructure Layer**: Framework-specific code (Fastify, PostgreSQL, AWS)

See `/docs/layout.md` for detailed architecture documentation.

## Logging

All requests, responses, and errors are automatically logged with:
- Request ID for tracing
- Endpoint called
- User/actor information
- Response time
- Status codes

## Type Safety

- TypeScript strict mode enabled
- No `any` types allowed
- Comprehensive error handling

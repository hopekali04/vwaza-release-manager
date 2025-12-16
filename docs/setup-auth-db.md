# Authentication & Database Setup Guide

## Quick Start

```bash
# 1. Install dependencies
cd backend && pnpm install
cd ../shared && pnpm install

# 2. Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# 3. Create database
createdb vwaza_release_manager

# 4. Run migrations
cd backend
pnpm db:migrate

# 5. Seed database (optional - creates test users)
pnpm db:seed

# 6. Start server
pnpm dev
```

## Database Setup

### Prerequisites
- PostgreSQL 13+ installed and running
- Database user with CREATE DATABASE privileges

### Create Database

```bash
# Using psql
psql -U postgres -c "CREATE DATABASE vwaza_release_manager;"

# Or using createdb
createdb -U postgres vwaza_release_manager
```

### Run Migrations

Migrations are located in `backend/migrations/` and run sequentially:

```bash
cd backend
pnpm db:migrate
```

This will:
1. Create `migrations` tracking table
2. Execute all pending `.sql` files in order
3. Record applied migrations to prevent re-running

### Seed Database

Seeds are located in `backend/migrations/seeds/`:

```bash
pnpm db:seed
```

This creates:
- Admin user: `admin@vwaza.com` (password: `Admin@123`)
- Test artist: `artist@vwaza.com` (password: `Artist@123`)
- Demo release for testing


### Combined Setup

```bash
pnpm db:setup  # Runs migrate + seed
```

## Authentication

### JWT Configuration

Set in `.env`:

```bash
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=1h  # Access token lifetime
```

### Password Requirements

Passwords must:
- Be at least 8 characters
- Contain uppercase letter
- Contain lowercase letter
- Contain number
- Contain special character

### Protected Routes

Use authentication middleware:

```typescript
import { authenticate, authorize } from '@infrastructure/auth';
import { UserRole } from '@vwaza/shared';

// Require authentication
server.get('/api/profile', 
  { preHandler: authenticate },
  async (request: AuthenticatedRequest) => {
    return { user: request.user };
  }
);

// Require specific role
server.post('/api/admin/releases/:id/approve',
  { preHandler: [authenticate, authorize(UserRole.ADMIN)] },
  async (request) => {
    // Only admins can access
  }
);
```

### Example: Sign Up Flow

```typescript
import { hashPassword, validatePassword } from '@infrastructure/auth';
import { generateAccessToken } from '@infrastructure/auth';

// 1. Validate password
const validation = validatePassword(password);
if (!validation.valid) {
  throw new Error(validation.error);
}

// 2. Hash password
const passwordHash = await hashPassword(password);

// 3. Save user to database
await pool.query(
  'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
  [email, passwordHash, UserRole.ARTIST]
);

// 4. Generate JWT
const token = generateAccessToken({
  userId: user.id,
  email: user.email,
  role: user.role,
});

// 5. Return to client
return { accessToken: token };
```

## Background Workers

Workers start automatically with the server. See `docs/workers.md` for details.

### Worker Configuration

Located in `infrastructure/workers/`:
- `upload-worker.ts` - Polls every 5s for pending uploads
- `processing-worker.ts` - Polls every 10s for releases to process

Workers use the same database pool as the HTTP server.

## Troubleshooting

### Migration Errors

**Error**: `relation "migrations" does not exist`

**Fix**: The migrations table is auto-created. If it fails:

```sql
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Authentication Errors

**Error**: `Missing authorization token`

**Fix**: Include JWT in request header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:4000/api/profile
```

### Database Connection Errors

**Error**: `ECONNREFUSED` or `FATAL: database "vwaza_release_manager" does not exist`

**Fix**: 
1. Ensure PostgreSQL is running: `pg_isready`
2. Create database: `createdb vwaza_release_manager`
3. Check `.env` credentials match PostgreSQL user

### Worker Not Processing Jobs

**Check**: Workers log to `backend/logs/app.log`

```bash
tail -f backend/logs/app.log | grep worker
```

**Common Issues**:
- Database connection failed (workers can't poll)
- No jobs in database (insert test job)
- Workers not started (check server startup logs)

## CLI Commands Reference

```bash
# Development
pnpm dev              # Start with hot reload
pnpm build            # Compile TypeScript
pnpm start            # Run compiled code

# Database
pnpm db:migrate       # Run pending migrations
pnpm db:seed          # Seed database
pnpm db:setup         # Migrate + seed

# Testing
pnpm test             # Run unit tests
pnpm test:coverage    # Coverage report

# Code Quality
pnpm lint             # ESLint check
pnpm format           # Prettier format
```

## Security Checklist

Before production:
- [ ] Change `JWT_SECRET` to cryptographically random string (min 32 chars)
- [ ] Set `JWT_EXPIRES_IN` to short duration (15m - 1h)
- [ ] Update seed file passwords with real bcrypt hashes
- [ ] Set `NODE_ENV=production`
- [ ] Use environment-specific `.env` files
- [ ] Rotate JWT secret periodically
- [ ] Implement refresh token flow
- [ ] Add rate limiting (e.g., `@fastify/rate-limit`)
- [ ] Enable HTTPS only
- [ ] Configure proper CORS origins (not `*`)

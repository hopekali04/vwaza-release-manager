# Vwaza Frontend - Quick Reference

## Quick Start

```bash
# Setup (one time)
pnpm install
cd frontend && cp .env.example .env

# Development (two terminals)
# Terminal 1:
cd backend && pnpm dev

# Terminal 2:
cd frontend && pnpm dev
```

**Frontend:** http://localhost:5173  
**Backend:** http://localhost:3000

## Demo Accounts

```
Artist: artist@vwaza.com / Artist@123
Admin:  admin@vwaza.com  / Admin@123
```

## Key Files

| File                   | Purpose              |
| ---------------------- | -------------------- |
| `app/features/auth/`   | Auth feature module  |
| `app/features/artist/` | Artist feature       |
| `app/features/admin/`  | Admin feature        |
| `app/lib/api.ts`       | HTTP client with JWT |

## UI Components

```tsx
import { Button, Input, Card, Badge, Alert } from '~/components/ui';

<Button variant="primary" isLoading={loading}>Save</Button>
<Input label="Email" error={errors.email} />
<Card className="p-6">Content</Card>
<Badge status="PUBLISHED" />
<Alert variant="error">Error message</Alert>
```

## Auth Hook

```tsx
import { useAuth } from "~/features/auth";

const { user, login, logout, isAuthenticated } = useAuth();

// Login
await login({ email: "test@example.com", password: "Test@123" });

// Access user
console.log(user?.email, user?.role);

// Logout
logout();
```

## API Client

```tsx
import { apiClient } from "~/lib/api";

// GET
const data = await apiClient.get("/api/releases");

// POST
const created = await apiClient.post("/api/releases", { title: "Album" });

// Errors
try {
  await apiClient.post("/api/auth/signin", data);
} catch (error) {
  console.error(error.message); // User-friendly message
}
```

## Routes

| Path               | Component        | Access |
| ------------------ | ---------------- | ------ |
| `/`                | Login            | Public |
| `/signup`          | Signup           | Public |
| `/dashboard`       | Artist Dashboard | Artist |
| `/releases`        | My Releases      | Artist |
| `/analytics`       | Analytics        | Artist |
| `/admin`           | Admin Overview   | Admin  |
| `/admin/approvals` | Approval Queue   | Admin  |
| `/admin/users`     | User Management  | Admin  |
| `/settings`        | Settings         | Both   |

## Adding a New Route

1. **Create file:** `app/routes/_dashboard.mypage.tsx`
2. **Add to config:**
   ```ts
   // app/routes.ts
   route("mypage", "routes/_dashboard.mypage.tsx");
   ```
3. **Add to sidebar:**
   ```tsx
   // app/components/Sidebar.tsx
   { path: '/mypage', label: 'My Page', icon: Star }
   ```

## Design Tokens

```css
/* Colors */
--primary:
  #ccff00 /* Neon yellow */ --bg: #000000 /* Black */ --card: #171717
    /* neutral-900 */ --text: #ffffff /* White */ --text-muted: #a3a3a3
    /* neutral-400 */ /* Spacing */ p-4,
  p-6, p-8, p-12 /* Padding */ gap-2, gap-4,
  gap-6 /* Flex gap */ /* Shadows */ border border-white/5 /* Subtle border */
    bg-neutral-900/50 /* Semi-transparent */;
```

## Common Issues

**Cannot connect to backend**

```bash
# Ensure backend is running
cd backend && pnpm dev
curl http://localhost:3000/health
```

**Auth not persisting**

```bash
# Check localStorage in DevTools
Application → Local Storage → vwaza_token
```

**Module not found**

```bash
pnpm install
rm -rf node_modules/.vite && pnpm dev
```

## Documentation

- **Setup Guide:** `docs/frontend-testing.md`
- **Architecture:** `docs/frontend.md`
- **Implementation:** `docs/frontend-implementation-summary.md`
- **Quick Start:** `frontend/README_VWAZA.md`

## 🔧 Dev Commands

```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm start      # Run production server
pnpm typecheck  # Check TypeScript
```

## What Works

- Login/logout
- Signup with validation
- Protected routes
- Role-based dashboards
- Sidebar navigation
- Error handling
- JWT auth with backend

## Placeholder Routes

- Release management
- Analytics
- User management
- Settings

---

**Quick Test:**

```bash
cd frontend && pnpm dev
# Visit http://localhost:5173
# Login with: artist@vwaza.com / Test@123
```

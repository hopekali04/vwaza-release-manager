# Vwaza Frontend

React application for the Vwaza Release Manager platform. Built with React Router v7, TypeScript, and Tailwind CSS.

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Backend API running on `http://localhost:4000`

### Setup

```bash
# Install dependencies (from project root)
pnpm install

# Configure environment
cp .env.example .env

# Start development server
cd frontend
pnpm dev
```

Visit `http://localhost:5173`

### Demo Credentials

```
Artist Account:
Email: artist@vwaza.com
Password: Test@123

Admin Account:
Email: admin@vwaza.com
Password: Test@123
```

## Available Scripts

```bash
pnpm dev        # Start dev server with HMR
pnpm build      # Build for production
pnpm start      # Run production server
pnpm typecheck  # Run TypeScript checks
```

## Tech Stack

- **React 19** with TypeScript (strict mode)
- **React Router v7** with file-based routing
- **Tailwind CSS 4** for styling
- **Lucide React** for icons
- **Vite 7** for fast builds

## Key Features

✅ **JWT Authentication** with backend integration  
✅ **Role-based dashboards** (Artist & Admin)  
✅ **Protected routes** with auto-redirect  
✅ **Responsive design** with clean, minimal aesthetic  
✅ **Type-safe API client** with error handling  
✅ **Reusable UI components** following design system

## Project Structure

```
app/
├── components/       # Reusable UI (Button, Input, Card, etc.)
├── contexts/         # React Context (AuthContext)
├── lib/              # Utilities (API client)
├── services/         # API services (auth.service.ts)
├── routes/           # React Router v7 routes
│   ├── login.tsx           # Login page
│   ├── signup.tsx          # Signup page
│   ├── _dashboard.tsx      # Protected layout
│   └── _dashboard.*.tsx    # Dashboard views
├── root.tsx          # App root
└── routes.ts         # Route configuration
```

## Architecture

### Authentication Flow

1. User logs in → JWT token stored in localStorage
2. `AuthContext` manages global auth state
3. Protected routes check auth before rendering
4. API client auto-attaches token to requests
5. On auth error, user redirected to login

### Routing (React Router v7)

File-based routing with nested layouts:

- `/login` → Public login page
- `/signup` → Public signup page
- `/dashboard` → Artist dashboard (protected)
- `/admin` → Admin dashboard (protected)
- `/admin/approvals` → Admin approval queue (protected)

The `_dashboard.tsx` layout wraps all protected routes and checks authentication.

### API Integration

All backend API calls go through `lib/api.ts`:

```typescript
import { apiClient } from '~/lib/api';

// GET request
const releases = await apiClient.get('/api/releases');

// POST request
const newRelease = await apiClient.post('/api/releases', { title: 'My Album' });
```

Auth tokens are automatically included when available.

## Development

### Adding a New Route

1. Create file in `app/routes/` (e.g., `_dashboard.releases.tsx`)
2. Add route to `app/routes.ts`:
   ```typescript
   route("releases", "routes/_dashboard.releases.tsx")
   ```
3. Add nav link to `components/Sidebar.tsx`

### Using Auth

```tsx
import { useAuth } from '~/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <div>
      <p>Welcome {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Reusable Components

Always use components from `components/ui.tsx`:

```tsx
import { Button, Input, Card, Badge, Alert } from '~/components/ui';

<Button variant="primary" isLoading={loading}>
  Submit
</Button>

<Input label="Email" error={errors.email} />
<Card className="p-6">Content</Card>
<Badge status="PUBLISHED" />
<Alert variant="error">Error message</Alert>
```

## Design System

- **Primary Color**: `#ccff00` (neon yellow)
- **Background**: Black (`#000000`)
- **Cards**: Dark gray with glassmorphism
- **Typography**: Inter font (Google Fonts)

## Environment Variables

```bash
VITE_API_URL=http://localhost:4000  # Backend API URL
```

## Troubleshooting

**Cannot connect to backend**
- Ensure backend is running: `cd backend && pnpm dev`
- Check `VITE_API_URL` in `.env`

**Module not found errors**
- Run `pnpm install` from project root
- Clear Vite cache: `rm -rf node_modules/.vite`

**Auth not persisting**
- Check browser localStorage
- Ensure backend JWT_SECRET is set

## Documentation

See [docs/frontend.md](../docs/frontend.md) for comprehensive documentation including:
- Complete API integration guide
- Component API reference
- Architecture decisions
- Future enhancement plans

## Contributing

1. Follow TypeScript strict mode (no `any` types)
2. Use existing UI components for consistency
3. Add error handling to all API calls
4. Test with both Artist and Admin roles
5. Update documentation when adding features

## License

MIT

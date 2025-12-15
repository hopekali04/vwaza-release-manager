# Vwaza Frontend Documentation

## Overview

The Vwaza frontend is a React application built with React Router v7, TypeScript, and Tailwind CSS. It provides separate dashboards for Artists and Administrators to manage music releases.

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Routing**: React Router v7 (file-based routing)
- **Styling**: Tailwind CSS (clean, minimal design)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Type Safety**: Strict TypeScript

## Project Structure

```
frontend/app/
├── features/           # Feature-based modules (NEW!)
│   ├── auth/          # Authentication feature
│   │   ├── components/    # LoginForm, SignupForm
│   │   ├── hooks/         # useAuth.tsx (AuthProvider + context)
│   │   ├── services/      # auth.service.ts (API calls)
│   │   ├── types/         # Type definitions
│   │   └── index.ts       # Public API exports
│   ├── artist/        # Artist dashboard feature
│   │   ├── components/    # DashboardStats
│   │   └── index.ts
│   └── admin/         # Admin feature
│       ├── components/    # AdminOverview
│       └── index.ts
├── components/         # Global UI components
│   ├── ui.tsx         # Button, Input, Card, Badge, Alert
│   ├── Sidebar.tsx    # Navigation sidebar
│   ├── AuthLayout.tsx # Split-screen auth layout
│   └── FeaturePanels.tsx  # Auth page feature panels
├── lib/               # Utility libraries
│   └── api.ts         # HTTP client with auth token handling
├── routes/            # React Router v7 routes (THIN wrappers)
│   ├── login.tsx      # Login page (imports from features/auth)
│   ├── signup.tsx     # Signup page (imports from features/auth)
│   ├── _dashboard.tsx # Dashboard layout (protected)
│   ├── _dashboard.dashboard.tsx   # Artist dashboard (imports from features/artist)
│   ├── _dashboard.admin.tsx       # Admin overview (imports from features/admin)
│   └── _dashboard.admin.approvals.tsx  # Admin approval queue
├── root.tsx           # App root with AuthProvider
├── routes.ts          # Route configuration
└── app.css            # Global styles
```

## Key Features

### Authentication System

**Files**: `features/auth/hooks/useAuth.tsx`, `features/auth/services/auth.service.ts`, `lib/api.ts`

- JWT-based authentication with backend
- Token stored in localStorage
- Automatic auth state restoration on page load
- Protected routes with role-based access control
- Error handling with user-friendly messages
- Feature-based architecture with public API exports

**Usage**:
```tsx
import { useAuth } from '~/features/auth';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Access user data
  console.log(user?.email, user?.role);
  
  // Login
  await login({ email: 'user@example.com', password: 'Test@123' });
  
  // Logout
  logout();
}
```

### API Client

**File**: `lib/api.ts`

Centralized HTTP client that:
- Automatically attaches JWT token to requests
- Handles errors with proper typing
- Provides clean REST methods (get, post, put, delete)

**Usage**:
```tsx
import { apiClient } from '~/lib/api';

const data = await apiClient.get('/api/releases');
const created = await apiClient.post('/api/releases', { title: 'New Album' });
```

### Reusable Components

**File**: `components/ui.tsx`

Clean, minimal components matching the project aesthetic:

- **Button**: Primary, secondary, ghost, danger, google variants
- **Input**: Form input with label and error display
- **Card**: Container with glassmorphism effect
- **Badge**: Status badges (DRAFT, PENDING_REVIEW, PUBLISHED, REJECTED)
- **Alert**: Error, success, info, warning alerts

**Example**:
```tsx
import { Button, Input, Card, Badge, Alert } from '~/components/ui';

<Button variant="primary" isLoading={loading}>
  Save Changes
</Button>

<Input 
  label="Email" 
  type="email" 
  error={errors.email}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

<Card className="p-6">
  <Badge status="PUBLISHED" />
</Card>

<Alert variant="error">Login failed</Alert>
```

### React Router v7 Configuration

**File**: `routes.ts`

Uses file-based routing with nested layouts:

```typescript
// Public routes
route("login", "routes/login.tsx")
route("signup", "routes/signup.tsx")

// Protected routes (nested under _dashboard layout)
layout("routes/_dashboard.tsx", [
  route("dashboard", "routes/_dashboard.dashboard.tsx"),  // Artist
  route("admin", "routes/_dashboard.admin.tsx"),          // Admin
])
```

**Route Protection**: The `_dashboard.tsx` layout checks auth state and redirects unauthenticated users to login.

### Role-Based Dashboards

**Artist Dashboard** (`_dashboard.dashboard.tsx`):
- Stats overview (streams, releases, followers)
- Recent releases list
- Quick actions (create new release)

**Admin Dashboard** (`_dashboard.admin.tsx`):
- System stats (users, releases, pending reviews)
- Quick action cards
- Navigation to approval queue

**Admin Approval Queue** (`_dashboard.admin.approvals.tsx`):
- View toggle between "Pending Approvals" and "All Releases"
- Paginated list with configurable page size (10 items default)
- Approve/reject actions with confirm modals
- Release details preview with track expansion
- Pagination controls: previous/next buttons, page numbers, total count display

### Sidebar Navigation

**File**: `components/Sidebar.tsx`

Role-based navigation:
- **Artist**: Dashboard, My Releases, Analytics, Settings
- **Admin**: Overview, Approval Queue, User Management, Settings

Shows active route highlighting and user info.

## Setup Instructions

### Prerequisites

- Node.js 18+ and pnpm
- Backend API running on `http://localhost:3000`

### Installation

```bash
# From project root
pnpm install

# Create environment file
cp frontend/.env.example frontend/.env

# Edit .env to point to your backend
# VITE_API_URL=http://localhost:3000
```

### Development

```bash
# From frontend directory
cd frontend
pnpm dev

# Or from project root
pnpm --filter frontend dev
```

App runs on `http://localhost:5173`

### Build

```bash
cd frontend
pnpm build

# Output in build/ directory
```

## Environment Variables

**File**: `.env.example`

```bash
VITE_API_URL=http://localhost:3000  # Backend API URL
```

Create `.env` locally (not committed to git):
```bash
cp .env.example .env
```

## Authentication Flow

1. **Login/Signup**: User enters credentials
2. **API Call**: `authService.signIn()` or `authService.signUp()`
3. **Token Storage**: JWT stored in localStorage
4. **State Update**: `AuthContext` updates user state
5. **Redirect**: Navigate to appropriate dashboard based on role
6. **Protected Routes**: `_dashboard.tsx` checks auth state
7. **Auto-Restore**: On page load, auth state restored from localStorage

## API Integration

### Backend Endpoints Used

- `POST /api/auth/signup` - Create new user
- `POST /api/auth/signin` - Authenticate user

### Request/Response Format

**Signup Request**:
```json
{
  "email": "artist@example.com",
  "password": "Test@123",
  "artistName": "Cool Artist",
  "role": "ARTIST"
}
```

**Signin Request**:
```json
{
  "email": "artist@example.com",
  "password": "Test@123"
}
```

**Response** (both endpoints):
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "artist@example.com",
    "role": "ARTIST",
    "artistName": "Cool Artist"
  }
}
```

### Error Handling

Errors follow backend format:
```json
{
  "error": {
    "message": "Invalid credentials",
    "statusCode": 401,
    "requestId": "req_123"
  }
}
```

Frontend displays error messages to users via Alert component.

## Design System

### Colors

- **Primary**: `#ccff00` (neon yellow/green)
- **Background**: `#000000` (pure black)
- **Card Background**: `#171717` (neutral-900)
- **Border**: `rgba(255,255,255,0.05)` (subtle white)
- **Text Primary**: `#ffffff` (white)
- **Text Secondary**: `#a3a3a3` (neutral-400)

### Typography

- **Font**: Inter (Google Fonts)
- **Headings**: Bold, tight tracking
- **Body**: Regular, neutral-400 color
- **Labels**: Uppercase, tracking-wider, xs size

### Component Patterns

- **Glassmorphism**: Cards with `bg-neutral-900/50 backdrop-blur-sm`
- **Transitions**: All interactive elements have `transition-colors`
- **Focus States**: Neon yellow ring (`focus:ring-[#ccff00]`)
- **Hover States**: Subtle brightness/opacity changes

## Testing Credentials

Demo accounts (seed data):

```
Artist Account:
Email: artist@vwaza.com
Password: Test@123

Admin Account:
Email: admin@vwaza.com
Password: Test@123
```

## Future Enhancements

### Planned Features
- [ ] Google OAuth integration
- [ ] Release creation/editing forms
- [ ] File upload with progress tracking
- [ ] Real-time notifications
- [ ] Analytics charts
- [ ] User management (admin)
- [ ] Forgot password flow
- [ ] Email verification

### API Endpoints Needed
- `GET /api/releases` - List releases (paginated with optional status filter: `?page=1&limit=10&status=PENDING_REVIEW`)
- `POST /api/releases` - Create release
- `PUT /api/releases/:id` - Update release
- `GET /api/admin/pending` - Pending approvals (now paginated in admin panel)
- `PUT /api/admin/releases/:id/approve` - Approve release
- `PUT /api/admin/releases/:id/reject` - Reject release
- `GET /api/users` - List users (admin)

## Troubleshooting

### Common Issues

**"Cannot connect to backend"**
- Ensure backend is running on `http://localhost:3000`
- Check `VITE_API_URL` in `.env`
- Check CORS settings in backend

**"Token expired" errors**
- Backend JWT expiry is 1 hour
- User needs to log in again
- Consider implementing refresh tokens

**"Module not found" errors**
- Run `pnpm install` from root
- Check path aliases in `tsconfig.json`

**Styles not loading**
- Ensure Tailwind is configured in `vite.config.ts`
- Check `app.css` is imported in `root.tsx`

## Development Tips

1. **Hot Reload**: Vite provides instant HMR - changes appear immediately
2. **Type Safety**: Use TypeScript strict mode - no `any` types
3. **Component Reuse**: Always use components from `ui.tsx` for consistency
4. **Error Handling**: Always wrap API calls in try/catch and display errors
5. **Auth State**: Use `useAuth()` hook everywhere, never access localStorage directly
6. **Routing**: Use `<Link>` from react-router for navigation, never `<a>` tags

## Contributing

When adding new features:

1. Create components in `components/` if reusable
2. Add routes in `routes/` following naming convention
3. Update `routes.ts` with new route config
4. Use existing auth patterns from `AuthContext`
5. Follow design system colors and spacing
6. Add error handling and loading states
7. Update this documentation

## Architecture Notes

### Feature-Based Architecture (Hybrid)

Frontend uses a **hybrid approach** combining React Router v7 Framework Mode with feature-based organization:

**Routes (Thin Wrappers)**:
```tsx
// app/routes/login.tsx - Just 18 lines!
import { useAuth, LoginForm } from '~/features/auth';

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  return (
    <AuthLayout title="Welcome back">
      <LoginForm onSubmit={login} isLoading={isLoading} error={error} />
    </AuthLayout>
  );
}
```

**Feature Modules**:
```
features/auth/
├── components/     # LoginForm, SignupForm (reusable)
├── hooks/          # useAuth (AuthProvider + context)
├── services/       # auth.service.ts (API calls)
├── types/          # Type definitions directory
└── index.ts        # Public API (export { LoginForm, useAuth })
```

**Key Benefits**:
- Features are self-contained and portable
- Routes stay thin (10-25 lines vs 160-250 lines)
- Import from feature public API: `~/features/auth` not deep paths
- Easy to scale (add `features/releases/`, `features/analytics/`)
- Types organized as directories, not single files

### Clean Architecture Alignment

Frontend follows similar principles to backend:

- **Services**: Handle API communication (like repositories)
- **Features/Hooks**: Manage application state (like use cases)
- **Components**: Pure presentation logic (like controllers)
- **Types**: Shared interfaces matching backend DTOs

### State Management

Currently using React Context for auth state. For complex state:
- Consider Zustand or Jotai for global state
- Use React Query for server state caching
- Keep local component state for UI-only concerns

## Resources

- [React Router v7 Docs](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Vite Guide](https://vitejs.dev/)

# Frontend Setup & Testing Guide

## Quick Setup

### 1. Install Dependencies

```bash
# From project root
pnpm install
```

### 2. Configure Environment

```bash
cd frontend
cp .env.example .env

# Edit .env to point to your backend (default is correct)
# VITE_API_URL=http://localhost:4000
```

### 3. Start Backend (Required!)

The frontend needs the backend API running:

```bash
# In a separate terminal, from project root
cd backend
pnpm dev
```

Backend should be running on `http://localhost:4000`

### 4. Start Frontend

```bash
# From frontend directory
pnpm dev
```

Frontend will start on `http://localhost:5173`

## Testing Authentication

### Demo Accounts

Use these pre-seeded accounts to test:

**Artist Account:**
- Email: `artist@vwaza.com`
- Password: `Test@123`
- Access: Artist dashboard, releases, analytics

**Admin Account:**
- Email: `admin@vwaza.com`  
- Password: `Test@123`
- Access: Admin dashboard, approval queue, user management

### Testing Flows

#### 1. Artist Login Flow
1. Visit `http://localhost:5173`
2. Enter artist credentials
3. Should redirect to `/dashboard`
4. See stats and recent releases
5. Navigate to "My Releases" (placeholder)
6. Navigate to "Analytics" (placeholder)
7. Test logout

#### 2. Admin Login Flow
1. Visit `http://localhost:5173`
2. Enter admin credentials
3. Should redirect to `/admin`
4. See system stats
5. Click "View Queue" or navigate to "Approval Queue"
6. See pending releases with approve/reject buttons
7. Navigate to "User Management" (placeholder)
8. Test logout

#### 3. Sign Up Flow
1. Click "Sign up" link on login page
2. Fill in form:
   - Email: `newuser@test.com`
   - Artist Name: `Test Artist`
   - Password: `Test@123` (meets requirements)
   - Confirm Password: `Test@123`
   - Role: Artist or Admin
3. Submit form
4. Should create account and redirect to dashboard
5. Check backend logs to verify user creation

#### 4. Error Handling
1. Try logging in with wrong password
2. Should see error alert: "Invalid credentials"
3. Try signing up with weak password
4. Should see validation errors
5. Try signing up with mismatched passwords
6. Should see "Passwords do not match"

### Password Requirements

Enforced by backend and validated in frontend:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*(),.?":{}|<>)

Example valid passwords:
- `Test@123`
- `SecurePass1!`
- `MyP@ssw0rd`

## Features Implemented

### ✅ Working Features

- **Authentication**
  - Login with JWT
  - Sign up with validation
  - Logout
  - Auto-restore auth state from localStorage
  - Protected routes
  - Role-based redirects

- **Artist Dashboard**
  - Stats overview (mock data)
  - Recent releases list (mock data)
  - Responsive layout
  - Navigation sidebar

- **Admin Dashboard**
  - System stats overview (mock data)
  - Quick action cards
  - Pending reviews counter

- **Admin Approval Queue**
  - List of pending releases (mock data)
  - Approve/Reject buttons (alerts for now)
  - Release preview cards

- **Navigation**
  - Sidebar with active link highlighting
  - User info display
  - Role-based menu items

### 🚧 Placeholder Routes

These routes show "Coming Soon" pages:
- `/releases` - Artist releases management
- `/analytics` - Analytics & insights
- `/admin/users` - User management
- `/settings` - Account settings

## Troubleshooting

### "Cannot connect to backend"

**Problem:** Frontend can't reach backend API

**Solutions:**
1. Ensure backend is running: `cd backend && pnpm dev`
2. Check backend is on port 4000: `curl http://localhost:4000/health`
3. Verify `.env` has `VITE_API_URL=http://localhost:4000`
4. Check browser console for CORS errors
5. Ensure backend CORS allows `http://localhost:5173`

### "Module not found" errors

**Problem:** Missing dependencies

**Solution:**
```bash
# From project root
pnpm install

# If still fails, try clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Auth not persisting after refresh

**Problem:** User logged out on page refresh

**Solutions:**
1. Check browser localStorage has `vwaza_token` and `vwaza_user`
2. Open DevTools → Application → Local Storage → `http://localhost:5173`
3. If token expired (>1 hour), log in again
4. Check backend JWT_SECRET is consistent across restarts

### Styles not loading

**Problem:** Page looks unstyled

**Solutions:**
1. Ensure Tailwind is installed: `pnpm list tailwindcss`
2. Check `app.css` is imported in `root.tsx`
3. Clear Vite cache: `rm -rf node_modules/.vite`
4. Restart dev server

### TypeScript errors

**Problem:** IDE showing type errors

**Solutions:**
1. Ensure all packages installed: `pnpm install`
2. Restart TypeScript server in VSCode: `Cmd/Ctrl + Shift + P` → "Restart TS Server"
3. Check `lucide-react` is installed: `pnpm list lucide-react`

## API Endpoints Used

Current implementation uses these backend endpoints:

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Authenticate and get JWT

### Request/Response Examples

**Sign Up:**
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "artistName": "Test Artist",
    "role": "ARTIST"
  }'
```

**Sign In:**
```bash
curl -X POST http://localhost:4000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artist@vwaza.com",
    "password": "Test@123"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "artist@vwaza.com",
    "role": "ARTIST",
    "artistName": "Cool Artist"
  }
}
```

## Browser DevTools Tips

### Inspecting Auth State

1. Open DevTools (F12)
2. Go to Application tab
3. Local Storage → `http://localhost:5173`
4. Check `vwaza_token` and `vwaza_user` keys

### Viewing API Requests

1. Open DevTools Network tab
2. Filter by "Fetch/XHR"
3. Login/signup to see API calls
4. Click request to see:
   - Headers (Authorization token)
   - Request payload
   - Response data

### Console Logging

AuthContext and components log useful info:
- Auth state changes
- API errors
- Navigation events

Check console for debugging info.

## Next Steps

After testing the current implementation:

1. **Implement Release Management**
   - Create release form
   - File upload with progress
   - Track management
   - Status transitions

2. **Add Admin Actions**
   - Approve/reject API integration
   - User management CRUD
   - Release editing

3. **Enhance UI**
   - Loading skeletons
   - Toast notifications
   - Confirmation modals
   - Form improvements

4. **Analytics**
   - Charts with real data
   - Date range filters
   - Export functionality

## Getting Help

- Backend API docs: `docs/setup-auth-db.md`
- Frontend architecture: `docs/frontend.md`
- Database schema: `docs/database-schema.md`
- Main project docs: `docs/layout.md`

## Development Tips

1. **Hot Reload**: Changes appear instantly, no refresh needed
2. **Component Reuse**: Always use `components/ui.tsx` components
3. **Auth Hook**: Use `useAuth()` everywhere, never access localStorage directly
4. **Type Safety**: Leverage TypeScript - if it compiles, it (mostly) works
5. **API Client**: Use `apiClient` from `lib/api.ts` for all HTTP calls
6. **Error Handling**: Always wrap API calls in try/catch

Happy coding! 🚀

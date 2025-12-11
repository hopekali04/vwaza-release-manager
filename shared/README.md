# @vwaza/shared

Shared types, enums, and Zod validation schemas for Vwaza Release Manager.

## Structure

```
src/
├── enums/       # Shared enums (UserRole, ReleaseStatus, etc.)
├── types/       # Shared TypeScript interfaces
└── schemas/     # Zod validation schemas + inferred types
    ├── auth.schema.ts
    ├── release.schema.ts
    └── track.schema.ts
```

## Usage

### In Backend

```typescript
import { 
  UserRole,
  signUpRequestSchema,
  type SignUpRequestDto,
  type AuthResponseDto
} from '@vwaza/shared';

// Validate request body with Zod
const result = signUpRequestSchema.safeParse(request.body);
if (!result.success) {
  return reply.status(400).send({ 
    error: result.error.flatten() 
  });
}

// TypeScript knows validData is SignUpRequestDto
const validData = result.data;
```

### In Frontend (when implemented)

```typescript
import { signInRequestSchema, type AuthResponseDto } from '@vwaza/shared';

// Validate form data before sending
const formData = signInRequestSchema.parse({
  email: 'user@example.com',
  password: 'password123'
});

// Make API call
const response: AuthResponseDto = await api.post('/auth/signin', formData);
```

## Available Schemas

### Auth (`auth.schema.ts`)

- `signUpRequestSchema` - Email, password (with rules), optional artistName
- `signInRequestSchema` - Email and password
- `refreshTokenRequestSchema` - Refresh token
- Types: `SignUpRequestDto`, `SignInRequestDto`, `RefreshTokenRequestDto`, `AuthResponseDto`

**Password validation** (enforced in `passwordSchema`):
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Release (`release.schema.ts`)

- `createReleaseRequestSchema` - Title and genre
- `updateReleaseRequestSchema` - Optional title, genre, coverArtUrl
- `submitReleaseRequestSchema` - Release ID (UUID)
- `approveReleaseRequestSchema` - Release ID (UUID)
- `rejectReleaseRequestSchema` - Release ID + optional reason
- Types: `CreateReleaseRequestDto`, `UpdateReleaseRequestDto`, etc.
- `ReleaseResponseDto` - Full release object

### Track (`track.schema.ts`)

- `createTrackRequestSchema` - Title, trackOrder, optional ISRC
- `updateTrackRequestSchema` - Optional title, trackOrder, ISRC, durationSeconds
- Types: `CreateTrackRequestDto`, `UpdateTrackRequestDto`
- `TrackResponseDto` - Full track object

## Development

```bash
# Build (compile TypeScript)
pnpm build

# Watch mode
pnpm watch
```

## Notes

- **Build artifacts** (`dist/`) are gitignored
- Always run `pnpm build` after making changes
- Backend automatically picks up changes via workspace dependency
- Zod provides runtime validation + TypeScript types from same source

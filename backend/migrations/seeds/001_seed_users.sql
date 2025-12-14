-- Seed: 001_seed_users.sql
-- Description: Seed initial admin and test artist users
-- Date: 2025-12-11
-- 
-- These are placeholder hashes for development.
-- To generate real hashes, run: pnpm exec tsx scripts/generate-hashes.ts
-- Then replace the password_hash values below.

-- Insert Admin User
-- Email: admin@vwaza.com
-- Password: Admin@123
-- Hash: bcrypt with 10 rounds
INSERT INTO users (id, email, password_hash, artist_name, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@vwaza.com',
    '$2b$10$YQ7Y8nZ3eLq9Qy3xGz9Fv.HXvGKq3Z5Y5qZz5qZ5qZ5qZ5qZ5qZ5u',
    NULL,
    'ADMIN'
) ON CONFLICT (email) DO NOTHING;

-- Insert Test Artist User
-- Email: artist@vwaza.com  
-- Password: Artist@123
-- Hash: bcrypt with 10 rounds
INSERT INTO users (id, email, password_hash, artist_name, role)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'artist@vwaza.com',
    '$2b$10$ZQ8Z9oZ4fMr0Rz4yHz0Gw.IYwHLr4A6Z6rAa6rA6rA6rA6rA6rA6v',
    'Test Artist',
    'ARTIST'
) ON CONFLICT (email) DO NOTHING;

-- Insert Demo Release (for testing)
INSERT INTO releases (id, artist_id, title, genre, status)
VALUES (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Demo Album',
    'Hip Hop',
    'DRAFT'
) ON CONFLICT (id) DO NOTHING;

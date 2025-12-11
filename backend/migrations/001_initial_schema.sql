-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for Vwaza Release Manager
-- Date: 2025-12-11

-- Enable UUID generation (Postgres 13+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- 1. ENUMS (Type Safety in DB)
-- ------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('ARTIST', 'ADMIN');
CREATE TYPE release_status AS ENUM ('DRAFT', 'PROCESSING', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED');
CREATE TYPE upload_job_status AS ENUM ('PENDING', 'UPLOADING', 'COMPLETED', 'FAILED');
CREATE TYPE upload_job_type AS ENUM ('AUDIO', 'COVER_ART');

-- ------------------------------------------------------------
-- 2. USERS TABLE
-- ------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    artist_name VARCHAR(255), -- Nullable because Admins might not have artist names
    role user_role NOT NULL DEFAULT 'ARTIST',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster login lookups
CREATE INDEX idx_users_email ON users(email);

-- ------------------------------------------------------------
-- 3. RELEASES TABLE
-- ------------------------------------------------------------
CREATE TABLE releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    cover_art_url TEXT, -- Nullable initially (Draft state), enforced in App Logic for submission
    status release_status NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Dashboard filtering
CREATE INDEX idx_releases_artist_id ON releases(artist_id);
CREATE INDEX idx_releases_status ON releases(status);

-- ------------------------------------------------------------
-- 4. TRACKS TABLE
-- ------------------------------------------------------------
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    isrc VARCHAR(20), -- International Standard Recording Code
    audio_file_url TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
    track_order INTEGER NOT NULL CHECK (track_order > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure track order is unique per release (No two tracks can be #1)
    CONSTRAINT unique_track_order_per_release UNIQUE (release_id, track_order)
);

-- Index for fetching album tracks quickly
CREATE INDEX idx_tracks_release_id ON tracks(release_id);

-- ------------------------------------------------------------
-- 5. PASSWORD RESET TOKENS
-- ------------------------------------------------------------
CREATE TABLE password_reset_tokens (
    token_hash VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_tokens_expires_at ON password_reset_tokens(expires_at);

-- ------------------------------------------------------------
-- 6. UPLOAD JOBS
-- ------------------------------------------------------------
CREATE TABLE upload_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_entity_id UUID NOT NULL, -- Polymorphic: Can be Release ID or Track ID
    job_type upload_job_type NOT NULL,
    local_path TEXT NOT NULL,
    status upload_job_status NOT NULL DEFAULT 'PENDING',
    retry_count INTEGER NOT NULL DEFAULT 0,
    error_log TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_upload_jobs_status ON upload_jobs(status);

-- ------------------------------------------------------------
-- 7. MIGRATIONS TABLE (Track applied migrations)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 8. AUTOMATIC TIMESTAMP UPDATES
-- ------------------------------------------------------------
-- Function to update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_releases_modtime BEFORE UPDATE ON releases FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tracks_modtime BEFORE UPDATE ON tracks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_password_tokens_modtime BEFORE UPDATE ON password_reset_tokens FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_upload_jobs_modtime BEFORE UPDATE ON upload_jobs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

# Archived Spotify OAuth Flow

This folder captures the old OAuth-based authentication flow used before the move to
email/password authentication.

## Why this was archived

Spotify OAuth works well for production apps with approved quota, but in Spotify
development mode access is heavily restricted to a small user allowlist. That made the
app difficult for new users to try without manual Spotify dashboard updates.

To remove that onboarding bottleneck, authentication moved to app-managed
email/password credentials while keeping Spotify API usage for metadata fetches.

## What used to exist

- `GET /auth/spotify/login`
- `GET /auth/spotify/callback`
- `POST /auth/exchange`

The backend previously used Goth and a short-lived auth-code exchange before issuing
JWTs for API access.

## Archived files

- `docs/archive/oauth/login.go`
- `docs/archive/oauth/exchange.go`
- `docs/archive/oauth/auth.go`
- `docs/archive/oauth/authcode.go`

These files are for historical reference only and are not wired into the running app.

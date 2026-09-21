# poddster-wall-web

The client-facing `/wall` page — SPEC.md's Stage 4, from the
`poddster-wall` repo (the pipeline: CLI, Cloud Run services, Supabase
schema). Read that repo's `CLAUDE.md`/`SPEC.md` first for the wall
pipeline's physical constants and build stages; this repo is just the UI
on top of `wall-api`.

## What this is (and isn't)

A client opens `/wall/<job id>?token=<access token>` — a private link
they're given after a booking, no account needed — and sees their
content's preview, an approve button, and eventually a download link.
There's no client login, no job list, no upload UI yet: `wall-api`'s
`POST /jobs` (which also issues the signed GCS upload URL) is currently
called by whoever creates the booking, not by this app. That's the next
real gap once this scaffold is in place — see `docs/architecture.md`.

## Local development

```bash
pnpm install   # or npm/yarn
cp .env.local.example .env.local   # fill in INTERNAL_API_KEY from Secret Manager
pnpm dev
```

Visit a real job URL locally against the deployed `wall-api` — there's no
local pipeline to run against.

## Deployment

Push to `master`. Vercel auto-deploys once the project is linked in the
Vercel dashboard (one-time, manual — see `poddster-apps` house
convention). Set `WALL_API_URL` and `INTERNAL_API_KEY` as Vercel
environment variables first.

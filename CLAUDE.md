# CLAUDE.md — poddster-wall-web

## Mandatory rule: always update docs and push to GitHub

After **every** change — no matter how small — you must:

1. Update `docs/changelog.md` with the date, a short description of what
   changed, and why.
2. Update `docs/architecture.md` if any routes, components, or env vars
   changed.
3. Commit all changed files (including the docs) and push to `master`.
   - Vercel auto-deploys on push to master — there is no separate deploy
     step, once the Vercel project is linked (a one-time manual step in
     the Vercel dashboard).

Do not wait until the end of a session. Update and push after each
discrete change.

## Project overview

The client-facing `/wall` page for the Poddster LED wall pipeline
(SPEC.md's Stage 4, in the sibling `poddster-wall` repo). Clients open a
private link (`/wall/<job id>?token=<access token>`) to see a live
preview of their content on the wall, approve it, and download the final
file — no login, no account.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router (TypeScript) |
| Deployment | Vercel (auto-deploys from `master`) |
| Backend | `wall-api` (Cloud Run, in `poddster-wall`) — this app never talks to GCP or Supabase directly |

## Key design point

This app has **no GCP credentials and no direct Supabase client**. Every
piece of data (job status, signed preview/master URLs) and every action
(approve) goes through `wall-api`'s `GET /jobs/:id` and
`POST /jobs/:id/approve`, authenticated with the shared `INTERNAL_API_KEY`
secret (`lib/wall-api.ts`, server-only — never import it into a Client
Component). See `poddster-wall/src/cloud/api-service.js` for why: a
GCP service-account key would need exporting and storing in Vercel, a
higher-value secret to leak than one bearer string scoped to this one API.

Clients are identified by a per-job `access_token` (see
`poddster-wall/supabase/wall_jobs_access_token.sql`), not a Supabase Auth
login — most clients only ever interact with one booking.

## Key directories

```
app/wall/[jobId]/page.tsx        server component: validates the token via
                                  wall-api, renders JobView
app/wall/[jobId]/JobView.tsx     client component: polls for status while
                                  the job is mid-pipeline, handles approve
app/api/wall-jobs/[jobId]/       proxy routes — keep WALL_API_URL and
                                  INTERNAL_API_KEY server-side, never sent
                                  to the browser
lib/wall-api.ts                  the only place that calls wall-api
docs/                            changelog.md + architecture.md
```

## Environment variables (Vercel)

`WALL_API_URL`, `INTERNAL_API_KEY` — see `.env.local.example`.

## Deployment

Push to `master` → Vercel builds and deploys automatically, once the
Vercel project has been linked to this repo (done once, manually, in the
Vercel dashboard — this is the one step that doesn't happen from a
terminal).

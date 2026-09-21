# Architecture

Scaffold only — see README.md for what's built vs. not.

```
app/
  page.tsx                     placeholder home page (nothing lives here)
  layout.tsx                   root layout
  wall/[jobId]/
    page.tsx                   server component: reads ?token, calls
                                wall-api's GET /jobs/:id, 404s on a bad
                                token or missing job
    JobView.tsx                client component: renders per job.status,
                                polls /api/wall-jobs/[jobId] every 5s
                                while the job is mid-pipeline (queued,
                                probing, approved, conforming); at
                                preview_ready, shows a fill/fit radio
                                picker (defaulting to the job's existing
                                rule) and sends the choice on approve
  api/wall-jobs/[jobId]/
    route.ts                   GET proxy to wall-api (keeps
                                INTERNAL_API_KEY server-side)
    approve/route.ts           POST proxy — re-validates token + status
                                before forwarding to wall-api
lib/
  wall-api.ts                  the only module that calls wall-api;
                                server-only, never import into a Client
                                Component
```

## Design choices worth knowing

- **No GCP credentials, no direct Supabase client.** Every job read/write
  goes through `wall-api`. See CLAUDE.md for why (avoiding a
  service-account key in Vercel).
- **Tokenized links, not accounts.** `access_token` (a column added to
  `wall_jobs` specifically for this — see
  `poddster-wall/supabase/wall_jobs_access_token.sql`) is checked by
  `wall-api` itself on every `GET /jobs/:id`; this app just forwards it.
- **No Realtime yet.** `JobView.tsx` polls every 5s instead of
  subscribing to Supabase Realtime. Realtime would need either a
  Postgres RLS policy that can validate a token (nontrivial — anonymous
  Realtime subscriptions don't carry a custom per-row secret naturally)
  or minting a scoped JWT per job. Polling is simpler and good enough for
  a job that takes well under a minute to move between states; revisit if
  that stops being true.
- **No upload UI, no job list.** `wall-api`'s `POST /jobs` (which creates
  the job and issues the signed upload URL) isn't called from anywhere in
  this app yet — whoever creates a booking calls it directly for now
  (`clientUrl` in its response is exactly the link this app expects). The
  real next step is deciding who/what should call it from here: an
  AM-facing internal page in this same app, gated some other way than the
  client token model above? Or does it stay outside this app entirely?
  Not decided — flagging rather than guessing.

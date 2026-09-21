# Changelog

Newest entry on top.

## 2026-09-21 — Fill/fit picker on the preview page

Ben asked why the client couldn't choose fill vs. fit — they couldn't;
the rule was fixed at job creation, and the fill/fit side-by-side preview
was purely informational. `JobView.tsx`'s `preview_ready` view now shows
a radio picker (Fill / Fit, each with a one-line description of the
tradeoff) defaulting to whatever rule the job already has, and the
Approve button sends the selection. `plate` isn't offered — it's a
deck/background-blur treatment, not a crop/pad choice for video.

`lib/wall-api.ts`'s `approveJob` and the `/api/wall-jobs/[jobId]/approve`
proxy both gained an optional `rule` param (validated client-side against
`['fill','fit']` before it ever reaches `wall-api`, which does its own
validation too). Paired with a `wall-api` change on the `poddster-wall`
side — see that repo's changelog.

Labeled the preview images "Fill on the left, Fit on the right" so the
picker and the image the client is looking at actually correspond —
the composite already put them in that order, it just wasn't stated.

## 2026-09-21 — Scaffold: the client-facing job page

First commit. `/wall/[jobId]` reads the job via `wall-api`'s new
`GET /jobs/:id?token=...`, renders per status (queued/probing spinners,
preview images + approve button at `preview_ready`, a download link at
`ready`, the error at `failed`), and polls every 5s while the job is
mid-pipeline. Approve goes through this app's own `/api/wall-jobs/[jobId]/approve`
proxy, which re-checks the token and status before forwarding to
`wall-api`.

Deliberately has no GCP credentials and no direct Supabase client —
everything goes through `wall-api`, authenticated with a shared
`INTERNAL_API_KEY` secret rather than a GCP service-account key (avoids
exporting/storing a higher-value credential in Vercel). This required two
small additions on the `poddster-wall` side, done in the same session:

- `supabase/wall_jobs_access_token.sql` — a per-job token column, since
  clients access their job via a private link, not a login.
- `wall-api` gained `GET /jobs/:id` (signs GCS read URLs for the preview
  images and master file, since this app can't sign them itself) and an
  `INTERNAL_API_KEY` check on every route, replacing reliance on Cloud
  Run IAM (which Vercel has no identity to satisfy).

**Not done yet — flagging, not guessing:**
- `wall-api` still needs redeploying with `--allow-unauthenticated` and
  the new `INTERNAL_API_KEY` secret; that specific command was blocked by
  a safety check in the session that built this (opening a service to
  public ingress), so it's waiting on Ben to run it himself. Until then
  this app can't actually reach `wall-api`.
- No upload UI or job list — see docs/architecture.md.
- No Realtime — polling instead, see docs/architecture.md for why.
- Not yet linked to a Vercel project (one-time manual step).

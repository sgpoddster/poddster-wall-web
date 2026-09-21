// Server-only. Never import this from a Client Component — it carries
// INTERNAL_API_KEY, the shared secret that authenticates this app to
// wall-api. See poddster-wall's src/cloud/api-service.js for why that's
// a bearer secret instead of a GCP service-account credential (Vercel
// has no GCP identity of its own).

const WALL_API_URL = process.env.WALL_API_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

function headers() {
  if (!WALL_API_URL || !INTERNAL_API_KEY) {
    throw new Error('WALL_API_URL and INTERNAL_API_KEY must be set');
  }
  return {
    'Content-Type': 'application/json',
    'X-Internal-Api-Key': INTERNAL_API_KEY,
  };
}

export type WallJob = {
  id: string;
  booking_id: string;
  client_id: string;
  created_at: string;
  source_kind: string;
  probe: Record<string, unknown> | null;
  rule: string | null;
  tier: number | null;
  status: 'queued' | 'probing' | 'preview_ready' | 'approved' | 'conforming' | 'ready' | 'failed';
  error: string | null;
  quoted_cents: number | null;
  approved_at: string | null;
  validated: Record<string, unknown> | null;
  previewUrls: string[];
  masterUrl: string | null;
};

// Fetches a job by id, scoped by its access token — the same token
// embedded in the client's link. wall-api returns 404 for both "no such
// job" and "wrong token", so a guesser can't tell which.
export async function getJob(jobId: string, token: string): Promise<WallJob | null> {
  const res = await fetch(`${WALL_API_URL}/jobs/${jobId}?token=${encodeURIComponent(token)}`, {
    headers: headers(),
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`wall-api GET /jobs/${jobId} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function approveJob(jobId: string): Promise<{ status: string; approvedAt: string }> {
  const res = await fetch(`${WALL_API_URL}/jobs/${jobId}/approve`, {
    method: 'POST',
    headers: headers(),
  });
  if (!res.ok) throw new Error(`wall-api POST /jobs/${jobId}/approve failed: ${res.status} ${await res.text()}`);
  return res.json();
}

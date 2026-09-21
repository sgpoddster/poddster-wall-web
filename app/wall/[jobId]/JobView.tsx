'use client';

import { useEffect, useState } from 'react';
import type { WallJob } from '@/lib/wall-api';

const POLLING_STATUSES = new Set(['queued', 'probing', 'approved', 'conforming']);
const POLL_INTERVAL_MS = 5000;

export default function JobView({ jobId, token, initialJob }: { jobId: string; token: string; initialJob: WallJob }) {
  const [job, setJob] = useState(initialJob);
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  useEffect(() => {
    if (!POLLING_STATUSES.has(job.status)) return;
    const id = setInterval(async () => {
      const res = await fetch(`/api/wall-jobs/${jobId}?token=${encodeURIComponent(token)}`, { cache: 'no-store' });
      if (res.ok) setJob(await res.json());
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [job.status, jobId, token]);

  async function handleApprove() {
    setApproving(true);
    setApproveError(null);
    try {
      const res = await fetch(`/api/wall-jobs/${jobId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `approve failed (${res.status})`);
      }
      setJob((j) => ({ ...j, status: 'approved' }));
    } catch (err) {
      setApproveError(err instanceof Error ? err.message : String(err));
    } finally {
      setApproving(false);
    }
  }

  switch (job.status) {
    case 'queued':
      return <Status text="Your file is queued — this usually takes under a minute." />;
    case 'probing':
      return <Status text="Analysing your file…" />;
    case 'preview_ready':
      return (
        <div>
          <p>Here&apos;s how your content will look on the wall:</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
            {job.previewUrls.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="Wall preview" style={{ maxWidth: '100%', height: 'auto' }} />
            ))}
          </div>
          <button onClick={handleApprove} disabled={approving}>
            {approving ? 'Approving…' : 'Approve'}
          </button>
          {approveError && <p style={{ color: 'crimson' }}>{approveError}</p>}
        </div>
      );
    case 'approved':
      return <Status text="Approved — starting the final render." />;
    case 'conforming':
      return <Status text="Rendering the final version…" />;
    case 'ready':
      return (
        <div>
          <p>Done! Your wall-ready file is here:</p>
          {job.masterUrl && <a href={job.masterUrl}>Download</a>}
        </div>
      );
    case 'failed':
      return <Status text={`Something went wrong: ${job.error ?? 'unknown error'}`} />;
    default:
      return <Status text={`Unknown status: ${job.status}`} />;
  }
}

function Status({ text }: { text: string }) {
  return <p>{text}</p>;
}

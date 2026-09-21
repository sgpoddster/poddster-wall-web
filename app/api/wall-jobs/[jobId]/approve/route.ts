import { NextRequest, NextResponse } from 'next/server';
import { getJob, approveJob } from '@/lib/wall-api';

// The client's browser never calls wall-api directly (it doesn't have
// INTERNAL_API_KEY). It calls this route, which re-validates the token
// and status itself before proxying — belt-and-braces on top of
// wall-api's own check, and lets us fail with a clean message instead of
// forwarding wall-api's internal error shape to the browser.
export async function POST(req: NextRequest, { params }: { params: { jobId: string } }) {
  const { token } = await req.json().catch(() => ({ token: null }));
  if (!token) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 });
  }

  const job = await getJob(params.jobId, token);
  if (!job) {
    return NextResponse.json({ error: 'job not found' }, { status: 404 });
  }
  if (job.status !== 'preview_ready') {
    return NextResponse.json({ error: `job isn't ready to approve (status: ${job.status})` }, { status: 409 });
  }

  const result = await approveJob(params.jobId);
  return NextResponse.json(result);
}

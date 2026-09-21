import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/wall-api';

// Thin proxy so the browser only ever talks to this app's own domain —
// wall-api's URL and INTERNAL_API_KEY stay server-side. Used both for
// the page's initial load and the client-side poll while a job is
// mid-pipeline (no Realtime wiring yet — see docs/architecture.md).
export async function GET(req: NextRequest, { params }: { params: { jobId: string } }) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 });
  }

  const job = await getJob(params.jobId, token);
  if (!job) {
    return NextResponse.json({ error: 'job not found' }, { status: 404 });
  }
  return NextResponse.json(job);
}

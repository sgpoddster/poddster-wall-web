import { notFound } from 'next/navigation';
import { getJob } from '@/lib/wall-api';
import JobView from './JobView';

export default async function WallJobPage({
  params,
  searchParams,
}: {
  params: { jobId: string };
  searchParams: { token?: string };
}) {
  const token = searchParams.token;
  if (!token) notFound();

  const job = await getJob(params.jobId, token);
  if (!job) notFound();

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Your LED wall content</h1>
      <JobView jobId={params.jobId} token={token} initialJob={job} />
    </main>
  );
}

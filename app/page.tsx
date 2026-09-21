export default function HomePage() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Poddster Wall</h1>
      <p>
        There&apos;s nothing to see here directly — this app only serves job-specific pages
        at <code>/wall/&lt;job id&gt;?token=&lt;access token&gt;</code>, created via wall-api.
      </p>
    </main>
  );
}

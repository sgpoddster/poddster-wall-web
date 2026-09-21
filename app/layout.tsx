export const metadata = {
  title: 'Poddster Wall',
  description: 'Client-facing page for the Poddster LED wall pipeline.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

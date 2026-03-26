// Force dynamic rendering for all dashboard pages
// These pages use auth/cookies and cannot be statically rendered
export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

'use client';
import { usePathname } from 'next/navigation';
import BottomNav from '@/components/layout/BottomNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  // Admin: full width, no mobile frame
  if (isAdmin) {
    return <>{children}</>;
  }

  // Public: mobile-first frame
  return (
    <div className="app-shell">
      <main className="main-content">{children}</main>
      <BottomNav />
    </div>
  );
}

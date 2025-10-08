
'use client';
import { usePathname } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { DesktopSidebar } from '@/components/desktop-sidebar';
import { AdminLayout } from './admin/admin-layout';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCandidatePage = pathname.startsWith('/candidate');
  const isAdminPage = pathname.startsWith('/admin');
  const isRegisterPage = pathname === '/register';

  if (isCandidatePage) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        {children}
        <SiteFooter />
      </div>
    );
  }

  if (isAdminPage) {
    return <>{children}</>;
  }

  if (isRegisterPage) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <SiteHeader />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          <DesktopSidebar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

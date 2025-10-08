
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams as useNextSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileUp,
  ClipboardList,
  FileText,
  UserCog,
  Cog,
  History,
  BookOpen,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const staticMenuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/requests', label: 'Requests', icon: Send },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/staff', label: 'Staff', icon: Briefcase },
  { href: '/admin/documents', label: 'Documents & Downloads', icon: FileUp },
  { href: '/admin/forms', label: 'Forms & Submissions', icon: ClipboardList },
  { href: '/admin/users-roles', label: 'Users & Roles', icon: UserCog },
  { href: '/admin/settings', label: 'Settings / Theme', icon: Cog },
  { href: '#', label: 'Audit Logs', icon: History },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();
  const { firestore } = initializeFirebase();
  const pagesQuery = useMemo(
    () => (firestore ? collection(firestore, 'website_pages') : null),
    [firestore]
  );
  const { data: pages, loading } = useCollection(pagesQuery);

  const sortedPages = useMemo(() => {
    if (!pages) return [];
    return [...pages].sort((a, b) => a.title.localeCompare(b.title));
  }, [pages]);
  
  const getLinkClassName = (href: string) => {
     return cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium h-[46px]',
        pathname === href
          ? 'bg-[hsl(var(--navbar-secondary))] text-white'
          : 'text-gray-300 hover:bg-white/10 hover:text-white'
      )
  };
  
  const getAccordionTriggerClassName = (pathPrefix: string) => {
      return cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium h-[46px] text-gray-300 hover:bg-white/10 hover:text-white hover:no-underline',
        pathname.startsWith(pathPrefix)
          ? 'bg-[hsl(var(--navbar-secondary))] text-white'
          : ''
      )
  }

  return (
    <aside className="w-[240px] text-white flex flex-col" style={{ backgroundColor: 'hsl(var(--navbar-primary))' }}>
      <div className="flex h-[60px] items-center justify-center border-b" style={{ borderColor: 'hsl(var(--navbar-secondary))' }}>
        <h1 className="text-xl font-bold">NSSC Admin</h1>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {staticMenuItems.slice(0, 2).map((item) => (
             <Link
              key={item.label}
              href={item.href}
              className={getLinkClassName(item.href)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
        ))}

        <Accordion type="single" collapsible>
          <AccordionItem value="pages-lms" className="border-b-0">
            <AccordionTrigger
              className={getAccordionTriggerClassName('/admin/pages')}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5" />
                <span>Pages / LMS</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-1 pl-4">
              {loading ? (
                <div className="text-gray-400 text-xs text-center p-2">
                  Loading pages...
                </div>
              ) : sortedPages.length > 0 ? (
                sortedPages.map((page) => (
                  <Link
                    key={page.id}
                    href={`/admin/pages?page=${page.id}`}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium',
                      pathname === '/admin/pages' &&
                        searchParams.get('page') === page.id
                        ? 'bg-black/20 text-white'
                        : 'text-gray-400 hover:bg-black/20 hover:text-white'
                    )}
                  >
                    {page.title}
                  </Link>
                ))
              ) : (
                <div className="text-gray-400 text-xs text-center p-2">
                  No pages found.
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
         {staticMenuItems.slice(2).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={getLinkClassName(item.href)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
        ))}
      </nav>
    </aside>
  );
}

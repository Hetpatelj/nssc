
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  ImageIcon,
  ShieldCheck,
  Award,
  Edit,
  Home,
  FileText,
  BadgeCheck,
  RefreshCw,
  Copy,
  CreditCard,
  ClipboardList,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const menuItems = [
  { href: '/council-members', label: 'Council Members', icon: Users },
  { href: '/photo-gallery', label: 'Photo Gallery', icon: ImageIcon },
  { href: '/verification-certificate', label: 'Verification of Certificate', icon: ShieldCheck },
  { href: '/permanent-registration', label: 'Permanent Registration', icon: Award },
  { href: '#', label: 'Change of Name', icon: Edit },
  { href: '#', label: 'Change of Address', icon: Home },
  { href: '/noc-page', label: 'NOC', icon: FileText },
  { href: '#', label: 'Good Standing', icon: BadgeCheck },
  { href: '/renewal', label: 'Renewal', icon: RefreshCw },
  { href: '/duplicate', label: 'Duplicate', icon: Copy },
  { href: '/online-payment', label: 'Online Payment', icon: CreditCard },
  { href: '/application-status', label: 'Application Status', icon: ClipboardList },
  { href: '/subject-wise-reg-list', label: 'Subjectwise Reg. List', icon: List },
];

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.label}
              asChild
              variant="default"
              className={cn(
                'w-full justify-start text-left h-auto py-2.5 rounded-md',
                isActive
                  ? 'bg-destructive hover:bg-destructive/90'
                  : 'bg-primary hover:bg-secondary',
                'text-primary-foreground'
              )}
            >
              <Link href={item.href}>
                <item.icon className="mr-3 h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}

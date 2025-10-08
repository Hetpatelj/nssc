
'use client';

import { AdminLayout } from '@/components/admin/admin-layout';
import { useSessionTimeout } from '@/hooks/use-session-timeout';
import { useEffect } from 'react';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { themes, fonts } from '@/lib/themes';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useSessionTimeout();

  useEffect(() => {
    const { firestore } = initializeFirebase();
    const applyPersistedAppearance = async () => {
      if (!firestore) return;
      const settingsRef = doc(firestore, 'settings', 'global');
      const docSnap = await getDoc(settingsRef);
      const root = document.documentElement;

      if (docSnap.exists()) {
        const settings = docSnap.data();
        
        // Apply theme
        const activeTheme = themes.find(t => t.name === settings.activeThemeName) || themes[0];
        Object.entries(activeTheme.cssVariables).forEach(([key, value]) => {
          root.style.setProperty(key, value);
        });

        // Apply font
        const activeFont = settings.activeFont || 'var(--font-montserrat)';
        root.style.setProperty('--font-body', activeFont);
        root.style.setProperty('--font-ui', activeFont);

        // Apply navbar theme
        const navbarTheme = themes.find(t => t.name === settings.navbarThemeName) || activeTheme;
        root.style.setProperty('--navbar-primary', navbarTheme.cssVariables['--primary']);
        root.style.setProperty('--navbar-secondary', navbarTheme.cssVariables['--secondary']);

      }
    };
    applyPersistedAppearance();
  }, []);

  return <AdminLayout>{children}</AdminLayout>;
}

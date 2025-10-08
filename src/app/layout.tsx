
import type { Metadata } from 'next';
import './globals.css';
import { Open_Sans, Merriweather, Montserrat, Poppins, Lato, Inter, Source_Code_Pro, Space_Mono, Work_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ConditionalLayout } from '@/components/conditional-layout';

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-merriweather',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
});


export const metadata: Metadata = {
  title: 'NSSC Portal',
  description: 'National Skills Sector Councils, New Delhi',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'font-body antialiased',
          openSans.variable,
          merriweather.variable,
          montserrat.variable,
          poppins.variable,
          lato.variable,
          inter.variable,
          sourceCodePro.variable,
          spaceMono.variable,
          workSans.variable
        )}
      >
        <FirebaseClientProvider>
            <ConditionalLayout>
                {children}
            </ConditionalLayout>
            <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

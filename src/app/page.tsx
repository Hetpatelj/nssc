
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bell,
  Download,
  FileText,
  Megaphone,
  SquarePen,
} from 'lucide-react';
import Link from 'next/link';
import { Slideshow } from '@/components/slideshow';
import { WelcomeSection } from '@/components/welcome-section';
import { LoginCard } from '@/components/login-card';

function InfoCard({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ElementType;
  items: {
    text: string;
    href: string;
    new?: boolean;
    linkText?: string;
    linkHref?: string;
  }[];
}) {
  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="text-center p-4">
        <div className="mx-auto bg-primary/10 text-primary rounded-full h-16 w-16 flex items-center justify-center mb-2">
          <Icon className="h-8 w-8" />
        </div>
        <CardTitle className="font-headline text-lg font-bold text-gray-800">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ul className="space-y-3 font-body text-sm">
          {items.map((item, index) => (
            <li key={index} className="border-b last:border-b-0 pb-3">
              <Link
                href={item.href}
                className="flex items-start gap-2 text-primary hover:underline"
              >
                <FileText className="h-4 w-4 mt-1 text-primary/60 shrink-0" />
                <span className="flex-1">
                  {item.text}
                  {item.new && (
                    <span className="text-xs text-red-500 font-bold ml-2 animate-pulse">
                      NEW
                    </span>
                  )}
                  {item.linkText && (
                    <Link
                      href={item.linkHref || '#'}
                      className="text-primary hover:underline ml-1"
                    >
                      {item.linkText}
                    </Link>
                  )}
                </span>
              </Link>
            </li>
          ))}
          {items.length === 0 && (
            <p className="text-center text-gray-500">No records found.</p>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <WelcomeSection />
        </div>
        <div>
          <LoginCard />
        </div>
      </div>

      <Slideshow />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InfoCard
          title="Announcements"
          icon={Megaphone}
          items={[
            {
              text: 'Result of Diploma in Medical Laboratory Technology (DMLT) Second Year Examination, April-2024',
              href: '#',
              new: true,
            },
            {
              text: 'Regarding examination fees of Medical Laboratory Technology, first and second year examination summer-2024',
              href: '#',
            },
          ]}
        />
        <InfoCard
          title="Notifications"
          icon={Bell}
          items={[
            {
              text: 'Regarding Change in Renewal process of Registration',
              href: '#',
            },
            { text: 'List of Holidays-2024', href: '#' },
          ]}
        />
        <InfoCard
          title="Downloads"
          icon={Download}
          items={[
            { text: 'Application Form for Registration', href: '#' },
            { text: 'Affidavit for Change of Name', href: '#' },
          ]}
        />
        <InfoCard
          title="Instructions"
          icon={SquarePen}
          items={[
            {
              text: 'User Manual For Online Application Submission',
              href: '#',
            },
            { text: 'Instructions for Online Payment', href: '#' },
          ]}
        />
      </div>
    </div>
  );
}

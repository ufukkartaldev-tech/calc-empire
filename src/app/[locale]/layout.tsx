import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from '@/components/ui/Navbar';
import { generateWebsiteSchema, generateOrganizationSchema, generateWebApplicationSchema } from '@/lib/structured-data';
import "../globals.css";

const RTL_LOCALES = new Set(['ar']);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'HomePage' });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://calcempire.com';

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: t('title'),
      template: `%s | ${t('title')}`,
    },
    description: t('description'),
    keywords: [
      'engineering calculator',
      'ohm law calculator',
      'beam deflection',
      'electrical engineering',
      'mechanical engineering',
      'civil engineering',
      'statistics calculator',
      'unit converter',
      'mühendislik hesaplayıcı',
      'online calculator',
      'scientific calculator',
    ],
    authors: [{ name: 'CalcEmpire Team' }],
    creator: 'CalcEmpire',
    publisher: 'CalcEmpire',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}`])
      ),
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: `/${locale}`,
      title: t('title'),
      description: t('description'),
      siteName: 'CalcEmpire',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/og-image.png'],
      creator: '@calcempire',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';

  // Generate structured data
  const websiteSchema = generateWebsiteSchema(locale);
  const organizationSchema = generateOrganizationSchema();
  const webAppSchema = generateWebApplicationSchema();

  return (
    <html lang={locale} dir={dir}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased ce-bg flex flex-col min-h-screen`}>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

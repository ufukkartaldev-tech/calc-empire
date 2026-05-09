/**
 * @file app/[locale]/calculators/[toolId]/page.tsx
 * @description Dynamic page for specific calculators
 */

import { EngineeringDashboard } from '@/components/dashboard';
import { TOOLS_CONFIG } from '@/config/tools.config';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import type { TranslationKey } from '@/types';

interface PageProps {
  params: Promise<{ locale: string; toolId: string }>;
}

export async function generateStaticParams() {
  const paths: { locale: string; toolId: string }[] = [];

  for (const locale of routing.locales) {
    for (const tool of TOOLS_CONFIG) {
      paths.push({ locale, toolId: tool.id });
    }
  }

  return paths;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, toolId } = await params;
  const tool = TOOLS_CONFIG.find((t) => t.id === toolId);

  if (!tool) return {};

  const t = await getTranslations({ locale, namespace: 'Dashboard' });
  const title = t(tool.titleKey as TranslationKey);
  const description = t(tool.descKey as TranslationKey);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default async function CalculatorPage({ params }: PageProps) {
  const { toolId } = await params;

  // Validate toolId
  const tool = TOOLS_CONFIG.find((t) => t.id === toolId);
  if (!tool) {
    notFound();
  }

  return <EngineeringDashboard initialToolId={tool.id} />;
}

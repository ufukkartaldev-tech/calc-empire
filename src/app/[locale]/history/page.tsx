import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth-config';
import { CalculationHistory } from '@/components/history/CalculationHistory';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'History' });
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  };
}

export default async function HistoryPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/${params.locale}/auth/login?callbackUrl=/${params.locale}/history`);
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <CalculationHistory user={session.user} locale={params.locale} />
    </main>
  );
}

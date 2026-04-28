import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth-config';
import { FavoritesManager } from '@/components/favorites/FavoritesManager';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Favorites' });
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  };
}

export default async function FavoritesPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/${params.locale}/auth/login?callbackUrl=/${params.locale}/favorites`);
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <FavoritesManager user={session.user} locale={params.locale} />
    </main>
  );
}

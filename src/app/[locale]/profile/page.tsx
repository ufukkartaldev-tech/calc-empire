import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth-config';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Profile' });
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  };
}

export default async function ProfilePage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);

  // If there is no session, we provide a mock user so the user can preview the premium design.
  // In a real production scenario, you would uncomment the redirect below.
  /*
  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=/${params.locale}/profile`);
  }
  */

  const mockUser = {
    id: 'anon-12345678',
    name: 'Guest User',
    email: 'guest@calcempire.com',
    image: null,
  };

  const user = session?.user || mockUser;

  return (
    <main className="container mx-auto px-4 py-12 max-w-5xl">
      <ProfileForm user={user} />
    </main>
  );
}

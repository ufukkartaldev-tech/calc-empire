import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: 'About' });
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  };
}

export default async function AboutPage({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: 'About' });

  const features = [
    { icon: '🧮', title: t('features.calculators.title'), desc: t('features.calculators.desc') },
    { icon: '🌐', title: t('features.multilingual.title'), desc: t('features.multilingual.desc') },
    { icon: '🔒', title: t('features.security.title'), desc: t('features.security.desc') },
    { icon: '📱', title: t('features.responsive.title'), desc: t('features.responsive.desc') },
    { icon: '⚡', title: t('features.fast.title'), desc: t('features.fast.desc') },
    { icon: '📊', title: t('features.export.title'), desc: t('features.export.desc') },
  ];

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl font-bold">CE</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </section>

      {/* Mission */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">{t('mission.title')}</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          {t('mission.text1')}
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {t('mission.text2')}
        </p>
      </section>

      {/* Features Grid */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">{t('features.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">{t('categories.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['electrical', 'mechanical', 'software', 'finance', 'civil', 'chemistry'].map((cat) => (
            <Link
              key={cat}
              href="/calculators"
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-2xl">
                {cat === 'electrical' ? '⚡' : cat === 'mechanical' ? '⚙️' : cat === 'software' ? '💻' : cat === 'finance' ? '💰' : cat === 'civil' ? '🏗️' : '🧪'}
              </span>
              <span className="font-medium">{t(`categories.${cat}`)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Contact / Get Started */}
      <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">{t('cta.title')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('cta.text')}
        </p>
        <Link
          href="/calculators"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {t('cta.button')}
        </Link>
      </section>

      {/* Footer Info */}
      <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500">
        <p>{t('footer.version', { version: '1.0.0' })}</p>
        <p className="mt-2">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
      </footer>
    </main>
  );
}

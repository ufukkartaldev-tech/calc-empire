import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Guides' });
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  };
}

export default async function GuidesPage({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Guides' });
  const tc = await getTranslations({ locale: params.locale, namespace: 'Categories' });

  const guideCategories = [
    {
      key: 'electrical',
      guides: [
        { title: t('electrical.ohmTitle'), desc: t('electrical.ohmDesc'), path: '/calculators/ohm' },
        { title: t('electrical.kirchhoffTitle'), desc: t('electrical.kirchhoffDesc'), path: '/calculators/kirchhoff' },
        { title: t('electrical.powerTitle'), desc: t('electrical.powerDesc'), path: '/calculators/power' },
      ],
    },
    {
      key: 'software',
      guides: [
        { title: t('software.baseConverterTitle'), desc: t('software.baseConverterDesc'), path: '/calculators/baseConverter' },
        { title: t('software.cronParserTitle'), desc: t('software.cronParserDesc'), path: '/calculators/cronParser' },
        { title: t('software.jsonFormatterTitle'), desc: t('software.jsonFormatterDesc'), path: '/calculators/jsonFormatter' },
      ],
    },
    {
      key: 'finance',
      guides: [
        { title: t('finance.compoundInterestTitle'), desc: t('finance.compoundInterestDesc'), path: '/calculators/compoundInterest' },
        { title: t('finance.cryptoPnlTitle'), desc: t('finance.cryptoPnlDesc'), path: '/calculators/cryptoPnl' },
      ],
    },
  ];

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
      </div>

      <div className="space-y-8">
        {guideCategories.map((category) => (
          <section key={category.key} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">{category.key === 'electrical' ? '⚡' : category.key === 'software' ? '💻' : '📊'}</span>
              {tc(category.key)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.guides.map((guide) => (
                <Link
                  key={guide.path}
                  href={guide.path}
                  className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">{guide.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{guide.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold mb-2">{t('needHelp')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('helpText')}{' '}
          <Link href="/about" className="text-blue-600 dark:text-blue-400 hover:underline">
            {t('contactLink')}
          </Link>
        </p>
      </div>
    </main>
  );
}

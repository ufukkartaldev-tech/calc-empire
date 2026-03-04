import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('HomePage');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-white dark:bg-black">
      <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
        {t('title')}
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400">
        {t('description')}
      </p>
    </div>
  );
}

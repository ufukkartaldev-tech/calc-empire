import { useTranslations } from 'next-intl';
import { EngineeringDashboard } from '@/components/dashboard';

export default function Home() {
  const t = useTranslations('HomePage');

  return (
    <div className="ce-app">
      <main className="ce-main">
        {/* ── Hero ── */}
        <header className="ce-hero">
          <h1 className="ce-hero__title">{t('title')}</h1>
          <p className="ce-hero__subtitle">{t('description')}</p>
        </header>

        {/* ── Engineering Dashboard ── */}
        <EngineeringDashboard />
      </main>
    </div>
  );
}

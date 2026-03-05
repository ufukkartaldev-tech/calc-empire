import { useTranslations } from 'next-intl';
import CalculatorTemplate from '@/components/CalculatorTemplate';
import { ohmConfig } from '@/lib/calculators/ohm';
import { ResistorVisualizer, BeamDeflectionVisualizer, NormalDistributionChart } from '@/components/visualizers';

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

        {/* ── Ohm's Law Calculator ── */}
        <CalculatorTemplate config={ohmConfig} />

        {/* ── Interactive Visualizers ── */}
        <section className="ce-section">
          <h2 className="ce-section__title">Interactive Visualizers</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <ResistorVisualizer />
            <BeamDeflectionVisualizer />
            <NormalDistributionChart />
          </div>
        </section>
      </main>
    </div>
  );
}

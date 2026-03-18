/**
 * @file components/dashboard/EngineeringDashboard.tsx
 * @description Main dashboard component with professional design
 */

'use client';

import { useTranslations } from 'next-intl';
import { useDashboard } from '@/hooks';
import { CRITICAL_TOOLS } from '@/config/tools.config';
import { ToolRenderer } from './ToolRenderer';
import { Sidebar } from '../ui/Sidebar';
import { Footer } from '../ui/Footer';
import { DisclaimerView } from './DisclaimerView';
import { ToolGrid } from './ToolGrid';
import { EmptyState } from './EmptyState';
import { useRouter } from '@/i18n/routing';
import { ArrowLeft, TrendingUp, Users, Award } from 'lucide-react';
import type { ToolId } from '@/types';

export function EngineeringDashboard({ initialToolId = null }: { initialToolId?: ToolId }) {
  const tCat = useTranslations('Categories');
  const tDash = useTranslations('Dashboard');
  const router = useRouter();

  const {
    activeTool,
    activeCategory,
    searchQuery,
    acknowledgedTools,
    filteredTools,
    toolsByCategory,
    setActiveTool,
    setSearchQuery,
    scrollToCategory,
    acknowledgeTool,
  } = useDashboard(initialToolId);

  const renderToolView = () => {
    if (!activeTool) return null;

    const isCritical = CRITICAL_TOOLS.includes(activeTool as (typeof CRITICAL_TOOLS)[number]);
    const hasAcknowledged = acknowledgedTools.has(activeTool);

    if (isCritical && !hasAcknowledged) {
      return (
        <DisclaimerView
          activeTool={activeTool}
          onBack={() => {
            setActiveTool(null);
            router.push('/');
          }}
          onAcknowledge={() => acknowledgeTool(activeTool)}
        />
      );
    }

    return (
      <div className="container-max py-8">
        <button
          onClick={() => {
            setActiveTool(null);
            router.push('/');
          }}
          className="btn-secondary mb-8 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          {tDash('backButton')}
        </button>
        <ToolRenderer activeTool={activeTool} />
      </div>
    );
  };

  const renderDashboardHeader = () => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-[var(--ce-border)]">
      <div className="container-max section-padding">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="heading-1 mb-6">
              Professional Engineering
              <span className="block text-[var(--ce-primary)]">Calculation Tools</span>
            </h1>
            <p className="body-large mb-8 max-w-lg">
              Precision-engineered calculators for electrical, mechanical, civil, and software engineering professionals.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-[var(--ce-text-muted)]">
                <TrendingUp size={16} className="text-[var(--ce-success)]" />
                <span>99.9% Accuracy</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--ce-text-muted)]">
                <Users size={16} className="text-[var(--ce-primary)]" />
                <span>10,000+ Engineers</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--ce-text-muted)]">
                <Award size={16} className="text-[var(--ce-warning)]" />
                <span>Industry Standard</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="professional-card p-6 text-center">
              <div className="text-2xl font-bold text-[var(--ce-primary)] mb-2">30+</div>
              <div className="text-sm text-[var(--ce-text-muted)]">Calculators</div>
            </div>
            <div className="professional-card p-6 text-center">
              <div className="text-2xl font-bold text-[var(--ce-success)] mb-2">8</div>
              <div className="text-sm text-[var(--ce-text-muted)]">Categories</div>
            </div>
            <div className="professional-card p-6 text-center">
              <div className="text-2xl font-bold text-[var(--ce-warning)] mb-2">5</div>
              <div className="text-sm text-[var(--ce-text-muted)]">Languages</div>
            </div>
            <div className="professional-card p-6 text-center">
              <div className="text-2xl font-bold text-[var(--ce-error)] mb-2">24/7</div>
              <div className="text-sm text-[var(--ce-text-muted)]">Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[var(--ce-bg)]">
      <div className="flex flex-1">
        <Sidebar
          activeCategory={activeCategory}
          onCategorySelect={scrollToCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 min-w-0">
          {activeTool ? (
            renderToolView()
          ) : (
            <>
              {renderDashboardHeader()}
              
              <div className="container-max py-12">
                <div className="mb-12">
                  <h2 className="heading-2 mb-4">
                    {activeCategory ? tCat(activeCategory as keyof IntlMessages['Categories']) : 'All Tools'}
                  </h2>
                  <p className="body-regular text-[var(--ce-text-muted)]">
                    Choose from our comprehensive collection of engineering calculators
                  </p>
                </div>

                {filteredTools.length === 0 ? (
                  <EmptyState />
                ) : (
                  <ToolGrid toolsByCategory={toolsByCategory} />
                )}
              </div>
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

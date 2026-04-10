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
import { ArrowLeft } from 'lucide-react';
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
    <div className="border-b border-[var(--ce-border)]">
      <div className="container-max py-12">
        <div className="max-w-2xl">
          <h1 className="heading-1 mb-4">Engineering Calculators</h1>
          <p className="body-large">Professional calculation tools for engineering workflows.</p>
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

              <div className="container-max py-8">
                <div className="mb-8">
                  <h2 className="heading-2 mb-2">
                    {activeCategory ? tCat(activeCategory as string) : 'All Tools'}
                  </h2>
                  <p className="body-regular text-[var(--ce-text-muted)]">
                    Select a calculator from the list below
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

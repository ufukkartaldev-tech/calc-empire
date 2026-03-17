/**
 * @file components/dashboard/EngineeringDashboard.tsx
 * @description Main dashboard component (refactored)
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
    handleToolSelect,
    acknowledgeTool,
  } = useDashboard(initialToolId);

  const renderToolView = () => {
    if (!activeTool) return null;

    const isCritical = CRITICAL_TOOLS.includes(activeTool as any);
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
      <div className="w-full max-w-5xl mx-auto py-8 px-4">
        <button
          onClick={() => {
            setActiveTool(null);
            router.push('/');
          }}
          className="mb-8 px-4 py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-900 border border-slate-800 hover:border-blue-600 hover:text-blue-500 rounded-md transition-all shadow-sm group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span> {tDash('backButton')}
        </button>
        <ToolRenderer activeTool={activeTool} />
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
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
            <div className="p-6 md:p-10 max-w-6xl mx-auto">
              <div className="mb-12">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4 uppercase">
                  {activeCategory ? tCat(activeCategory as any) : tDash('title')}
                </h1>
                <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                  {tDash('subtitle')}
                </p>
                <div className="h-[1px] w-full bg-slate-800 mt-8"></div>
              </div>

              {filteredTools.length === 0 ? (
                <EmptyState />
              ) : (
                <ToolGrid toolsByCategory={toolsByCategory} />
              )}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

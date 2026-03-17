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
      <div className="w-full max-w-5xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <button
          onClick={() => {
            setActiveTool(null);
            router.push('/');
          }}
          className="mb-12 px-6 py-3 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-900 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl transition-all shadow-xl shadow-blue-500/5 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> {tDash('backButton')}
        </button>
        <ToolRenderer activeTool={activeTool} />
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
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
            <div className="p-8 md:p-14 lg:p-20 max-w-7xl mx-auto">
              <div className="mb-20 animate-in fade-in slide-in-from-left-8 duration-1000">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 uppercase">
                  {activeCategory ? tCat(activeCategory as any) : tDash('title')}
                </h1>
                <div className="h-2 w-24 bg-blue-600 dark:bg-blue-500 rounded-full mb-8"></div>
                <p className="text-xl text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed font-medium">
                  {tDash('subtitle')}
                </p>
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

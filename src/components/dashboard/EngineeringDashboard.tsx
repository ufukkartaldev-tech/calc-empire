/**
 * @file components/dashboard/EngineeringDashboard.tsx
 * @description Main dashboard component (refactored)
 */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useDashboard } from '@/hooks';
import { CRITICAL_TOOLS } from '@/config/tools.config';
import { ToolRenderer } from './ToolRenderer';
import { Sidebar } from '../ui/Sidebar';
import { Footer } from '../ui/Footer';
import { DisclaimerView } from './DisclaimerView';
import { ToolGrid } from './ToolGrid';
import { EmptyState } from './EmptyState';

export function EngineeringDashboard() {
  const tCat = useTranslations('Categories');
  const tDash = useTranslations('Dashboard');
  
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
  } = useDashboard();

  const renderToolView = () => {
    if (!activeTool) return null;

    const isCritical = CRITICAL_TOOLS.includes(activeTool);
    const hasAcknowledged = acknowledgedTools.has(activeTool);

    if (isCritical && !hasAcknowledged) {
      return (
        <DisclaimerView
          activeTool={activeTool}
          onBack={() => setActiveTool(null)}
          onAcknowledge={() => acknowledgeTool(activeTool)}
        />
      );
    }

    return (
      <div className="w-full max-w-4xl mx-auto py-8 px-6 animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={() => setActiveTool(null)}
          className="mb-8 px-4 py-2 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm"
        >
          ← {tDash('backButton')}
        </button>
        <ToolRenderer activeTool={activeTool} />
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
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
            <div className="p-6 md:p-10 max-w-7xl mx-auto">
              <div className="mb-12">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
                  {activeCategory ? tCat(activeCategory as any) : tDash('title')}
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
                  {tDash('subtitle')}
                </p>
              </div>

              {filteredTools.length === 0 ? (
                <EmptyState />
              ) : (
                <ToolGrid 
                  toolsByCategory={toolsByCategory} 
                  onToolSelect={handleToolSelect} 
                />
              )}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

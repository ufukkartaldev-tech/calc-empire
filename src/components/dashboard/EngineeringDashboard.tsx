'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Fuse from 'fuse.js';
import { ToolId, CATEGORY_ORDER, TOOLS_CONFIG, CATEGORY_ICONS, CRITICAL_TOOLS } from './tools.config';
import { ToolRenderer } from './ToolRenderer';
import { Sidebar } from '../ui/Sidebar';
import { Footer } from '../ui/Footer';

export function EngineeringDashboard() {
  const tCat = useTranslations('Categories');
  const tDash = useTranslations('Dashboard');
  const [activeTool, setActiveTool] = useState<ToolId>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [acknowledgedTools, setAcknowledgedTools] = useState<Set<ToolId>>(new Set());

  // Smooth scroll to category section
  const scrollToCategory = (catKey: string | null) => {
    setActiveCategory(catKey);
    setActiveTool(null);
    
    if (catKey) {
      setTimeout(() => {
        const element = document.getElementById(`category-${catKey}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // Scroll to top for "All Tools"
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Pre-translate everything for searchable fields
  const searchableTools = useMemo(() => {
    return TOOLS_CONFIG.map(tool => ({
      ...tool,
      translatedTitle: tDash(tool.titleKey as any),
      translatedDesc: tDash(tool.descKey as any),
      translatedCat: tCat(tool.catKey as any)
    }));
  }, [tDash, tCat]);

  // Use Fuse for fuzzy matching
  const fuse = useMemo(() => {
    return new Fuse(searchableTools, {
      keys: ['translatedTitle', 'translatedDesc', 'translatedCat'],
      threshold: 0.35,
      distance: 100
    });
  }, [searchableTools]);

  const filteredTools = useMemo(() => {
    let tools = searchableTools;
    if (searchQuery.trim()) {
      tools = fuse.search(searchQuery).map(result => result.item);
    }
    if (activeCategory) {
      tools = tools.filter(tool => tool.catKey === activeCategory);
    }
    return tools;
  }, [searchQuery, fuse, searchableTools, activeCategory]);

  const toolsByCategory = useMemo(() => {
    const grouped: Partial<Record<typeof CATEGORY_ORDER[number], typeof searchableTools>> = {};
    for (const tool of filteredTools) {
      if (!grouped[tool.catKey]) grouped[tool.catKey] = [];
      grouped[tool.catKey]!.push(tool);
    }
    return grouped;
  }, [filteredTools]);

  // Handle Tool Selection
  const handleToolSelect = (id: ToolId) => {
    setActiveTool(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderToolView = () => {
    if (!activeTool) return null;

    const isCritical = CRITICAL_TOOLS.includes(activeTool);
    const hasAcknowledged = acknowledgedTools.has(activeTool);

    if (isCritical && !hasAcknowledged) {
      return (
        <div className="w-full max-w-2xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4">
          <button
            onClick={() => setActiveTool(null)}
            className="mb-8 px-4 py-2 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            ← {tDash('backButton')}
          </button>

          <div className="p-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-3xl shadow-sm">
            <h3 className="text-amber-900 dark:text-amber-400 font-bold text-xl mb-4 flex items-center gap-3">
              <span className="text-2xl">⚠️</span> {tDash('consentTitle' as any) || "Kullanım Öncesi Onay"}
            </h3>
            <p className="text-amber-800 dark:text-amber-300 text-sm mb-8 leading-relaxed italic">
              {tDash('disclaimer' as any)}
            </p>
            <label className="flex items-start gap-4 cursor-pointer p-6 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-800 group hover:border-blue-400 transition-all shadow-sm">
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 accent-blue-600 cursor-pointer"
                onChange={(e) => {
                  if (e.target.checked) {
                    setAcknowledgedTools(prev => new Set([...prev, activeTool]));
                  }
                }}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                {tDash('acknowledgeDisclaimer' as any)}
              </span>
            </label>
          </div>
        </div>
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
                <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
                  <div className="text-7xl mb-6">🔭</div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {tDash('noResults' as any)}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
                    {tDash('requestTool' as any)}
                  </p>
                  <a
                    href="mailto:contact@calcempire.com"
                    className="inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
                  >
                    <span>📧</span> {tDash('contactUs' as any)}
                  </a>
                </div>
              ) : (
                <div className="space-y-16">
                  {CATEGORY_ORDER.map(catKey => {
                    const catTools = toolsByCategory[catKey];
                    if (!catTools || catTools.length === 0) return null;

                    return (
                      <div key={catKey} className="animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-4 mb-8">
                          <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-2xl shadow-sm">
                            {CATEGORY_ICONS[catKey]}
                          </span>
                          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {tCat(catKey as any)}
                          </h2>
                          <div className="flex-1 h-[2px] bg-slate-100 dark:bg-slate-800/50 rounded-full ml-2"></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {catTools.map(tool => (
                            <button
                              key={tool.id}
                              onClick={() => handleToolSelect(tool.id)}
                              className="group w-full flex flex-col items-start p-6 rounded-3xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 text-left relative overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                              <div className="flex items-center gap-4 mb-4 relative z-10">
                                <span className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 text-2xl shadow-inner">
                                  {tool.icon}
                                </span>
                                <span className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                                  {tool.translatedTitle}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 relative z-10">
                                {tool.translatedDesc}
                              </p>

                              <div className="mt-6 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0">
                                {tDash('openTool' as any) || "ARACI AÇ"} <span className="ml-1">→</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

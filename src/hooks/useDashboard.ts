/**
 * @file hooks/useDashboard.ts
 * @description Dashboard state management hook
 */

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Fuse from 'fuse.js';
import type { ToolId, SearchableTool } from '@/types';
import { TOOLS_CONFIG } from '@/config/tools.config';
import { FUSE_OPTIONS, SCROLL_DELAY } from '@/constants';

export function useDashboard() {
  const tCat = useTranslations('Categories');
  const tDash = useTranslations('Dashboard');

  const [activeTool, setActiveTool] = useState<ToolId>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [acknowledgedTools, setAcknowledgedTools] = useState<Set<ToolId>>(new Set());

  // Pre-translate tools for search
  const searchableTools = useMemo<SearchableTool[]>(() => {
    return TOOLS_CONFIG.map((tool) => ({
      ...tool,
      translatedTitle: tDash(tool.titleKey as any),
      translatedDesc: tDash(tool.descKey as any),
      translatedCat: tCat(tool.catKey as any),
    }));
  }, [tDash, tCat]);

  // Fuse.js instance for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(searchableTools, {
      ...FUSE_OPTIONS,
      keys: [...FUSE_OPTIONS.keys],
    });
  }, [searchableTools]);

  // Filtered tools based on search and category
  const filteredTools = useMemo(() => {
    let tools = searchableTools;
    if (searchQuery.trim()) {
      tools = fuse.search(searchQuery).map((result) => result.item);
    }
    if (activeCategory) {
      tools = tools.filter((tool) => tool.catKey === activeCategory);
    }
    return tools;
  }, [searchQuery, fuse, searchableTools, activeCategory]);

  // Group tools by category
  const toolsByCategory = useMemo(() => {
    const grouped: Partial<Record<string, SearchableTool[]>> = {};
    for (const tool of filteredTools) {
      if (!grouped[tool.catKey]) grouped[tool.catKey] = [];
      grouped[tool.catKey]!.push(tool);
    }
    return grouped;
  }, [filteredTools]);

  // Smooth scroll to category
  const scrollToCategory = (catKey: string | null) => {
    setActiveCategory(catKey);
    setActiveTool(null);

    if (catKey) {
      setTimeout(() => {
        const element = document.getElementById(`category-${catKey}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, SCROLL_DELAY);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle tool selection
  const handleToolSelect = (id: ToolId) => {
    setActiveTool(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Acknowledge critical tool disclaimer
  const acknowledgeTool = (id: ToolId) => {
    setAcknowledgedTools((prev) => new Set([...prev, id]));
  };

  return {
    // State
    activeTool,
    activeCategory,
    searchQuery,
    acknowledgedTools,

    // Computed
    searchableTools,
    filteredTools,
    toolsByCategory,

    // Actions
    setActiveTool,
    setSearchQuery,
    scrollToCategory,
    handleToolSelect,
    acknowledgeTool,
  };
}

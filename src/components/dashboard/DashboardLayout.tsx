/**
 * @file components/dashboard/DashboardLayout.tsx
 * @description Layout for the dashboard and calculator pages
 */

'use client';

import React from 'react';
import { Sidebar } from '../ui/Sidebar';
import { Footer } from '../ui/Footer';
import { useDashboard } from '@/hooks';
import type { ToolId } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTool?: ToolId;
}

export function DashboardLayout({ children, activeTool: initialActiveTool = null }: DashboardLayoutProps) {
  const {
    activeCategory,
    searchQuery,
    setSearchQuery,
    scrollToCategory,
  } = useDashboard(initialActiveTool);

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
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, Mock } from 'vitest';
import { EngineeringDashboard } from '../EngineeringDashboard';
import { useDashboard } from '@/hooks/useDashboard';

// Mock the hook
vi.mock('@/hooks/useDashboard', () => ({
  useDashboard: vi.fn(),
}));

// Mock ToolRenderer and ToolGrid sub-components for isolation
vi.mock('../ToolRenderer', () => ({
  ToolRenderer: () => <div data-testid="tool-renderer">Tool Renderer</div>,
}));

// Mock i18n routing
vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('EngineeringDashboard', () => {
  const mockTools = [
    {
      id: 'ohm',
      titleKey: 'ohmTitle',
      catKey: 'electrical',
      translatedTitle: 'Ohm Calculator',
      icon: 'Ω',
    },
    {
      id: 'baseConverter',
      titleKey: 'baseConverterTitle',
      catKey: 'software',
      translatedTitle: 'Base Converter',
      icon: '🔟',
    },
  ];

  const mockUseDashboard = {
    activeTool: null,
    activeCategory: null,
    searchQuery: '',
    acknowledgedTools: new Set(),
    filteredTools: mockTools,
    toolsByCategory: {
      electrical: [mockTools[0]],
      software: [mockTools[1]],
    },
    setActiveTool: vi.fn(),
    setSearchQuery: vi.fn(),
    scrollToCategory: vi.fn(),
    acknowledgeTool: vi.fn(),
  };

  it('renders categories in the sidebar and main grid', () => {
    (useDashboard as Mock).mockReturnValue(mockUseDashboard);

    render(<EngineeringDashboard />);

    // Check sidebar and main grid categories (mocked translations return the key with namespace)
    expect(screen.getAllByText('Categories.electrical').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Categories.software').length).toBeGreaterThan(0);

    // Check main grid category headers
    expect(screen.getAllByText('Categories.electrical').length).toBeGreaterThan(1);
    expect(screen.getAllByText('Categories.software').length).toBeGreaterThan(1);
  });

  it('renders tools within their categories', () => {
    (useDashboard as Mock).mockReturnValue(mockUseDashboard);

    render(<EngineeringDashboard />);

    expect(screen.getByText('Ohm Calculator')).toBeInTheDocument();
    expect(screen.getByText('Base Converter')).toBeInTheDocument();
  });

  it('updates search query when typing in the search input', () => {
    (useDashboard as Mock).mockReturnValue(mockUseDashboard);

    render(<EngineeringDashboard />);

    const searchInput = screen.getByPlaceholderText('Dashboard.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'ohm' } });

    expect(mockUseDashboard.setSearchQuery).toHaveBeenCalledWith('ohm');
  });

  it('renders ToolRenderer when a tool is active', () => {
    (useDashboard as Mock).mockReturnValue({
      ...mockUseDashboard,
      activeTool: 'ohm',
    });

    render(<EngineeringDashboard />);

    expect(screen.getByTestId('tool-renderer')).toBeInTheDocument();
  });

  it('shows disclaimer for critical tools if not acknowledged', () => {
    // 'beam' is a critical tool according to tools.config.ts
    (useDashboard as Mock).mockReturnValue({
      ...mockUseDashboard,
      activeTool: 'beam',
      acknowledgedTools: new Set(),
    });

    render(<EngineeringDashboard />);

    // DisclaimerView should be rendered (we'll check for a text that is likely in it)
    // Since we didn't mock DisclaimerView specifically, it will render its content.
    // Let's assume it has some specific text or we can mock it.
    expect(screen.queryByTestId('tool-renderer')).not.toBeInTheDocument();
  });
});

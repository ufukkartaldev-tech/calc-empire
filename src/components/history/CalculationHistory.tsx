'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import {
  Clock,
  Calculator,
  Trash2,
  ExternalLink,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Calendar,
  Tag,
} from 'lucide-react';

interface CalculationRecord {
  id: string;
  toolId: string;
  toolName: string;
  category: string;
  inputs: Record<string, number | string>;
  results: Record<string, number | string>;
  timestamp: string;
  notes?: string;
  tags?: string[];
}

interface CalculationHistoryProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
  locale: string;
}

// Simple SVG icons
const ClockIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CalculatorIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const FilterIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const TagIcon = () => (
  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
    />
  </svg>
);

export function CalculationHistory({ user, locale }: CalculationHistoryProps) {
  const t = useTranslations('History');
  const [calculations, setCalculations] = useState<CalculationRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load calculations from localStorage on mount
  useEffect(() => {
    const loadCalculations = () => {
      try {
        const stored = localStorage.getItem('calculationHistory');
        if (stored) {
          const parsed = JSON.parse(stored);
          setCalculations(parsed);
        }
      } catch (error) {
        console.error('Failed to load calculation history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCalculations();
  }, []);

  // Filter calculations
  const filteredCalculations = calculations.filter((calc) => {
    const matchesSearch =
      calc.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      calc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (calc.notes && calc.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = filterCategory === 'all' || calc.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...new Set(calculations.map((c) => c.category))];

  // Delete calculation
  const deleteCalculation = (id: string) => {
    const updated = calculations.filter((c) => c.id !== id);
    setCalculations(updated);
    localStorage.setItem('calculationHistory', JSON.stringify(updated));
  };

  // Clear all history
  const clearAllHistory = () => {
    if (confirm(t('confirmClear'))) {
      setCalculations([]);
      localStorage.removeItem('calculationHistory');
    }
  };

  // Export calculation as JSON
  const exportCalculation = (calc: CalculationRecord) => {
    const dataStr = JSON.stringify(calc, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calculation-${calc.toolId}-${calc.timestamp.slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Format date
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      electrical: '⚡',
      mechanical: '⚙️',
      software: '💻',
      finance: '💰',
      civil: '🏗️',
      chemistry: '🧪',
      mathematics: '📐',
      statistics: '📊',
    };
    return icons[category] || '📱';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClockIcon />
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('subtitle', { count: calculations.length })}
          </p>
        </div>

        {calculations.length > 0 && (
          <Button
            variant="outline"
            onClick={clearAllHistory}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <TrashIcon />
            <span className="ml-2">{t('clearAll')}</span>
          </Button>
        )}
      </div>

      {/* Filters */}
      {calculations.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <SearchIcon />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <FilterIcon />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? t('filters.allCategories') : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calculations List */}
      {filteredCalculations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">
              {calculations.length === 0 ? t('empty.title') : t('noResults.title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {calculations.length === 0 ? t('empty.description') : t('noResults.description')}
            </p>
            {calculations.length === 0 && (
              <Link
                href="/calculators"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <CalculatorIcon />
                <span className="ml-2">{t('empty.cta')}</span>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCalculations.map((calc) => (
            <Card key={calc.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getCategoryIcon(calc.category)}</div>
                    <div>
                      <CardTitle className="text-lg font-semibold">{calc.toolName}</CardTitle>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <CalendarIcon />
                        <span>{formatDate(calc.timestamp)}</span>
                        <Badge variant="secondary" className="ml-2">
                          {calc.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportCalculation(calc)}
                      title={t('actions.export')}
                    >
                      <DownloadIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCalculation(calc.id)}
                      title={t('actions.delete')}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Quick Results Preview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {Object.entries(calc.results)
                    .slice(0, 4)
                    .map(([key, value]) => (
                      <div key={key} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase">{key}</p>
                        <p className="font-semibold text-blue-600 dark:text-blue-400">
                          {typeof value === 'number' ? value.toFixed(4) : value}
                        </p>
                      </div>
                    ))}
                </div>

                {/* Expandable Details */}
                <button
                  onClick={() => setExpandedId(expandedId === calc.id ? null : calc.id)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  {expandedId === calc.id ? (
                    <>
                      <ChevronUpIcon />
                      <span className="ml-1">{t('actions.hideDetails')}</span>
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon />
                      <span className="ml-1">{t('actions.showDetails')}</span>
                    </>
                  )}
                </button>

                {expandedId === calc.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {/* Inputs */}
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 text-sm uppercase text-gray-500">
                        {t('details.inputs')}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(calc.inputs).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="text-gray-500">{key}:</span>{' '}
                            <span className="font-medium">
                              {typeof value === 'number' ? value.toFixed(4) : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* All Results */}
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 text-sm uppercase text-gray-500">
                        {t('details.results')}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(calc.results).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="text-gray-500">{key}:</span>{' '}
                            <span className="font-medium text-blue-600">
                              {typeof value === 'number' ? value.toFixed(4) : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {calc.notes && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2 text-sm uppercase text-gray-500">
                          {t('details.notes')}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                          {calc.notes}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {calc.tags && calc.tags.length > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        {calc.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="flex items-center gap-1">
                            <TagIcon />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/calculators/${calc.toolId}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        <ExternalLinkIcon />
                        <span className="ml-2">{t('actions.recalculate')}</span>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {calculations.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">{t('stats.title')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{calculations.length}</p>
                <p className="text-sm text-gray-600">{t('stats.total')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(calculations.map((c) => c.category)).size}
                </p>
                <p className="text-sm text-gray-600">{t('stats.categories')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {
                    calculations.filter(
                      (c) => new Date(c.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ).length
                  }
                </p>
                <p className="text-sm text-gray-600">{t('stats.thisWeek')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {
                    calculations.filter(
                      (c) => new Date(c.timestamp).toDateString() === new Date().toDateString()
                    ).length
                  }
                </p>
                <p className="text-sm text-gray-600">{t('stats.today')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

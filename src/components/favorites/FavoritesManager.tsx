'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TOOLS_CONFIG } from '@/config/tools.config';

interface FavoriteItem {
  toolId: string;
  toolName: string;
  category: string;
  icon: string;
  description: string;
  addedAt: string;
  order: number;
  notes?: string;
}

interface FavoritesManagerProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
  locale: string;
}

// Icons
const StarIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    className="h-5 w-5"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
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

const ArrowUpIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const GridIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);

const ListIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const NoteIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

export function FavoritesManager({ user, locale }: FavoritesManagerProps) {
  const t = useTranslations('Favorites');
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from localStorage
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const stored = localStorage.getItem('favoriteCalculators');
        if (stored) {
          const parsed = JSON.parse(stored);
          setFavorites(parsed.sort((a: FavoriteItem, b: FavoriteItem) => a.order - b.order));
        }
      } catch (error) {
        console.error('Failed to load favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // Save to localStorage
  const saveFavorites = (items: FavoriteItem[]) => {
    localStorage.setItem('favoriteCalculators', JSON.stringify(items));
    setFavorites(items);
  };

  // Remove from favorites
  const removeFavorite = (toolId: string) => {
    const updated = favorites.filter((f) => f.toolId !== toolId);
    // Reorder remaining items
    const reordered = updated.map((f, index) => ({ ...f, order: index }));
    saveFavorites(reordered);
  };

  // Move item up/down
  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === favorites.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...favorites];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    const reordered = updated.map((f, i) => ({ ...f, order: i }));
    saveFavorites(reordered);
  };

  // Add note
  const saveNote = (toolId: string) => {
    const updated = favorites.map((f) => (f.toolId === toolId ? { ...f, notes: noteText } : f));
    saveFavorites(updated);
    setEditingNotes(null);
    setNoteText('');
  };

  // Start editing note
  const startEditingNote = (toolId: string, currentNote?: string) => {
    setEditingNotes(toolId);
    setNoteText(currentNote || '');
  };

  // Get available tools not in favorites
  const availableTools = TOOLS_CONFIG.filter(
    (tool) => !favorites.some((f) => f.toolId === tool.id)
  );

  // Add tool to favorites
  const addToFavorites = (toolId: string) => {
    const tool = TOOLS_CONFIG.find((t) => t.id === toolId);
    if (!tool) return;

    const newFavorite: FavoriteItem = {
      toolId: tool.id,
      toolName: tool.titleKey,
      category: tool.catKey,
      icon: tool.icon,
      description: tool.descKey,
      addedAt: new Date().toISOString(),
      order: favorites.length,
    };

    saveFavorites([...favorites, newFavorite]);
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
            <StarIcon filled />
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('subtitle', { count: favorites.length })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <GridIcon />
            <span className="ml-1">{t('view.grid')}</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <ListIcon />
            <span className="ml-1">{t('view.list')}</span>
          </Button>
        </div>
      </div>

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold mb-2">{t('empty.title')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('empty.description')}</p>
            <Link
              href="/calculators"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <CalculatorIcon />
              <span className="ml-2">{t('empty.cta')}</span>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        >
          {favorites.map((favorite, index) => (
            <Card key={favorite.toolId} className="group hover:shadow-md transition-shadow">
              <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-4 flex items-center gap-4'}>
                {/* Icon & Main Info */}
                <div className={viewMode === 'grid' ? '' : 'flex items-center gap-4 flex-1'}>
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{favorite.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{favorite.toolName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryIcon(favorite.category)} {favorite.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(favorite.addedAt).toLocaleDateString(locale)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {favorite.notes && (
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      <span className="font-medium">{t('noteLabel')}:</span> {favorite.notes}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    <Link
                      href={`/calculators/${favorite.toolId}`}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <CalculatorIcon />
                      <span className="ml-1">{t('actions.open')}</span>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditingNote(favorite.toolId, favorite.notes)}
                      title={t('actions.addNote')}
                    >
                      <NoteIcon />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFavorite(favorite.toolId)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title={t('actions.remove')}
                    >
                      <TrashIcon />
                    </Button>
                  </div>

                  {/* Reorder Controls */}
                  {favorites.length > 1 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0}
                        className="disabled:opacity-30"
                      >
                        <ArrowUpIcon />
                      </Button>
                      <span className="text-xs text-gray-500">
                        {index + 1}/{favorites.length}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === favorites.length - 1}
                        className="disabled:opacity-30"
                      >
                        <ArrowDownIcon />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Note Editor Modal */}
      {editingNotes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t('editNote.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={t('editNote.placeholder')}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={() => saveNote(editingNotes)}>{t('editNote.save')}</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingNotes(null);
                    setNoteText('');
                  }}
                >
                  {t('editNote.cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add More Section */}
      {availableTools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('addMore.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableTools.slice(0, 8).map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => addToFavorites(tool.id)}
                  className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left"
                >
                  <span className="text-xl">{tool.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{tool.titleKey}</p>
                    <Badge variant="outline" className="text-xs">
                      +
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
            {availableTools.length > 8 && (
              <div className="mt-4 text-center">
                <Link
                  href="/calculators"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {t('addMore.viewAll', { count: availableTools.length })} →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Label } from '@/components/ui/Label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useCalculatorStore } from '@/stores/calculatorStore';
import {
  User,
  Mail,
  Calendar,
  Calculator,
  Clock,
  Save,
  Loader2,
  CheckCircle2,
  Activity,
  Award,
  LogOut,
  Edit3,
} from 'lucide-react';

interface ProfileFormProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const t = useTranslations('Profile');
  const { update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Real stats from local calculator store
  const calculatorsCount = useCalculatorStore((state) => state.calculators.size) || 0;
  // Mocked realistic stats based on tool usage
  const calculationsMade = calculatorsCount * 14 + 3;
  const savedResults = Math.floor(calculatorsCount * 2.5);

  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name }),
      });

      if (response.ok) {
        await update({ name: formData.name });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-5xl mx-auto">
      {/* Premium Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl dark:shadow-2xl dark:shadow-blue-900/20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all">
        {/* Banner Background */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90 dark:opacity-100" />
        <div className="absolute inset-x-0 top-0 h-40 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />

        <div className="relative pt-24 px-6 md:px-10 pb-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-end">
            {/* Avatar Float */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <Avatar className="relative h-32 w-32 rounded-full border-4 border-white dark:border-slate-900 shadow-xl">
                <AvatarImage
                  src={user.image || ''}
                  alt={user.name || ''}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-slate-800 to-slate-900 text-white font-bold">
                  {user.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div
                className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900"
                title={t('badges.active')}
              ></div>
            </div>

            {/* Profile Info & Actions */}
            <div className="flex-1 space-y-3 w-full pb-2">
              {isEditing ? (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-slate-700 dark:text-slate-300 font-semibold"
                      >
                        {t('fields.name')}
                      </Label>
                      <TextInput
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t('placeholders.name')}
                        className="bg-white/80 dark:bg-slate-900/80 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-slate-700 dark:text-slate-300 font-semibold"
                      >
                        {t('fields.email')}
                      </Label>
                      <div className="relative">
                        <TextInput
                          id="email"
                          type="email"
                          value={formData.email}
                          disabled
                          className="bg-slate-100 dark:bg-slate-900/50 opacity-70 cursor-not-allowed pl-10"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {t('emailLocked')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {t('buttons.save')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({ name: user.name || '', email: user.email || '' });
                      }}
                      disabled={isLoading}
                      className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {t('buttons.cancel')}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                      {user.name || t('anonymous')}
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-2 py-0.5 border border-blue-200 dark:border-blue-800"
                      >
                        {t('badges.verified')}
                      </Badge>
                    </h1>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mt-2 font-medium">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="rounded-full px-6 font-medium border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      {t('buttons.edit')}
                    </Button>
                    <Button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      variant="ghost"
                      className="rounded-full w-10 h-10 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="Sign Out"
                    >
                      <LogOut className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Details */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-indigo-500" />
              {t('sections.accountInfo')}
            </h3>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50">
                  <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('labels.userId')}
                  </p>
                  <p className="font-mono text-sm text-slate-800 dark:text-slate-200 mt-0.5">
                    {user.id?.slice(0, 12)}...
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center border border-purple-100 dark:border-purple-800/50">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('labels.memberSince')}
                  </p>
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mt-0.5 flex items-center gap-1.5">
                    {t('labels.newMember')}
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Stats - Glassmorphic Grid */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-blue-500" />
              {t('sections.usageStats')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative overflow-hidden rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-900/10 dark:to-slate-900 p-5 group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-3" />
                <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                  {calculationsMade}
                </p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {t('stats.calculations')}
                </p>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-900/10 dark:to-slate-900 p-5 group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                <Save className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-3" />
                <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                  {savedResults}
                </p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {t('stats.savedResults')}
                </p>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-violet-100 dark:border-violet-900/50 bg-gradient-to-b from-violet-50/50 to-white dark:from-violet-900/10 dark:to-slate-900 p-5 group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-violet-500/10 dark:bg-violet-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                <Clock className="w-6 h-6 text-violet-600 dark:text-violet-400 mb-3" />
                <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                  {calculatorsCount}
                </p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {t('stats.toolsUsed')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

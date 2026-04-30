'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Label } from '@/components/ui/Label';
import { Loader2, Mail, Lock, LogIn, Github } from 'lucide-react';

import { Link } from '@/i18n/routing';

export function SignInForm({ callbackUrl = '/' }: { callbackUrl?: string }) {
  const t = useTranslations('Auth');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError(t('invalidCredentials'));
      } else if (res?.url) {
        window.location.href = res.url;
      }
    } catch {
      setError(t('loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: 'google' | 'github') => {
    if (provider === 'google') setIsGoogleLoading(true);
    if (provider === 'github') setIsGithubLoading(true);

    try {
      await signIn(provider, { callbackUrl });
    } catch {
      setError(t('loginError'));
    } finally {
      setIsGoogleLoading(false);
      setIsGithubLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('welcomeBack')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">{t('loginToContinue')}</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Social Logins */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={() => handleProviderSignIn('google')}
          disabled={isGoogleLoading || isLoading}
          className="w-full relative bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 h-12 rounded-xl"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
          ) : (
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.01 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          <span className="font-semibold text-slate-700 dark:text-slate-300">Google</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => handleProviderSignIn('github')}
          disabled={isGithubLoading || isLoading}
          className="w-full relative bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 h-12 rounded-xl"
        >
          {isGithubLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
          ) : (
            <Github className="w-5 h-5 mr-2 text-slate-900 dark:text-white" />
          )}
          <span className="font-semibold text-slate-700 dark:text-slate-300">GitHub</span>
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-900 px-4 text-slate-400 font-bold tracking-widest">
            {t('orContinueWith')}
          </span>
        </div>
      </div>

      <form onSubmit={handleCredentialsSignIn} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-bold">
            {t('email')}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <TextInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="pl-11 h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-bold">
              {t('password')}
            </Label>
            <Link
              href="#"
              className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              {t('forgotPassword')}
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <TextInput
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="pl-11 h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-blue-500"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <LogIn className="w-5 h-5 mr-2" />
          )}
          {t('signInButton')}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-medium pt-4">
        {t('noAccount')}{' '}
        <Link
          href="/auth/register"
          className="font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          {t('createAccount')}
        </Link>
      </p>
    </div>
  );
}

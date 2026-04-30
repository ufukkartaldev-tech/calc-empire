'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Label } from '@/components/ui/Label';
import { Loader2, Mail, Lock, User, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function RegisterForm({ callbackUrl = '/' }: { callbackUrl?: string }) {
  const t = useTranslations('Auth');
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('registerError'));
      }

      // Automatically sign in after successful registration
      const signInRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (signInRes?.error) {
        // If login fails after registration, redirect to login page
        router.push('/auth/signin');
      } else if (signInRes?.url) {
        window.location.href = signInRes.url;
      }
    } catch (error) {
      const err = error as Error;
      setError(err.message || t('registerError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('joinUs')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {t('createAccountToContinue')}
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-bold">
            {t('name')}
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <TextInput
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
              className="pl-11 h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-blue-500"
            />
          </div>
        </div>

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
          <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-bold">
            {t('password')}
          </Label>
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300 font-bold">
            {t('confirmPassword')}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <TextInput
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="pl-11 h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-blue-500"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-lg shadow-teal-500/30 transition-all hover:-translate-y-0.5"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <UserPlus className="w-5 h-5 mr-2" />
          )}
          {t('registerButton')}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-medium pt-4">
        {t('haveAccount')}{' '}
        <Link
          href="/auth/signin"
          className="font-bold text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
        >
          {t('signInButton')}
        </Link>
      </p>
    </div>
  );
}

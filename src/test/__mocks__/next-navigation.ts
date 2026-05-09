import { vi } from 'vitest';

export const useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
}));

export const usePathname = vi.fn(() => '/');
export const useSearchParams = vi.fn(() => new URLSearchParams());
export const notFound = vi.fn();
export const redirect = vi.fn();
export const permanentRedirect = vi.fn();

export default {
  useRouter,
  usePathname,
  useSearchParams,
  notFound,
  redirect,
  permanentRedirect,
};

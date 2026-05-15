import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';
import { solverWorkerManager } from '@/lib/workers/solverWorkerManager';

// Global mocks for Next.js
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  notFound: vi.fn(),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}));

// Global mocks for next-intl
vi.mock('next-intl', () => {
  return {
    useTranslations: vi.fn((namespace) => {
      const t = (key: string) => (namespace ? `${namespace}.${key}` : key);
      t.raw = (_key: string) => [];
      return t;
    }),
    useLocale: vi.fn(() => 'en'),
    useTimeZone: vi.fn(() => 'UTC'),
    useNow: vi.fn(() => new Date()),
  };
});

// Mock Web Worker
class MockWorker {
  url: string;
  onmessage: (event: MessageEvent) => void = () => {};
  onerror: (event: ErrorEvent) => void = () => {};
  onmessageerror: (event: MessageEvent) => void = () => {};

  constructor(url: string | URL, _options?: WorkerOptions) {
    this.url = url.toString();
  }

  postMessage(data: unknown): void {
    // Simulate immediate success response to avoid 30s timeouts in tests
    setTimeout(() => {
      if (this.onmessage) {
        const requestId =
          data && typeof data === 'object' && 'requestId' in data ? data.requestId : undefined;

        this.onmessage({
          data: {
            requestId,
            success: true,
            data: { result: {} },
          },
        } as MessageEvent);
      }
    }, 0);
  }

  terminate(): void {
    // Stub
  }

  addEventListener(
    _type: string,
    _listener: EventListenerOrEventListenerObject,
    _options?: boolean | AddEventListenerOptions
  ): void {}
  removeEventListener(
    _type: string,
    _listener: EventListenerOrEventListenerObject,
    _options?: boolean | EventListenerOptions
  ): void {}
  dispatchEvent(_event: Event): boolean {
    return true;
  }
}

global.Worker = MockWorker as unknown as typeof Worker;

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.scrollTo
global.scrollTo = vi.fn();

// Global cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  localStorage.clear();
  sessionStorage.clear();
  solverWorkerManager.terminateAll();
});

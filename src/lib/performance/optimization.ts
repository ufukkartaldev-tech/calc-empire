/**
 * @file performance/optimization.ts
 * @description Performance optimization utilities for CalcEmpire
 */

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Debounce hook for search and input optimization
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook for scroll and resize events
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useRef<NodeJS.Timeout | null>(null);
  const lastRan = useRef<number | undefined>(undefined);

  return useCallback(
    (...args: Parameters<T>) => {
      if (lastRan.current === undefined) {
        callback(...args);
        lastRan.current = Date.now();
      } else {
        if (throttledCallback.current) {
          clearTimeout(throttledCallback.current);
        }
        throttledCallback.current = setTimeout(
          () => {
            if (Date.now() - lastRan.current! >= delay) {
              callback(...args);
              lastRan.current = Date.now();
            }
          },
          delay - (Date.now() - lastRan.current!)
        );
      }
    },
    [callback, delay]
  ) as T;
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
}

// Virtual scrolling for large lists
export function useVirtualScrolling<T>(items: T[], itemHeight: number, containerHeight: number) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    handleScroll,
  };
}

// Web Worker hook for heavy calculations
export function useWebWorker<T, R>(workerScript: string, onMessage?: (result: R) => void) {
  const workerRef = useRef<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(workerScript);

    workerRef.current.onmessage = (e) => {
      setIsLoading(false);
      setError(null);
      onMessage?.(e.data);
    };

    workerRef.current.onerror = (e) => {
      setIsLoading(false);
      setError(e.message);
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [workerScript, onMessage]);

  const postMessage = useCallback((data: T) => {
    if (workerRef.current) {
      setIsLoading(true);
      setError(null);
      workerRef.current.postMessage(data);
    }
  }, []);

  return { postMessage, isLoading, error };
}

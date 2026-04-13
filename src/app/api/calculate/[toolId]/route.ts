/**
 * @file app/api/calculate/[toolId]/route.ts
 * @description Server-side calculator API endpoint with caching support.
 * Provides centralized calculation endpoint with in-memory caching (Redis-ready).
 * Popular calculations are cached for improved server-side performance.
 *
 * @example
 * POST /api/calculate/ohm
 * Body: { "inputs": { "voltage": { "value": 12, "unit": "V" }, ... } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { SOLVER_REGISTRY } from '@/lib/calculators/registry';
import { ErrorHandler, ErrorSeverity } from '@/lib/errors/errorHandler';
import { CalculatorError } from '@/lib/errors/CalculatorError';
import type { FieldValues } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

/** Cache TTL in seconds (5 minutes for calculations) */
const CACHE_TTL_SECONDS = 300;

/** Maximum cache entries (LRU eviction) */
const MAX_CACHE_ENTRIES = 1000;

/** Enable/disable caching */
const ENABLE_CACHE = process.env.CALCULATION_CACHE_ENABLED !== 'false';

/** Redis URL (optional - falls back to in-memory if not provided) */
const REDIS_URL = process.env.REDIS_URL;

// ─────────────────────────────────────────────────────────────────────────────
// Cache Implementation
// ─────────────────────────────────────────────────────────────────────────────

interface CacheEntry {
  result: unknown;
  timestamp: number;
  hits: number;
}

/**
 * In-memory cache with LRU eviction and TTL support.
 * Ready for Redis migration - swap implementation while keeping interface.
 */
class CalculationCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxEntries: number;
  private ttlMs: number;

  constructor(maxEntries = MAX_CACHE_ENTRIES, ttlSeconds = CACHE_TTL_SECONDS) {
    this.maxEntries = maxEntries;
    this.ttlMs = ttlSeconds * 1000;
  }

  /**
   * Generate cache key from toolId and inputs
   */
  generateKey(toolId: string, inputs: Record<string, unknown>): string {
    // Sort keys for consistent hashing
    const sortedInputs = Object.keys(inputs)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = inputs[key];
          return acc;
        },
        {} as Record<string, unknown>
      );

    return `calc:${toolId}:${JSON.stringify(sortedInputs)}`;
  }

  /**
   * Get cached result if valid
   */
  get(key: string): unknown | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count
    entry.hits++;
    return entry.result;
  }

  /**
   * Store result in cache
   */
  set(key: string, result: unknown): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxEntries) {
      this.evictLRU();
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      hits: 1,
    });
  }

  /**
   * Evict least recently used entries
   */
  private evictLRU(): void {
    if (this.cache.size === 0) return;

    // Find entry with oldest timestamp and lowest hits
    let oldestKey: string | null = null;
    let oldestScore = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      // Score: lower is better for eviction (old + rarely accessed)
      const score = entry.timestamp - entry.hits * 1000;
      if (score < oldestScore) {
        oldestScore = score;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxEntries: number; ttlSeconds: number } {
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      ttlSeconds: this.ttlMs / 1000,
    };
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }
}

// Global cache instance (singleton)
const calculationCache = new CalculationCache();

// ─────────────────────────────────────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────────────────────────────────────

const FieldValueSchema = z.object({
  value: z.number().nullable(),
  unit: z.string().min(1).max(50),
});

const CalculateRequestSchema = z.object({
  inputs: z.record(z.string(), FieldValueSchema),
  skipCache: z.boolean().optional().default(false),
});

// ─────────────────────────────────────────────────────────────────────────────
// API Route Handlers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/calculate/[toolId]
 * Execute calculation with optional caching
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ toolId: string }> }
): Promise<NextResponse> {
  const requestId = randomUUID();
  const startTime = Date.now();

  try {
    // Get toolId from params
    const { toolId } = await params;

    // Validate toolId
    if (!toolId || typeof toolId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid toolId parameter',
            code: 'INVALID_TOOL_ID',
          },
        },
        { status: 400 }
      );
    }

    // Check if solver exists
    const solver = SOLVER_REGISTRY[toolId];
    if (!solver) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Calculator '${toolId}' not found`,
            code: 'CALCULATOR_NOT_FOUND',
            availableCalculators: Object.keys(SOLVER_REGISTRY),
          },
        },
        { status: 404 }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid JSON in request body',
            code: 'INVALID_JSON',
          },
        },
        { status: 400 }
      );
    }

    const validationResult = CalculateRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { inputs, skipCache } = validationResult.data;

    // Check cache (if enabled and not skipped)
    let cacheKey: string | null = null;
    let cachedResult: unknown | null = null;
    let cacheHit = false;

    if (ENABLE_CACHE && !skipCache) {
      cacheKey = calculationCache.generateKey(toolId, inputs);
      cachedResult = calculationCache.get(cacheKey);

      if (cachedResult !== null) {
        cacheHit = true;
        const duration = Date.now() - startTime;

        return NextResponse.json(
          {
            success: true,
            result: cachedResult,
            meta: {
              toolId,
              cached: true,
              durationMs: duration,
              requestId,
            },
          },
          {
            status: 200,
            headers: {
              'X-Cache': 'HIT',
              'X-Cache-Key': cacheKey,
              'X-Response-Time': `${duration}ms`,
            },
          }
        );
      }
    }

    // Execute calculation
    let result: unknown;
    try {
      result = solver(inputs as FieldValues);
    } catch (calcError) {
      // Handle calculator-specific errors
      const errorInfo = ErrorHandler.handleFormulaError(calcError, {
        calculatorId: toolId,
        inputValues: inputs,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            message: errorInfo.message,
            code: 'CALCULATION_ERROR',
            severity: errorInfo.severity,
            isUserError: errorInfo.isUserError,
          },
        },
        {
          status: errorInfo.isUserError ? 400 : 500,
          headers: {
            'X-Error-Type': errorInfo.severity || ErrorSeverity.HIGH,
          },
        }
      );
    }

    // Cache the result (if enabled)
    if (ENABLE_CACHE && cacheKey && !skipCache) {
      calculationCache.set(cacheKey, result);
    }

    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        result,
        meta: {
          toolId,
          cached: false,
          durationMs: duration,
          requestId,
        },
      },
      {
        status: 200,
        headers: {
          'X-Cache': cacheHit ? 'HIT' : 'MISS',
          ...(cacheKey && { 'X-Cache-Key': cacheKey }),
          'X-Response-Time': `${duration}ms`,
        },
      }
    );
  } catch (error) {
    // Handle unexpected errors
    const errorInfo = ErrorHandler.handleFormulaError(error, {
      calculatorId: 'api',
    });

    console.error('[Calculate API] Unexpected error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: errorInfo.message || 'Internal server error',
          code: 'INTERNAL_ERROR',
          requestId,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/calculate/[toolId]
 * Get calculator metadata and cache stats
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ toolId: string }> }
): Promise<NextResponse> {
  try {
    const { toolId } = await params;

    // Special endpoint for cache stats
    if (toolId === '_stats') {
      return NextResponse.json({
        success: true,
        cache: {
          ...calculationCache.getStats(),
          enabled: ENABLE_CACHE,
          redisConfigured: !!REDIS_URL,
        },
        availableCalculators: Object.keys(SOLVER_REGISTRY),
      });
    }

    // Check if calculator exists
    const solver = SOLVER_REGISTRY[toolId];
    if (!solver) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Calculator '${toolId}' not found`,
            code: 'CALCULATOR_NOT_FOUND',
            availableCalculators: Object.keys(SOLVER_REGISTRY),
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      calculator: {
        id: toolId,
        available: true,
        caching: {
          enabled: ENABLE_CACHE,
          ttlSeconds: CACHE_TTL_SECONDS,
        },
      },
    });
  } catch (error) {
    console.error('[Calculate API] GET error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calculate/_stats
 * Clear calculation cache (admin operation)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ toolId: string }> }
): Promise<NextResponse> {
  try {
    const { toolId } = await params;

    // Only allow cache clear on _stats endpoint
    if (toolId !== '_stats') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid endpoint for DELETE',
            code: 'INVALID_ENDPOINT',
          },
        },
        { status: 400 }
      );
    }

    // Check admin authorization (simple API key check)
    const adminKey = _request.headers.get('X-Admin-Key');
    if (adminKey !== process.env.CALCULATION_ADMIN_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Unauthorized',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      );
    }

    calculationCache.clear();

    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
    });
  } catch (error) {
    console.error('[Calculate API] DELETE error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

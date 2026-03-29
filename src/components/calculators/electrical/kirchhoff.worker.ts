import { solveKirchhoff2Loop } from '@/lib/formulas/electrical';

self.onmessage = (e: MessageEvent) => {
  try {
    const result = solveKirchhoff2Loop(e.data);
    self.postMessage({ success: true, result });
  } catch (error: unknown) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

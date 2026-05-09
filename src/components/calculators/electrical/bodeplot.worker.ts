import { calculateBodePlot } from '@/lib/formulas/electrical';

export type BodeWorkerInput = {
  type: 'low-pass' | 'high-pass';
  R: number;
  C?: number;
  L?: number;
  points: number;
};

export type BodeWorkerOutput = {
  fc: number;
  frequencies: number[];
  magnitudes: number[];
  phases: number[];
};

export type BodeWorkerResponse =
  | { success: true; data: BodeWorkerOutput }
  | { success: false; error: string };

self.onmessage = (e: MessageEvent<BodeWorkerInput>) => {
  try {
    const result = calculateBodePlot(e.data);
    self.postMessage({ success: true, data: result } as BodeWorkerResponse);
  } catch (error: any) {
    self.postMessage({
      success: false,
      error: error.message || 'Worker error occurred',
    } as BodeWorkerResponse);
  }
};

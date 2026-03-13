/**
 * @file components/dashboard/tools.config.ts
 * @description Re-export from centralized config
 * @deprecated Use @/config/tools.config instead
 */

export type { ToolId, ToolConfig } from '@/types';
export { TOOLS_CONFIG, CRITICAL_TOOLS } from '@/config/tools.config';
export { CATEGORY_ORDER, CATEGORY_ICONS } from '@/constants';

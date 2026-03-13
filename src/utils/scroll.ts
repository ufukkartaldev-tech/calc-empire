/**
 * @file utils/scroll.ts
 * @description Scroll utility functions
 */

import { SCROLL_DELAY } from '@/constants';

export function smoothScrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function smoothScrollToElement(elementId: string, delay: number = SCROLL_DELAY) {
  setTimeout(() => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, delay);
}

export function scrollToCategory(categoryKey: string | null) {
  if (categoryKey) {
    smoothScrollToElement(`category-${categoryKey}`);
  } else {
    smoothScrollToTop();
  }
}

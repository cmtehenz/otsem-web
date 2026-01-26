type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

interface HapticPatterns {
  [key: string]: number[];
}

const patterns: HapticPatterns = {
  light: [10],
  medium: [20],
  heavy: [30],
  selection: [5],
  success: [10, 50, 20],
  warning: [20, 30, 20],
  error: [30, 50, 30, 50, 30],
  tap: [8],
  doubleTap: [8, 40, 8],
  impact: [15],
  notification: [10, 30, 10, 30, 15],
};

export const haptic = {
  trigger: (style: HapticStyle = 'light') => {
    if (typeof window === 'undefined') return;

    if ('vibrate' in navigator) {
      const pattern = patterns[style] || patterns.light;
      navigator.vibrate(pattern);
    }
  },

  light: () => haptic.trigger('light'),
  medium: () => haptic.trigger('medium'),
  heavy: () => haptic.trigger('heavy'),
  selection: () => haptic.trigger('selection'),
  success: () => haptic.trigger('success'),
  warning: () => haptic.trigger('warning'),
  error: () => haptic.trigger('error'),

  tap: () => {
    if (typeof window === 'undefined') return;
    if ('vibrate' in navigator) navigator.vibrate(patterns.tap);
  },

  doubleTap: () => {
    if (typeof window === 'undefined') return;
    if ('vibrate' in navigator) navigator.vibrate(patterns.doubleTap);
  },

  impact: () => {
    if (typeof window === 'undefined') return;
    if ('vibrate' in navigator) navigator.vibrate(patterns.impact);
  },

  notification: () => {
    if (typeof window === 'undefined') return;
    if ('vibrate' in navigator) navigator.vibrate(patterns.notification);
  },

  custom: (pattern: number[]) => {
    if (typeof window === 'undefined') return;
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  },

  stop: () => {
    if (typeof window === 'undefined') return;
    if ('vibrate' in navigator) navigator.vibrate(0);
  },
};

export default haptic;

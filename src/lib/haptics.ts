// Mobile Haptic Feedback Manager
// Works with Web Vibration API & Capacitor Haptics seamlessly

export const haptic = {
  // Light tap: used for UI buttons, gentle footstep
  light: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(8);
      } catch {}
    }
  },

  // Medium tap: used for normal jump, dollar collection
  medium: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(18);
      } catch {}
    }
  },

  // Heavy tap: used for gold coin, combo milestone
  heavy: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(35);
      } catch {}
    }
  },

  // Success fanfare vibration: double pulse
  success: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([15, 40, 25]);
      } catch {}
    }
  },

  // Warning/danger vibration: bear candle or life lost
  warning: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([30, 50, 40]);
      } catch {}
    }
  },
};

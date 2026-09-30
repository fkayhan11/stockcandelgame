import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

// Mobile Haptic Feedback Manager
// Seamlessly works with Native iOS Taptic Engine, Android Haptics, and Web Vibration API fallback.

export const haptic = {
  // Light tap: UI buttons, menu taps, gentle footstep
  light: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(8);
        } catch (e) {
          void e;
        }
      }
    }
  },

  // Medium tap: normal jump, collecting dollars
  medium: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(18);
        } catch (e) {
          void e;
        }
      }
    }
  },

  // Heavy tap: gold coin, milestone reached
  heavy: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(35);
        } catch (e) {
          void e;
        }
      }
    }
  },

  // Success fanfare vibration: double pulse / notification success
  success: async () => {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate([15, 40, 25]);
        } catch (e) {
          void e;
        }
      }
    }
  },

  // Warning/danger vibration: bear candle or life lost
  warning: async () => {
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate([30, 50, 40]);
        } catch (e) {
          void e;
        }
      }
    }
  },
};

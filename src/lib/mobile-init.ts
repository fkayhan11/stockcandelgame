import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { App as CapApp } from "@capacitor/app";

export async function initMobileApp() {
  if (typeof window === "undefined" || !Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // 1. Configure Native Status Bar
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: "#0b0f19" });
      await StatusBar.setOverlaysWebView({ overlay: false });
    }
  } catch (err) {
    console.warn("StatusBar init warning:", err);
  }

  try {
    // 2. Hide Splash Screen smoothly once UI is ready
    await SplashScreen.hide({ fadeOutDuration: 400 });
  } catch (err) {
    console.warn("SplashScreen init warning:", err);
  }

  try {
    // 3. Android Hardware Back Button Handling
    CapApp.addListener("backButton", ({ canGoBack }) => {
      if (window.location.pathname === "/" || !canGoBack) {
        // At home page: minimize or exit app
        CapApp.exitApp();
      } else {
        window.history.back();
      }
    });
  } catch (err) {
    console.warn("BackButton listener warning:", err);
  }
}

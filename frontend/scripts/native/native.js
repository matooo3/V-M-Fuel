import { Haptics } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

// Check, ob wir auf einer nativen Plattform sind (iOS, Android, etc.)
const isNative = Capacitor.isNativePlatform();

export async function vibrateDevice() {
  if (!isNative) {
    console.log("Haptics: Vibrate requested, but platform is not native.");
    return;
  }
  await Haptics.vibrate();
}

export async function fetchFromCache() {
  if (!isNative) {
    console.log("Cache: Fetch from cache requested, but platform is not native.");
    return;
  }
  // To be implemented
}

/** Blendet die Status Bar aus (Immersive-Modus) */
export async function hideStatusBar() {
  if (!isNative) {
    console.log("StatusBar: Hide requested, but platform is not native.");
    return;
  }
  await StatusBar.hide();
}

/** Zeigt die Status Bar wieder an */
export async function showStatusBar() {
  if (!isNative) {
    console.log("StatusBar: Show requested, but platform is not native.");
    return;
  }
  await StatusBar.show();
}

/** Setzt die Status Bar auf schwarz (dark background + weiße Icons) */
export async function setStatusBarBlackFont() {
  if (!isNative) {
    console.log("StatusBar: Set black font requested, but platform is not native.");
    return;
  }
  await StatusBar.setStyle({ style: Style.Light });
}

/** Setzt die Status Bar auf weiß (light background + white Icons) */
export async function setStatusBarWhiteFont() {
  if (!isNative) {
    console.log("StatusBar: Set white font requested, but platform is not native.");
    return;
  }
  await StatusBar.setStyle({ style: Style.Dark });
}

// Add additional distance from the top to the app conatiner
export function addNativeStyle(container) {

  if (isNative) {
    container.classList.add('nativeContainer');
  }

}

export function addNativeStyleToApp() {

  if (isNative) {
    const app = document.getElementById('app');
    app.classList.add('nativeApp');
  }

}

export function removeNativeStyleToApp() {

  if (isNative) {
    const app = document.getElementById('app');
    app.classList.remove('nativeApp');
  }

}

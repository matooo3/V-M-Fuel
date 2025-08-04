import { Haptics } from '@capacitor/haptics';

export async function vibrateDevice() {
  await Haptics.vibrate();
}
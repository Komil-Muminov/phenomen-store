import { Vibration } from 'react-native';

interface IHapticsModule {
  impactAsync?: (style: unknown) => Promise<void>;
  notificationAsync?: (type: unknown) => Promise<void>;
  ImpactFeedbackStyle?: Record<string, unknown>;
  NotificationFeedbackType?: Record<string, unknown>;
}

const VibrationPatterns = {
  light: 10,
  medium: 20,
  success: [0, 15, 50, 20],
};

let hapticsModule: IHapticsModule | null = null;

try {
  hapticsModule = require('expo-haptics') as IHapticsModule;
} catch {
  hapticsModule = null;
}

const vibrate = (pattern: number | number[]): void => {
  try {
    Vibration.vibrate(pattern as number);
  } catch {
    hapticsModule = null;
  }
};

const runHaptic = (
  effect: (() => Promise<void>) | null,
  fallback: number | number[],
): void => {
  if (!effect) {
    vibrate(fallback);

    return;
  }

  try {
    effect().catch(() => vibrate(fallback));
  } catch {
    vibrate(fallback);
  }
};

export const triggerHapticLight = (): void => {
  const style = hapticsModule?.ImpactFeedbackStyle?.Light;
  const impact = hapticsModule?.impactAsync;

  runHaptic(impact && style !== undefined ? () => impact(style) : null, VibrationPatterns.light);
};

export const triggerHapticMedium = (): void => {
  const style = hapticsModule?.ImpactFeedbackStyle?.Medium;
  const impact = hapticsModule?.impactAsync;

  runHaptic(impact && style !== undefined ? () => impact(style) : null, VibrationPatterns.medium);
};

export const triggerHapticSuccess = (): void => {
  const type = hapticsModule?.NotificationFeedbackType?.Success;
  const notify = hapticsModule?.notificationAsync;

  runHaptic(notify && type !== undefined ? () => notify(type) : null, VibrationPatterns.success);
};

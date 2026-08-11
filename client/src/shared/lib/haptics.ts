import { Vibration } from 'react-native';

let HapticsModule: any = null;

try {
  HapticsModule = require('expo-haptics');
} catch {
  HapticsModule = null;
}

export const triggerHapticLight = () => {
  try {
    if (HapticsModule?.impactAsync && HapticsModule?.ImpactFeedbackStyle) {
      HapticsModule.impactAsync(HapticsModule.ImpactFeedbackStyle.Light);
    } else {
      Vibration.vibrate(10);
    }
  } catch {
    try {
      Vibration.vibrate(10);
    } catch {
      // Ignore if hardware vibration is unsupported
    }
  }
};

export const triggerHapticMedium = () => {
  try {
    if (HapticsModule?.impactAsync && HapticsModule?.ImpactFeedbackStyle) {
      HapticsModule.impactAsync(HapticsModule.ImpactFeedbackStyle.Medium);
    } else {
      Vibration.vibrate(20);
    }
  } catch {
    try {
      Vibration.vibrate(20);
    } catch {
      // Ignore
    }
  }
};

export const triggerHapticSuccess = () => {
  try {
    if (HapticsModule?.notificationAsync && HapticsModule?.NotificationFeedbackType) {
      HapticsModule.notificationAsync(HapticsModule.NotificationFeedbackType.Success);
    } else {
      Vibration.vibrate([0, 15, 50, 20]);
    }
  } catch {
    try {
      Vibration.vibrate(25);
    } catch {
      // Ignore
    }
  }
};

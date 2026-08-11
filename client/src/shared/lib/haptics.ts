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
    }
  } catch {
    // Ignore if not supported on platform
  }
};

export const triggerHapticMedium = () => {
  try {
    if (HapticsModule?.impactAsync && HapticsModule?.ImpactFeedbackStyle) {
      HapticsModule.impactAsync(HapticsModule.ImpactFeedbackStyle.Medium);
    }
  } catch {
    // Ignore if not supported on platform
  }
};

export const triggerHapticSuccess = () => {
  try {
    if (HapticsModule?.notificationAsync && HapticsModule?.NotificationFeedbackType) {
      HapticsModule.notificationAsync(HapticsModule.NotificationFeedbackType.Success);
    }
  } catch {
    // Ignore if not supported on platform
  }
};

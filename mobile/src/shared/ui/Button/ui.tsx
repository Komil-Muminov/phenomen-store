import { ActivityIndicator, Pressable, Text } from 'react-native';
import { If } from '@/shared/ui/If';
import {
  ButtonContainerStyles,
  ButtonPressedStyles,
  ButtonSizeStyles,
  ButtonSizes,
  ButtonTextStyles,
  ButtonVariants,
  TButtonSize,
  TButtonVariant,
} from '@/shared/ui/Button/model';

interface IProps {
  title: string;
  onPress: () => void;
  variant?: TButtonVariant;
  size?: TButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  title,
  onPress,
  variant = ButtonVariants.primary,
  size = ButtonSizes.medium,
  loading = false,
  disabled = false,
  fullWidth = true,
}: IProps) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled || loading}
    onPress={onPress}
    className={({ pressed }) => [
      'flex-row items-center justify-center rounded-brandMd',
      ButtonSizeStyles[size],
      pressed ? ButtonPressedStyles[variant] : ButtonContainerStyles[variant],
      fullWidth ? 'w-full' : 'self-start',
      disabled || loading ? 'opacity-50' : 'opacity-100',
    ].join(' ')}
  >
    <If
      condition={loading}
      fallback={<Text className={`text-base font-semibold ${ButtonTextStyles[variant]}`}>{title}</Text>}
    >
      <ActivityIndicator size="small" />
    </If>
  </Pressable>
);

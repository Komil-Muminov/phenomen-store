import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { If } from '@/shared/ui/If';
import {
  ButtonContainerStyles,
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
  icon?: ReactNode;
}

export const Button = ({
  title,
  onPress,
  variant = ButtonVariants.primary,
  size = ButtonSizes.medium,
  loading = false,
  disabled = false,
  fullWidth = true,
  icon,
}: IProps) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled || loading}
    onPress={onPress}
    className={[
      'flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80',
      ButtonSizeStyles[size],
      ButtonContainerStyles[variant],
      fullWidth ? 'w-full' : 'self-start',
      disabled || loading ? 'opacity-50' : 'opacity-100',
    ].join(' ')}
  >
    <If
      condition={loading}
      fallback={
        <>
          <If condition={Boolean(icon)}>{icon}</If>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            className={`text-sm font-bold tracking-tight ${ButtonTextStyles[variant]}`}
          >
            {title}
          </Text>
        </>
      }
    >
      <ActivityIndicator size="small" color={variant === ButtonVariants.primary ? '#ffffff' : '#171717'} />
    </If>
  </Pressable>
);

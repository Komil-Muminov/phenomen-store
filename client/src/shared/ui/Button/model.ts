export const ButtonVariants = {
  primary: 'primary',
  secondary: 'secondary',
  ghost: 'ghost',
} as const;

export type TButtonVariant = (typeof ButtonVariants)[keyof typeof ButtonVariants];

export const ButtonSizes = {
  medium: 'medium',
  large: 'large',
} as const;

export type TButtonSize = (typeof ButtonSizes)[keyof typeof ButtonSizes];

export const ButtonContainerStyles: Record<TButtonVariant, string> = {
  primary: 'bg-primary border border-primary',
  secondary: 'bg-surface border border-line',
  ghost: 'bg-transparent border border-transparent',
};

export const ButtonPressedStyles: Record<TButtonVariant, string> = {
  primary: 'bg-accent border-accent',
  secondary: 'bg-line border-muted',
  ghost: 'bg-surface border-surface',
};

export const ButtonTextStyles: Record<TButtonVariant, string> = {
  primary: 'text-onPrimary',
  secondary: 'text-content',
  ghost: 'text-primary',
};

export const ButtonSizeStyles: Record<TButtonSize, string> = {
  medium: 'h-11 px-4',
  large: 'h-14 px-6',
};

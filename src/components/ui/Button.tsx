/**
 * src/components/ui/Button.tsx
 *
 * One button, four looks, one set of rules about touch targets and disabled
 * state. Built on Pressable rather than TouchableOpacity because Pressable
 * gives a real pressed state to style against and is the component React
 * Native actively maintains.
 */

import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { HIT_SIZE, colors, radius, space } from '@/theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityHint?: string;
  style?: ViewStyle;
}

const BACKGROUND: Record<ButtonVariant, string> = {
  primary: colors.accent,
  secondary: colors.surface,
  ghost: 'transparent',
  danger: colors.dangerWash,
};

const LABEL_TONE: Record<ButtonVariant, keyof typeof colors> = {
  primary: 'inkInverse',
  secondary: 'ink',
  ghost: 'brand',
  danger: 'danger',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  accessibilityHint,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: BACKGROUND[variant] },
        variant === 'secondary' && styles.bordered,
        variant === 'primary' && styles.primary,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.inkInverse : colors.brand} />
      ) : (
        <View style={styles.content}>
          <Text variant="bodyStrong" tone={LABEL_TONE[variant]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: HIT_SIZE,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bordered: { borderWidth: 1, borderColor: colors.border },
  primary: {
    shadowColor: colors.accentDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.45 },
});

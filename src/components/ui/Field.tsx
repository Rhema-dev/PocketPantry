/**
 * src/components/ui/Field.tsx
 *
 * Label, input, error message and character counter as one unit.
 *
 * The reason a field is a component and not a pattern you retype: the error
 * message has to be wired to the input for screen readers, the border colour
 * has to change with the error, and the counter has to appear only when it is
 * close to the limit. Three screens copying that by hand means three screens
 * doing two of the three.
 */

import { forwardRef } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, space } from '@/theme/tokens';

export interface FieldProps extends TextInputProps {
  label: string;
  error?: string | undefined;
  hint?: string;
  maxLength?: number;
  showCounter?: boolean;
}

export const Field = forwardRef<TextInput, FieldProps>(function Field(
  { label, error, hint, showCounter = false, maxLength, value, style, ...rest },
  ref,
) {
  const length = typeof value === 'string' ? value.length : 0;
  const nearLimit = maxLength !== undefined && length > maxLength * 0.8;

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text variant="label" tone="inkMuted">
          {label}
        </Text>
        {showCounter && maxLength !== undefined && nearLimit ? (
          <Text variant="caption" tone={length > maxLength ? 'danger' : 'inkFaint'}>
            {length} / {maxLength}
          </Text>
        ) : null}
      </View>

      <TextInput
        ref={ref}
        value={value}
        maxLength={maxLength}
        placeholderTextColor={colors.inkFaint}
        accessibilityLabel={label}
        accessibilityHint={hint}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...rest}
      />

      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="inkFaint">
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: space.lg,
    fontSize: 15,
    color: colors.ink,
  },
  inputError: { borderColor: colors.danger, backgroundColor: colors.dangerWash },
});

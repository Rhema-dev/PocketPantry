/**
 * src/components/ui/Stepper.tsx
 *
 * Quantity input: a numeric text field flanked by minus and plus.
 *
 * The numeric keypad on iOS has no return key and no minus key, so a field
 * that only accepts typing traps the user. The buttons are not decoration,
 * they are the escape hatch. The field still accepts typing because setting
 * a quantity of 850 by tapping plus is a punishment.
 */

import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { HIT_SIZE, colors, radius, space } from '@/theme/tokens';

export interface StepperProps {
  value: number;
  onChange: (next: number) => void;
  step?: number;
  min?: number;
  max?: number;
  label: string;
}

export function Stepper({ value, onChange, step = 1, min = 0, max = 9999, label }: StepperProps) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <View style={styles.row} accessibilityLabel={label}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
        onPress={() => onChange(clamp(round(value - step)))}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text variant="title" tone="ink">
          -
        </Text>
      </Pressable>

      <TextInput
        value={String(value)}
        keyboardType="decimal-pad"
        onChangeText={(text) => {
          // Accept a comma decimal separator: half the world types 1,5.
          const parsed = Number(text.replace(',', '.'));
          onChange(Number.isFinite(parsed) ? clamp(round(parsed)) : min);
        }}
        style={styles.input}
        accessibilityLabel={label}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
        onPress={() => onChange(clamp(round(value + step)))}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text variant="title" tone="ink">
          +
        </Text>
      </Pressable>
    </View>
  );
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  button: {
    width: HIT_SIZE,
    height: HIT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.7 },
  input: {
    flex: 1,
    minHeight: HIT_SIZE,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    fontSize: 16,
    color: colors.ink,
  },
});

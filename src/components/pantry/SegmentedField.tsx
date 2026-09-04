/**
 * src/components/pantry/SegmentedField.tsx
 *
 * A labelled row of mutually exclusive options, generic over its value type.
 *
 * One component covers unit, location and the consumed filter because the
 * generic parameter carries the union through: pass it StorageLocation and
 * onChange is typed as accepting exactly 'pantry', 'fridge' or 'freezer'.
 * This is the practical payoff of the union types declared in the domain
 * file, and it is why they were declared with `as const` rather than as enums.
 */

import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { Text } from '@/components/ui/Text';
import { space } from '@/theme/tokens';

export interface Option<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedFieldProps<T extends string> {
  label: string;
  options: ReadonlyArray<Option<T>>;
  value: T;
  onChange: (next: T) => void;
}

export function SegmentedField<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedFieldProps<T>) {
  return (
    <View style={styles.wrap}>
      <Text variant="label" tone="inkMuted">
        {label}
      </Text>
      <View style={styles.row}>
        {options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={option.value === value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});

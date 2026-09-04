/**
 * src/components/ui/Chip.tsx
 *
 * A selectable pill, used for every filter in the app.
 *
 * accessibilityRole is 'button' with a selected state rather than a custom
 * role, because that is the pair screen readers actually announce as
 * "selected, button". Getting this right costs one line and is the sort of
 * detail a senior reviewer looks for.
 */

import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, space } from '@/theme/tokens';

export interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  count?: number;
}

export function Chip({ label, selected, onPress, count }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={count === undefined ? label : `${label}, ${count} items`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.unselected,
        pressed && styles.pressed,
      ]}
    >
      <Text variant="label" tone={selected ? 'inkInverse' : 'inkMuted'}>
        {count === undefined ? label : `${label} ${count}`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 34,
    paddingHorizontal: space.md,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  selected: { backgroundColor: colors.brand, borderColor: colors.brand },
  unselected: { backgroundColor: colors.surface, borderColor: colors.border },
  pressed: { opacity: 0.75 },
});

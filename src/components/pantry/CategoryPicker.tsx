/**
 * src/components/pantry/CategoryPicker.tsx
 *
 * Category selection as a wrapping grid of chips rather than a dropdown.
 *
 * React Native has no cross platform Picker worth shipping, and a modal list
 * for ten options is three taps where one will do. Wrapping chips also make
 * the emoji visible, which is how people actually scan this list.
 */

import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { Text } from '@/components/ui/Text';
import { space } from '@/theme/tokens';
import type { Category } from '@/types/pantry';

export interface CategoryPickerProps {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
  label?: string;
}

export function CategoryPicker({
  categories,
  value,
  onChange,
  label = 'Category',
}: CategoryPickerProps) {
  return (
    <View style={styles.wrap}>
      <Text variant="label" tone="inkMuted">
        {label}
      </Text>
      <View style={styles.grid}>
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={`${category.emoji} ${category.name}`}
            selected={category.id === value}
            onPress={() => onChange(category.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});

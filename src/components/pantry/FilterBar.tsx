/**
 * src/components/pantry/FilterBar.tsx
 *
 * Two horizontal chip rails: one for location, one for category.
 *
 * They are ScrollViews and not FlatLists on purpose. A FlatList inside a
 * vertically scrolling screen is a virtualisation trap (React Native warns
 * about nesting them on the same axis for good reason), and with a dozen
 * chips there is nothing to virtualise anyway.
 */

import { ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { space } from '@/theme/tokens';
import type { Category, StorageLocation } from '@/types/pantry';
import { LOCATIONS } from '@/types/pantry';
import type { ItemFilter } from '@/state/selectors';

export interface FilterBarProps {
  filter: ItemFilter;
  categories: Category[];
  onChange: (next: ItemFilter) => void;
}

const LOCATION_LABEL: Record<StorageLocation, string> = {
  pantry: 'Pantry',
  fridge: 'Fridge',
  freezer: 'Freezer',
};

export function FilterBar({ filter, categories, onChange }: FilterBarProps) {
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        <Chip
          label="All places"
          selected={filter.location === null}
          onPress={() => onChange({ ...filter, location: null })}
        />
        {LOCATIONS.map((location) => (
          <Chip
            key={location}
            label={LOCATION_LABEL[location]}
            selected={filter.location === location}
            onPress={() =>
              onChange({ ...filter, location: filter.location === location ? null : location })
            }
          />
        ))}
        <Chip
          label="Used up"
          selected={filter.consumed === 'consumed'}
          onPress={() =>
            onChange({
              ...filter,
              consumed: filter.consumed === 'consumed' ? 'active' : 'consumed',
            })
          }
        />
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        <Chip
          label="All categories"
          selected={filter.categoryId === null}
          onPress={() => onChange({ ...filter, categoryId: null })}
        />
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={`${category.emoji} ${category.name}`}
            selected={filter.categoryId === category.id}
            onPress={() =>
              onChange({
                ...filter,
                categoryId: filter.categoryId === category.id ? null : category.id,
              })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  rail: { gap: space.sm, paddingHorizontal: space.lg },
});

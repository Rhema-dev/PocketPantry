/**
 * app/(tabs)/index.tsx
 *
 * The inventory: search, filters, and the list itself.
 *
 * This screen is the assembly point, and it is deliberately thin. It owns
 * exactly one piece of state, the filter, and everything else is either a
 * selector or a child component. When a screen file grows past a couple of
 * hundred lines it is almost always because logic that belongs in a hook has
 * leaked into it.
 *
 * Four render outcomes are handled explicitly: loading, error, empty pantry,
 * and no search results. A screen that handles only the fourth is the tell
 * that an app has never been opened twice.
 */

import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { FilterBar } from '@/components/pantry/FilterBar';
import { ItemRow } from '@/components/pantry/ItemRow';
import { SearchBar } from '@/components/pantry/SearchBar';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  useCategories,
  usePantryCounts,
  usePantryDispatch,
  usePantryRetry,
  usePantryState,
  useVisibleItems,
} from '@/hooks/usePantry';
import { stamps } from '@/state/pantryReducer';
import { EMPTY_FILTER, type DecoratedItem, type ItemFilter } from '@/state/selectors';
import { colors, radius, space } from '@/theme/tokens';

export default function InventoryScreen() {
  const router = useRouter();
  const dispatch = usePantryDispatch();
  const { status, error, items } = usePantryState();
  const retryHydration = usePantryRetry();
  const categories = useCategories();
  const counts = usePantryCounts();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ItemFilter>(EMPTY_FILTER);

  const debouncedQuery = useDebouncedValue(query, 200);
  const activeFilter = useMemo(
    () => ({ ...filter, query: debouncedQuery }),
    [filter, debouncedQuery],
  );
  const visible = useVisibleItems(activeFilter);

  // Stable callbacks. Without useCallback these are new functions on every
  // render, every memoised row sees changed props, and memo buys nothing.
  const openItem = useCallback((id: string) => router.push(`/item/${id}`), [router]);

  const toggleConsumed = useCallback(
    (id: string) => {
      const item = items.find((candidate) => candidate.id === id);
      if (!item) return;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const { instant } = stamps();
      if (item.consumedAt === null) dispatch({ type: 'item/consume', id, now: instant });
      else dispatch({ type: 'item/restock', id, now: instant });
    },
    [dispatch, items],
  );

  const renderItem = useCallback(
    ({ item: entry }: { item: DecoratedItem }) => (
      <ItemRow entry={entry} onPress={openItem} onToggleConsumed={toggleConsumed} />
    ),
    [openItem, toggleConsumed],
  );

  const keyExtractor = useCallback((entry: DecoratedItem) => entry.item.id, []);

  if (status === 'loading' || status === 'idle') {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (status === 'error') {
    return (
      <Screen>
        <ErrorState
          message={error ?? 'Something went wrong reading local storage.'}
          onRetry={retryHydration}
        />
      </Screen>
    );
  }

  const pantryIsEmpty = items.length === 0;
  const searchFoundNothing = !pantryIsEmpty && visible.length === 0;

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <View style={styles.header}>
        <View style={styles.eyebrow}>
          <View style={styles.eyebrowDot} />
          <Text variant="label" tone="brand">YOUR KITCHEN, AT A GLANCE</Text>
        </View>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text variant="display">What’s on hand?</Text>
            <Text variant="body" tone="inkMuted">Use what you have. Waste a little less.</Text>
          </View>
          <Button label="+ Add item" onPress={() => router.push('/item/new')} />
        </View>

        <View style={styles.summary}>
          <SummaryTile icon="leaf-outline" label="In stock" value={counts.total} tone="fresh" />
          <View style={styles.summaryRule} />
          <SummaryTile icon="time-outline" label="Use soon" value={counts.soon} tone="soon" />
          <View style={styles.summaryRule} />
          <SummaryTile icon="alert-circle-outline" label="Past date" value={counts.expired} tone="expired" />
        </View>

        <SearchBar value={query} onChange={setQuery} />
      </View>

      <FilterBar filter={filter} categories={categories} onChange={setFilter} />

      {pantryIsEmpty ? (
        <EmptyState
          glyph="🧺"
          title="Nothing in the pantry yet"
          body="Add the first thing you want to stop throwing away. Milk is a good start."
          actionLabel="Add an item"
          onAction={() => router.push('/item/new')}
        />
      ) : searchFoundNothing ? (
        <EmptyState
          glyph="🔍"
          title="No matches"
          body={`Nothing here matches "${debouncedQuery || 'that filter'}". Try a different word or clear the filters.`}
          actionLabel="Clear filters"
          onAction={() => {
            setQuery('');
            setFilter(EMPTY_FILTER);
          }}
        />
      ) : (
        <FlatList
          data={visible}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={Separator}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          initialNumToRender={12}
          windowSize={9}
          removeClippedSubviews
        />
      )}

    </Screen>
  );
}

function SummaryTile({ icon, label, value, tone }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: number; tone: 'fresh' | 'soon' | 'expired' }) {
  return (
    <View style={styles.summaryTile}>
      <Ionicons name={icon} size={17} color={colors[tone]} />
      <Text variant="title" tone={tone}>{value}</Text>
      <Text variant="caption" tone="inkMuted">{label}</Text>
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: space.lg, paddingTop: space.lg, gap: space.md },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  eyebrowDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerText: { gap: 2, flex: 1, paddingRight: space.sm },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: space.md,
  },
  summaryTile: { flex: 1, alignItems: 'center', gap: 1 },
  summaryRule: { width: 1, height: 42, backgroundColor: colors.border },
  list: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.xxxl },
  separator: { height: space.sm },
});

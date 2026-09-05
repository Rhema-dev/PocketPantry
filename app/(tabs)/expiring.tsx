/**
 * app/(tabs)/expiring.tsx
 *
 * The screen the app exists for: what is already gone, and what to cook next.
 *
 * SectionList rather than FlatList, because the two groups need headers and
 * because a sticky header keeps the group name visible while the user scrolls
 * a long "use these next" list. Everything else is the same virtualisation
 * machinery, and the row component is reused unchanged.
 */

import { useCallback, useMemo } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ItemRow } from '@/components/pantry/ItemRow';
import { EmptyState } from '@/components/ui/States';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import {
  useExpiringSections,
  usePantryDispatch,
  usePantryState,
} from '@/hooks/usePantry';
import { stamps } from '@/state/pantryReducer';
import type { DecoratedItem } from '@/state/selectors';
import { colors, radius, space } from '@/theme/tokens';

export default function ExpiringScreen() {
  const router = useRouter();
  const dispatch = usePantryDispatch();
  const { items, settings } = usePantryState();
  const sections = useExpiringSections();

  const populated = useMemo(
    () => sections.filter((section) => section.data.length > 0),
    [sections],
  );

  const openItem = useCallback((id: string) => router.push(`/item/${id}`), [router]);

  const toggleConsumed = useCallback(
    (id: string) => {
      const item = items.find((candidate) => candidate.id === id);
      if (!item) return;
      const { instant } = stamps();
      if (item.consumedAt === null) dispatch({ type: 'item/consume', id, now: instant });
      else dispatch({ type: 'item/restock', id, now: instant });
    },
    [dispatch, items],
  );

  if (populated.length === 0) {
    return (
      <Screen edges={{ top: true, bottom: true }}>
        <EmptyState
          glyph="✅"
          title="Nothing is about to go off"
          body={`Nothing in your pantry expires in the next ${settings.soonWindowDays} days. Check back tomorrow.`}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <SectionList
        sections={populated}
        keyExtractor={(entry: DecoratedItem) => entry.item.id}
        renderItem={({ item: entry }) => (
          <ItemRow entry={entry} onPress={openItem} onToggleConsumed={toggleConsumed} />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text variant="label" tone={section.status === 'expired' ? 'expired' : 'soon'}>
              {section.title.toUpperCase()}
            </Text>
            <Text variant="caption" tone="inkFaint">
              {section.data.length}
            </Text>
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons name="sparkles" size={20} color={colors.soon} />
            </View>
            <View style={styles.heroText}>
              <Text variant="display">Use these next</Text>
              <Text variant="body" tone="inkMuted">A small nudge toward a waste-free kitchen.</Text>
            </View>
          </View>
        }
        ItemSeparatorComponent={Separator}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.list}
      />
    </Screen>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: space.lg, paddingBottom: space.xxxl },
  hero: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingTop: space.lg, paddingBottom: space.xl },
  heroIcon: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.soonWash, alignItems: 'center', justifyContent: 'center' },
  heroText: { flex: 1, gap: 2 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: space.md,
    backgroundColor: colors.bg,
  },
  separator: { height: space.sm },
});

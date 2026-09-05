/**
 * src/components/pantry/ItemRow.tsx
 *
 * One row of the inventory list.
 *
 * Wrapped in React.memo and given only primitive-ish props on purpose. A
 * FlatList re-renders every visible row whenever the parent re-renders, and
 * the parent re-renders on every keystroke in the search field. memo turns
 * that into a shallow prop compare per row, which is the difference between
 * a list that keeps up with typing and one that does not.
 *
 * For memo to actually work, the callbacks passed in must be stable. That is
 * why the list below builds them with useCallback and passes the id back out
 * rather than closing over it here.
 */

import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { StatusPill } from '@/components/pantry/StatusPill';
import { Text } from '@/components/ui/Text';
import { formatQuantity } from '@/lib/format';
import { colors, radius, space } from '@/theme/tokens';
import type { DecoratedItem } from '@/state/selectors';

export interface ItemRowProps {
  entry: DecoratedItem;
  onPress: (id: string) => void;
  onToggleConsumed: (id: string) => void;
}

function ItemRowBase({ entry, onPress, onToggleConsumed }: ItemRowProps) {
  const { item, category, expiry } = entry;
  const consumed = item.consumedAt !== null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${category.name}`}
      accessibilityHint="Opens the item details"
      onPress={() => onPress(item.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.glyphWrap}>
        <Text style={styles.glyph}>{category.emoji}</Text>
      </View>

      <View style={styles.middle}>
        <Text
          variant="bodyStrong"
          tone={consumed ? 'inkFaint' : 'ink'}
          numberOfLines={1}
          style={consumed ? styles.struck : undefined}
        >
          {item.name}
        </Text>
        <Text variant="caption" tone="inkFaint" numberOfLines={1}>
          {category.name} · {formatQuantity(item.quantity, item.unit)} · {item.location}
        </Text>
        <View style={styles.pillRow}>
          <StatusPill expiry={expiry} expiresOn={item.expiresOn} />
        </View>
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: consumed }}
        accessibilityLabel={consumed ? `Put ${item.name} back` : `Mark ${item.name} used up`}
        hitSlop={10}
        onPress={() => onToggleConsumed(item.id)}
        style={({ pressed }) => [styles.check, consumed && styles.checkOn, pressed && styles.pressed]}
      >
        {consumed ? <Ionicons name="checkmark" size={17} color={colors.inkInverse} /> : null}
      </Pressable>
    </Pressable>
  );
}

export const ItemRow = memo(ItemRowBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  pressed: { opacity: 0.75 },
  glyphWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: { fontSize: 23 },
  middle: { flex: 1, gap: 2 },
  pillRow: { marginTop: space.xs },
  struck: { textDecorationLine: 'line-through' },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.brand, borderColor: colors.brand },
});

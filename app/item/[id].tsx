/**
 * app/item/[id].tsx
 *
 * Item detail: the first route with a parameter, and therefore the first
 * place the app has to deal with a parameter that does not resolve.
 *
 * Two lines everyone writes wrong once live at the top: useLocalSearchParams
 * can hand back an array, because a route can match a segment more than once.
 * Typing it as { id: string } compiles and then hands an array to a lookup
 * that expects a string, and the item silently never resolves. Narrow it
 * once, here, and everything below is a plain string.
 *
 * Delete does not confirm. It dispatches and pops, landing the user on the
 * list where the undo strip is already showing, and the reducer kept the
 * whole record so undo restores it exactly.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { StatusPill } from '@/components/pantry/StatusPill';
import { Button } from '@/components/ui/Button';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { formatDate, formatQuantity } from '@/lib/format';
import { useItem, usePantryDispatch, usePantryState } from '@/hooks/usePantry';
import { stamps } from '@/state/pantryReducer';
import { colors, space } from '@/theme/tokens';

const LOCATION_LABEL = {
  pantry: 'Pantry',
  fridge: 'Fridge',
  freezer: 'Freezer',
} as const;

export default function ItemDetailScreen() {
  const router = useRouter();
  const dispatch = usePantryDispatch();
  const { status } = usePantryState();

  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const entry = useItem(id);

  if (status === 'idle' || status === 'loading') {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  // Reachable by deep link to an id that has since been deleted, so this is a
  // real branch rather than a defensive one. replace, not push: the user is
  // already looking at a dead entry in the stack.
  if (!entry || !id) {
    return (
      <Screen>
        <EmptyState
          glyph="🕳️"
          title="That item is gone"
          body="It was deleted, or the link points at something that never existed."
          actionLabel="Back to the pantry"
          onAction={() => router.replace('/')}
        />
      </Screen>
    );
  }

  const { item, category, expiry } = entry;
  const consumed = item.consumedAt !== null;

  const toggleConsumed = () => {
    const { instant } = stamps();
    if (consumed) dispatch({ type: 'item/restock', id: item.id, now: instant });
    else dispatch({ type: 'item/consume', id: item.id, now: instant });
  };

  return (
    <Screen edges={{ bottom: true }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.head}>
          <Text style={styles.glyph}>{category.emoji}</Text>
          <Text variant="display">{item.name}</Text>
          <StatusPill expiry={expiry} expiresOn={item.expiresOn} />
        </View>

        <View style={styles.rows}>
          <Row label="Category" value={`${category.emoji} ${category.name}`} />
          <Row label="Quantity" value={formatQuantity(item.quantity, item.unit)} />
          <Row label="Where it lives" value={LOCATION_LABEL[item.location]} />
          <Row label="Expiry date" value={formatDate(item.expiresOn)} />
          <Row label="Status" value={consumed ? 'Used up' : 'In the pantry'} />
          {item.note ? <Row label="Note" value={item.note} /> : null}
        </View>

        <View style={styles.actions}>
          <Button
            label={consumed ? 'Put it back' : 'Mark used up'}
            variant="secondary"
            onPress={toggleConsumed}
            fullWidth
          />
          <Button
            label="Edit"
            variant="secondary"
            onPress={() => router.push(`/item/edit/${item.id}`)}
            fullWidth
          />
          <Button
            label="Delete"
            variant="danger"
            accessibilityHint="Deletes the item, with five seconds to undo"
            onPress={() => {
              dispatch({ type: 'item/delete', id: item.id });
              router.back();
            }}
            fullWidth
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="label" tone="inkMuted">
        {label}
      </Text>
      <Text variant="body" tone="ink" style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: space.lg, gap: space.xl, paddingBottom: space.xxxl },
  head: { gap: space.sm, alignItems: 'flex-start' },
  glyph: { fontSize: 40 },
  rows: { gap: space.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: space.lg,
    paddingBottom: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  value: { flex: 1, textAlign: 'right' },
  actions: { gap: space.md },
});

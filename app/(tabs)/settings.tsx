/**
 * app/(tabs)/settings.tsx
 *
 * The soon window, the category manager, the demo shelf and the reset.
 *
 * Two of these matter beyond the feature list. The soon window is the one
 * knob that changes what the whole app considers urgent, and wiring it to a
 * live preview is what proves to a reader that status is derived rather than
 * stored. The reset is what makes the app demonstrable: a reviewer can empty
 * it, refill it and see the empty state without deleting the app.
 */

import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { buildSeedItems } from '@/lib/seed';
import { usePantryCounts, usePantryDispatch, usePantryState } from '@/hooks/usePantry';
import { useResetPantry } from '@/state/PantryProvider';
import { space } from '@/theme/tokens';

const WINDOW_OPTIONS = [2, 3, 5, 7, 14];

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = usePantryDispatch();
  const { settings, categories, dropped } = usePantryState();
  const counts = usePantryCounts();
  const reset = useResetPantry(dispatch);

  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <Screen edges={{ bottom: false }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text variant="heading">Expiring soon window</Text>
          <Text variant="body" tone="inkMuted" style={styles.body}>
            How many days ahead should count as urgent. Everything in the app reacts
            immediately, because status is worked out on read and never stored.
          </Text>
          <View style={styles.row}>
            {WINDOW_OPTIONS.map((days) => (
              <Chip
                key={days}
                label={`${days} days`}
                selected={settings.soonWindowDays === days}
                onPress={() => dispatch({ type: 'settings/soonWindow', days })}
              />
            ))}
          </View>
          <Text variant="caption" tone="inkFaint" style={styles.body}>
            Right now that is {counts.soon} due soon and {counts.expired} past their date.
          </Text>
        </Card>

        <Card>
          <Text variant="heading">Categories</Text>
          <Text variant="body" tone="inkMuted" style={styles.body}>
            {categories.length} categories. Rename any of them, or add your own.
          </Text>
          <Button
            label="Manage categories"
            variant="secondary"
            onPress={() => router.push('/categories')}
            style={styles.button}
          />
        </Card>

        <Card>
          <Text variant="heading">Demo shelf</Text>
          <Text variant="body" tone="inkMuted" style={styles.body}>
            Replaces everything with twelve items spread across expired, due soon and
            fine. Useful for screenshots and for seeing every state at once.
          </Text>
          <Button
            label="Load demo data"
            variant="secondary"
            onPress={() => dispatch({ type: 'data/replace', items: buildSeedItems() })}
            style={styles.button}
          />
        </Card>

        <Card>
          <Text variant="heading">Reset</Text>
          <Text variant="body" tone="inkMuted" style={styles.body}>
            Deletes every item and every setting from this device. There is no copy
            anywhere else, so this cannot be undone.
          </Text>
          <Button
            label="Erase everything"
            variant="danger"
            onPress={() => setConfirmReset(true)}
            style={styles.button}
          />
        </Card>

        {dropped > 0 ? (
          <Card>
            <Text variant="heading">Recovered storage</Text>
            <Text variant="body" tone="inkMuted" style={styles.body}>
              {dropped} saved records could not be read on the last start and were
              skipped. The rest of your pantry opened normally.
            </Text>
          </Card>
        ) : null}

        <Text variant="caption" tone="inkFaint" style={styles.footer}>
          PocketPantry stores everything on this device. No account, no server, no
          network calls.
        </Text>
      </ScrollView>

      <ConfirmDialog
        visible={confirmReset}
        title="Erase everything?"
        body="Every item, category change and setting on this device will be deleted."
        confirmLabel="Erase"
        destructive
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          void reset();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: space.lg, gap: space.lg, paddingBottom: space.xxxl },
  body: { marginTop: space.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  button: { marginTop: space.lg, alignSelf: 'flex-start', paddingHorizontal: space.xl },
  footer: { textAlign: 'center', marginTop: space.sm },
});

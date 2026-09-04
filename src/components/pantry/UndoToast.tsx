/**
 * src/components/pantry/UndoToast.tsx
 *
 * A five second undo strip, shown after a delete or a "used up".
 *
 * Undo is why this app has no "are you sure" on delete. A confirmation makes
 * every correct delete cost an extra tap to protect against the rare wrong
 * one. Undo inverts that: the common case is free, the rare case is
 * recoverable, and the record is still in memory so recovery is exact.
 *
 * The timer restarts whenever a new undoable action arrives, which is why the
 * effect depends on the pending item's id and not just on its presence.
 */

import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, space } from '@/theme/tokens';

export interface UndoToastProps {
  message: string | null;
  /** Changes whenever a new undoable action happens, restarting the timer. */
  token: string | null;
  onUndo: () => void;
  onDismiss: () => void;
  timeoutMs?: number;
  bottomOffset?: number;
}

export function UndoToast({
  message,
  token,
  onUndo,
  onDismiss,
  timeoutMs = 5000,
  bottomOffset = space.lg,
}: UndoToastProps) {
  useEffect(() => {
    if (token === null) return;
    const handle = setTimeout(onDismiss, timeoutMs);
    return () => clearTimeout(handle);
  }, [token, timeoutMs, onDismiss]);

  if (message === null) return null;

  return (
    <View style={[styles.wrap, { bottom: bottomOffset }]} accessibilityLiveRegion="polite">
      <Text variant="body" tone="inkInverse" style={styles.message} numberOfLines={1}>
        {message}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Undo"
        hitSlop={10}
        onPress={onUndo}
      >
        <Text variant="bodyStrong" tone="inkInverse">
          Undo
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.ink,
    zIndex: 1000,
    elevation: 8,
  },
  message: { flex: 1 },
});

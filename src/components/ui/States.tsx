/**
 * src/components/ui/States.tsx
 *
 * Loading, empty and error, as three real components.
 *
 * A screen has four outcomes, not one. Most portfolio apps ship the happy
 * path and leave the other three as a blank white rectangle, which is the
 * single fastest way for a reviewer to tell that an app has never been used.
 *
 * Empty is not one state either. "You have not added anything yet" and "no
 * results for kimchi" need different words and different buttons, which is
 * why EmptyState takes its copy from the caller.
 */

import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, space } from '@/theme/tokens';

export function LoadingState({ label = 'Opening your pantry' }: { label?: string }) {
  return (
    <View style={styles.center} accessibilityRole="progressbar">
      <ActivityIndicator color={colors.brand} />
      <Text variant="body" tone="inkMuted" style={styles.gap}>
        {label}
      </Text>
    </View>
  );
}

export interface EmptyStateProps {
  glyph: string;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function EmptyState({ glyph, title, body, actionLabel, onAction, children }: EmptyStateProps) {
  return (
    <View style={styles.center}>
      <Text style={styles.glyph}>{glyph}</Text>
      <Text variant="title" tone="ink" style={styles.gap}>
        {title}
      </Text>
      <Text variant="body" tone="inkMuted" style={styles.body}>
        {body}
      </Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
      {children}
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.center}>
      <Text style={styles.glyph}>⚠️</Text>
      <Text variant="title" tone="ink" style={styles.gap}>
        Could not open the pantry
      </Text>
      <Text variant="body" tone="inkMuted" style={styles.body}>
        {message}
      </Text>
      <Button label="Try again" onPress={onRetry} variant="secondary" style={styles.action} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  glyph: { fontSize: 40 },
  gap: { marginTop: space.md, textAlign: 'center' },
  body: { marginTop: space.xs, textAlign: 'center' },
  action: { marginTop: space.lg, paddingHorizontal: space.xl },
});

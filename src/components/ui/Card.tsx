/**
 * src/components/ui/Card.tsx
 *
 * A surface with a hairline border rather than a shadow. Shadows on Android
 * need elevation, elevation changes how the view is composited, and a list of
 * eighty elevated views scrolls measurably worse. A one pixel border reads as
 * the same separation and costs nothing.
 */

import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, space } from '@/theme/tokens';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: space.lg,
  },
});

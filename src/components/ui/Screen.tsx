/**
 * src/components/ui/Screen.tsx
 *
 * The frame every screen sits in: background colour, safe area insets and,
 * when the screen holds a form, keyboard avoidance.
 *
 * Safe area handling belongs here rather than in each screen because the
 * value differs per screen (a screen under a tab bar must not pad the bottom
 * twice) and that decision is exactly the kind of thing that drifts when it
 * is copied into nine files.
 */

import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, space } from '@/theme/tokens';

export interface ScreenProps {
  children: ReactNode;
  /** Skip bottom inset when a tab bar or a sticky footer already covers it. */
  edges?: { top?: boolean; bottom?: boolean };
  padded?: boolean;
  avoidKeyboard?: boolean;
}

export function Screen({
  children,
  edges = { top: false, bottom: true },
  padded = false,
  avoidKeyboard = false,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const body = (
    <View
      style={[
        styles.root,
        padded && styles.padded,
        { paddingTop: edges.top ? insets.top : 0, paddingBottom: edges.bottom ? insets.bottom : 0 },
      ]}
    >
      {children}
    </View>
  );

  if (!avoidKeyboard) return body;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {body}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.bg },
  padded: { paddingHorizontal: space.lg },
});

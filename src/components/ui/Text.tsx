/**
 * src/components/ui/Text.tsx
 *
 * A typed wrapper around React Native's Text.
 *
 * The point is not styling convenience. It is that `variant` and `tone` are
 * unions, so a typo becomes a compile error instead of an invisible default,
 * and no screen can invent a fourteenth font size at two in the morning.
 */

import { Platform, Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';

import { colors, type, type ColorToken, type TypeToken } from '@/theme/tokens';

export interface TextProps extends RNTextProps {
  variant?: TypeToken;
  tone?: ColorToken;
}

export function Text({ variant = 'body', tone = 'ink', style, ...rest }: TextProps) {
  const preset = type[variant];
  return (
    <RNText
      {...rest}
      style={[
        styles.base,
        {
          fontSize: preset.fontSize,
          lineHeight: preset.lineHeight,
          fontWeight: preset.fontWeight,
          color: colors[tone],
          fontFamily: variant === 'display' || variant === 'title'
            ? Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' })
            : Platform.select({ ios: 'Avenir Next', android: 'sans-serif', web: 'system-ui, sans-serif' }),
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    // Stops Android from adding its own vertical padding, which is the usual
    // reason a row looks aligned on iOS and one pixel off on Android.
    includeFontPadding: false,
  },
});

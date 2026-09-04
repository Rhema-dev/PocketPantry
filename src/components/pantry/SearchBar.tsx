/**
 * src/components/pantry/SearchBar.tsx
 *
 * A controlled text input with a clear button.
 *
 * Controlled is the point of the exercise: the value lives in the screen's
 * state, the input renders it, and every keystroke goes through onChangeText.
 * That is what makes "clear" a one line state update rather than a fight with
 * an imperative ref.
 */

import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, space } from '@/theme/tokens';

export interface SearchBarProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search your pantry' }: SearchBarProps) {
  return (
    <View style={styles.wrap}>
      <Text variant="body" tone="inkFaint">
        🔍
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
        accessibilityLabel="Search your pantry"
        style={styles.input}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={12}
          onPress={() => onChange('')}
        >
          <Text variant="body" tone="inkFaint">
            ✕
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    height: 44,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, fontSize: 15, color: colors.ink, paddingVertical: 0 },
});

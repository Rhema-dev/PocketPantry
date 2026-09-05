import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, radius, space } from '@/theme/tokens';

export interface SearchBarProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Find an ingredient' }: SearchBarProps) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={19} color={colors.brand} />
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
        <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={12} onPress={() => onChange('')}>
          <Ionicons name="close-circle" size={20} color={colors.inkFaint} />
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
    height: 50,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  input: { flex: 1, fontSize: 15, color: colors.ink, paddingVertical: 0 },
});

/**
 * app/categories.tsx
 *
 * The category manager, presented as a modal.
 *
 * The interesting rule here is not the form, it is what deleting a category
 * does to the items that pointed at it. Without a rule, those items keep an
 * id that resolves to nothing and the list renders a blank glyph and the word
 * "undefined". The reducer reassigns them to Other in the same transition, so
 * that state never exists.
 *
 * Built in categories can be renamed but not deleted, which keeps the
 * fallback category guaranteed to exist.
 */

import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Text } from '@/components/ui/Text';
import { Screen } from '@/components/ui/Screen';
import { useCategories, usePantryDispatch, usePantryState } from '@/hooks/usePantry';
import { stamps } from '@/state/pantryReducer';
import { colors, radius, space } from '@/theme/tokens';
import type { Category } from '@/types/pantry';

function lastGlyph(value: string): string {
  const segments = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value)];
  return segments.at(-1)?.segment || '📦';
}

export default function CategoriesScreen() {
  const dispatch = usePantryDispatch();
  const categories = useCategories();
  const { items } = usePantryState();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📦');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('📦');

  const trimmed = name.trim();
  const duplicate = categories.some(
    (category) => category.name.toLowerCase() === trimmed.toLowerCase(),
  );
  const error = trimmed !== '' && duplicate ? 'You already have a category with that name.' : undefined;

  const editTrimmed = editName.trim();
  const editDuplicate = categories.some(
    (category) =>
      category.id !== editingId && category.name.toLowerCase() === editTrimmed.toLowerCase(),
  );
  const editError =
    editTrimmed !== '' && editDuplicate
      ? 'You already have a category with that name.'
      : undefined;

  const finishEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditEmoji('📦');
  };

  const countFor = (category: Category) =>
    items.filter((item) => item.categoryId === category.id).length;

  return (
    <Screen avoidKeyboard>
      <FlatList
        data={categories}
        keyExtractor={(category) => category.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.form}>
            <Field
              label="New category"
              value={name}
              onChangeText={setName}
              placeholder="Baby food"
              maxLength={24}
              error={error}
            />
            <View style={styles.formRow}>
              <Field
                label="Glyph"
                value={emoji}
                onChangeText={(text) => setEmoji(lastGlyph(text))}
                style={styles.emojiInput}
              />
              <Button
                label="Add category"
                disabled={trimmed === '' || duplicate}
                onPress={() => {
                  dispatch({ type: 'category/add', name: trimmed, emoji });
                  setName('');
                  setEmoji('📦');
                }}
                style={styles.addButton}
              />
            </View>
          </View>
        }
        renderItem={({ item: category }) => {
          const count = countFor(category);
          if (editingId === category.id) {
            return (
              <View style={styles.editRow}>
                <Field
                  label="Category name"
                  value={editName}
                  onChangeText={setEditName}
                  maxLength={24}
                  error={editError}
                  autoFocus
                />
                <View style={styles.formRow}>
                  <Field
                    label="Glyph"
                    value={editEmoji}
                    onChangeText={(text) => setEditEmoji(lastGlyph(text))}
                    style={styles.emojiInput}
                  />
                  <Button
                    label="Cancel"
                    variant="secondary"
                    onPress={finishEditing}
                    style={styles.editButton}
                  />
                  <Button
                    label="Save"
                    disabled={editTrimmed === '' || editDuplicate}
                    onPress={() => {
                      dispatch({
                        type: 'category/rename',
                        id: category.id,
                        name: editTrimmed,
                        emoji: editEmoji,
                      });
                      finishEditing();
                    }}
                    style={styles.editButton}
                  />
                </View>
              </View>
            );
          }

          return (
            <View style={styles.row}>
              <Text style={styles.glyph}>{category.emoji}</Text>
              <View style={styles.rowText}>
                <Text variant="bodyStrong">{category.name}</Text>
                <Text variant="caption" tone="inkFaint">
                  {count === 1 ? '1 item' : `${count} items`}
                  {category.builtIn ? ' · built in' : ''}
                </Text>
              </View>
              <View style={styles.rowActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Rename ${category.name}`}
                  hitSlop={10}
                  onPress={() => {
                    setEditingId(category.id);
                    setEditName(category.name);
                    setEditEmoji(category.emoji);
                  }}
                  style={styles.rowAction}
                >
                  <Text variant="label" tone="brand">
                    Rename
                  </Text>
                </Pressable>
                {category.builtIn ? null : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${category.name}`}
                    accessibilityHint="Items in this category move to Other"
                    hitSlop={10}
                    onPress={() =>
                      dispatch({ type: 'category/delete', id: category.id, now: stamps().instant })
                    }
                    style={styles.rowAction}
                  >
                    <Text variant="label" tone="danger">
                      Delete
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: space.xxxl },
  form: { margin: space.lg, padding: space.lg, gap: space.md, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  formRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md },
  emojiInput: { width: 72, textAlign: 'center', fontSize: 20 },
  addButton: { flex: 1 },
  editRow: { padding: space.lg, gap: space.md, backgroundColor: colors.brandWash },
  editButton: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginHorizontal: space.lg,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowText: { flex: 1, gap: 2 },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  rowAction: { minHeight: 44, justifyContent: 'center', paddingHorizontal: space.xs },
  glyph: { fontSize: 22 },
  separator: { height: space.sm },
});

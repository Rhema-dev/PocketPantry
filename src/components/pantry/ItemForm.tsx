/**
 * src/components/pantry/ItemForm.tsx
 *
 * The add and edit form, shared by both routes.
 *
 * The component owns no state of its own: `useItemForm` owns the draft and
 * the validation, and this file is the arrangement of fields. That split is
 * what lets the Edit screen reuse it with a different starting draft and a
 * different submit label without a single conditional in the markup.
 *
 * Submit is deliberately not disabled while the form is invalid. A disabled
 * button with no explanation is the most common accessibility failure in
 * mobile forms: the user taps, nothing happens, and nothing says why. Here
 * the tap always does something, and what it does when invalid is reveal the
 * errors by marking every field touched.
 */

import { ScrollView, StyleSheet, View } from 'react-native';

import { CategoryPicker } from '@/components/pantry/CategoryPicker';
import { DateField } from '@/components/pantry/DateField';
import { SegmentedField } from '@/components/pantry/SegmentedField';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Stepper } from '@/components/ui/Stepper';
import { Text } from '@/components/ui/Text';
import { colors, space } from '@/theme/tokens';
import type { ItemFormApi } from '@/hooks/useItemForm';
import type { Category, StorageLocation, Unit } from '@/types/pantry';

const UNIT_OPTIONS: ReadonlyArray<{ value: Unit; label: string }> = [
  { value: 'pc', label: 'Pieces' },
  { value: 'pack', label: 'Packs' },
  { value: 'g', label: 'Grams' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'ml', label: 'Millilitres' },
  { value: 'l', label: 'Litres' },
];

const LOCATION_OPTIONS: ReadonlyArray<{ value: StorageLocation; label: string }> = [
  { value: 'pantry', label: 'Pantry' },
  { value: 'fridge', label: 'Fridge' },
  { value: 'freezer', label: 'Freezer' },
];

export interface ItemFormProps {
  form: ItemFormApi;
  categories: Category[];
  submitLabel: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export function ItemForm({ form, categories, submitLabel, onSubmit, onCancel }: ItemFormProps) {
  const { draft, setField, markTouched, errorFor } = form;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Field
          label="Item name"
          value={draft.name}
          onChangeText={(text) => setField('name', text)}
          onBlur={() => markTouched('name')}
          error={errorFor('name')}
          placeholder="Greek yoghurt"
          maxLength={60}
          showCounter
          autoFocus
          returnKeyType="next"
        />

        <CategoryPicker
          categories={categories}
          value={draft.categoryId}
          onChange={(id) => setField('categoryId', id)}
        />

        <View style={styles.quantityBlock}>
          <Text variant="label" tone="inkMuted">
            Quantity
          </Text>
          <Stepper
            label="Quantity"
            value={draft.quantity}
            onChange={(next) => {
              setField('quantity', next);
              markTouched('quantity');
            }}
            min={0}
            max={9999}
          />
          {errorFor('quantity') ? (
            <Text variant="caption" tone="danger">
              {errorFor('quantity')}
            </Text>
          ) : null}
        </View>

        <SegmentedField
          label="Unit"
          options={UNIT_OPTIONS}
          value={draft.unit}
          onChange={(unit) => setField('unit', unit)}
        />

        <SegmentedField
          label="Where it lives"
          options={LOCATION_OPTIONS}
          value={draft.location}
          onChange={(location) => setField('location', location)}
        />

        <DateField
          value={draft.expiresOn}
          onChange={(next) => {
            setField('expiresOn', next);
            markTouched('expiresOn');
          }}
          error={errorFor('expiresOn')}
        />

        <Field
          label="Note"
          value={draft.note}
          onChangeText={(text) => setField('note', text)}
          onBlur={() => markTouched('note')}
          error={errorFor('note')}
          placeholder="Second shelf, behind the jam"
          maxLength={200}
          showCounter
          multiline
          style={styles.note}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Cancel" onPress={onCancel} variant="secondary" style={styles.footerButton} />
        <Button label={submitLabel} onPress={onSubmit} style={styles.footerButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: space.lg, gap: space.xl, paddingBottom: space.xxxl },
  quantityBlock: { gap: space.sm },
  note: { minHeight: 88, paddingTop: space.sm, textAlignVertical: 'top' },
  footer: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerButton: { flex: 1 },
});

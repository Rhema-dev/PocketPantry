/**
 * src/components/pantry/DateField.tsx
 *
 * Expiry date input: a button that opens the native picker, plus a switch for
 * "this does not expire".
 *
 * Two platform facts drive the shape of this file:
 *
 *   Android renders the picker as its own dialog and fires onChange once,
 *   with event.type 'set' or 'dismissed'. It must then be unmounted, or it
 *   reopens on the next render.
 *
 *   iOS renders inline and fires onChange on every spin, so it stays mounted
 *   until the user confirms.
 *
 * Handling both in one branchy component is normal, and hiding it behind this
 * one file is why no screen has to know about it.
 */

import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, View } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { fromPickerDate, toPickerDate, todayIso } from '@/lib/date';
import { formatDate } from '@/lib/format';
import { colors, radius, space } from '@/theme/tokens';
import type { IsoDate } from '@/types/pantry';

export interface DateFieldProps {
  value: IsoDate | null;
  onChange: (next: IsoDate | null) => void;
  error?: string | undefined;
}

export function DateField({ value, onChange, error }: DateFieldProps) {
  const [open, setOpen] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setOpen(false);
      if (event.type !== 'set' || !selected) return;
      onChange(fromPickerDate(selected));
      return;
    }
    if (selected) onChange(fromPickerDate(selected));
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text variant="label" tone="inkMuted">
          Expiry date
        </Text>
        <View style={styles.switchRow}>
          <Text variant="caption" tone="inkFaint">
            Does not expire
          </Text>
          <Switch
            value={value === null}
            onValueChange={(off) => {
              setOpen(false);
              onChange(off ? null : todayIso());
            }}
            trackColor={{ true: colors.brand, false: colors.borderStrong }}
            accessibilityLabel="This item does not expire"
          />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Expiry date, ${formatDate(value)}`}
        disabled={value === null}
        onPress={() => setOpen((current) => !current)}
        style={({ pressed }) => [
          styles.button,
          error ? styles.buttonError : null,
          value === null && styles.buttonDisabled,
          pressed && styles.pressed,
        ]}
      >
        <Text variant="body" tone={value === null ? 'inkFaint' : 'ink'}>
          {formatDate(value)}
        </Text>
        <Text variant="caption" tone="brand">
          {value === null ? '' : 'Change'}
        </Text>
      </Pressable>

      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}

      {open && value !== null ? (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={toPickerDate(value)}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handleChange}
            minimumDate={new Date(2000, 0, 1)}
          />
          {Platform.OS === 'ios' ? (
            <Button label="Done" onPress={() => setOpen(false)} variant="secondary" />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  button: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  buttonError: { borderColor: colors.danger, backgroundColor: colors.dangerWash },
  buttonDisabled: { backgroundColor: colors.surfaceSunken },
  pressed: { opacity: 0.75 },
  pickerWrap: { gap: space.sm, alignItems: 'stretch' },
});

/**
 * src/components/ui/ConfirmDialog.tsx
 *
 * A confirmation built on React Native's Modal rather than on Alert.alert.
 *
 * Alert is quicker to write, but it cannot be styled, it renders differently
 * on each platform, and it cannot be screenshotted for a case study in a way
 * that looks like your app. A Modal is twelve more lines and is yours.
 *
 * The two details people miss: `onRequestClose` is what makes the Android
 * hardware back button dismiss it, and the destructive action goes on the
 * right where a confirm normally lives, so muscle memory does not delete
 * things by accident.
 */

import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, radius, space } from '@/theme/tokens';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  destructive = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel="Dismiss">
        {/* Stops a tap inside the card from closing the dialog. */}
        <Pressable style={styles.card} onPress={() => undefined}>
          <Text variant="heading" tone="ink">
            {title}
          </Text>
          <Text variant="body" tone="inkMuted" style={styles.body}>
            {body}
          </Text>
          <View style={styles.actions}>
            <Button label="Cancel" onPress={onCancel} variant="secondary" style={styles.action} />
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              variant={destructive ? 'danger' : 'primary'}
              style={styles.action}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 32, 28, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.xl,
  },
  body: { marginTop: space.sm },
  actions: { flexDirection: 'row', gap: space.md, marginTop: space.xl },
  action: { flex: 1 },
});

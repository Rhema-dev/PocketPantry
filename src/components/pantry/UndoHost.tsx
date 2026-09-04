import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UndoToast } from '@/components/pantry/UndoToast';
import { usePantryDispatch, usePantryState } from '@/hooks/usePantry';
import { space } from '@/theme/tokens';

/** Keeps undo available regardless of which list or detail screen started the action. */
export function UndoHost() {
  const dispatch = usePantryDispatch();
  const { pendingUndo } = usePantryState();
  const insets = useSafeAreaInsets();

  return (
    <UndoToast
      message={
        pendingUndo === null
          ? null
          : pendingUndo.kind === 'delete'
            ? `Deleted ${pendingUndo.item.name}`
            : `Marked ${pendingUndo.item.name} used up`
      }
      token={pendingUndo?.item.id ?? null}
      bottomOffset={insets.bottom + space.xxxl + space.lg}
      onUndo={() => dispatch({ type: 'undo/apply' })}
      onDismiss={() => dispatch({ type: 'undo/clear' })}
    />
  );
}

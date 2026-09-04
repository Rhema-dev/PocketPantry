/**
 * app/item/edit/[id].tsx
 *
 * The same form, seeded from an existing record, dispatching a different
 * action. If the form hook and the form component were split correctly this
 * file is short, and its shortness is the proof.
 *
 * Two details are load bearing:
 *
 *   The initial draft is memoised on `entry`. useItemForm uses its argument
 *   as the initial state and as the baseline for isDirty, so a fresh object
 *   every render would compare isDirty against a new reference each time.
 *
 *   Every hook, including useItemForm, runs before the `if (!entry)` return.
 *   Hooks must run in the same order on every render, so the guard has to
 *   come after all of them. Move it above useItemForm and React throws
 *   "rendered fewer hooks than expected" the moment an id fails to resolve.
 */

import { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ItemForm } from '@/components/pantry/ItemForm';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { Screen } from '@/components/ui/Screen';
import {
  useCategories,
  useItem,
  usePantryDispatch,
  usePantryState,
} from '@/hooks/usePantry';
import { EMPTY_DRAFT, draftFromItem, useItemForm } from '@/hooks/useItemForm';
import { stamps } from '@/state/pantryReducer';

export default function EditItemScreen() {
  const router = useRouter();
  const dispatch = usePantryDispatch();
  const { status } = usePantryState();
  const categories = useCategories();

  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const entry = useItem(id);

  const initial = useMemo(
    () => (entry ? draftFromItem(entry.item) : EMPTY_DRAFT),
    [entry],
  );
  const form = useItemForm(initial);

  if (status === 'idle' || status === 'loading') {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (!entry || !id) {
    return (
      <Screen>
        <EmptyState
          glyph="🕳️"
          title="That item is gone"
          body="It was deleted while this screen was open, so there is nothing left to edit."
          actionLabel="Back to the pantry"
          onAction={() => router.replace('/')}
        />
      </Screen>
    );
  }

  const handleSubmit = () => {
    if (!form.isValid) {
      form.markAllTouched();
      return;
    }
    const { instant } = stamps();
    dispatch({ type: 'item/update', id: entry.item.id, draft: form.draft, now: instant });
    router.back();
  };

  return (
    <Screen avoidKeyboard>
      <ItemForm
        form={form}
        categories={categories}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </Screen>
  );
}

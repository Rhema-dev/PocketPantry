/**
 * app/item/new.tsx
 *
 * Add item, presented as a modal by the root layout.
 *
 * The screen holds no form state. `useItemForm` holds it, `ItemForm` renders
 * it, and this file does exactly two things: turn a valid draft into an
 * action, and decide where to go afterwards.
 *
 * router.back() rather than router.push('/'): the modal was pushed on top of
 * whatever screen the user was on, and pushing home would leave that screen
 * buried underneath and break the back gesture.
 */

import { useRouter } from 'expo-router';

import { ItemForm } from '@/components/pantry/ItemForm';
import { Screen } from '@/components/ui/Screen';
import { useCategories, usePantryDispatch } from '@/hooks/usePantry';
import { useItemForm } from '@/hooks/useItemForm';
import { stamps } from '@/state/pantryReducer';

export default function NewItemScreen() {
  const router = useRouter();
  const dispatch = usePantryDispatch();
  const categories = useCategories();
  const form = useItemForm();

  const handleSubmit = () => {
    if (!form.isValid) {
      // Reveal every message at once rather than disabling the button.
      form.markAllTouched();
      return;
    }
    const { instant } = stamps();
    dispatch({ type: 'item/add', draft: form.draft, now: instant });
    router.back();
  };

  return (
    <Screen avoidKeyboard>
      <ItemForm
        form={form}
        categories={categories}
        submitLabel="Add to pantry"
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </Screen>
  );
}

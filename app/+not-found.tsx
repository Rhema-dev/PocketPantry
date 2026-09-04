/**
 * app/+not-found.tsx
 *
 * The route Expo Router falls back to when a deep link matches nothing.
 *
 * Worth writing even for an app with no public links: during development this
 * is what catches a typo in a router.push path, and it turns a blank screen
 * into a message that names the problem.
 */

import { useRouter } from 'expo-router';

import { EmptyState } from '@/components/ui/States';
import { Screen } from '@/components/ui/Screen';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <Screen>
      <EmptyState
        glyph="🧭"
        title="No screen here"
        body="That link does not point at anything in PantryPilot."
        actionLabel="Go to the pantry"
        onAction={() => router.replace('/')}
      />
    </Screen>
  );
}

/**
 * app/_layout.tsx
 *
 * The root of the navigation tree and the only place providers are mounted.
 *
 * Order matters and is not arbitrary:
 *
 *   SafeAreaProvider   measures the notch, so it must wrap anything that
 *                      reads insets, which is every screen.
 *   PantryProvider     owns the data, so it must wrap the navigator, or a
 *                      screen pushed as a modal would mount outside it and
 *                      throw the "must be used inside PantryProvider" error.
 *   Stack              the navigator itself.
 *
 * The modal routes are declared here rather than inferred, because
 * `presentation: 'modal'` is a property of how a route is presented by its
 * parent, not something the route can decide for itself.
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { runExpiryChecks } from '@/lib/expiryChecks';
import { UndoHost } from '@/components/pantry/UndoHost';
import { PantryProvider } from '@/state/PantryProvider';
import { colors } from '@/theme/tokens';

export default function RootLayout() {
  // Dev only. __DEV__ is false in a release bundle, so the checks and the
  // module they import are dropped by the minifier before shipping.
  useEffect(() => {
    if (__DEV__) runExpiryChecks();
  }, []);

  return (
    <SafeAreaProvider>
      <PantryProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTitleStyle: { color: colors.ink, fontSize: 17, fontWeight: '600' },
            headerTintColor: colors.brand,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="item/new"
            options={{ presentation: 'modal', title: 'Add item' }}
          />
          <Stack.Screen
            name="item/edit/[id]"
            options={{ presentation: 'modal', title: 'Edit item' }}
          />
          <Stack.Screen name="item/[id]" options={{ title: 'Item' }} />
          <Stack.Screen
            name="categories"
            options={{ presentation: 'modal', title: 'Categories' }}
          />
          <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
        </Stack>
        <UndoHost />
      </PantryProvider>
    </SafeAreaProvider>
  );
}

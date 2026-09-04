/**
 * app/(tabs)/_layout.tsx
 *
 * Three tabs. The parentheses in the folder name make `(tabs)` a route group:
 * it organises files without adding a segment to the URL, so the inventory
 * screen lives at '/' and not at '/tabs'.
 *
 * The badge on the Expiring tab reads from the same selector the screen uses.
 * There is no second source of truth for "how many things are going off", and
 * that is the whole argument for computing status rather than storing it.
 */

import { Tabs } from 'expo-router';

import { Text } from '@/components/ui/Text';
import { usePantryCounts } from '@/hooks/usePantry';
import { colors } from '@/theme/tokens';

export default function TabsLayout() {
  const counts = usePantryCounts();
  const urgent = counts.expired + counts.soon;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { color: colors.ink, fontSize: 17, fontWeight: '600' },
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pantry',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🧺</Text>,
        }}
      />
      <Tabs.Screen
        name="expiring"
        options={{
          title: 'Expiring',
          tabBarBadge: urgent > 0 ? urgent : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.expired },
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⏳</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}

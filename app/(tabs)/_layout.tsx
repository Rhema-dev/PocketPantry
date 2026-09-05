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
import { Ionicons } from '@expo/vector-icons';

import { usePantryCounts } from '@/hooks/usePantry';
import { colors, radius } from '@/theme/tokens';

export default function TabsLayout() {
  const counts = usePantryCounts();
  const urgent = counts.expired + counts.soon;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 68,
          paddingTop: 7,
          paddingBottom: 8,
        },
        tabBarItemStyle: { borderRadius: radius.md },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pantry',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'basket' : 'basket-outline'} size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="expiring"
        options={{
          title: 'Expiring',
          tabBarBadge: urgent > 0 ? urgent : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.expired },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'timer' : 'timer-outline'} size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'options' : 'options-outline'} size={23} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

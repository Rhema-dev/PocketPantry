/**
 * src/components/pantry/StatusPill.tsx
 *
 * The single visual that carries the app's whole point: how close this is to
 * being rubbish.
 *
 * Colour alone is not the signal. The pill always carries words, because red
 * and amber are indistinguishable to a meaningful slice of users and because
 * "3 days left" is more useful than a colour at any sight level.
 */

import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { describeExpiry, type ExpiryInfo } from '@/lib/expiry';
import { colors, radius, space } from '@/theme/tokens';
import type { ExpiryStatus, IsoDate } from '@/types/pantry';

const BACKGROUND: Record<ExpiryStatus, string> = {
  expired: colors.expiredWash,
  soon: colors.soonWash,
  fresh: colors.freshWash,
  nonPerishable: colors.neutralWash,
  consumed: colors.neutralWash,
};

const FOREGROUND: Record<ExpiryStatus, keyof typeof colors> = {
  expired: 'expired',
  soon: 'soon',
  fresh: 'fresh',
  nonPerishable: 'neutral',
  consumed: 'neutral',
};

export function StatusPill({
  expiry,
  expiresOn,
}: {
  expiry: ExpiryInfo;
  expiresOn: IsoDate | null;
}) {
  const label = describeExpiry(expiry, expiresOn);
  return (
    <View style={[styles.pill, { backgroundColor: BACKGROUND[expiry.status] }]}>
      <Text variant="caption" tone={FOREGROUND[expiry.status]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

/**
 * src/lib/expiry.ts
 *
 * The only place in the app that decides whether something is fresh, close to
 * expiring, or gone. Pure functions: no React, no storage, no clock of their
 * own. `today` is always passed in.
 *
 * Passing the clock in is not ceremony. It is what makes the rules testable
 * ("on 2026-09-03 this item reads as soon") and what stops five components
 * each calling new Date() and disagreeing across a midnight boundary.
 */

import { daysBetween } from '@/lib/date';
import type { ExpiryStatus, IsoDate, PantryItem } from '@/types/pantry';

export interface ExpiryInfo {
  status: ExpiryStatus;
  /** Days until expiry. Negative when overdue, null when not applicable. */
  daysLeft: number | null;
}

export function getExpiryInfo(
  item: PantryItem,
  today: IsoDate,
  soonWindowDays: number,
): ExpiryInfo {
  if (item.consumedAt !== null) {
    return { status: 'consumed', daysLeft: null };
  }
  if (item.expiresOn === null) {
    return { status: 'nonPerishable', daysLeft: null };
  }

  const daysLeft = daysBetween(today, item.expiresOn);
  if (daysLeft === null) {
    // A malformed date on a stored record. Treat it as non perishable rather
    // than throwing: a bad byte in storage must never blank the whole list.
    return { status: 'nonPerishable', daysLeft: null };
  }

  if (daysLeft < 0) return { status: 'expired', daysLeft };
  if (daysLeft <= soonWindowDays) return { status: 'soon', daysLeft };
  return { status: 'fresh', daysLeft };
}

/** Sort weight. Lower sorts first, so the urgent things sit at the top. */
const STATUS_RANK: Record<ExpiryStatus, number> = {
  expired: 0,
  soon: 1,
  fresh: 2,
  nonPerishable: 3,
  consumed: 4,
};

export function compareByUrgency(
  a: PantryItem,
  b: PantryItem,
  today: IsoDate,
  soonWindowDays: number,
): number {
  const infoA = getExpiryInfo(a, today, soonWindowDays);
  const infoB = getExpiryInfo(b, today, soonWindowDays);

  const rank = STATUS_RANK[infoA.status] - STATUS_RANK[infoB.status];
  if (rank !== 0) return rank;

  // Same bucket: the one running out first goes on top.
  if (infoA.daysLeft !== null && infoB.daysLeft !== null) {
    if (infoA.daysLeft !== infoB.daysLeft) return infoA.daysLeft - infoB.daysLeft;
  }

  // Final tiebreak is alphabetical, so the order never jitters between
  // renders. Two items with identical dates must always land the same way.
  return a.name.localeCompare(b.name);
}

/** Human wording for a status pill. Short enough to fit a 320pt row. */
export function describeExpiry(info: ExpiryInfo, expiresOn: IsoDate | null): string {
  switch (info.status) {
    case 'consumed':
      return 'Used up';
    case 'nonPerishable':
      return 'No date';
    case 'expired': {
      const days = Math.abs(info.daysLeft ?? 0);
      if (days === 0) return 'Expires today';
      return days === 1 ? 'Expired yesterday' : `Expired ${days} days ago`;
    }
    case 'soon': {
      const days = info.daysLeft ?? 0;
      if (days === 0) return 'Expires today';
      return days === 1 ? 'Expires tomorrow' : `${days} days left`;
    }
    case 'fresh':
    default:
      return expiresOn ? `${info.daysLeft} days left` : 'No date';
  }
}

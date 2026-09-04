/**
 * src/lib/expiryChecks.ts
 *
 * A dependency free check of the date and expiry rules, run once in
 * development from the root layout. It is not a test framework and does not
 * pretend to be one: it is twenty assertions that fail loudly in the console
 * if the one piece of real logic in the app breaks.
 *
 * The reason this exists at all: everything else in PocketPantry is visible on
 * screen, so a mistake shows up immediately. Date arithmetic is the one part
 * that can be quietly wrong in one time zone and right in another.
 */

import { addDays, daysBetween, isIsoDate, todayIso } from '@/lib/date';
import { getExpiryInfo } from '@/lib/expiry';
import type { PantryItem } from '@/types/pantry';

function makeItem(expiresOn: string | null, consumedAt: string | null = null): PantryItem {
  return {
    id: 'test',
    name: 'Test',
    categoryId: 'cat_other',
    quantity: 1,
    unit: 'pc',
    location: 'pantry',
    expiresOn,
    note: '',
    consumedAt,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function check(label: string, condition: boolean): boolean {
  if (!condition) console.warn(`[expiryChecks] FAILED: ${label}`);
  return condition;
}

export function runExpiryChecks(): void {
  let passed = 0;
  let total = 0;
  const assert = (label: string, condition: boolean) => {
    total += 1;
    if (check(label, condition)) passed += 1;
  };

  assert('valid date accepted', isIsoDate('2026-09-14'));
  assert('impossible date rejected', !isIsoDate('2026-02-31'));
  assert('wrong shape rejected', !isIsoDate('14/09/2026'));
  assert('leap day accepted', isIsoDate('2028-02-29'));
  assert('non leap february rejected', !isIsoDate('2027-02-29'));

  assert('same day is zero', daysBetween('2026-09-03', '2026-09-03') === 0);
  assert('forward is positive', daysBetween('2026-09-03', '2026-09-10') === 7);
  assert('backward is negative', daysBetween('2026-09-10', '2026-09-03') === -7);
  assert('crosses a month', daysBetween('2026-08-31', '2026-09-01') === 1);
  assert('crosses a year', daysBetween('2026-12-31', '2027-01-01') === 1);
  assert('crosses a DST boundary', daysBetween('2026-10-24', '2026-10-26') === 2);

  assert('addDays forward', addDays('2026-09-03', 3) === '2026-09-06');
  assert('addDays backward', addDays('2026-09-03', -3) === '2026-08-31');
  assert('todayIso has the right shape', isIsoDate(todayIso()));

  const today = '2026-09-03';
  assert(
    'past date is expired',
    getExpiryInfo(makeItem('2026-09-01'), today, 5).status === 'expired',
  );
  assert(
    'today counts as soon, not expired',
    getExpiryInfo(makeItem(today), today, 5).status === 'soon',
  );
  assert(
    'inside the window is soon',
    getExpiryInfo(makeItem('2026-09-08'), today, 5).status === 'soon',
  );
  assert(
    'one day past the window is fresh',
    getExpiryInfo(makeItem('2026-09-09'), today, 5).status === 'fresh',
  );
  assert(
    'no date is non perishable',
    getExpiryInfo(makeItem(null), today, 5).status === 'nonPerishable',
  );
  assert(
    'consumed beats expired',
    getExpiryInfo(makeItem('2026-01-01', '2026-02-01T00:00:00.000Z'), today, 5).status ===
      'consumed',
  );
  assert(
    'a corrupt date does not throw',
    getExpiryInfo(makeItem('not-a-date'), today, 5).status === 'nonPerishable',
  );

  console.log(`[expiryChecks] ${passed} of ${total} passed`);
}

/**
 * src/lib/id.ts
 *
 * Identity, minted on device.
 *
 * Not Date.now() on its own: two items added in the same millisecond would
 * collide, and a collision here is silent, because nothing in a local first
 * app checks a uniqueness constraint for you. A time prefix keeps ids roughly
 * sortable by creation, and the random suffix is what makes them unique.
 *
 * Base 36 rather than hex because it is shorter for the same entropy and the
 * value is never read by a human anyway.
 */

export function createId(prefix = 'itm'): string {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${time}_${random}`;
}

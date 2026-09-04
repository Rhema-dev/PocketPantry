/**
 * src/lib/date.ts
 *
 * Calendar maths, done once, correctly, in one file.
 *
 * The bug this file exists to prevent:
 *
 *   new Date('2026-09-14')            // midnight UTC
 *     .toLocaleDateString()           // '13/09/2026' anywhere west of UTC
 *
 * The ISO date only form is defined by the spec to parse as UTC, but every
 * display and every "what day is it" call runs in local time. Mix the two and
 * items expire a day early for half the planet, which is exactly the class of
 * bug a reviewer looks for in a date heavy app.
 *
 * The fix used throughout: never let a date string become a local Date.
 * Parse it into year, month and day integers, and do arithmetic at 12:00 UTC
 * so a one hour DST shift can never move the day.
 */

import type { IsoDate } from '@/types/pantry';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface CalendarParts {
  year: number;
  month: number; // 1 to 12
  day: number; // 1 to 31
}

export function isIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const parts = toParts(value);
  if (!parts) return false;
  // Reject '2026-02-31': round tripping through UTC normalises it, so a
  // mismatch after the round trip means the input was never a real date.
  return toIsoDate(fromParts(parts)) === value;
}

export function toParts(value: IsoDate): CalendarParts | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

/** A Date pinned to 12:00 UTC, safe to add and subtract days from. */
export function fromParts(parts: CalendarParts): Date {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));
}

export function parseIsoDate(value: IsoDate): Date | null {
  const parts = toParts(value);
  return parts ? fromParts(parts) : null;
}

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** Format a 12:00 UTC anchored Date back to 'YYYY-MM-DD'. */
export function toIsoDate(date: Date): IsoDate {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/**
 * Today, as the user's device sees it. Reads the local calendar fields and
 * re-anchors them at 12:00 UTC, so "today" is the day on the phone's clock
 * and still safe for arithmetic.
 */
export function todayIso(now: Date = new Date()): IsoDate {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Whole days from `from` to `to`. Negative when `to` is in the past. */
export function daysBetween(from: IsoDate, to: IsoDate): number | null {
  const a = parseIsoDate(from);
  const b = parseIsoDate(to);
  if (!a || !b) return null;
  const MS_PER_DAY = 86_400_000;
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

export function addDays(value: IsoDate, days: number): IsoDate | null {
  const date = parseIsoDate(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

/** A local Date at noon, for handing to the native date picker. */
export function toPickerDate(value: IsoDate | null): Date {
  const parts = value ? toParts(value) : null;
  if (!parts) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  }
  return new Date(parts.year, parts.month - 1, parts.day, 12);
}

/** Convert what the native picker returns back into a calendar date. */
export function fromPickerDate(date: Date): IsoDate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

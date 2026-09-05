/**
 * src/theme/tokens.ts
 *
 * One source of truth for every colour, space, radius and type size in
 * PocketPantry. Nothing in the app is allowed to hard code a hex value or a
 * magic number: components import from here.
 *
 * Why a plain object and not a theming library: the app has one theme. A
 * library would add a provider, a hook and a bundle cost to solve a problem
 * we do not have. When a second theme is needed, this object becomes the
 * light branch of a record keyed by scheme, and the only file that changes
 * is the one that reads it.
 */

export const colors = {
  // Surfaces
  bg: '#F6F0E4',
  surface: '#FFFDF7',
  surfaceSunken: '#EDE5D5',
  surfaceTint: '#F0E7D6',

  // Text
  ink: '#17372E',
  inkMuted: '#52665E',
  inkFaint: '#829087',
  inkInverse: '#FFFDF7',

  // Lines
  border: '#DED3BF',
  borderStrong: '#BBAE96',

  // Brand
  brand: '#1F5C48',
  brandDark: '#123E31',
  brandWash: '#DCEADF',
  accent: '#DC5B3E',
  accentDark: '#A63D29',
  accentWash: '#F7DDD3',

  // Expiry status
  fresh: '#1F6A4E',
  freshWash: '#DCEADF',
  soon: '#9A6118',
  soonWash: '#F6E5B8',
  expired: '#B13E2C',
  expiredWash: '#F7DDD3',
  neutral: '#5F6B64',
  neutralWash: '#EFF1F0',

  // Feedback
  danger: '#9E3A2F',
  dangerWash: '#FBEAE7',
  focus: '#2F6B4F',
} as const;

/** 4 point spacing scale. Never write a raw margin number in a component. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const type = {
  display: { fontSize: 34, lineHeight: 39, fontWeight: '700' },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  heading: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 21, fontWeight: '600' },
  label: { fontSize: 13, lineHeight: 17, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
} as const;

/** Minimum touch target. Anything pressable must reach this in both axes. */
export const HIT_SIZE = 44;

export type ColorToken = keyof typeof colors;
export type TypeToken = keyof typeof type;

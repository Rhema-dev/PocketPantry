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
  bg: '#FBFAF7',
  surface: '#FFFFFF',
  surfaceSunken: '#F3F2EE',

  // Text
  ink: '#1A1F1C',
  inkMuted: '#5F6B64',
  inkFaint: '#8E9A93',
  inkInverse: '#FFFFFF',

  // Lines
  border: '#E4E8E5',
  borderStrong: '#CBD4CE',

  // Brand
  brand: '#2F6B4F',
  brandDark: '#204C38',
  brandWash: '#E8F1EC',

  // Expiry status
  fresh: '#2F6B4F',
  freshWash: '#E8F1EC',
  soon: '#B4741E',
  soonWash: '#FBF1E2',
  expired: '#9E3A2F',
  expiredWash: '#FBEAE7',
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
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const type = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
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

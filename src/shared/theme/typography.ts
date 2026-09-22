import type { TextStyle } from 'react-native';

export const fontSizes = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 16,
  xl: 20,
  xxl: 26,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '600',
  bold: '700',
  heavy: '800',
} satisfies Record<string, TextStyle['fontWeight']>;

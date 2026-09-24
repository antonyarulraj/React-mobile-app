import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, radii, spacing } from '@/shared/theme';

import type { SalesStatus } from '../types';

const LABELS: Record<SalesStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

type Props = {
  status: SalesStatus;
  size?: 'sm' | 'md';
};

export function StatusBadge({ status, size = 'sm' }: Props) {
  const palette = colors.status[status];
  return (
    <View style={[styles.badge, size === 'md' && styles.badgeMd, { backgroundColor: palette.background }]}>
      <Text style={[styles.label, size === 'md' && styles.labelMd, { color: palette.text }]}>
        {LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.xs,
  },
  badgeMd: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm - 2,
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
  },
  labelMd: {
    fontSize: fontSizes.md,
  },
});

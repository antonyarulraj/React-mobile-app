import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, radii, spacing } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/format';

import type { OrderTotals as Totals } from '../utils/orderMath';

export function OrderTotals({ totals }: { totals: Totals }) {
  return (
    <View style={styles.card}>
      <TotalRow label="Subtotal" value={totals.subtotal} />
      <TotalRow label="Tax" value={totals.tax} />
      {totals.discount > 0 ? <TotalRow label="Discount" value={-totals.discount} /> : null}
      <View style={styles.divider} />
      <TotalRow label="Total" value={totals.total} emphasized />
    </View>
  );
}

function TotalRow({ label, value, emphasized }: { label: string; value: number; emphasized?: boolean }) {
  const textStyle = emphasized ? styles.emphasized : styles.regular;
  return (
    <View style={styles.row}>
      <Text style={textStyle}>{label}</Text>
      <Text style={textStyle}>{formatCurrency(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  regular: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  emphasized: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.heavy,
    color: colors.textPrimary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
});

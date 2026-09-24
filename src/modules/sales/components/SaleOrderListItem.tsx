import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/shared/components/Avatar';
import { colors, fontSizes, fontWeights, radii, spacing } from '@/shared/theme';
import { formatCurrency, formatDate } from '@/shared/utils/format';

import type { SaleOrderWithCustomer } from '../hooks/useSaleOrders';
import { StatusBadge } from './StatusBadge';

type Props = {
  order: SaleOrderWithCustomer;
  isFirst: boolean;
  isLast: boolean;
  onPress: () => void;
};

export function SaleOrderListItem({ order, isFirst, isLast, onPress }: Props) {
  const customerName = order.customer?.name ?? 'Unknown customer';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${order.orderNumber}, ${customerName}, ${formatCurrency(order.total)}`}
      style={({ pressed }) => [
        styles.row,
        isFirst && styles.first,
        isLast && styles.last,
        !isLast && styles.divider,
        pressed && styles.pressed,
      ]}
    >
      <Avatar name={customerName} />
      <View style={styles.main}>
        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {customerName} · {formatDate(order.date)}
        </Text>
      </View>
      <View style={styles.trailing}>
        <Text style={styles.total}>{formatCurrency(order.total)}</Text>
        <StatusBadge status={order.status} />
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  first: {
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  },
  last: {
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.background,
  },
  main: {
    flex: 1,
  },
  orderNumber: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  meta: {
    marginTop: 2,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  total: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.heavy,
    color: colors.textPrimary,
  },
});

import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/shared/components/Avatar';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { PlaceholderCard } from '@/shared/components/PlaceholderCard';
import { Screen } from '@/shared/components/Screen';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { colors, fontSizes, fontWeights, radii, spacing } from '@/shared/theme';
import { formatCurrency, formatDate } from '@/shared/utils/format';

import { StatusBadge } from '../components/StatusBadge';
import { useSaleOrder } from '../hooks/useSaleOrder';
import type { SaleOrderWithCustomer } from '../hooks/useSaleOrders';

function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/sales');
  }
}

export default function SaleOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, reload } = useSaleOrder(id);

  if (state.status === 'success' && state.data) {
    const order = state.data;
    return (
      <Screen>
        <ScreenHeader title={order.orderNumber} subtitle={formatDate(order.date)} onBack={goBack} />
        <OrderDetails order={order} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Sale Order" onBack={goBack} />
      {state.status === 'loading' && <LoadingState />}
      {state.status === 'error' && <ErrorState message="We couldn't load this order." onRetry={reload} />}
      {state.status === 'success' && (
        <PlaceholderCard
          icon="search-outline"
          title="Order not found"
          description="This order may have been removed or the link is incorrect."
        />
      )}
    </Screen>
  );
}

function OrderDetails({ order }: { order: SaleOrderWithCustomer }) {
  const { customer } = order;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.summaryRow}>
        <StatusBadge status={order.status} size="md" />
        <Text style={styles.summaryTotal}>{formatCurrency(order.total)}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.customerRow}>
          <Avatar name={customer?.name ?? '?'} size={44} />
          <View style={styles.flex}>
            <Text style={styles.customerName}>{customer?.name ?? 'Unknown customer'}</Text>
            {customer?.company ? <Text style={styles.secondary}>{customer.company}</Text> : null}
            {customer ? <Text style={styles.secondary}>{customer.email}</Text> : null}
            {customer ? <Text style={styles.secondary}>{customer.phone}</Text> : null}
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order items ({order.items.length})</Text>
        {order.items.map((item, index) => (
          <View
            key={`${item.productId}-${index}`}
            style={[styles.itemRow, index < order.items.length - 1 && styles.itemDivider]}
          >
            <View style={styles.flex}>
              <Text style={styles.itemName}>{item.productName}</Text>
              <Text style={styles.secondary}>
                {item.quantity} × {formatCurrency(item.unitPrice)}
              </Text>
            </View>
            <Text style={styles.itemTotal}>{formatCurrency(item.lineTotal)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <TotalRow label="Subtotal" value={order.subtotal} />
        <TotalRow label="Tax" value={order.tax} />
        {order.discount > 0 ? <TotalRow label="Discount" value={-order.discount} /> : null}
        <View style={styles.totalDivider} />
        <TotalRow label="Total" value={order.total} emphasized />
      </View>

      {order.notes ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notes</Text>
          <Text style={styles.notes}>{order.notes}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function TotalRow({ label, value, emphasized }: { label: string; value: number; emphasized?: boolean }) {
  return (
    <View style={styles.totalRow}>
      <Text style={emphasized ? styles.totalLabelEmphasized : styles.totalLabel}>{label}</Text>
      <Text style={emphasized ? styles.totalValueEmphasized : styles.totalLabel}>
        {formatCurrency(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  summaryTotal: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.heavy,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.heavy,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  customerName: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.heavy,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  secondary: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  itemDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  itemName: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  itemTotal: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  totalLabel: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  totalLabelEmphasized: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.heavy,
    color: colors.textPrimary,
  },
  totalValueEmphasized: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.heavy,
    color: colors.textPrimary,
  },
  totalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  notes: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

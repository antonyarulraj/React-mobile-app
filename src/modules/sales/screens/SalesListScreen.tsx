import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';

import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { PlaceholderCard } from '@/shared/components/PlaceholderCard';
import { Screen } from '@/shared/components/Screen';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { colors, spacing } from '@/shared/theme';

import { SaleOrderListItem } from '../components/SaleOrderListItem';
import { useSaleOrders } from '../hooks/useSaleOrders';

const FAB_SIZE = 56;

export default function SalesListScreen() {
  const { state, reload } = useSaleOrders();

  const subtitle = state.status === 'success' ? `${state.data.length} orders` : undefined;

  return (
    <Screen>
      <ScreenHeader title="Sales Orders" subtitle={subtitle} />
      {state.status === 'loading' && <LoadingState />}
      {state.status === 'error' && (
        <ErrorState message="We couldn't load your sales orders." onRetry={reload} />
      )}
      {state.status === 'success' && (
        <FlatList
          data={state.data}
          keyExtractor={(order) => order.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <PlaceholderCard
              icon="receipt-outline"
              title="No sales orders yet"
              description="Tap + to create your first order."
            />
          }
          renderItem={({ item, index }) => (
            <SaleOrderListItem
              order={item}
              isFirst={index === 0}
              isLast={index === state.data.length - 1}
              onPress={() => router.push({ pathname: '/sales/[id]', params: { id: item.id } })}
            />
          )}
        />
      )}
      <Pressable
        onPress={() => router.push('/sales/new')}
        accessibilityRole="button"
        accessibilityLabel="New sale order"
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Ionicons name="add" size={28} color={colors.surface} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    // Leave room so the floating button never covers the last row.
    paddingBottom: FAB_SIZE + spacing.xxxl,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabPressed: {
    opacity: 0.85,
  },
});

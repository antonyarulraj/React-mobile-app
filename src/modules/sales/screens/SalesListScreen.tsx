import { router } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';

import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { PlaceholderCard } from '@/shared/components/PlaceholderCard';
import { Screen } from '@/shared/components/Screen';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { spacing } from '@/shared/theme';

import { SaleOrderListItem } from '../components/SaleOrderListItem';
import { useSaleOrders } from '../hooks/useSaleOrders';

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
              description="Orders you create will show up here."
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});

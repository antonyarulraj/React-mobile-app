import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { PlaceholderCard } from '@/shared/components/PlaceholderCard';
import { Screen } from '@/shared/components/Screen';
import { colors } from '@/shared/theme';

import { mockSalesRepository } from '../data/salesRepository';

export default function SalesListScreen() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [summary, setSummary] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [orders, customers, products] = await Promise.all([
          mockSalesRepository.getOrders(),
          mockSalesRepository.getCustomers(),
          mockSalesRepository.getProducts(),
        ]);
        if (cancelled) return;
        setSummary(
          `${orders.length} orders • ${customers.length} customers • ${products.length} products loaded (mock data).`
        );
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading') {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <PlaceholderCard
        icon="receipt-outline"
        title="Sales Orders"
        description={
          status === 'error'
            ? 'Could not load mock sales data.'
            : `The list, filters, and order detail/creation screens are coming next.\n\n${summary}`
        }
      />
    </Screen>
  );
}

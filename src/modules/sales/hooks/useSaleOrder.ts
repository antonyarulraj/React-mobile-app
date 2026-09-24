import { useCallback } from 'react';

import { useAsyncData } from '@/shared/hooks/useAsyncData';

import { mockSalesRepository } from '../data/salesRepository';
import type { SaleOrderWithCustomer } from './useSaleOrders';

/** Resolves to `null` when no order has this id, so screens can show a not-found state instead of an error. */
export function useSaleOrder(id: string) {
  const load = useCallback(async (): Promise<SaleOrderWithCustomer | null> => {
    const order = await mockSalesRepository.getOrderById(id);
    if (!order) return null;
    const customer = await mockSalesRepository.getCustomerById(order.customerId);
    return { ...order, customer };
  }, [id]);

  return useAsyncData(load);
}

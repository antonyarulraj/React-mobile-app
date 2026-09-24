import { useCallback } from 'react';

import { useAsyncData } from '@/shared/hooks/useAsyncData';

import { mockSalesRepository } from '../data/salesRepository';
import type { Customer, Product, SaleOrder } from '../types';

export interface OrderFormData {
  customers: Customer[];
  products: Product[];
  /** The order being edited; `null` when creating, or when editing an id that doesn't exist. */
  order: SaleOrder | null;
}

/** No refetch-on-focus here: the form owns its draft, and a background refetch must never clobber unsaved input. */
export function useOrderFormData(orderId?: string) {
  const load = useCallback(async (): Promise<OrderFormData> => {
    const [customers, products, order] = await Promise.all([
      mockSalesRepository.getCustomers(),
      mockSalesRepository.getProducts(),
      orderId ? mockSalesRepository.getOrderById(orderId) : Promise.resolve(undefined),
    ]);
    return { customers, products, order: order ?? null };
  }, [orderId]);

  return useAsyncData(load);
}

import { useAsyncData } from '@/shared/hooks/useAsyncData';

import { mockSalesRepository } from '../data/salesRepository';
import type { Customer, SaleOrder } from '../types';

export interface SaleOrderWithCustomer extends SaleOrder {
  customer?: Customer;
}

async function loadOrdersWithCustomers(): Promise<SaleOrderWithCustomer[]> {
  const [orders, customers] = await Promise.all([
    mockSalesRepository.getOrders(),
    mockSalesRepository.getCustomers(),
  ]);
  const customersById = new Map(customers.map((customer) => [customer.id, customer]));
  return orders.map((order) => ({ ...order, customer: customersById.get(order.customerId) }));
}

export function useSaleOrders() {
  return useAsyncData(loadOrdersWithCustomers);
}

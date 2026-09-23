import type { SaleOrderItem } from '../types';

export interface OrderTotals {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

export function calculateOrderTotals(
  items: SaleOrderItem[],
  { taxRate = 0, discount = 0 }: { taxRate?: number; discount?: number } = {}
): OrderTotals {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax - discount;
  return { subtotal, tax, discount, total };
}

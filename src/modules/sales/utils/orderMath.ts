import type { OrderLineInput, Product, SaleOrderItem } from '../types';

export interface OrderTotals {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

export function buildOrderItems(lines: OrderLineInput[], products: Product[]): SaleOrderItem[] {
  return lines.map(({ productId, quantity }) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      throw new Error(`Unknown product id: ${productId}`);
    }
    return {
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice: product.unitPrice,
      lineTotal: product.unitPrice * quantity,
    };
  });
}

export function calculateOrderTotals(
  items: SaleOrderItem[],
  { taxRate = 0, discount = 0 }: { taxRate?: number; discount?: number } = {}
): OrderTotals {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const tax = subtotal * taxRate;
  // A discount carried over from before an edit can exceed a now-smaller order; never let the total go negative.
  const appliedDiscount = Math.min(discount, subtotal + tax);
  return { subtotal, tax, discount: appliedDiscount, total: subtotal + tax - appliedDiscount };
}

/** The tax rate implied by an existing order, so edits keep charging the same rate. */
export function effectiveTaxRate(order: { subtotal: number; tax: number }): number {
  return order.subtotal > 0 ? order.tax / order.subtotal : 0;
}

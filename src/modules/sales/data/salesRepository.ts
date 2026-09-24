import { delay } from '@/shared/utils/delay';
import { generateId } from '@/shared/utils/id';

import type { Customer, Product, SaleOrder, SaleOrderInput, SalesStatus } from '../types';
import { buildOrderItems, calculateOrderTotals, effectiveTaxRate } from '../utils/orderMath';
import { isOrderEditable } from '../utils/orderRules';
import { mockCustomers } from './mockCustomers';
import { mockProducts } from './mockProducts';
import { mockSalesOrders } from './mockSalesOrders';

const MOCK_DELAY_MS = 400;

export interface SalesRepository {
  getOrders(): Promise<SaleOrder[]>;
  getOrderById(id: string): Promise<SaleOrder | undefined>;
  getCustomers(): Promise<Customer[]>;
  getCustomerById(id: string): Promise<Customer | undefined>;
  getProducts(): Promise<Product[]>;
  createOrder(input: SaleOrderInput): Promise<SaleOrder>;
  /** Rejects if the order doesn't exist or its status no longer allows editing. */
  updateOrder(id: string, input: SaleOrderInput): Promise<SaleOrder>;
  updateOrderStatus(id: string, status: SalesStatus): Promise<SaleOrder>;
}

// In-memory copies so create/update can change state for the session without touching the seed data.
// Updates replace order objects rather than mutating them, so screens holding an old copy never change underneath React.
let orders: SaleOrder[] = [...mockSalesOrders];
const customers: Customer[] = [...mockCustomers];
const products: Product[] = [...mockProducts];

function orderNumberValue(order: SaleOrder): number {
  return Number(order.orderNumber.replace('SO-', ''));
}

function nextOrderNumber(): string {
  return `SO-${Math.max(0, ...orders.map(orderNumberValue)) + 1}`;
}

function findOrderOrThrow(id: string): SaleOrder {
  const order = orders.find((o) => o.id === id);
  if (!order) {
    throw new Error(`Unknown order id: ${id}`);
  }
  return order;
}

function replaceOrder(updated: SaleOrder): SaleOrder {
  orders = orders.map((o) => (o.id === updated.id ? updated : o));
  return updated;
}

function validateInput(input: SaleOrderInput) {
  if (!customers.some((c) => c.id === input.customerId)) {
    throw new Error(`Unknown customer id: ${input.customerId}`);
  }
  if (input.items.length === 0) {
    throw new Error('An order needs at least one item.');
  }
  if (input.items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
    throw new Error('Item quantities must be whole numbers of at least 1.');
  }
}

export const mockSalesRepository: SalesRepository = {
  async getOrders() {
    await delay(MOCK_DELAY_MS);
    return [...orders].sort(
      (a, b) => b.date.localeCompare(a.date) || orderNumberValue(b) - orderNumberValue(a)
    );
  },

  async getOrderById(id) {
    await delay(MOCK_DELAY_MS);
    return orders.find((order) => order.id === id);
  },

  async getCustomers() {
    await delay(MOCK_DELAY_MS);
    return [...customers];
  },

  async getCustomerById(id) {
    await delay(MOCK_DELAY_MS);
    return customers.find((customer) => customer.id === id);
  },

  async getProducts() {
    await delay(MOCK_DELAY_MS);
    return [...products];
  },

  async createOrder(input) {
    await delay(MOCK_DELAY_MS);
    validateInput(input);

    const items = buildOrderItems(input.items, products);
    const order: SaleOrder = {
      id: generateId('order'),
      orderNumber: nextOrderNumber(),
      customerId: input.customerId,
      date: input.date,
      items,
      status: 'draft',
      notes: input.notes,
      ...calculateOrderTotals(items, { taxRate: input.taxRate, discount: input.discount }),
    };

    orders = [...orders, order];
    return order;
  },

  async updateOrder(id, input) {
    await delay(MOCK_DELAY_MS);
    const existing = findOrderOrThrow(id);
    if (!isOrderEditable(existing.status)) {
      throw new Error(`${existing.orderNumber} is ${existing.status} and can no longer be edited.`);
    }
    validateInput(input);

    const items = buildOrderItems(input.items, products);
    return replaceOrder({
      ...existing,
      customerId: input.customerId,
      date: input.date,
      items,
      notes: input.notes,
      ...calculateOrderTotals(items, {
        taxRate: input.taxRate ?? effectiveTaxRate(existing),
        discount: input.discount ?? existing.discount,
      }),
    });
  },

  async updateOrderStatus(id, status) {
    await delay(MOCK_DELAY_MS);
    return replaceOrder({ ...findOrderOrThrow(id), status });
  },
};

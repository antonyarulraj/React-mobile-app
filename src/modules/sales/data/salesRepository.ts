import { delay } from '@/shared/utils/delay';
import { generateId } from '@/shared/utils/id';

import type { Customer, NewSaleOrderInput, Product, SaleOrder, SalesStatus } from '../types';
import { calculateOrderTotals } from '../utils/calculateTotals';
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
  createOrder(input: NewSaleOrderInput): Promise<SaleOrder>;
  updateOrderStatus(id: string, status: SalesStatus): Promise<SaleOrder>;
}

// In-memory copies so create/update can mutate state for the session without touching the seed data.
const orders: SaleOrder[] = [...mockSalesOrders];
const customers: Customer[] = [...mockCustomers];
const products: Product[] = [...mockProducts];

function nextOrderNumber(): string {
  const numbers = orders.map((order) => Number(order.orderNumber.replace('SO-', '')));
  const next = Math.max(0, ...numbers) + 1;
  return `SO-${next}`;
}

function findProduct(productId: string): Product {
  const product = products.find((p) => p.id === productId);
  if (!product) {
    throw new Error(`Unknown product id: ${productId}`);
  }
  return product;
}

export const mockSalesRepository: SalesRepository = {
  async getOrders() {
    await delay(MOCK_DELAY_MS);
    return [...orders].sort((a, b) => b.date.localeCompare(a.date));
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

    const items = input.items.map(({ productId, quantity }) => {
      const product = findProduct(productId);
      return {
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.unitPrice,
        lineTotal: product.unitPrice * quantity,
      };
    });
    const totals = calculateOrderTotals(items, { taxRate: input.taxRate, discount: input.discount });

    const order: SaleOrder = {
      id: generateId('order'),
      orderNumber: nextOrderNumber(),
      customerId: input.customerId,
      date: input.date,
      items,
      status: 'draft',
      notes: input.notes,
      ...totals,
    };

    orders.push(order);
    return order;
  },

  async updateOrderStatus(id, status) {
    await delay(MOCK_DELAY_MS);

    const order = orders.find((o) => o.id === id);
    if (!order) {
      throw new Error(`Unknown order id: ${id}`);
    }
    order.status = status;
    return order;
  },
};

import type { SalesStatus, SaleOrder, SaleOrderItem } from '../types';
import { calculateOrderTotals } from '../utils/calculateTotals';
import { mockProducts } from './mockProducts';

function productById(id: string) {
  const product = mockProducts.find((p) => p.id === id);
  if (!product) {
    throw new Error(`Unknown mock product id: ${id}`);
  }
  return product;
}

function buildItems(lines: { productId: string; quantity: number }[]): SaleOrderItem[] {
  return lines.map(({ productId, quantity }) => {
    const product = productById(productId);
    return {
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice: product.unitPrice,
      lineTotal: product.unitPrice * quantity,
    };
  });
}

interface OrderSeed {
  id: string;
  orderNumber: string;
  customerId: string;
  date: string;
  status: SalesStatus;
  lines: { productId: string; quantity: number }[];
  notes?: string;
  discount?: number;
}

const orderSeeds: OrderSeed[] = [
  {
    id: 'order-1042',
    orderNumber: 'SO-1042',
    customerId: 'cust-1',
    date: '2026-09-24',
    status: 'confirmed',
    lines: [
      { productId: 'prod-1', quantity: 2 },
      { productId: 'prod-2', quantity: 1 },
      { productId: 'prod-3', quantity: 1 },
    ],
    notes: 'Deliver before Friday, gift wrap requested.',
  },
  {
    id: 'order-1041',
    orderNumber: 'SO-1041',
    customerId: 'cust-2',
    date: '2026-09-23',
    status: 'shipped',
    lines: [
      { productId: 'prod-3', quantity: 3 },
      { productId: 'prod-7', quantity: 2 },
      { productId: 'prod-1', quantity: 2 },
    ],
  },
  {
    id: 'order-1040',
    orderNumber: 'SO-1040',
    customerId: 'cust-3',
    date: '2026-09-22',
    status: 'pending',
    lines: [{ productId: 'prod-8', quantity: 1 }, { productId: 'prod-1', quantity: 1 }],
  },
  {
    id: 'order-1039',
    orderNumber: 'SO-1039',
    customerId: 'cust-4',
    date: '2026-09-21',
    status: 'completed',
    lines: [
      { productId: 'prod-6', quantity: 2 },
      { productId: 'prod-4', quantity: 2 },
      { productId: 'prod-5', quantity: 4 },
    ],
  },
  {
    id: 'order-1038',
    orderNumber: 'SO-1038',
    customerId: 'cust-5',
    date: '2026-09-20',
    status: 'cancelled',
    lines: [{ productId: 'prod-8', quantity: 7 }],
    notes: 'Customer cancelled — ordered by mistake.',
  },
  {
    id: 'order-1037',
    orderNumber: 'SO-1037',
    customerId: 'cust-6',
    date: '2026-09-19',
    status: 'draft',
    lines: [
      { productId: 'prod-3', quantity: 1 },
      { productId: 'prod-2', quantity: 2 },
      { productId: 'prod-7', quantity: 3 },
    ],
  },
  {
    id: 'order-1036',
    orderNumber: 'SO-1036',
    customerId: 'cust-1',
    date: '2026-09-18',
    status: 'completed',
    lines: [{ productId: 'prod-4', quantity: 3 }, { productId: 'prod-5', quantity: 2 }],
  },
  {
    id: 'order-1035',
    orderNumber: 'SO-1035',
    customerId: 'cust-2',
    date: '2026-09-17',
    status: 'confirmed',
    lines: [{ productId: 'prod-6', quantity: 1 }, { productId: 'prod-1', quantity: 3 }],
  },
  {
    id: 'order-1034',
    orderNumber: 'SO-1034',
    customerId: 'cust-3',
    date: '2026-09-16',
    status: 'pending',
    lines: [{ productId: 'prod-2', quantity: 1 }],
  },
  {
    id: 'order-1033',
    orderNumber: 'SO-1033',
    customerId: 'cust-4',
    date: '2026-09-15',
    status: 'shipped',
    lines: [
      { productId: 'prod-3', quantity: 1 },
      { productId: 'prod-8', quantity: 2 },
      { productId: 'prod-4', quantity: 1 },
    ],
    discount: 50,
  },
  {
    id: 'order-1032',
    orderNumber: 'SO-1032',
    customerId: 'cust-5',
    date: '2026-09-14',
    status: 'completed',
    lines: [{ productId: 'prod-7', quantity: 1 }, { productId: 'prod-6', quantity: 1 }],
  },
  {
    id: 'order-1031',
    orderNumber: 'SO-1031',
    customerId: 'cust-6',
    date: '2026-09-13',
    status: 'cancelled',
    lines: [{ productId: 'prod-5', quantity: 5 }],
  },
  {
    id: 'order-1030',
    orderNumber: 'SO-1030',
    customerId: 'cust-1',
    date: '2026-09-12',
    status: 'confirmed',
    lines: [{ productId: 'prod-1', quantity: 4 }, { productId: 'prod-2', quantity: 1 }],
  },
  {
    id: 'order-1029',
    orderNumber: 'SO-1029',
    customerId: 'cust-2',
    date: '2026-09-11',
    status: 'draft',
    lines: [{ productId: 'prod-3', quantity: 1 }],
  },
  {
    id: 'order-1028',
    orderNumber: 'SO-1028',
    customerId: 'cust-3',
    date: '2026-09-10',
    status: 'completed',
    lines: [
      { productId: 'prod-4', quantity: 2 },
      { productId: 'prod-8', quantity: 3 },
      { productId: 'prod-1', quantity: 1 },
    ],
  },
  {
    id: 'order-1027',
    orderNumber: 'SO-1027',
    customerId: 'cust-4',
    date: '2026-09-09',
    status: 'pending',
    lines: [{ productId: 'prod-6', quantity: 2 }],
  },
];

export const mockSalesOrders: SaleOrder[] = orderSeeds.map((seed) => {
  const items = buildItems(seed.lines);
  const totals = calculateOrderTotals(items, { discount: seed.discount ?? 0 });
  return {
    id: seed.id,
    orderNumber: seed.orderNumber,
    customerId: seed.customerId,
    date: seed.date,
    items,
    status: seed.status,
    notes: seed.notes,
    ...totals,
  };
});

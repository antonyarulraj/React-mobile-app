export type SalesStatus = 'draft' | 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  unit: string;
}

export interface SaleOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface SaleOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  date: string;
  items: SaleOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: SalesStatus;
  notes?: string;
}

export type OrderLineInput = Pick<SaleOrderItem, 'productId' | 'quantity'>;

/** Used for both creating and editing. On edit, omitted `taxRate`/`discount` keep the order's existing values. */
export interface SaleOrderInput {
  customerId: string;
  date: string;
  items: OrderLineInput[];
  taxRate?: number;
  discount?: number;
  notes?: string;
}

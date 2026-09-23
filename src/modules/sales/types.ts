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

export interface NewSaleOrderInput {
  customerId: string;
  date: string;
  items: Pick<SaleOrderItem, 'productId' | 'quantity'>[];
  taxRate?: number;
  discount?: number;
  notes?: string;
}

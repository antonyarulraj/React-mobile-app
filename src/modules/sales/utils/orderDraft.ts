import { isValidIsoDate, todayIsoDate } from '@/shared/utils/date';

import type { SaleOrder, SaleOrderInput } from '../types';

export const MAX_QUANTITY = 9999;

/** Quantity is kept as text so the field can be cleared while typing without snapping to 0. */
export interface DraftLine {
  productId: string;
  quantityText: string;
}

export interface OrderDraft {
  customerId: string | null;
  date: string;
  lines: DraftLine[];
  notes: string;
}

export interface DraftErrors {
  customer?: string;
  date?: string;
  items?: string;
  /** Keyed by productId — each product appears on at most one line. */
  lines?: Record<string, string>;
}

export function emptyDraft(): OrderDraft {
  return { customerId: null, date: todayIsoDate(), lines: [], notes: '' };
}

export function draftFromOrder(order: SaleOrder): OrderDraft {
  return {
    customerId: order.customerId,
    date: order.date,
    lines: order.items.map((item) => ({ productId: item.productId, quantityText: String(item.quantity) })),
    notes: order.notes ?? '',
  };
}

/** Returns the quantity as a positive integer, or `null` if the text isn't one. */
export function parseQuantity(text: string): number | null {
  if (!/^\d+$/.test(text)) return null;
  const quantity = Number(text);
  return quantity >= 1 && quantity <= MAX_QUANTITY ? quantity : null;
}

/** Adding a product that's already on the order bumps its quantity instead of creating a duplicate line. */
export function addProductLine(lines: DraftLine[], productId: string): DraftLine[] {
  const existing = lines.find((line) => line.productId === productId);
  if (!existing) {
    return [...lines, { productId, quantityText: '1' }];
  }
  const next = Math.min((parseQuantity(existing.quantityText) ?? 0) + 1, MAX_QUANTITY);
  return lines.map((line) => (line.productId === productId ? { ...line, quantityText: String(next) } : line));
}

export function validateDraft(draft: OrderDraft): DraftErrors {
  const errors: DraftErrors = {};

  if (!draft.customerId) {
    errors.customer = 'Choose a customer.';
  }
  if (!isValidIsoDate(draft.date)) {
    errors.date = 'Enter a valid date as YYYY-MM-DD.';
  }
  if (draft.lines.length === 0) {
    errors.items = 'Add at least one item.';
  }

  const lineErrors: Record<string, string> = {};
  for (const line of draft.lines) {
    if (parseQuantity(line.quantityText) === null) {
      lineErrors[line.productId] = `Quantity must be a whole number from 1 to ${MAX_QUANTITY}.`;
    }
  }
  if (Object.keys(lineErrors).length > 0) {
    errors.lines = lineErrors;
  }

  return errors;
}

export function hasErrors(errors: DraftErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Only call after `validateDraft` reports no errors. */
export function draftToInput(draft: OrderDraft): SaleOrderInput {
  if (!draft.customerId) {
    throw new Error('draftToInput called on an invalid draft');
  }
  const notes = draft.notes.trim();
  return {
    customerId: draft.customerId,
    date: draft.date,
    items: draft.lines.map((line) => ({ productId: line.productId, quantity: parseQuantity(line.quantityText) ?? 0 })),
    notes: notes || undefined,
  };
}

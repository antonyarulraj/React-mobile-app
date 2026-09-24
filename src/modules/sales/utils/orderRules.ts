import type { SalesStatus } from '../types';

const EDITABLE_STATUSES: readonly SalesStatus[] = ['draft', 'pending'];

/** Once an order is confirmed its contents are committed; only drafts and pending orders can be edited. */
export function isOrderEditable(status: SalesStatus): boolean {
  return EDITABLE_STATUSES.includes(status);
}

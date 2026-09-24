export const colors = {
  primary: '#4338CA',
  primaryLight: '#EEF2FF',
  background: '#F4F5F7',
  surface: '#FFFFFF',

  textPrimary: '#12131A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  border: '#EDEEF1',

  success: '#059669',
  warning: '#B45309',
  danger: '#991B1B',

  status: {
    draft: { background: '#E5E7EB', text: '#374151' },
    pending: { background: '#FEF3C7', text: '#92400E' },
    confirmed: { background: '#DBEAFE', text: '#1E40AF' },
    shipped: { background: '#E0E7FF', text: '#3730A3' },
    completed: { background: '#D1FAE5', text: '#065F46' },
    cancelled: { background: '#FEE2E2', text: '#991B1B' },
  },
} as const;

import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/shared/components/Button';
import { ErrorState } from '@/shared/components/ErrorState';
import { FormSection } from '@/shared/components/FormSection';
import { LoadingState } from '@/shared/components/LoadingState';
import { PickerModal, type PickerOption } from '@/shared/components/PickerModal';
import { PlaceholderCard } from '@/shared/components/PlaceholderCard';
import { Screen } from '@/shared/components/Screen';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { SelectField } from '@/shared/components/SelectField';
import { colors, fontSizes, fontWeights, radii, spacing } from '@/shared/theme';
import { isValidIsoDate } from '@/shared/utils/date';
import { formatCurrency, formatDate } from '@/shared/utils/format';

import { LineItemEditor } from '../components/LineItemEditor';
import { OrderTotals } from '../components/OrderTotals';
import { mockSalesRepository } from '../data/salesRepository';
import { useOrderFormData, type OrderFormData } from '../hooks/useOrderFormData';
import {
  addProductLine,
  draftFromOrder,
  draftToInput,
  emptyDraft,
  hasErrors,
  parseQuantity,
  validateDraft,
  type DraftErrors,
  type OrderDraft,
} from '../utils/orderDraft';
import { buildOrderItems, calculateOrderTotals, effectiveTaxRate } from '../utils/orderMath';
import { isOrderEditable } from '../utils/orderRules';

function leaveForm(orderId?: string) {
  if (router.canGoBack()) {
    router.back();
  } else if (orderId) {
    router.replace({ pathname: '/sales/[id]', params: { id: orderId } });
  } else {
    router.replace('/sales');
  }
}

/** Serves both `/sales/new` (no id) and `/sales/[id]/edit`. */
export default function SaleOrderFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { state, reload } = useOrderFormData(id);
  const title = id ? 'Edit Sale Order' : 'New Sale Order';

  if (state.status === 'success') {
    const { order } = state.data;
    if (id && !order) {
      return (
        <FormShell title={title} orderId={id}>
          <PlaceholderCard
            icon="search-outline"
            title="Order not found"
            description="This order may have been removed or the link is incorrect."
          />
        </FormShell>
      );
    }
    if (order && !isOrderEditable(order.status)) {
      return (
        <FormShell title={title} orderId={id}>
          <PlaceholderCard
            icon="lock-closed-outline"
            title="This order can't be edited"
            description={`${order.orderNumber} is ${order.status}. Only draft and pending orders can be changed.`}
          />
        </FormShell>
      );
    }
    return (
      <FormShell title={order ? `Edit ${order.orderNumber}` : title} orderId={id}>
        <OrderForm data={state.data} />
      </FormShell>
    );
  }

  return (
    <FormShell title={title} orderId={id}>
      {state.status === 'loading' && <LoadingState />}
      {state.status === 'error' && <ErrorState message="We couldn't load the order form." onRetry={reload} />}
    </FormShell>
  );
}

function FormShell({ title, orderId, children }: { title: string; orderId?: string; children: ReactNode }) {
  return (
    <Screen>
      <ScreenHeader title={title} onBack={() => leaveForm(orderId)} />
      {children}
    </Screen>
  );
}

type PickerKind = 'customer' | 'product' | null;

function OrderForm({ data }: { data: OrderFormData }) {
  const { customers, products, order } = data;
  const [draft, setDraft] = useState<OrderDraft>(() => (order ? draftFromOrder(order) : emptyDraft()));
  const [openPicker, setOpenPicker] = useState<PickerKind>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const customer = customers.find((c) => c.id === draft.customerId);
  const errors = validateDraft(draft);
  const shownErrors: DraftErrors = submitAttempted ? errors : {};

  const totals = useMemo(() => {
    const items = buildOrderItems(
      draft.lines.map((line) => ({ productId: line.productId, quantity: parseQuantity(line.quantityText) ?? 0 })),
      products
    );
    // Edits keep the order's existing tax rate and discount; the form doesn't change them.
    return calculateOrderTotals(items, {
      taxRate: order ? effectiveTaxRate(order) : 0,
      discount: order?.discount ?? 0,
    });
  }, [draft.lines, products, order]);

  const customerOptions: PickerOption[] = customers.map((c) => ({
    id: c.id,
    label: c.name,
    sublabel: c.company ?? c.email,
  }));
  const productOptions: PickerOption[] = products.map((p) => ({
    id: p.id,
    label: p.name,
    sublabel: `${p.sku} · ${formatCurrency(p.unitPrice)}`,
  }));

  const update = (patch: Partial<OrderDraft>) => setDraft((current) => ({ ...current, ...patch }));

  const setLineQuantity = (productId: string, quantityText: string) =>
    setDraft((current) => ({
      ...current,
      lines: current.lines.map((line) => (line.productId === productId ? { ...line, quantityText } : line)),
    }));

  const removeLine = (productId: string) =>
    setDraft((current) => ({ ...current, lines: current.lines.filter((line) => line.productId !== productId) }));

  async function handleSave() {
    setSubmitAttempted(true);
    if (hasErrors(errors) || saving) return;

    setSaving(true);
    setSaveError(null);
    try {
      const input = draftToInput(draft);
      if (order) {
        await mockSalesRepository.updateOrder(order.id, input);
        leaveForm(order.id);
      } else {
        const created = await mockSalesRepository.createOrder(input);
        // Replace the form so "back" from the new order goes to the list, not back into an empty form.
        router.replace({ pathname: '/sales/[id]', params: { id: created.id } });
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Something went wrong while saving.');
      setSaving(false);
    }
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <FormSection label="Customer" error={shownErrors.customer}>
          <SelectField
            value={customer?.name}
            placeholder="Select customer"
            onPress={() => setOpenPicker('customer')}
            invalid={Boolean(shownErrors.customer)}
            accessibilityLabel="Customer"
          />
        </FormSection>

        <FormSection label="Order date" error={shownErrors.date}>
          <TextInput
            value={draft.date}
            onChangeText={(date) => update({ date })}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textMuted}
            keyboardType="numbers-and-punctuation"
            autoCorrect={false}
            maxLength={10}
            accessibilityLabel="Order date"
            style={[styles.input, shownErrors.date && styles.inputInvalid]}
          />
          {isValidIsoDate(draft.date) ? <Text style={styles.hint}>{formatDate(draft.date)}</Text> : null}
        </FormSection>

        <FormSection
          label="Items"
          error={shownErrors.items}
          action={
            <Pressable
              onPress={() => setOpenPicker('product')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Add item"
            >
              <Text style={styles.link}>+ Add item</Text>
            </Pressable>
          }
        >
          {draft.lines.length > 0 ? (
            <View style={styles.card}>
              {draft.lines.map((line, index) => {
                const product = productsById.get(line.productId);
                if (!product) return null;
                return (
                  <View key={line.productId} style={index > 0 && styles.lineDivider}>
                    <LineItemEditor
                      product={product}
                      quantityText={line.quantityText}
                      error={shownErrors.lines?.[line.productId]}
                      onChangeQuantity={(text) => setLineQuantity(line.productId, text)}
                      onRemove={() => removeLine(line.productId)}
                    />
                  </View>
                );
              })}
            </View>
          ) : (
            <Pressable
              onPress={() => setOpenPicker('product')}
              accessibilityRole="button"
              accessibilityLabel="Add the first item"
              style={[styles.emptyItems, shownErrors.items && styles.inputInvalid]}
            >
              <Text style={styles.emptyItemsText}>No items yet — tap to add a product</Text>
            </Pressable>
          )}
        </FormSection>

        <OrderTotals totals={totals} />

        <FormSection label="Notes">
          <TextInput
            value={draft.notes}
            onChangeText={(notes) => update({ notes })}
            placeholder="Add a note for this order…"
            placeholderTextColor={colors.textMuted}
            multiline
            accessibilityLabel="Notes"
            style={[styles.input, styles.notesInput]}
          />
        </FormSection>

        {saveError ? (
          <Text style={styles.saveError} accessibilityLiveRegion="polite">
            {saveError}
          </Text>
        ) : null}
        {submitAttempted && hasErrors(errors) ? (
          <Text style={styles.saveError}>Fix the highlighted fields to save this order.</Text>
        ) : null}

        <Button label={order ? 'Save Changes' : 'Create Order'} onPress={handleSave} loading={saving} />
      </ScrollView>

      <PickerModal
        visible={openPicker === 'customer'}
        title="Select customer"
        options={customerOptions}
        selectedId={draft.customerId}
        onSelect={(customerId) => {
          update({ customerId });
          setOpenPicker(null);
        }}
        onClose={() => setOpenPicker(null)}
      />
      <PickerModal
        visible={openPicker === 'product'}
        title="Add item"
        options={productOptions}
        onSelect={(productId) => {
          setDraft((current) => ({ ...current, lines: addProductLine(current.lines, productId) }));
          setOpenPicker(null);
        }}
        onClose={() => setOpenPicker(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
  },
  lineDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  input: {
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: colors.surface,
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },
  inputInvalid: {
    borderColor: colors.danger,
  },
  notesInput: {
    minHeight: 88,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  link: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
  emptyItems: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textMuted,
    backgroundColor: colors.surface,
  },
  emptyItemsText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  saveError: {
    fontSize: fontSizes.md,
    color: colors.danger,
    textAlign: 'center',
  },
});

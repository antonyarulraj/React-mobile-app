import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fontSizes, fontWeights, radii, spacing } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/format';

import type { Product } from '../types';
import { MAX_QUANTITY, parseQuantity } from '../utils/orderDraft';

type Props = {
  product: Product;
  quantityText: string;
  error?: string;
  onChangeQuantity: (text: string) => void;
  onRemove: () => void;
};

export function LineItemEditor({ product, quantityText, error, onChangeQuantity, onRemove }: Props) {
  const quantity = parseQuantity(quantityText);
  const lineTotal = product.unitPrice * (quantity ?? 0);

  const step = (delta: number) => {
    const next = Math.min(Math.max((quantity ?? 0) + delta, 1), MAX_QUANTITY);
    onChangeQuantity(String(next));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Pressable
          onPress={onRemove}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${product.name}`}
        >
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.controlsRow}>
        <View style={[styles.stepper, error && styles.stepperInvalid]}>
          <StepButton
            icon="remove"
            label={`Decrease ${product.name} quantity`}
            disabled={quantity !== null && quantity <= 1}
            onPress={() => step(-1)}
          />
          <TextInput
            value={quantityText}
            onChangeText={(text) => onChangeQuantity(text.replace(/\D/g, ''))}
            keyboardType="number-pad"
            maxLength={String(MAX_QUANTITY).length}
            selectTextOnFocus
            accessibilityLabel={`${product.name} quantity`}
            style={styles.quantityInput}
          />
          <StepButton
            icon="add"
            label={`Increase ${product.name} quantity`}
            disabled={quantity !== null && quantity >= MAX_QUANTITY}
            onPress={() => step(1)}
          />
        </View>
        <Text style={styles.unitPrice}>× {formatCurrency(product.unitPrice)}</Text>
        <Text style={styles.lineTotal}>{formatCurrency(lineTotal)}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

type StepButtonProps = {
  icon: 'add' | 'remove';
  label: string;
  disabled: boolean;
  onPress: () => void;
};

function StepButton({ icon, label, disabled, onPress }: StepButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.stepButton, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Ionicons name={icon} size={16} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  name: {
    flex: 1,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  stepperInvalid: {
    borderColor: colors.danger,
  },
  stepButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.5,
  },
  disabled: {
    opacity: 0.3,
  },
  quantityInput: {
    // Fixed width: on web an <input> otherwise takes its ~20-character default width and pushes the line total off-screen.
    width: 48,
    paddingVertical: spacing.xs,
    textAlign: 'center',
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  unitPrice: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  lineTotal: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  error: {
    fontSize: fontSizes.sm,
    color: colors.danger,
  },
});

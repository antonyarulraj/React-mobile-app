import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { fontSizes, fontWeights } from '../theme/typography';

type Props = {
  value?: string;
  placeholder: string;
  onPress: () => void;
  invalid?: boolean;
  accessibilityLabel: string;
};

export function SelectField({ value, placeholder, onPress, invalid, accessibilityLabel }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={value ? `Currently ${value}` : undefined}
      style={({ pressed }) => [styles.field, invalid && styles.invalid, pressed && styles.pressed]}
    >
      <Text style={value ? styles.value : styles.placeholder} numberOfLines={1}>
        {value ?? placeholder}
      </Text>
      <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: colors.surface,
  },
  invalid: {
    borderColor: colors.danger,
  },
  pressed: {
    opacity: 0.7,
  },
  value: {
    flex: 1,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.textPrimary,
  },
  placeholder: {
    flex: 1,
    fontSize: fontSizes.base,
    color: colors.textMuted,
  },
});

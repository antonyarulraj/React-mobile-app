import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { fontSizes, fontWeights } from '../theme/typography';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Action shown opposite the back button (compact header only). Should be ~36pt wide to keep the title centered. */
  right?: ReactNode;
};

/** Large left-aligned title for tab roots; compact centered title with a back button when `onBack` is given. */
export function ScreenHeader({ title, subtitle, onBack, right }: Props) {
  if (!onBack) {
    return (
      <View style={styles.container}>
        <Text style={styles.largeTitle}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.row]}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons name="chevron-back" size={20} color={colors.primary} />
      </Pressable>
      <View style={styles.centerTitle}>
        <Text style={styles.compactTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.compactSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.backButtonSpacer}>{right}</View>
    </View>
  );
}

type HeaderIconButtonProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  accessibilityLabel: string;
  onPress: () => void;
};

export function HeaderIconButton({ icon, accessibilityLabel, onPress }: HeaderIconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={18} color={colors.primary} />
    </Pressable>
  );
}

const BACK_BUTTON_SIZE = 36;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  largeTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.heavy,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 2,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  backButton: {
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonSpacer: {
    width: BACK_BUTTON_SIZE,
  },
  pressed: {
    opacity: 0.6,
  },
  centerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  compactTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.heavy,
    color: colors.textPrimary,
  },
  compactSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
});

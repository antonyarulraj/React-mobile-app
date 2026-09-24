import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { fontSizes, fontWeights } from '../theme/typography';
import { PlaceholderCard } from './PlaceholderCard';

type Props = {
  message: string;
  onRetry: () => void;
};

export function ErrorState({ message, onRetry }: Props) {
  return (
    <PlaceholderCard icon="cloud-offline-outline" title="Something went wrong" description={message}>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonLabel}>Try again</Text>
      </Pressable>
    </PlaceholderCard>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.8,
  },
  buttonLabel: {
    color: colors.surface,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
  },
});

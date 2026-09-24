import { StyleSheet } from 'react-native';

import { spacing } from '../theme/spacing';
import { Button } from './Button';
import { PlaceholderCard } from './PlaceholderCard';

type Props = {
  message: string;
  onRetry: () => void;
};

export function ErrorState({ message, onRetry }: Props) {
  return (
    <PlaceholderCard icon="cloud-offline-outline" title="Something went wrong" description={message}>
      <Button label="Try again" onPress={onRetry} style={styles.button} />
    </PlaceholderCard>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: spacing.xl,
  },
});

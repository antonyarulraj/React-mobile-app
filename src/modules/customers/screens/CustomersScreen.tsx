import { PlaceholderCard } from '@/shared/components/PlaceholderCard';
import { Screen } from '@/shared/components/Screen';

export default function CustomersScreen() {
  return (
    <Screen>
      <PlaceholderCard
        icon="people-outline"
        title="Customers"
        description="A lightweight customer list to support the Sales module will appear here."
      />
    </Screen>
  );
}

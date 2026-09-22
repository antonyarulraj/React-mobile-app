import { PlaceholderCard } from '@/shared/components/PlaceholderCard';
import { Screen } from '@/shared/components/Screen';

export default function DashboardScreen() {
  return (
    <Screen>
      <PlaceholderCard
        icon="grid-outline"
        title="Sales Dashboard"
        description="Sales stats and recent orders will appear here once the Sales module is wired up with mock data."
      />
    </Screen>
  );
}

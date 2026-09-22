import { PlaceholderCard } from '@/shared/components/PlaceholderCard';
import { Screen } from '@/shared/components/Screen';

export default function MoreScreen() {
  return (
    <Screen>
      <PlaceholderCard
        icon="ellipsis-horizontal-circle-outline"
        title="More"
        description="Settings and future ERP modules (Inventory, Purchases, Reports) will be reachable from here."
      />
    </Screen>
  );
}

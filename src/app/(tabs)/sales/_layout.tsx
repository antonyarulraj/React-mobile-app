import { Stack } from 'expo-router';

import { colors } from '@/shared/theme';

export const unstable_settings = {
  // Keeps the list underneath a deep-linked order so back navigation has somewhere to go.
  initialRouteName: 'index',
};

export default function SalesStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
  );
}

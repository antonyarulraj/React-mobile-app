import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontWeights } from '../theme/typography';
import { getInitials } from '../utils/format';

type Props = {
  name: string;
  size?: number;
};

export function Avatar({ name, size = 40 }: Props) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size * 0.3 }]}>
      <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.primary,
    fontWeight: fontWeights.heavy,
  },
});

import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '@/theme';

export function CommunityDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Community Detail</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  text: {
    ...typography.h2,
    color: colors.textPrimary,
  },
});

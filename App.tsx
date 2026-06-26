import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { View, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { queryClient } from '@/services/queryClient';
import { AppNavigator } from '@/navigation/AppNavigator';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { useOfflineStore } from '@/store/offlineStore';
import { syncOfflineQueue } from '@/services/offlineQueue';

function AppContent() {
  const { setOnline, loadQueue, isOnline } = useOfflineStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setOnline(online);
      if (online) {
        syncOfflineQueue();
      }
    });
    return () => unsubscribe();
  }, [setOnline]);

  const bannerHeight = 40;
  const spacerHeight = insets.top + bannerHeight;

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {!isOnline && <View style={{ height: spacerHeight }} />}
      <AppNavigator />
      <OfflineBanner />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

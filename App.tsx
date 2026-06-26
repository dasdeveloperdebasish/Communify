import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { queryClient } from '@/services/queryClient';
import { AppNavigator } from '@/navigation/AppNavigator';
import { useOfflineStore } from '@/store/offlineStore';
import { syncOfflineQueue } from '@/services/offlineQueue';

function AppContent() {
  const { setOnline, loadQueue } = useOfflineStore();

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected === true && state.isInternetReachable === true;
      setOnline(online);
      if (online) {
        syncOfflineQueue();
      }
    });
    return () => unsubscribe();
  }, [setOnline]);

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
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

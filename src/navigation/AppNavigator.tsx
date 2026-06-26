import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

import { storageService } from '@/services/storage';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';

export function AppNavigator() {
  const { isAuthenticated, isHydrated, setAuth, setHydrated } = useAuthStore();

  useEffect(() => {
    async function hydrate() {
      try {
        const token = await storageService.getToken();
        const user = await storageService.getUser();
        if (token && user) {
          setAuth(user, token);
        }
      } catch {
      } finally {
        setHydrated(true);
      }
    }
    hydrate();
  }, [setAuth, setHydrated]);

  if (!isHydrated) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});

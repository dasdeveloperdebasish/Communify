import { useState } from 'react';

import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { resetMockStore } from '@/api/mocks/adapter';
import { queryClient } from '@/services/queryClient';
import { storageService } from '@/services/storage';
import { useAuthStore } from '@/store/authStore';
import { LoginCredentials, User } from '@/types/auth';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth, clearAuth, isAuthenticated, user } = useAuthStore();

  async function login(credentials: LoginCredentials) {
    setIsLoading(true);
    setError(null);
    try {
      await storageService.clearPostDraft();
      await storageService.clearOfflineQueue();
      await storageService.clearJoinedCommunities();
      queryClient.clear();
      resetMockStore();

      const response = await apiClient.post<{ token: string; user: User }>(
        endpoints.auth.login,
        credentials
      );
      const { token, user: userData } = response.data;
      await storageService.setToken(token);
      await storageService.setUser(userData);
      setAuth(userData, token);
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    await storageService.clearAuth();
    await storageService.clearPostDraft();
    await storageService.clearOfflineQueue();
    await storageService.clearJoinedCommunities();
    queryClient.clear();
    resetMockStore();
    clearAuth();
  }

  return {
    login,
    logout,
    isLoading,
    error,
    isAuthenticated,
    user,
  };
}

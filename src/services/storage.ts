import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { User } from '@/types/auth';

const KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  OFFLINE_QUEUE: 'offline_queue',
  POST_DRAFT: 'post_draft',
  JOINED_COMMUNITIES: 'joined_communities',
};

export const storageService = {
  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.TOKEN, token);
  },

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(KEYS.TOKEN);
  },

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.TOKEN);
  },

  async setUser(user: User): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  async getUser(): Promise<User | null> {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    return raw ? (JSON.parse(raw) as User) : null;
  },

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.USER);
  },

  async clearAuth(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.TOKEN),
      AsyncStorage.removeItem(KEYS.USER),
    ]);
  },

  async getOfflineQueue<T>(): Promise<T[]> {
    const raw = await AsyncStorage.getItem(KEYS.OFFLINE_QUEUE);
    return raw ? (JSON.parse(raw) as T[]) : [];
  },

  async setOfflineQueue<T>(queue: T[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  },

  async clearOfflineQueue(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.OFFLINE_QUEUE);
  },

  async getPostDraft(): Promise<{ title: string; body: string } | null> {
    const raw = await AsyncStorage.getItem(KEYS.POST_DRAFT);
    return raw ? JSON.parse(raw) : null;
  },

  async setPostDraft(draft: { title: string; body: string }): Promise<void> {
    await AsyncStorage.setItem(KEYS.POST_DRAFT, JSON.stringify(draft));
  },

  async clearPostDraft(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.POST_DRAFT);
  },

  async getJoinedCommunities(): Promise<string[]> {
    const raw = await AsyncStorage.getItem(KEYS.JOINED_COMMUNITIES);
    return raw ? (JSON.parse(raw) as string[]) : [];
  },

  async setJoinedCommunities(ids: string[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.JOINED_COMMUNITIES, JSON.stringify(ids));
  },

  async clearJoinedCommunities(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.JOINED_COMMUNITIES);
  },
};

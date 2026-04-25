import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const storage = {
  getItemAsync: async (key) => {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      return null;
    }
  },
  setItemAsync: async (key, value) => {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (e) {}
      return;
    }
    return await SecureStore.setItemAsync(key, value);
  },
  deleteItemAsync: async (key) => {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
      return;
    }
    return await SecureStore.deleteItemAsync(key);
  }
};

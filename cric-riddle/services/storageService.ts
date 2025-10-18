import type { User } from '../types';
import { azureBlobService } from './azureBlobService';

const CURRENT_USER_KEY = 'cricRiddle_currentUser';
const ALL_USERS_KEY_PREFIX = 'cricRiddle_user_';

export const storageService = {
  // Session helpers
  setUser: (user: User) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },
  getUser: (): User | null => {
    const txt = localStorage.getItem(CURRENT_USER_KEY);
    return txt ? JSON.parse(txt) : null;
  },
  clearUser: () => localStorage.removeItem(CURRENT_USER_KEY),

  // Persistent user data helpers
  saveUserData: async (user: User): Promise<void> => {
    try {
      // Primary: Azure
      await azureBlobService.saveUserData(user);
      // Cache locally for faster load/offline use
      localStorage.setItem(`${ALL_USERS_KEY_PREFIX}${user.username}`, JSON.stringify(user));
    } catch (err) {
      console.error('Azure save failed – storing only in localStorage', err);
      localStorage.setItem(`${ALL_USERS_KEY_PREFIX}${user.username}`, JSON.stringify(user));
    }
  },

  getUserData: async (username: string): Promise<User | null> => {
    // Try Azure first; on error, fall back to localStorage
    try {
      const user = await azureBlobService.getUserData(username);
      if (user) {
        // update cache
        localStorage.setItem(`${ALL_USERS_KEY_PREFIX}${username}`, JSON.stringify(user));
        return user;
      }
    } catch (err) {
      console.warn('Azure fetch failed – falling back to localStorage', err);
    }

    const cached = localStorage.getItem(`${ALL_USERS_KEY_PREFIX}${username}`);
    return cached ? JSON.parse(cached) : null;
  },
};

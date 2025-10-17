import type { User } from '../types';
import { azureBlobService } from './azureBlobService';

const CURRENT_USER_KEY = 'cricRiddle_currentUser';
const ALL_USERS_KEY_PREFIX = 'cricRiddle_user_';

/**
 * storageService now wraps both localStorage (for offline/quick access) and
 * Azure Blob Storage (for persistence across devices). If the Azure connection
 * string is not configured the service will silently fall back to localStorage.
 */
export const storageService = {
  // Current logged in user session (still kept in localStorage for speed)
  setUser: (user: User) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },
  getUser: (): User | null => {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },
  clearUser: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // All user data storage
  saveUserData: async (user: User) => {
    // Save to localStorage for offline support
    localStorage.setItem(`${ALL_USERS_KEY_PREFIX}${user.username}`, JSON.stringify(user));
    // Persist to Azure (ignore errors)
    await azureBlobService.saveUserData(user);
  },
  getUserData: async (username: string): Promise<User | null> => {
    // Try Azure first
    const azureUser = await azureBlobService.getUserData(username);
    if (azureUser) {
      // Mirror to localStorage for quick subsequent loads
      localStorage.setItem(`${ALL_USERS_KEY_PREFIX}${username}`, JSON.stringify(azureUser));
      return azureUser;
    }
    // Fallback to localStorage
    const userJson = localStorage.getItem(`${ALL_USERS_KEY_PREFIX}${username}`);
    return userJson ? JSON.parse(userJson) : null;
  },
};

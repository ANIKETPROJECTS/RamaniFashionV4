import { auth } from './auth';

const PREFERENCES_KEY = 'color_variant_preferences';
const GUEST_USER_KEY = 'GUEST';

interface ColorPreferences {
  [customerId: string]: {
    [productId: string]: number;
  };
}

export const colorPreferences = {
  getUserKey(): string {
    try {
      const userJson = localStorage.getItem('user');
      if (!userJson) return GUEST_USER_KEY;
      
      const user = JSON.parse(userJson);
      const customerId = user._id || user.id;
      return customerId || GUEST_USER_KEY;
    } catch {
      return GUEST_USER_KEY;
    }
  },

  getPreference(productId: string): number | null {
    const userKey = this.getUserKey();

    try {
      const preferencesJson = localStorage.getItem(PREFERENCES_KEY);
      if (!preferencesJson) return null;

      const preferences: ColorPreferences = JSON.parse(preferencesJson);
      if (!preferences || typeof preferences !== 'object') return null;
      
      const userPreferences = preferences[userKey];
      if (!userPreferences || typeof userPreferences !== 'object') return null;
      
      const colorIndex = userPreferences[productId];
      return typeof colorIndex === 'number' ? colorIndex : null;
    } catch (error) {
      console.error('Failed to get color preference:', error);
      return null;
    }
  },

  getPreferredVariantIndex(productId: string, product: any): number {
    if (!product || !Array.isArray(product.colorVariants) || product.colorVariants.length === 0) {
      return 0;
    }

    const savedPreference = this.getPreference(productId);
    if (savedPreference !== null && savedPreference >= 0 && savedPreference < product.colorVariants.length) {
      return savedPreference;
    }
    return 0;
  },

  setPreference(productId: string, colorIndex: number): void {
    const userKey = this.getUserKey();

    try {
      const preferencesJson = localStorage.getItem(PREFERENCES_KEY);
      const preferences: ColorPreferences = preferencesJson ? JSON.parse(preferencesJson) : {};

      if (!preferences[userKey]) {
        preferences[userKey] = {};
      }

      preferences[userKey][productId] = colorIndex;
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save color preference:', error);
    }
  },

  migrateGuestPreferences(customerId?: string): void {
    try {
      let userId = customerId;
      
      if (!userId) {
        const userJson = localStorage.getItem('user');
        if (!userJson) return;
        
        const user = JSON.parse(userJson);
        userId = user._id || user.id;
      }
      
      if (!userId) return;

      const preferencesJson = localStorage.getItem(PREFERENCES_KEY);
      if (!preferencesJson) return;

      const preferences: ColorPreferences = JSON.parse(preferencesJson);
      const guestPreferences = preferences[GUEST_USER_KEY];
      
      if (!guestPreferences || typeof guestPreferences !== 'object') return;

      if (!preferences[userId]) {
        preferences[userId] = {};
      }

      for (const [productId, colorIndex] of Object.entries(guestPreferences)) {
        if (typeof colorIndex === 'number') {
          preferences[userId][productId] = colorIndex;
        }
      }

      delete preferences[GUEST_USER_KEY];
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to migrate guest preferences:', error);
    }
  },

  clearUserPreferences(): void {
    const userKey = this.getUserKey();

    try {
      const preferencesJson = localStorage.getItem(PREFERENCES_KEY);
      if (!preferencesJson) return;

      const preferences: ColorPreferences = JSON.parse(preferencesJson);
      delete preferences[userKey];
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to clear color preferences:', error);
    }
  },

  clearAllPreferences(): void {
    localStorage.removeItem(PREFERENCES_KEY);
  }
};

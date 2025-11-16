import { auth } from './auth';

const PREFERENCES_KEY = 'color_variant_preferences';

interface ColorPreferences {
  [customerId: string]: {
    [productId: string]: number;
  };
}

export const colorPreferences = {
  getPreference(productId: string): number | null {
    const customer = auth.getCustomer();
    if (!customer) return null;

    try {
      const preferencesJson = localStorage.getItem(PREFERENCES_KEY);
      if (!preferencesJson) return null;

      const preferences: ColorPreferences = JSON.parse(preferencesJson);
      const userPreferences = preferences[customer.id];
      
      if (!userPreferences) return null;
      
      const colorIndex = userPreferences[productId];
      return colorIndex !== undefined ? colorIndex : null;
    } catch {
      return null;
    }
  },

  setPreference(productId: string, colorIndex: number): void {
    const customer = auth.getCustomer();
    if (!customer) return;

    try {
      const preferencesJson = localStorage.getItem(PREFERENCES_KEY);
      const preferences: ColorPreferences = preferencesJson ? JSON.parse(preferencesJson) : {};

      if (!preferences[customer.id]) {
        preferences[customer.id] = {};
      }

      preferences[customer.id][productId] = colorIndex;
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save color preference:', error);
    }
  },

  clearUserPreferences(): void {
    const customer = auth.getCustomer();
    if (!customer) return;

    try {
      const preferencesJson = localStorage.getItem(PREFERENCES_KEY);
      if (!preferencesJson) return;

      const preferences: ColorPreferences = JSON.parse(preferencesJson);
      delete preferences[customer.id];
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to clear color preferences:', error);
    }
  },

  clearAllPreferences(): void {
    localStorage.removeItem(PREFERENCES_KEY);
  }
};

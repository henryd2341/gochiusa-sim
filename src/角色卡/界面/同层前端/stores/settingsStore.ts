import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export type ThemeMode = 'warm' | 'cool' | 'high-contrast' | 'eye-care';
export type FontScheme = 'default' | 'reading' | 'artistic';
export type FontSize = 'small' | 'medium' | 'large';

export interface UiSettings {
  theme: ThemeMode;
  fontScheme: FontScheme;
  fontSize: FontSize;
}

const STORAGE_KEY = 'gochiusa-sim.ui-settings.v3';

const defaultSettings: UiSettings = {
  theme: 'warm',
  fontScheme: 'default',
  fontSize: 'medium',
};

function parseSettings(raw: string | null): UiSettings {
  if (!raw) return { ...defaultSettings };

  try {
    const parsed = JSON.parse(raw) as Partial<UiSettings>;
    return {
      theme:
        parsed.theme === 'warm' ||
        parsed.theme === 'cool' ||
        parsed.theme === 'high-contrast' ||
        parsed.theme === 'eye-care'
          ? parsed.theme
          : defaultSettings.theme,
      fontScheme:
        parsed.fontScheme === 'default' || parsed.fontScheme === 'reading' || parsed.fontScheme === 'artistic'
          ? parsed.fontScheme
          : defaultSettings.fontScheme,
      fontSize:
        parsed.fontSize === 'small' || parsed.fontSize === 'medium' || parsed.fontSize === 'large'
          ? parsed.fontSize
          : defaultSettings.fontSize,
    };
  } catch {
    return { ...defaultSettings };
  }
}

export const useSettingsStore = defineStore('gochiusa-settings-v3', () => {
  const settings = ref<UiSettings>(parseSettings(localStorage.getItem(STORAGE_KEY)));

  function updateSettings(next: Partial<UiSettings>) {
    settings.value = { ...settings.value, ...next };
  }

  function resetSettings() {
    settings.value = { ...defaultSettings };
  }

  watch(
    settings,
    value => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      } catch {
        // ignore storage write failures in sandboxed iframe
      }
    },
    { deep: true },
  );

  return {
    settings,
    updateSettings,
    resetSettings,
  };
});

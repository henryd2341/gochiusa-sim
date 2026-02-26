import { defineStore } from 'pinia';
import type { Ref } from 'vue';

// 设置类型定义
export interface GameSettings {
  // 显示设置
  messageDisplayMode: 'instant' | 'typewriter' | 'segment';
  theme: 'warm' | 'cool' | 'high-contrast' | 'eye-care';
  fontScheme: 'default' | 'reading' | 'artistic';
  fontSize: 'small' | 'medium' | 'large';

  // 动画设置
  enableAnimations: boolean;
  typewriterEffect: boolean;

  // 交互设置
  autoScroll: boolean;
  showCharacterBar: boolean;
  backgroundBlur: number; // 背景模糊程度（像素）

  // 其他设置
  allowCustomOptions: boolean;
}

// 默认设置
const defaultSettings: GameSettings = {
  messageDisplayMode: 'instant',
  theme: 'warm',
  fontScheme: 'default',
  fontSize: 'medium',
  enableAnimations: true,
  typewriterEffect: true,
  autoScroll: true,
  showCharacterBar: true,
  backgroundBlur: 8,
  allowCustomOptions: true,
};

const DISPLAY_MODE_MAP: Record<string, GameSettings['messageDisplayMode']> = {
  instant: 'instant',
  typewriter: 'typewriter',
  segment: 'segment',
  card: 'instant',
  bubble: 'segment',
  classic: 'instant',
};

const THEME_MAP: Record<string, GameSettings['theme']> = {
  warm: 'warm',
  cool: 'cool',
  'high-contrast': 'high-contrast',
  'eye-care': 'eye-care',
  light: 'warm',
  dark: 'high-contrast',
  sakura: 'warm',
  ocean: 'cool',
};

const FONT_SCHEME_MAP: Record<string, GameSettings['fontScheme']> = {
  default: 'default',
  reading: 'reading',
  artistic: 'artistic',
  elegant: 'reading',
  modern: 'default',
  classic: 'artistic',
};

function normalizeDisplayMode(value: unknown): GameSettings['messageDisplayMode'] {
  if (typeof value === 'string' && DISPLAY_MODE_MAP[value]) {
    return DISPLAY_MODE_MAP[value];
  }
  return defaultSettings.messageDisplayMode;
}

function normalizeTheme(value: unknown): GameSettings['theme'] {
  if (typeof value === 'string' && THEME_MAP[value]) {
    return THEME_MAP[value];
  }
  return defaultSettings.theme;
}

function normalizeFontScheme(value: unknown): GameSettings['fontScheme'] {
  if (typeof value === 'string' && FONT_SCHEME_MAP[value]) {
    return FONT_SCHEME_MAP[value];
  }
  return defaultSettings.fontScheme;
}

function normalizeFontSize(value: unknown): GameSettings['fontSize'] {
  if (value === 'small' || value === 'medium' || value === 'large') {
    return value;
  }
  if (typeof value === 'number') {
    if (value <= 14) return 'small';
    if (value >= 18) return 'large';
    return 'medium';
  }
  return defaultSettings.fontSize;
}

function normalizeSettings(parsed: Partial<GameSettings> & Record<string, unknown>): GameSettings {
  return {
    messageDisplayMode: normalizeDisplayMode(parsed.messageDisplayMode),
    theme: normalizeTheme(parsed.theme),
    fontScheme: normalizeFontScheme(parsed.fontScheme),
    fontSize: normalizeFontSize(parsed.fontSize),
    enableAnimations:
      typeof parsed.enableAnimations === 'boolean' ? parsed.enableAnimations : defaultSettings.enableAnimations,
    typewriterEffect:
      typeof parsed.typewriterEffect === 'boolean' ? parsed.typewriterEffect : defaultSettings.typewriterEffect,
    autoScroll: typeof parsed.autoScroll === 'boolean' ? parsed.autoScroll : defaultSettings.autoScroll,
    showCharacterBar:
      typeof parsed.showCharacterBar === 'boolean' ? parsed.showCharacterBar : defaultSettings.showCharacterBar,
    backgroundBlur: typeof parsed.backgroundBlur === 'number' ? parsed.backgroundBlur : defaultSettings.backgroundBlur,
    allowCustomOptions:
      typeof parsed.allowCustomOptions === 'boolean' ? parsed.allowCustomOptions : defaultSettings.allowCustomOptions,
  };
}

// 从 localStorage 加载设置
function loadSettings(): GameSettings {
  try {
    const saved = localStorage.getItem('gochiusa-game-settings');
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<GameSettings> & Record<string, unknown>;
      return normalizeSettings(parsed);
    }
  } catch (e) {
    console.warn('[设置] 加载设置失败:', e);
  }
  return { ...defaultSettings };
}

export const useSettingsStore = defineStore('settings', () => {
  const settings: Ref<GameSettings> = ref(loadSettings());

  // 更新设置
  function updateSettings(newSettings: Partial<GameSettings>) {
    settings.value = { ...settings.value, ...newSettings };
    saveSettings();
  }

  // 重置设置
  function resetSettings() {
    settings.value = { ...defaultSettings };
    saveSettings();
  }

  // 保存设置到 localStorage
  function saveSettings() {
    try {
      localStorage.setItem('gochiusa-game-settings', JSON.stringify(settings.value));
    } catch (e) {
      console.warn('[设置] 保存设置失败:', e);
    }
  }

  // 监听变化自动保存
  watchEffect(() => {
    saveSettings();
  });

  return {
    settings,
    updateSettings,
    resetSettings,
  };
});

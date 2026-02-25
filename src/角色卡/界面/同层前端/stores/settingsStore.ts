import { defineStore } from 'pinia';
import type { Ref } from 'vue';

// 设置类型定义
export interface GameSettings {
  // 显示设置
  messageDisplayMode: 'card' | 'bubble' | 'classic';
  theme: 'light' | 'dark' | 'warm' | 'sakura' | 'ocean';
  fontScheme: 'default' | 'elegant' | 'modern' | 'classic';
  fontSize: number; // 字体大小（像素）

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
  messageDisplayMode: 'card',
  theme: 'warm',
  fontScheme: 'default',
  fontSize: 16,
  enableAnimations: true,
  typewriterEffect: true,
  autoScroll: true,
  showCharacterBar: true,
  backgroundBlur: 8,
  allowCustomOptions: true,
};

// 从 localStorage 加载设置
function loadSettings(): GameSettings {
  try {
    const saved = localStorage.getItem('gochiusa-game-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultSettings, ...parsed };
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

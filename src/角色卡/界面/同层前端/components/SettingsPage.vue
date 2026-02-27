<template>
  <div class="settings-page">
    <header class="settings-header">
      <button class="back-btn" @click="goBack">
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <h1 class="header-title">设置</h1>
    </header>

    <main class="settings-content">
      <section class="settings-section">
        <h2 class="section-title">
          <i class="fa-solid fa-display"></i>
          显示设置
        </h2>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">消息显示模式</span>
            <span class="setting-desc">选择消息的呈现方式</span>
          </div>
          <div class="setting-control">
            <select v-model="settings.messageDisplayMode" class="setting-select">
              <option value="instant">即时显示（默认）</option>
              <option value="typewriter">打字机效果</option>
              <option value="segment">分段显示</option>
            </select>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">主题</span>
            <span class="setting-desc">选择界面配色方案</span>
          </div>
          <div class="setting-control">
            <div class="theme-options">
              <button
                v-for="theme in themes"
                :key="theme.id"
                class="theme-btn"
                :class="{ active: settings.theme === theme.id }"
                @click="setTheme(theme.id)"
              >
                <span class="theme-preview" :style="{ background: theme.preview }"></span>
                <span class="theme-name">{{ theme.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">字体方案</span>
            <span class="setting-desc">选择界面字体风格</span>
          </div>
          <div class="setting-control">
            <select v-model="settings.fontScheme" class="setting-select">
              <option value="default">默认字体</option>
              <option value="reading">阅读字体</option>
              <option value="artistic">艺术字体</option>
            </select>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">字体大小</span>
            <span class="setting-desc">调整界面文字大小</span>
          </div>
          <div class="setting-control">
            <div class="font-size-control">
              <button class="size-btn" @click="decreaseFontSize">
                <i class="fa-solid fa-minus"></i>
              </button>
              <span class="size-value">{{ fontSizeLabel }}</span>
              <button class="size-btn" @click="increaseFontSize">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          动画设置
        </h2>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">启用动画</span>
            <span class="setting-desc">开启界面过渡动画效果</span>
          </div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input v-model="settings.enableAnimations" type="checkbox" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">打字机效果</span>
            <span class="setting-desc">消息逐字显示效果</span>
          </div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input v-model="settings.typewriterEffect" type="checkbox" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">
          <i class="fa-solid fa-hand-pointer"></i>
          交互设置
        </h2>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">自动滚动</span>
            <span class="setting-desc">新消息时自动滚动到底部</span>
          </div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input v-model="settings.autoScroll" type="checkbox" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">显示角色栏</span>
            <span class="setting-desc">在界面底部显示角色状态栏</span>
          </div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input v-model="settings.showCharacterBar" type="checkbox" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">背景模糊</span>
            <span class="setting-desc">背景图片模糊效果</span>
          </div>
          <div class="setting-control">
            <div class="slider-control">
              <input v-model.number="settings.backgroundBlur" type="range" min="0" max="20" class="setting-slider" />
              <span class="slider-value">{{ settings.backgroundBlur }}px</span>
            </div>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">
          <i class="fa-solid fa-circle-info"></i>
          关于
        </h2>

        <div class="about-content">
          <div class="about-logo">
            <div class="logo-placeholder">
              <i class="fa-solid fa-mug-hot"></i>
            </div>
          </div>
          <div class="about-info">
            <h3 class="about-title">点兔互动界面</h3>
            <p class="about-version">版本 1.0.0</p>
            <p class="about-desc">
              基于「请问您今天要来点兔子吗？」世界观的沉浸式文字冒险游戏界面。采用法式艺术风格设计，为您带来温馨治愈的互动体验。
            </p>
          </div>
        </div>
      </section>

      <div class="settings-footer">
        <button class="btn btn-danger" @click="resetSettings">
          <i class="fa-solid fa-rotate-left"></i>
          重置为默认设置
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { GameSettings } from '../stores/settingsStore';
import { useSettingsStore } from '../stores/settingsStore';

const router = useRouter();
const settingsStore = useSettingsStore();
const settings = settingsStore.settings;

type ThemeId = GameSettings['theme'];
const themes: { id: ThemeId; name: string; preview: string }[] = [
  { id: 'warm', name: '暖色', preview: 'linear-gradient(135deg, #fef3c7, #fde68a)' },
  { id: 'cool', name: '冷色', preview: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' },
  { id: 'high-contrast', name: '高对比度', preview: 'linear-gradient(135deg, #ffffff, #e5e5e5)' },
  { id: 'eye-care', name: '护眼', preview: 'linear-gradient(135deg, #f5f0e6, #ebe5d9)' },
];

const fontSizeOrder: GameSettings['fontSize'][] = ['small', 'medium', 'large'];
const fontSizeLabel = computed(() => {
  if (settings.fontSize === 'small') return '小';
  if (settings.fontSize === 'large') return '大';
  return '中';
});

function setTheme(id: ThemeId) {
  settings.theme = id;
}

function increaseFontSize() {
  const index = fontSizeOrder.indexOf(settings.fontSize);
  if (index < fontSizeOrder.length - 1) {
    settings.fontSize = fontSizeOrder[index + 1];
  }
}

function decreaseFontSize() {
  const index = fontSizeOrder.indexOf(settings.fontSize);
  if (index > 0) {
    settings.fontSize = fontSizeOrder[index - 1];
  }
}

function resetSettings() {
  settingsStore.resetSettings();
  toastr.success('设置已重置');
}

function goBack() {
  router.push('/game');
}
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--secondary-bg);
    color: var(--text-primary);
  }
}

.header-title {
  font-family: var(--font-heading);
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.settings-content {
  flex: 1;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.settings-section {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  margin: 0;
  font-family: var(--font-heading);
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  background: var(--secondary-bg);
  border-bottom: 1px solid var(--border-color);

  i {
    color: var(--accent-color);
  }
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.setting-label {
  font-weight: 500;
  color: var(--text-primary);
}

.setting-desc {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.setting-control {
  flex-shrink: 0;
}

.setting-select {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-family: var(--font-ui);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  cursor: pointer;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .toggle-slider {
      background-color: var(--accent-color);

      &::before {
        transform: translateX(20px);
      }
    }
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background-color: var(--border-color);
    transition: all var(--transition-fast);
    border-radius: var(--radius-full);

    &::before {
      position: absolute;
      content: '';
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: all var(--transition-fast);
      border-radius: 50%;
    }
  }
}

.theme-options {
  display: flex;
  gap: var(--spacing-sm);
}

.theme-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: transparent;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--text-muted);
  }

  &.active {
    border-color: var(--accent-color);
    background: var(--secondary-bg);
  }
}

.theme-preview {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-color);
}

.theme-name {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.font-size-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.size-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--border-color);
    color: var(--text-primary);
  }
}

.size-value {
  min-width: 50px;
  text-align: center;
  font-weight: 500;
  color: var(--text-primary);
}

.slider-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.setting-slider {
  width: 120px;
  height: 4px;
  background: var(--border-color);
  border-radius: var(--radius-full);
  appearance: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: var(--accent-color);
    border-radius: 50%;
    cursor: pointer;
    transition: transform var(--transition-fast);

    &:hover {
      transform: scale(1.2);
    }
  }
}

.slider-value {
  min-width: 40px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.about-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.about-logo {
  flex-shrink: 0;
}

.logo-placeholder {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary));
  border-radius: var(--radius-lg);
  color: white;
  font-size: 36px;
}

.about-info {
  flex: 1;
}

.about-title {
  font-family: var(--font-heading);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.about-version {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin: 0 0 var(--spacing-sm) 0;
}

.about-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.settings-footer {
  display: flex;
  justify-content: center;
  padding: var(--spacing-lg);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-lg);
  font-family: var(--font-ui);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);

  &.btn-danger {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;

    &:hover {
      background: rgba(239, 68, 68, 0.2);
    }
  }
}
</style>

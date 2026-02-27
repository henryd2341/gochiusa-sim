<template>
  <section class="card settings">
    <h2>基础设置</h2>

    <div class="group">
      <label>主题</label>
      <select :value="settings.theme" @change="onThemeChange">
        <option value="warm">暖色</option>
        <option value="cool">冷色</option>
        <option value="high-contrast">高对比</option>
        <option value="eye-care">护眼</option>
      </select>
    </div>

    <div class="group">
      <label>字体方案</label>
      <select :value="settings.fontScheme" @change="onFontChange">
        <option value="default">默认</option>
        <option value="reading">阅读</option>
        <option value="artistic">艺术</option>
      </select>
    </div>

    <div class="group">
      <label>字号</label>
      <select :value="settings.fontSize" @change="onSizeChange">
        <option value="small">小</option>
        <option value="medium">中</option>
        <option value="large">大</option>
      </select>
    </div>

    <button class="reset-btn" @click="settingsStore.resetSettings">恢复默认</button>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore, type FontScheme, type FontSize, type ThemeMode } from '../stores/settingsStore';

const settingsStore = useSettingsStore();
const settings = computed(() => settingsStore.settings);

function onThemeChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as ThemeMode;
  settingsStore.updateSettings({ theme: value });
}

function onFontChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as FontScheme;
  settingsStore.updateSettings({ fontScheme: value });
}

function onSizeChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as FontSize;
  settingsStore.updateSettings({ fontSize: value });
}
</script>

<style scoped lang="scss">
.settings {
  padding: 12px;
  display: grid;
  gap: 12px;
}

.group {
  display: grid;
  gap: 6px;
}

select {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px;
  background: #fff;
}

.reset-btn {
  justify-self: start;
  border: 1px solid var(--border-color);
  background: var(--secondary-bg);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}
</style>

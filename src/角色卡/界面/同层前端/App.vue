<template>
  <div
    class="app-container"
    :data-theme="settingsStore.settings.theme"
    :data-font="settingsStore.settings.fontScheme"
    :data-font-size="settingsStore.settings.fontSize"
  >
    <BackgroundLayer />
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import BackgroundLayer from './components/BackgroundLayer.vue';
import { useSettingsStore } from './stores/settingsStore';

const settingsStore = useSettingsStore();
</script>

<style lang="scss" scoped>
.app-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

// Page transition animations
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>

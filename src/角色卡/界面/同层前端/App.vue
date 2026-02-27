<template>
  <div
    class="app-shell"
    :data-theme="settingsStore.settings.theme"
    :data-font="settingsStore.settings.fontScheme"
    :data-font-size="settingsStore.settings.fontSize"
  >
    <TopNavBar v-if="route.name !== 'start'" />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import TopNavBar from './components/TopNavBar.vue';
import { useSettingsStore } from './stores/settingsStore';

const route = useRoute();
const settingsStore = useSettingsStore();
</script>

<style scoped lang="scss">
.app-shell {
  min-height: 100vh;
  background: var(--primary-bg);
  color: var(--text-primary);
}

.app-main {
  width: min(960px, 100%);
  margin: 0 auto;
  padding: 12px;
}
</style>

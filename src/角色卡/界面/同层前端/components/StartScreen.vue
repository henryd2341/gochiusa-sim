<template>
  <section class="card start">
    <h1>点兔同层前端 v3</h1>
    <p>先初始化 MVU 与消息状态，再进入主界面。</p>

    <div v-if="isFirstRun" class="pov card">
      <h2>主视角</h2>
      <p class="hint">首次进入请选择主视角，开场白将按该视角确定。</p>

      <label v-for="name in povOptions" :key="name" class="pov-item">
        <input v-model="pendingPov" type="radio" :value="name" />
        <span>{{ name }}</span>
      </label>
    </div>

    <p v-else class="hint done">已记住主视角：{{ gameStore.selectedPov }}</p>

    <button class="start-btn" :disabled="isLoading" @click="handleStart">
      {{ isLoading ? '初始化中...' : 'Press Start' }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCharacterStore } from '../stores/characterStore';
import { useGameStore } from '../stores/gameStore';

const router = useRouter();
const characterStore = useCharacterStore();
const gameStore = useGameStore();
const isLoading = ref(false);
const isFirstRun = computed(() => !gameStore.selectedPov);

const povOptions = computed(() => gameStore.listAvailablePov());
const pendingPov = ref(gameStore.selectedPov ?? gameStore.listAvailablePov()[0] ?? '保登心爱');

async function handleStart() {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    if (isFirstRun.value) {
      gameStore.setPov(pendingPov.value);
    }
    await characterStore.initialize();
    await router.push('/game');
  } catch (error) {
    console.error('[同层前端_v3] 启动页初始化失败:', error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped lang="scss">
.start {
  margin-top: 12vh;
  padding: 24px;
  text-align: center;
}

.pov {
  margin: 14px auto 0;
  max-width: 520px;
  text-align: left;
  padding: 12px;
}

.pov h2 {
  margin: 0 0 8px;
  font-size: 16px;
}

.hint {
  margin: 0 0 8px;
  color: var(--text-secondary);
  font-size: 13px;
}

.done {
  margin-top: 14px;
}

.pov-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}

.start-btn {
  margin-top: 16px;
  border: 1px solid var(--border-color);
  background: var(--accent-color);
  color: #fff;
  border-radius: 8px;
  padding: 10px 18px;
  cursor: pointer;
}
</style>

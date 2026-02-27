<template>
  <section class="card start">
    <h1>点兔同层前端 v3</h1>
    <p>先初始化 MVU 与消息状态，再进入主界面。</p>
    <button class="start-btn" :disabled="isLoading" @click="handleStart">
      {{ isLoading ? '初始化中...' : 'Press Start' }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCharacterStore } from '../stores/characterStore';

const router = useRouter();
const characterStore = useCharacterStore();
const isLoading = ref(false);

async function handleStart() {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
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

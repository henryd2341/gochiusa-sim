<template>
  <header class="top-nav card">
    <button class="btn" @click="goStart">首页</button>
    <div class="spacer"></div>
    <button class="btn" @click="goGame">主界面</button>
    <button class="btn" @click="goHistory">历史</button>
    <button class="btn" @click="goSettings">设置</button>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goStart() {
  void router.push('/');
}

function goGame() {
  void router.push('/game');
}

function goHistory() {
  void router.push('/history');
}

function goSettings() {
  void router.push('/settings');
}
</script>

<style scoped lang="scss">
.top-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px;
  margin-bottom: 12px;
}

.spacer {
  flex: 1;
}

.btn {
  border: 1px solid var(--border-color);
  background: var(--secondary-bg);
  color: var(--text-primary);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
}
</style>

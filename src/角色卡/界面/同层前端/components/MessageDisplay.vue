<template>
  <section class="card message-display">
    <header class="head">
      <strong>当前楼层：</strong>
      <span>{{ messageId >= 0 ? `#${messageId}` : '暂无' }}</span>
    </header>
    <article class="content">{{ message }}</article>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  message: string;
  messageId: number;
}>();

const message = computed(() => props.message);
</script>

<style scoped lang="scss">
.message-display {
  padding: 12px;
}

.head {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.content {
  min-height: 120px;
  line-height: 1.7;
  white-space: pre-wrap;
}
</style>

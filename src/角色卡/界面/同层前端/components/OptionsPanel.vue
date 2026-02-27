<template>
  <section class="card options-panel">
    <header class="head">
      <strong>可选行动</strong>
    </header>

    <div v-if="options.length === 0" class="empty">当前消息未解析出选项</div>

    <div v-else class="list">
      <button v-for="item in options" :key="item.id" class="option-btn" :disabled="disabled" @click="emitSelect(item)">
        <span class="title">{{ item.title }}</span>
        <span class="content">{{ item.content }}</span>
      </button>
    </div>

    <div class="custom-row">
      <input v-model.trim="customText" class="custom-input" placeholder="输入自定义行动内容" />
      <button class="custom-btn" :disabled="disabled || !customText" @click="submitCustom">发送</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { RoleplayOption } from '../stores/gameStore';

const props = defineProps<{
  options: RoleplayOption[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  select: [option: RoleplayOption];
}>();

const customText = ref('');

function emitSelect(option: RoleplayOption) {
  emit('select', option);
}

function submitCustom() {
  const text = customText.value;
  if (!text) return;
  emit('select', {
    id: `custom-${Date.now()}`,
    title: '自定义行动',
    content: text,
    isCustom: true,
  });
  customText.value = '';
}
</script>

<style scoped lang="scss">
.options-panel {
  margin-top: 12px;
  padding: 12px;
}

.head {
  margin-bottom: 10px;
}

.empty {
  color: var(--text-secondary);
  font-size: 14px;
}

.list {
  display: grid;
  gap: 8px;
}

.option-btn {
  border: 1px solid var(--border-color);
  background: #fff;
  border-radius: 8px;
  padding: 10px;
  text-align: left;
  cursor: pointer;
}

.title {
  display: block;
  font-weight: 700;
}

.content {
  display: block;
  margin-top: 4px;
  color: var(--text-secondary);
  font-size: 14px;
}

.custom-row {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}

.custom-input {
  flex: 1;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px;
}

.custom-btn {
  border: 1px solid var(--border-color);
  background: var(--secondary-bg);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}
</style>

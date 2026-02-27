<template>
  <div class="options-panel">
    <!-- Options List -->
    <TransitionGroup name="option-list" tag="div" class="options-list">
      <OptionCard
        v-for="option in options"
        :key="option.id"
        :option="option"
        :disabled="isDisabled"
        @select="handleSelect"
        @remove="handleRemove"
      />
    </TransitionGroup>

    <!-- Custom Option Input -->
    <div v-if="allowCustom" class="custom-option-section">
      <Transition name="expand">
        <div v-if="!isAddingCustom" class="add-custom-btn" @click="startAddingCustom">
          <i class="fa-solid fa-plus"></i>
          <span>添加自定义选项</span>
        </div>
        <CustomOptionInput v-else @submit="handleCustomSubmit" @cancel="cancelAddingCustom" />
      </Transition>
    </div>

    <!-- Empty State -->
    <div v-if="options.length === 0 && !isAddingCustom" class="empty-options">
      <i class="fa-solid fa-hand-pointer"></i>
      <p>暂无可选选项</p>
      <p v-if="allowCustom" class="hint">点击上方按钮添加自定义行动</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { RoleplayOption } from '../stores/gameStore';
import { useGameStore } from '../stores/gameStore';
import OptionCard from './OptionCard.vue';
import CustomOptionInput from './CustomOptionInput.vue';

const props = defineProps({
  options: {
    type: Array as PropType<RoleplayOption[]>,
    default: () => [],
  },
  allowCustom: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits<{
  select: [option: RoleplayOption];
}>();

const gameStore = useGameStore();
const isAddingCustom = ref(false);

const isDisabled = computed(() => gameStore.isGenerating);

function handleSelect(option: RoleplayOption) {
  if (isDisabled.value) return;
  emit('select', option);
}

function handleRemove(optionId: string) {
  gameStore.removeOption(optionId);
}

function startAddingCustom() {
  isAddingCustom.value = true;
}

function cancelAddingCustom() {
  isAddingCustom.value = false;
}

function handleCustomSubmit(title: string, content: string) {
  gameStore.addCustomOption(title, content);
  isAddingCustom.value = false;
}
</script>

<style lang="scss" scoped>
.options-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.custom-option-section {
  margin-top: var(--spacing-sm);
}

.add-custom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--secondary-bg);
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--border-color);
    color: var(--text-primary);
    border-color: var(--accent-color);
  }

  i {
    font-size: var(--font-size-lg);
  }
}

.empty-options {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--text-muted);
  text-align: center;

  i {
    font-size: 32px;
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: var(--font-size-base);
  }

  .hint {
    font-size: var(--font-size-sm);
    margin-top: var(--spacing-xs);
  }
}

// Transitions
.option-list-enter-active,
.option-list-leave-active {
  transition: all var(--transition-normal);
}

.option-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.option-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.expand-enter-active,
.expand-leave-active {
  transition: all var(--transition-normal);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 200px;
}
</style>

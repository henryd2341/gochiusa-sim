<template>
  <div class="option-card" :class="{ disabled, custom: option.isCustom }" @click="handleClick">
    <div class="card-content">
      <div class="option-header">
        <span class="option-title">
          <i v-if="option.isCustom" class="fa-solid fa-pen custom-icon"></i>
          <strong>{{ option.title }}</strong>
        </span>
        <button v-if="option.isCustom" class="remove-btn" title="移除选项" @click.stop="handleRemove">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
      <hr class="option-divider" />
      <span class="option-content">{{ option.content }}</span>
    </div>
    <div class="card-hover-effect"></div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { RoleplayOption } from '../stores/gameStore';

const props = defineProps({
  option: {
    type: Object as PropType<RoleplayOption>,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  select: [option: RoleplayOption];
  remove: [optionId: string];
}>();

function handleClick() {
  if (props.disabled) return;
  emit('select', props.option);
}

function handleRemove() {
  emit('remove', props.option.id);
}
</script>

<style lang="scss" scoped>
.option-card {
  position: relative;
  background: linear-gradient(160deg, rgba(45, 45, 45, 0.75), rgba(35, 35, 35, 0.85));
  border-radius: var(--radius-lg);
  box-shadow:
    0 10px 28px rgba(0, 0, 0, 0.15),
    0 3px 10px rgba(0, 0, 0, 0.12);
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  color: #d8d8d8;

  &:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    background: linear-gradient(160deg, rgba(58, 58, 58, 0.75), rgba(48, 48, 48, 0.85));
    border-color: rgba(200, 200, 200, 0.12);

    .card-hover-effect {
      opacity: 1;
    }

    .option-content {
      color: #e2e2e2;
    }
  }

  &:active:not(.disabled) {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  }

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.custom {
    border-left: 3px solid var(--accent-color);
  }
}

.card-content {
  position: relative;
  z-index: 1;
}

.option-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
}

.option-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-base);
  font-weight: 600;
  color: #f0f0f0;
  letter-spacing: 0.02em;

  .custom-icon {
    color: var(--accent-color);
    font-size: var(--font-size-sm);
  }
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: var(--radius-sm);
  color: #999;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: rgba(255, 100, 100, 0.2);
    color: #ff6b6b;
  }
}

.option-divider {
  display: none;
}

.option-content {
  display: block;
  font-size: var(--font-size-sm);
  line-height: 1.55;
  color: #c6c6c6;
  font-weight: normal;
  transition: color 0.25s ease;
  letter-spacing: 0.015em;
  overflow-wrap: anywhere;
}

.card-hover-effect {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(90, 90, 90, 0.06) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

// Responsive
@media (max-width: 767px) {
  .option-card {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .option-title {
    font-size: var(--font-size-sm);
  }

  .option-content {
    font-size: var(--font-size-xs);
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .option-card {
    transition: none;
  }

  .card-hover-effect,
  .option-content,
  .option-title {
    transition: none;
  }
}
</style>

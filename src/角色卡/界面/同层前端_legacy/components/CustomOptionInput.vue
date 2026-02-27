<template>
  <div class="custom-option-input">
    <div class="input-group">
      <input
        v-model="title"
        type="text"
        class="input-field title-input"
        placeholder="选项标题（可选）"
        maxlength="50"
        @keyup.enter="submit"
      />
    </div>
    <div class="input-group">
      <textarea
        v-model="content"
        class="input-field content-input"
        placeholder="输入你的行动内容..."
        rows="3"
        maxlength="500"
        @keyup.enter.ctrl="submit"
      ></textarea>
      <span class="char-count">{{ content.length }}/500</span>
    </div>
    <div class="input-actions">
      <button class="btn btn-ghost cancel-btn" @click="cancel">
        <i class="fa-solid fa-times"></i>
        <span>取消</span>
      </button>
      <button class="btn btn-primary submit-btn" :disabled="!canSubmit" @click="submit">
        <i class="fa-solid fa-check"></i>
        <span>添加</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  submit: [title: string, content: string];
  cancel: [];
}>();

const title = ref('');
const content = ref('');

const canSubmit = computed(() => content.value.trim().length > 0);

function submit() {
  if (!canSubmit.value) return;
  emit('submit', title.value.trim() || '自定义行动', content.value.trim());
  reset();
}

function cancel() {
  reset();
  emit('cancel');
}

function reset() {
  title.value = '';
  content.value = '';
}
</script>

<style lang="scss" scoped>
.custom-option-input {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px var(--card-shadow);
}

.input-group {
  position: relative;
  margin-bottom: var(--spacing-sm);
}

.input-field {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  font-family: var(--font-ui);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(212, 165, 116, 0.2);
  }

  &::placeholder {
    color: var(--text-muted);
  }
}

.title-input {
  font-weight: 500;
}

.content-input {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.char-count {
  position: absolute;
  bottom: var(--spacing-xs);
  right: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.cancel-btn,
.submit-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);

  i {
    font-size: var(--font-size-sm);
  }
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

// Responsive
@media (max-width: 767px) {
  .custom-option-input {
    padding: var(--spacing-sm);
  }

  .input-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

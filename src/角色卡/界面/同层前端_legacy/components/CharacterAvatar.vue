<template>
  <div class="character-avatar" :style="{ '--character-color': color }" @click="handleClick">
    <div class="avatar-image">
      <img v-if="portraitUrl" :src="portraitUrl" :alt="name" @error="handleImageError" />
      <div v-else class="avatar-placeholder">
        <span>{{ name.charAt(0) }}</span>
      </div>
    </div>
    <div class="avatar-info">
      <span class="avatar-name">{{ name }}</span>
    </div>
    <div class="avatar-ring"></div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  portraitUrl: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: 'var(--text-primary)',
  },
  size: {
    type: String as PropType<'small' | 'medium' | 'large'>,
    default: 'medium',
  },
});

const emit = defineEmits<{
  click: [name: string];
}>();

const imageError = ref(false);

function handleClick() {
  emit('click', props.name);
}

function handleImageError() {
  imageError.value = true;
}
</script>

<style lang="scss" scoped>
.character-avatar {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  transition: transform var(--transition-fast);

  &:hover {
    transform: translateY(-2px);

    .avatar-ring {
      opacity: 1;
      transform: scale(1.1);
    }

    .avatar-name {
      color: var(--character-color);
    }
  }

  &:active {
    transform: translateY(0);
  }
}

.avatar-image {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  overflow: hidden;
  background: var(--secondary-bg);
  border: 2px solid var(--border-color);
  transition: border-color var(--transition-fast);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--character-color), var(--secondary-bg));

  span {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
}

.avatar-info {
  text-align: center;
}

.avatar-name {
  display: block;
  font-family: var(--font-ui);
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
  transition: color var(--transition-fast);
}

.avatar-ring {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%) scale(1);
  width: 56px;
  height: 56px;
  border: 2px solid var(--character-color);
  border-radius: var(--radius-full);
  opacity: 0;
  pointer-events: none;
  transition: all var(--transition-fast);
}

// Size variants
.character-avatar.size-small {
  .avatar-image {
    width: 36px;
    height: 36px;
  }

  .avatar-name {
    font-size: 10px;
    max-width: 60px;
  }

  .avatar-ring {
    width: 44px;
    height: 44px;
  }
}

.character-avatar.size-large {
  .avatar-image {
    width: 64px;
    height: 64px;
  }

  .avatar-name {
    font-size: var(--font-size-sm);
    max-width: 100px;
  }

  .avatar-ring {
    width: 72px;
    height: 72px;
  }
}

// Desktop layout
@media (min-width: 1024px) {
  .character-avatar {
    flex-direction: row;
    gap: var(--spacing-sm);
  }

  .avatar-name {
    max-width: 100px;
  }
}
</style>

<template>
  <div class="character-bar" :class="{ collapsed }">
    <div class="bar-header" @click="toggle">
      <div class="header-left">
        <i class="fa-solid fa-users"></i>
        <span class="header-title">当前场景角色</span>
        <span class="character-count">{{ characters.length }}</span>
      </div>
      <i class="fa-solid toggle-icon" :class="collapsed ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
    </div>

    <Transition name="expand">
      <div v-show="!collapsed" class="bar-content">
        <div class="characters-list">
          <CharacterAvatar
            v-for="name in characters"
            :key="name"
            :name="name"
            :portrait-url="getPortraitUrl(name)"
            :color="getCharacterColor(name)"
            @click="handleSelect(name)"
          />
        </div>
        <div v-if="characters.length === 0" class="empty-state">
          <i class="fa-solid fa-user-slash"></i>
          <span>暂无角色</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { CHARACTER_COLOR_MAP, CHARACTER_NAME_MAP } from '../stores/characterStore';
import CharacterAvatar from './CharacterAvatar.vue';

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
  characters: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});

const emit = defineEmits<{
  toggle: [];
  selectCharacter: [name: string];
}>();

function toggle() {
  emit('toggle');
}

function handleSelect(name: string) {
  emit('selectCharacter', name);
}

function getPortraitUrl(name: string): string {
  const fileName = CHARACTER_NAME_MAP[name];
  if (fileName) {
    // 返回相对路径
    return `../assets/portraits/${fileName}.png`;
  }
  return '';
}

function getCharacterColor(name: string): string {
  return CHARACTER_COLOR_MAP[name] || 'var(--text-primary)';
}
</script>

<style lang="scss" scoped>
.character-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--border-color);
  box-shadow: 0 -4px 12px var(--card-shadow);
  z-index: var(--z-sticky);
  transition: all var(--transition-normal);

  &.collapsed {
    .bar-header {
      border-bottom: none;
    }
  }
}

.bar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: background var(--transition-fast);

  &:hover {
    background: var(--secondary-bg);
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.header-title {
  font-family: var(--font-ui);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.character-count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--accent-color);
  color: white;
  font-size: var(--font-size-xs);
  font-weight: 600;
  border-radius: var(--radius-full);
}

.toggle-icon {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  transition: transform var(--transition-fast);
}

.bar-content {
  padding: var(--spacing-sm) var(--spacing-md);
  max-height: 120px;
  overflow-x: auto;
  overflow-y: hidden;
}

.characters-list {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-xs) 0;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  color: var(--text-muted);
  font-size: var(--font-size-sm);

  i {
    font-size: var(--font-size-lg);
  }
}

// Expand transition
.expand-enter-active,
.expand-leave-active {
  transition: all var(--transition-normal);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 150px;
}

// Desktop: side bar
@media (min-width: 1024px) {
  .character-bar {
    position: fixed;
    bottom: auto;
    top: 80px;
    left: auto;
    right: var(--spacing-md);
    width: auto;
    max-width: 200px;
    border-top: none;
    border-left: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 12px var(--card-shadow);
  }

  .bar-content {
    max-height: 300px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .characters-list {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>

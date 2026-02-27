<template>
  <header class="top-nav-bar">
    <div class="nav-left">
      <button class="nav-btn menu-btn" title="菜单" @click="toggleMenu">
        <i class="fa-solid fa-bars"></i>
      </button>
      <span class="nav-title">点兔同层前端</span>
    </div>

    <div class="nav-right">
      <button class="nav-btn" title="历史消息" @click="goToHistory">
        <i class="fa-solid fa-clock-rotate-left"></i>
      </button>
      <button class="nav-btn" title="世界书管理" @click="goToWorldbook">
        <i class="fa-solid fa-book"></i>
      </button>
      <button class="nav-btn" title="设置" @click="goToSettings">
        <i class="fa-solid fa-gear"></i>
      </button>
      <button class="nav-btn" :title="gameStore.isFullscreen ? '退出全屏' : '全屏'" @click="toggleFullscreen">
        <i :class="gameStore.isFullscreen ? 'fa-solid fa-compress' : 'fa-solid fa-expand'"></i>
      </button>
    </div>

    <!-- Menu Dropdown -->
    <Transition name="dropdown">
      <div v-if="isMenuOpen" class="menu-dropdown">
        <button class="menu-item" @click="goToHistory">
          <i class="fa-solid fa-clock-rotate-left"></i>
          <span>历史消息</span>
        </button>
        <button class="menu-item" @click="goToWorldbook">
          <i class="fa-solid fa-book"></i>
          <span>世界书管理</span>
        </button>
        <button class="menu-item" @click="goToSettings">
          <i class="fa-solid fa-gear"></i>
          <span>设置</span>
        </button>
        <hr class="menu-divider" />
        <button class="menu-item" @click="goToStart">
          <i class="fa-solid fa-house"></i>
          <span>返回首页</span>
        </button>
      </div>
    </Transition>

    <!-- Overlay -->
    <Transition name="fade">
      <div v-if="isMenuOpen" class="menu-overlay" @click="closeMenu"></div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/gameStore';

const router = useRouter();
const gameStore = useGameStore();

const isMenuOpen = ref(false);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
}

function goToHistory() {
  closeMenu();
  router.push('/history');
}

function goToWorldbook() {
  closeMenu();
  router.push('/worldbook');
}

function goToSettings() {
  closeMenu();
  router.push('/settings');
}

function goToStart() {
  closeMenu();
  router.push('/');
}

function toggleFullscreen() {
  gameStore.toggleFullscreen();
}

// 点击外部关闭菜单
onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});

function handleOutsideClick(e: Event) {
  const target = e.target as HTMLElement;
  if (!target.closest('.top-nav-bar')) {
    closeMenu();
  }
}
</script>

<style lang="scss" scoped>
.top-nav-bar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 8px var(--card-shadow);
}

.nav-left,
.nav-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.nav-title {
  font-family: var(--font-heading);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-left: var(--spacing-sm);
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--secondary-bg);
    color: var(--text-primary);
  }

  &:active {
    transform: scale(0.95);
  }

  i {
    font-size: var(--font-size-lg);
  }
}

.menu-btn {
  display: none;

  @media (max-width: 767px) {
    display: flex;
  }
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  left: var(--spacing-md);
  min-width: 180px;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 24px var(--card-shadow);
  border: 1px solid var(--border-color);
  padding: var(--spacing-sm);
  z-index: var(--z-dropdown);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-ui);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;

  &:hover {
    background: var(--secondary-bg);
  }

  i {
    width: 20px;
    text-align: center;
    color: var(--text-secondary);
  }
}

.menu-divider {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: var(--spacing-xs) 0;
}

.menu-overlay {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-dropdown) - 1);
}

// Transitions
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--transition-fast);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// Desktop: hide menu button, show all nav buttons
@media (min-width: 768px) {
  .nav-right {
    .nav-btn {
      display: flex;
    }
  }
}

// Mobile: show menu button, hide individual nav buttons
@media (max-width: 767px) {
  .nav-right {
    .nav-btn:not(:last-child) {
      display: none;
    }
  }
}
</style>

<template>
  <div class="start-screen">
    <div class="start-content">
      <!-- Logo -->
      <div class="logo-container animate-fadeInDown">
        <svg class="logo-svg" viewBox="0 0 400 120">
          <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="logo-text">
            ご注文はうさぎですか？
          </text>
          <text x="50%" y="85%" text-anchor="middle" dominant-baseline="middle" class="logo-subtitle">
            请问您今天要来点兔子吗？
          </text>
        </svg>
      </div>

      <!-- Press Start Button -->
      <button class="press-start-btn animate-fadeInUp" :disabled="isLoading" @click="handleStart">
        <span class="btn-text" :class="{ 'animate-pulse': !isLoading }">
          {{ isLoading ? '加载中...' : 'Press Start' }}
        </span>
        <span class="btn-decor"></span>
      </button>

      <!-- Version Info -->
      <div class="version-info animate-fadeIn">
        <span>Version 1.0.0</span>
        <span class="separator">|</span>
        <span>点兔同层前端</span>
      </div>
    </div>

    <!-- Decorative elements -->
    <div class="decorative-rabbits">
      <svg v-for="i in 5" :key="i" class="rabbit-icon" :style="getRabbitStyle(i)" viewBox="0 0 24 24">
        <path
          d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 7.5 7.8 8.4 8.3 9.1L6 14L9 12L12 16L15 12L18 14L15.7 9.1C16.2 8.4 16.5 7.5 16.5 6.5C16.5 4 14.5 2 12 2Z"
          fill="currentColor"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useCharacterStore } from '../stores/characterStore';
import { useGameStore } from '../stores/gameStore';

const router = useRouter();
const characterStore = useCharacterStore();
const gameStore = useGameStore();

const isLoading = ref(false);

async function handleStart() {
  if (isLoading.value) return;

  isLoading.value = true;
  gameStore.setLoading(true);

  try {
    // 初始化角色数据
    await characterStore.initialize();

    // 导航到游戏主页面
    router.push('/game');
  } catch (e) {
    console.error('[启动] 初始化失败:', e);
    toastr.error('初始化失败，请刷新页面重试');
  } finally {
    isLoading.value = false;
    gameStore.setLoading(false);
  }
}

function getRabbitStyle(index: number) {
  const positions = [
    { left: '5%', top: '15%', size: '20px', delay: '0s' },
    { left: '90%', top: '25%', size: '16px', delay: '0.5s' },
    { left: '8%', top: '75%', size: '18px', delay: '1s' },
    { left: '92%', top: '70%', size: '22px', delay: '1.5s' },
    { left: '50%', top: '90%', size: '14px', delay: '2s' },
  ];
  const pos = positions[index - 1] || positions[0];
  return {
    left: pos.left,
    top: pos.top,
    width: pos.size,
    height: pos.size,
    animationDelay: pos.delay,
  };
}
</script>

<style lang="scss" scoped>
.start-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  position: relative;
  overflow: hidden;
}

.start-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2xl);
  z-index: 1;
}

.logo-container {
  text-align: center;
}

.logo-svg {
  width: 100%;
  max-width: 400px;
  height: auto;
}

.logo-text {
  font-family: var(--font-decor);
  font-size: 28px;
  font-weight: 600;
  fill: var(--accent-color);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.logo-subtitle {
  font-family: var(--font-heading);
  font-size: 16px;
  fill: var(--text-secondary);
}

.press-start-btn {
  position: relative;
  padding: var(--spacing-md) var(--spacing-2xl);
  background: linear-gradient(135deg, var(--accent-color) 0%, var(--decor-gold) 100%);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  overflow: hidden;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 15px rgba(212, 165, 116, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(212, 165, 116, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.btn-text {
  font-family: var(--font-decor);
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  z-index: 1;
}

.btn-decor {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.version-info {
  font-family: var(--font-ui);
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.separator {
  opacity: 0.5;
}

.decorative-rabbits {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.rabbit-icon {
  position: absolute;
  color: var(--decor-gold);
  opacity: 0.15;
  animation: rabbitFloat 4s ease-in-out infinite;
}

@keyframes rabbitFloat {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

// Responsive
@media (max-width: 767px) {
  .logo-text {
    font-size: 20px;
  }

  .logo-subtitle {
    font-size: 12px;
  }

  .press-start-btn {
    padding: var(--spacing-sm) var(--spacing-xl);
  }

  .btn-text {
    font-size: var(--font-size-lg);
  }

  .decorative-rabbits {
    display: none;
  }
}
</style>

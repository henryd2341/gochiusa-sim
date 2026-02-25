<template>
  <div class="character-detail">
    <!-- Header -->
    <header class="detail-header">
      <button class="back-btn" @click="goBack">
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <h1 class="header-title">角色详情</h1>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>

    <!-- Content -->
    <main v-else-if="characterData" class="detail-content">
      <!-- Portrait Section -->
      <div class="portrait-section">
        <div class="portrait-container" :style="{ '--character-color': characterColor }">
          <img v-if="portraitUrl" :src="portraitUrl" :alt="characterName" class="portrait-image" />
          <div v-else class="portrait-placeholder">
            <span>{{ characterName?.charAt(0) }}</span>
          </div>
        </div>
        <h2 class="character-name">{{ characterName }}</h2>
      </div>

      <!-- Status Section -->
      <div class="status-section">
        <div class="status-item">
          <i class="fa-solid fa-location-dot"></i>
          <span class="status-label">位置</span>
          <span class="status-value">{{ characterData.当前位置 || '未知' }}</span>
        </div>
        <div class="status-item">
          <i class="fa-solid fa-face-smile"></i>
          <span class="status-label">心情</span>
          <span class="status-value">{{ characterData.心情状态 || '未知' }}</span>
        </div>
        <div class="status-item">
          <i class="fa-solid fa-shirt"></i>
          <span class="status-label">着装</span>
          <span class="status-value">{{ characterData.着装 || '未知' }}</span>
        </div>
      </div>

      <!-- Items Section -->
      <div v-if="hasItems" class="items-section">
        <h3 class="section-title">
          <i class="fa-solid fa-box"></i>
          关键物品
        </h3>
        <div class="items-list">
          <div v-for="(item, name) in characterData.关键物品" :key="name" class="item-card">
            <div class="item-icon">
              <i class="fa-solid fa-cube"></i>
            </div>
            <div class="item-info">
              <span class="item-name">{{ name }}</span>
              <span class="item-desc">{{ item.描述 }}</span>
            </div>
            <span class="item-count">x{{ item.数量 }}</span>
          </div>
        </div>
      </div>

      <!-- Empty Items -->
      <div v-else class="empty-items">
        <i class="fa-solid fa-box-open"></i>
        <span>暂无关键物品</span>
      </div>
    </main>

    <!-- Error State -->
    <div v-else class="error-state">
      <i class="fa-solid fa-user-slash"></i>
      <p>未找到角色信息</p>
      <button class="btn btn-primary" @click="goBack">返回</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { CHARACTER_COLOR_MAP, CHARACTER_NAME_MAP, useCharacterStore } from '../stores/characterStore';

const router = useRouter();
const route = useRoute();
const characterStore = useCharacterStore();

const characterName = computed(() => {
  const name = route.params.name as string;
  return decodeURIComponent(name);
});

const characterData = computed(() => {
  return characterStore.getCharacterData(characterName.value);
});

const portraitUrl = computed(() => {
  const fileName = CHARACTER_NAME_MAP[characterName.value];
  if (fileName) {
    return `../assets/portraits/${fileName}.png`;
  }
  return '';
});

const characterColor = computed(() => {
  return CHARACTER_COLOR_MAP[characterName.value] || 'var(--text-primary)';
});

const hasItems = computed(() => {
  return characterData.value?.关键物品 && Object.keys(characterData.value.关键物品).length > 0;
});

const isLoading = ref(true);

onMounted(async () => {
  await characterStore.refreshData();
  isLoading.value = false;
});

function goBack() {
  router.push('/game');
}
</script>

<style lang="scss" scoped>
.character-detail {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.back-btn {
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
}

.header-title {
  font-family: var(--font-heading);
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.loading-state,
.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  color: var(--text-muted);
  padding: var(--spacing-xl);

  i {
    font-size: 48px;
    opacity: 0.5;
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.detail-content {
  flex: 1;
  padding: var(--spacing-lg);
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.portrait-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.portrait-container {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: var(--secondary-bg);
  border: 4px solid var(--character-color);
  box-shadow: 0 8px 24px var(--card-shadow);
  margin-bottom: var(--spacing-md);
}

.portrait-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.portrait-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--character-color), var(--secondary-bg));

  span {
    font-size: 64px;
    font-weight: 600;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
}

.character-name {
  font-family: var(--font-heading);
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.status-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);

  i {
    width: 24px;
    text-align: center;
    color: var(--accent-color);
  }

  .status-label {
    font-weight: 500;
    color: var(--text-secondary);
    min-width: 50px;
  }

  .status-value {
    flex: 1;
    color: var(--text-primary);
    text-align: right;
  }
}

.items-section {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-family: var(--font-heading);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);

  i {
    color: var(--accent-color);
  }
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.item-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--secondary-bg);
  border-radius: var(--radius-md);
  color: var(--accent-color);
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.item-name {
  font-weight: 500;
  color: var(--text-primary);
}

.item-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.item-count {
  font-weight: 600;
  color: var(--accent-color);
  background: var(--secondary-bg);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
}

.empty-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl);
  color: var(--text-muted);

  i {
    font-size: 32px;
    opacity: 0.5;
  }
}

// Responsive
@media (max-width: 767px) {
  .detail-content {
    padding: var(--spacing-md);
  }

  .portrait-container {
    width: 150px;
    height: 150px;
  }

  .portrait-placeholder span {
    font-size: 48px;
  }
}
</style>

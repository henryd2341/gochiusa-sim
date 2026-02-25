<template>
  <div class="history-messages">
    <!-- Header -->
    <header class="history-header">
      <button class="back-btn" @click="goBack">
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <h1 class="header-title">历史消息</h1>
    </header>

    <!-- Search Bar -->
    <div class="search-section">
      <div class="search-input-wrapper">
        <i class="fa-solid fa-search"></i>
        <input v-model="searchQuery" type="text" class="search-input" placeholder="搜索消息内容..." />
        <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>

    <!-- Messages List -->
    <main v-else class="messages-list">
      <div v-for="group in filteredMessages" :key="group.id" class="message-group" @click="viewMessage(group.id)">
        <div class="message-avatar" :style="{ backgroundColor: getAvatarColor(group.role) }">
          <i :class="getAvatarIcon(group.role)"></i>
        </div>
        <div class="message-info">
          <div class="message-header">
            <span class="message-role">{{ getRoleLabel(group.role) }}</span>
            <span class="message-id">第 {{ group.id }} 楼</span>
          </div>
          <p class="message-preview">{{ group.preview }}</p>
        </div>
        <i class="fa-solid fa-chevron-right arrow-icon"></i>
      </div>

      <!-- Load More -->
      <button v-if="hasMore" class="load-more-btn" :disabled="isLoadingMore" @click="loadMore">
        <i :class="isLoadingMore ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-arrow-down'"></i>
        <span>{{ isLoadingMore ? '加载中...' : '加载更多' }}</span>
      </button>

      <!-- Empty State -->
      <div v-if="filteredMessages.length === 0 && !isLoading" class="empty-state">
        <i class="fa-solid fa-inbox"></i>
        <p>暂无历史消息</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

interface MessageGroup {
  id: number;
  role: 'user' | 'assistant' | 'system';
  preview: string;
  fullContent?: string;
}

const searchQuery = ref('');
const isLoading = ref(true);
const isLoadingMore = ref(false);
const messages = ref<MessageGroup[]>([]);
const hasMore = ref(true);
const currentPage = ref(0);
const pageSize = 20;

const filteredMessages = computed(() => {
  if (!searchQuery.value) return messages.value;
  const query = searchQuery.value.toLowerCase();
  return messages.value.filter(msg => msg.preview.toLowerCase().includes(query));
});

async function loadMessages() {
  isLoading.value = true;
  try {
    const chatLength = SillyTavern.chat.length;
    const start = Math.max(0, chatLength - (currentPage.value + 1) * pageSize);
    const end = chatLength - currentPage.value * pageSize;

    const newMessages: MessageGroup[] = [];
    for (let i = end - 1; i >= start; i--) {
      const msg = getChatMessages(i)[0];
      if (msg) {
        newMessages.push({
          id: i,
          role: msg.role as 'user' | 'assistant' | 'system',
          preview: truncateText(msg.message, 100),
          fullContent: msg.message,
        });
      }
    }

    messages.value = [...messages.value, ...newMessages];
    hasMore.value = start > 0;
  } catch (e) {
    console.error('[历史消息] 加载失败:', e);
  } finally {
    isLoading.value = false;
  }
}

async function loadMore() {
  if (isLoadingMore.value || !hasMore.value) return;
  isLoadingMore.value = true;
  currentPage.value++;
  await loadMessages();
  isLoadingMore.value = false;
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  // 移除HTML标签
  const cleanText = text.replace(/<[^>]*>/g, '').trim();
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.slice(0, maxLength) + '...';
}

function getAvatarColor(role: string): string {
  switch (role) {
    case 'user':
      return 'var(--clr-cocoa)';
    case 'assistant':
      return 'var(--clr-chino)';
    case 'system':
      return 'var(--text-muted)';
    default:
      return 'var(--text-secondary)';
  }
}

function getAvatarIcon(role: string): string {
  switch (role) {
    case 'user':
      return 'fa-solid fa-user';
    case 'assistant':
      return 'fa-solid fa-robot';
    case 'system':
      return 'fa-solid fa-gear';
    default:
      return 'fa-solid fa-message';
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'user':
      return '用户';
    case 'assistant':
      return 'AI';
    case 'system':
      return '系统';
    default:
      return '未知';
  }
}

function viewMessage(id: number) {
  // 使用 /chat-jump 跳转到指定消息
  triggerSlash(`/chat-jump ${id}`);
  router.push('/game');
}

function clearSearch() {
  searchQuery.value = '';
}

function goBack() {
  router.push('/game');
}

onMounted(() => {
  loadMessages();
});
</script>

<style lang="scss" scoped>
.history-messages {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.history-header {
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

.search-section {
  padding: var(--spacing-md);
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--secondary-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);

  i {
    color: var(--text-muted);
  }
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--font-ui);
  font-size: var(--font-size-sm);
  color: var(--text-primary);

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: var(--text-muted);
  }
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;

  &:hover {
    background: var(--border-color);
    color: var(--text-primary);
  }
}

.loading-state,
.empty-state {
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

.messages-list {
  flex: 1;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.message-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--secondary-bg);
    border-color: var(--accent-color);
  }
}

.message-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  color: white;
  flex-shrink: 0;
}

.message-info {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
}

.message-role {
  font-weight: 500;
  color: var(--text-primary);
}

.message-id {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.message-preview {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow-icon {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.load-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-ui);
  font-size: var(--font-size-sm);

  &:hover:not(:disabled) {
    background: var(--border-color);
    color: var(--text-primary);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>

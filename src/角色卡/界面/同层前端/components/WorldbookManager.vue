<template>
  <div class="worldbook-manager">
    <!-- Header -->
    <header class="wb-header">
      <button class="back-btn" @click="goBack">
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <h1 class="header-title">世界书管理</h1>
    </header>

    <!-- Search Bar -->
    <div class="search-section">
      <div class="search-input-wrapper">
        <i class="fa-solid fa-search"></i>
        <input v-model="searchQuery" type="text" class="search-input" placeholder="搜索条目..." />
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

    <!-- Entries List -->
    <main v-else class="entries-list">
      <div v-for="entry in filteredEntries" :key="entry.uid" class="entry-card">
        <div class="entry-toggle">
          <label class="toggle-switch">
            <input type="checkbox" :checked="entry.enabled" @change="toggleEntry(entry)" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="entry-info">
          <div class="entry-header">
            <span class="entry-key">{{ entry.name }}</span>
            <span class="entry-status" :class="{ enabled: entry.enabled, disabled: !entry.enabled }">
              {{ entry.enabled ? '已启用' : '已禁用' }}
            </span>
          </div>
          <p class="entry-comment">{{ entry.comment || '无描述' }}</p>
        </div>
        <button class="entry-action" title="查看详情" @click="viewEntry(entry)">
          <i class="fa-solid fa-eye"></i>
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="filteredEntries.length === 0 && !isLoading" class="empty-state">
        <i class="fa-solid fa-book-open"></i>
        <p>暂无世界书条目</p>
      </div>
    </main>

    <!-- Entry Detail Modal -->
    <Transition name="modal">
      <div v-if="selectedEntry" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <header class="modal-header">
            <h2 class="modal-title">{{ selectedEntry.name }}</h2>
            <button class="modal-close" @click="closeModal">
              <i class="fa-solid fa-times"></i>
            </button>
          </header>
          <div class="modal-body">
            <div class="detail-item">
              <span class="detail-label">关键词</span>
              <span class="detail-value">{{ selectedEntry.keys?.join(', ') || '无' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">描述</span>
              <span class="detail-value">{{ selectedEntry.comment || '无' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">内容</span>
              <pre class="detail-content">{{ selectedEntry.content }}</pre>
            </div>
          </div>
          <footer class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">关闭</button>
            <button class="btn btn-primary" @click="toggleEntry(selectedEntry)">
              {{ selectedEntry.enabled ? '禁用' : '启用' }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { toastError, toastSuccess } from '../utils/toast';

const router = useRouter();

interface WorldbookEntryDisplay {
  uid: number;
  name: string;
  keys: string[];
  comment?: string;
  content: string;
  enabled: boolean;
}

const searchQuery = ref('');
const isLoading = ref(true);
const entries = ref<WorldbookEntryDisplay[]>([]);
const selectedEntry = ref<WorldbookEntryDisplay | null>(null);
const worldbookName = ref<string | null>(null);

const filteredEntries = computed(() => {
  if (!searchQuery.value) return entries.value;
  const query = searchQuery.value.toLowerCase();
  return entries.value.filter(
    entry =>
      entry.name.toLowerCase().includes(query) ||
      entry.comment?.toLowerCase().includes(query) ||
      entry.content.toLowerCase().includes(query) ||
      entry.keys.some(k => k.toLowerCase().includes(query)),
  );
});

async function loadWorldbook() {
  isLoading.value = true;
  try {
    // 获取当前角色卡绑定的世界书
    const charWorldbooks = getCharWorldbookNames('current');
    const wbName = charWorldbooks.primary;

    if (!wbName) {
      console.log('[世界书] 当前角色卡没有绑定世界书');
      entries.value = [];
      return;
    }

    worldbookName.value = wbName;
    const worldbook = await getWorldbook(wbName);

    if (worldbook && Array.isArray(worldbook)) {
      entries.value = worldbook.map(entry => ({
        uid: entry.uid,
        name: entry.name || '未命名',
        keys: entry.strategy?.keys?.map(k => String(k)) || [],
        comment: entry.content?.slice(0, 100),
        content: entry.content || '',
        enabled: entry.enabled ?? true,
      }));
    }
  } catch (e) {
    console.error('[世界书] 加载失败:', e);
  } finally {
    isLoading.value = false;
  }
}

async function toggleEntry(entry: WorldbookEntryDisplay) {
  if (!worldbookName.value) return;

  try {
    await updateWorldbookWith(worldbookName.value, worldbook => {
      return worldbook.map(e => {
        if (e.uid === entry.uid) {
          return { ...e, enabled: !entry.enabled };
        }
        return e;
      });
    });

    entry.enabled = !entry.enabled;
    toastSuccess(entry.enabled ? '已启用条目' : '已禁用条目');
  } catch (e) {
    console.error('[世界书] 切换状态失败:', e);
    toastError('操作失败');
  }
}

function viewEntry(entry: WorldbookEntryDisplay) {
  selectedEntry.value = entry;
}

function closeModal() {
  selectedEntry.value = null;
}

function clearSearch() {
  searchQuery.value = '';
}

function goBack() {
  router.push('/game');
}

onMounted(() => {
  loadWorldbook();
});
</script>

<style lang="scss" scoped>
.worldbook-manager {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.wb-header {
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

.entries-list {
  flex: 1;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.entry-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--accent-color);
  }
}

.entry-toggle {
  flex-shrink: 0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .toggle-slider {
      background-color: var(--accent-color);

      &::before {
        transform: translateX(20px);
      }
    }
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background-color: var(--border-color);
    transition: all var(--transition-fast);
    border-radius: var(--radius-full);

    &::before {
      position: absolute;
      content: '';
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: all var(--transition-fast);
      border-radius: 50%;
    }
  }
}

.entry-info {
  flex: 1;
  min-width: 0;
}

.entry-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
}

.entry-key {
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.entry-status {
  font-size: var(--font-size-xs);
  padding: 2px 8px;
  border-radius: var(--radius-full);

  &.enabled {
    background: rgba(135, 206, 135, 0.2);
    color: #4caf50;
  }

  &.disabled {
    background: rgba(255, 152, 152, 0.2);
    color: #f44336;
  }
}

.entry-comment {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.entry-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--secondary-bg);
    color: var(--text-primary);
  }
}

// Modal Styles
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-md);
}

.modal-content {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  max-height: 32rem;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-family: var(--font-heading);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  cursor: pointer;

  &:hover {
    background: var(--secondary-bg);
    color: var(--text-primary);
  }
}

.modal-body {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
}

.detail-item {
  margin-bottom: var(--spacing-md);

  &:last-child {
    margin-bottom: 0;
  }
}

.detail-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.detail-value {
  color: var(--text-primary);
}

.detail-content {
  background: var(--secondary-bg);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-family: var(--font-ui);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

// Modal Transitions
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-normal);

  .modal-content {
    transition: transform var(--transition-normal);
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal-content {
    transform: scale(0.95);
  }
}
</style>

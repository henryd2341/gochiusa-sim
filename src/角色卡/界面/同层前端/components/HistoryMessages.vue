<template>
  <section class="card history">
    <header class="head">
      <h2>历史消息</h2>
      <button class="btn" @click="reload">刷新</button>
    </header>

    <input v-model.trim="keyword" class="search" placeholder="搜索消息内容..." />

    <div v-if="filtered.length === 0" class="empty">暂无匹配消息</div>

    <ul v-else class="list">
      <li v-for="item in filtered" :key="item.message_id" class="item">
        <button class="jump" @click="jumpTo(item.message_id)">#{{ item.message_id }} · {{ item.role }}</button>
        <p class="preview">{{ item.message }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

type Row = {
  message_id: number;
  role: 'system' | 'assistant' | 'user';
  message: string;
};

const router = useRouter();
const rows = ref<Row[]>([]);
const keyword = ref('');

const filtered = computed(() => {
  const key = keyword.value.toLowerCase();
  if (!key) return rows.value;
  return rows.value.filter(item => item.message.toLowerCase().includes(key));
});

async function reload() {
  const lastId = getLastMessageId();
  const next: Row[] = [];

  for (let i = lastId; i >= 0; i -= 1) {
    const found = getChatMessages(i, { hide_state: 'all' })[0];
    if (!found?.message) continue;
    next.push({
      message_id: found.message_id,
      role: found.role,
      message: found.message,
    });
    if (next.length >= 80) break;
  }

  rows.value = next;
}

async function jumpTo(messageId: number) {
  try {
    await triggerSlash(`/chat-jump ${messageId}`);
  } catch (error) {
    console.warn('[同层前端_v3] 历史跳转失败:', error);
  }
  await router.push('/game');
}

onMounted(async () => {
  await reload();
});
</script>

<style scoped lang="scss">
.history {
  padding: 12px;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.btn {
  border: 1px solid var(--border-color);
  background: var(--secondary-bg);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
}

.search {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 10px;
}

.empty {
  color: var(--text-secondary);
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}

.item {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px;
}

.jump {
  border: none;
  background: transparent;
  color: var(--accent-color);
  cursor: pointer;
  font-weight: 700;
  padding: 0;
}

.preview {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 14px;
  white-space: pre-wrap;
}
</style>
